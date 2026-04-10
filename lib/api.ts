import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export const BASE_URL = "http://localhost:8080";

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

export async function saveToken(token: string): Promise<void> {
  _tokenCache = token;
  if (Platform.OS === "web") {
    localStorage.setItem("auth_token", token);
  } else {
    await SecureStore.setItemAsync("auth_token", token);
  }
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

    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new Error(`${res.status}: ${text}`);
    }

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
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new Error(`${res.status}: ${text}`);
    }
    const text = await res.text();
    if (!text) return undefined as T;
    try {
      return JSON.parse(text) as T;
    } catch {
      return text as T;
    }
  },

  async get<T = unknown>(path: string): Promise<T> {
    const headers = await buildHeaders();
    const res = await fetch(`${BASE_URL}${path}`, { headers });
    if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
    return res.json() as Promise<T>;
  },
};
