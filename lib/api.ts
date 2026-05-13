import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";


// 10.0.2.2 = emulator AVD loopback; for physical device set EXPO_PUBLIC_DEV_HOST to your PC's LAN IP
const DEV_HOST = process.env.EXPO_PUBLIC_DEV_HOST
  ?? (Platform.OS === "android" ? "10.0.2.2" : "localhost");
export const BASE_URL = __DEV__
  ? `http://${DEV_HOST}:8080`
  : (process.env.EXPO_PUBLIC_API_URL ?? "https://budgetgarden-backend-latest.onrender.com");

// Cache in-memory — token nu se schimbă în timpul sesiunii
let _tokenCache: string | null | undefined = undefined;

export async function getStoredToken(): Promise<string | null> {
  if (_tokenCache !== undefined) return _tokenCache;
  if (Platform.OS === "web") {
    _tokenCache = localStorage.getItem("auth_token");
  } else {
    _tokenCache = await SecureStore.getItemAsync("auth_token");
  }
  return _tokenCache ?? null;
}

/** Apelat la logout sau după ce token-ul se schimbă */
export function invalidateTokenCache(): void {
  _tokenCache = undefined;
}

export async function logout(): Promise<void> {
  _tokenCache = null;
  if (Platform.OS === "web") {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("is_new_user");
    localStorage.removeItem("pending_email");
  } else {
    await SecureStore.deleteItemAsync("auth_token");
    await SecureStore.deleteItemAsync("is_new_user");
    await SecureStore.deleteItemAsync("pending_email");
  }
}

export async function getPendingEmail(): Promise<string> {
  if (Platform.OS === "web") return localStorage.getItem("pending_email") ?? "";
  return (await SecureStore.getItemAsync("pending_email")) ?? "";
}

export async function clearPendingEmail(): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.removeItem("pending_email");
  } else {
    await SecureStore.deleteItemAsync("pending_email");
  }
}

export async function saveToken(token: string): Promise<void> {
  _tokenCache = token;
  if (Platform.OS === "web") {
    localStorage.setItem("auth_token", token);
  } else {
    await SecureStore.setItemAsync("auth_token", token);
  }
}

export class EmailNotVerifiedError extends Error {
  constructor() {
    super("EMAIL_NOT_VERIFIED");
    this.name = "EmailNotVerifiedError";
  }
}

let _emailNotVerifiedHandler: (() => void) | null = null;
export function registerEmailNotVerifiedHandler(handler: () => void): void {
  _emailNotVerifiedHandler = handler;
}

async function handleErrorResponse(res: Response): Promise<never> {
  const text = await res.text().catch(() => res.statusText);
  let message: string = text || res.statusText;
  try {
    const json = JSON.parse(text);
    if (json?.message) message = json.message;
  } catch {}
  if (res.status === 403 && message === "EMAIL_NOT_VERIFIED") {
    _emailNotVerifiedHandler?.();
    throw new EmailNotVerifiedError();
  }
  throw new Error(message);
}

async function buildHeaders(
  extra: Record<string, string> = {},
  withAuth = true,
): Promise<Record<string, string>> {
  const headers: Record<string, string> = { ...extra };
  if (withAuth) {
    const token = await getStoredToken();
    if (token) headers["Authorization"] = token;
  }
  return headers;
}

export const api = {
  async post<T = unknown>(
    path: string,
    body: unknown,
    opts: { auth?: boolean; contentType?: string } = {},
  ): Promise<T> {
    const { auth = true, contentType = "application/json" } = opts;
    const headers = await buildHeaders({ "Content-Type": contentType }, auth);

    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers,
      body: typeof body === "string" ? body : JSON.stringify(body),
    });

    if (!res.ok) return handleErrorResponse(res);

    const text = await res.text();
    if (!text) return undefined as T;
    try {
      return JSON.parse(text) as T;
    } catch {
      return text as T;
    }
  },

  async patch<T = unknown>(path: string, body: unknown): Promise<T> {
    const headers = await buildHeaders({ "Content-Type": "application/json" });
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) return handleErrorResponse(res);
    const text = await res.text();
    if (!text) return undefined as T;
    try {
      return JSON.parse(text) as T;
    } catch {
      return text as T;
    }
  },

  async put<T = unknown>(path: string, body: unknown): Promise<T> {
    const headers = await buildHeaders({ "Content-Type": "application/json" });
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) return handleErrorResponse(res);
    const text = await res.text();
    if (!text) return undefined as T;
    try {
      return JSON.parse(text) as T;
    } catch {
      return text as T;
    }
  },

  async delete(path: string): Promise<void> {
    const headers = await buildHeaders();
    const res = await fetch(`${BASE_URL}${path}`, { method: "DELETE", headers });
    if (!res.ok) return handleErrorResponse(res);
  },

  async get<T = unknown>(path: string): Promise<T> {
    const headers = await buildHeaders();
    const res = await fetch(`${BASE_URL}${path}`, { headers });
    if (!res.ok) return handleErrorResponse(res);
    return res.json() as Promise<T>;
  },
};
