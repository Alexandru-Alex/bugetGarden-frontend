# Sign in with Apple — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Apple button placeholder in `AuthModal` with a working Sign in with Apple flow — native on iOS via `expo-apple-authentication`, OAuth on Web via `expo-auth-session`.

**Architecture:** iOS uses the native Apple sheet (`expo-apple-authentication`) which returns `identityToken` + `authorizationCode`. Web uses `expo-auth-session` (already installed) with Apple's OIDC endpoint which returns `authorizationCode`. Both paths POST to `/authorization-apple`. The Apple button is hidden on Android.

**Tech Stack:** `expo-apple-authentication` (new, iOS only), `expo-auth-session` + `useAuthRequest` (existing, web), `api.post` from `lib/api.ts`

---

## Prerequisites (manual — do before running tasks)

These cannot be automated. Check them off before starting:

- [ ] Apple Developer Console → App ID `com.g3d0manz00.bugetGardenfront` → Capabilities → **Sign In with Apple** → Enable
- [ ] Apple Developer Console → Create a **Services ID** (e.g. `com.g3d0manz00.bugetGardenfront.web`) with Sign In with Apple enabled and redirect URI: `https://bugetgardenfront.vercel.app` (add `https://auth.expo.io/@g3d0m/bugetGarden-front` for Expo Go dev if needed)
- [ ] Replace the placeholder `APPLE_WEB_CLIENT_ID` constant in `landing.tsx` with your real Services ID after creating it

---

## Files Changed

| File | Change |
|---|---|
| `app.json` | Add `expo-apple-authentication` to plugins array |
| `app/landing.tsx` | Add imports, web auth request hook, `handleAppleBackendAuth`, `handleAppleSignIn`, wire up button |

---

## Task 1: Install package and configure app.json

**Files:**
- Modify: `app.json` (plugins array)

- [ ] **Step 1: Install expo-apple-authentication**

```bash
npx expo install expo-apple-authentication
```

Expected output: package added to `node_modules` and `package.json` dependencies.

- [ ] **Step 2: Add plugin to app.json**

In `app.json`, add `"expo-apple-authentication"` to the `plugins` array, after `"expo-secure-store"`:

```json
"plugins": [
  "expo-router",
  [
    "@react-native-google-signin/google-signin",
    {
      "iosUrlScheme": "com.googleusercontent.apps.975323074001-re455uukk107dpf8l25q75nia9co29td"
    }
  ],
  [
    "expo-splash-screen",
    {
      "image": "./assets/images/icon.jpg",
      "imageWidth": 200,
      "resizeMode": "contain",
      "backgroundColor": "#ffffff",
      "dark": {
        "backgroundColor": "#000000"
      }
    }
  ],
  "expo-secure-store",
  "expo-apple-authentication"
]
```

- [ ] **Step 3: Commit**

```bash
git add app.json package.json package-lock.json
git commit -m "chore: install expo-apple-authentication"
```

---

## Task 2: Add Apple web auth request and response effect in AuthModal

**Files:**
- Modify: `app/landing.tsx`

These changes go inside `AuthModal`, alongside the existing Google `useAuthRequest` block.

- [ ] **Step 1: Add `useAuthRequest` and `ResponseType` to the expo-auth-session import**

Find the existing import at the top of `landing.tsx`:

```typescript
import { makeRedirectUri } from "expo-auth-session";
```

Replace with:

```typescript
import { makeRedirectUri, useAuthRequest, ResponseType } from "expo-auth-session";
```

- [ ] **Step 2: Add Apple OIDC constants after the GOOGLE_CLIENT_IDS block**

Find this line in `landing.tsx` (~line 150):
```typescript
const GOOGLE_CLIENT_IDS = {
```

After the closing `};` of `GOOGLE_CLIENT_IDS`, add:

```typescript
const APPLE_DISCOVERY = {
  authorizationEndpoint: "https://appleid.apple.com/auth/authorize",
  tokenEndpoint: "https://appleid.apple.com/auth/token",
};
// Replace with your real Apple Services ID from Apple Developer Console
const APPLE_WEB_CLIENT_ID = "com.g3d0manz00.bugetGardenfront.web";
```

- [ ] **Step 3: Add the Apple web auth request hook inside AuthModal**

Inside the `AuthModal` function body, after the Google `useAuthRequest` block (~line 169):

```typescript
const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
  ...GOOGLE_CLIENT_IDS,
  redirectUri: makeRedirectUri({ scheme: "bugetgardenfront", path: "auth" }),
});
```

Add immediately after:

```typescript
const [appleRequest, appleResponse, applePromptAsync] = useAuthRequest(
  {
    clientId: APPLE_WEB_CLIENT_ID,
    scopes: ["name", "email"],
    redirectUri: makeRedirectUri({ scheme: "bugetgardenfront", path: "auth" }),
    responseType: ResponseType.Code,
    usePKCE: false,
    extraParams: { response_mode: "query" },
  },
  APPLE_DISCOVERY,
);
```

- [ ] **Step 4: Commit**

```bash
git add app/landing.tsx
git commit -m "feat: add Apple web auth request hook in AuthModal"
```

---

## Task 3: Add handleAppleBackendAuth and handleAppleSignIn functions

**Files:**
- Modify: `app/landing.tsx`

These functions go inside `AuthModal`, after the existing `handleGoogleToken` function (~line 215).

- [ ] **Step 1: Add handleAppleBackendAuth after handleGoogleToken**

Find the end of `handleGoogleToken` function:
```typescript
  const handleGoogleToken = async (accessToken: string) => {
    ...
  };
```

Add immediately after:

```typescript
  const handleAppleBackendAuth = async (payload: {
    identityToken: string | null;
    authorizationCode: string | null;
    user?: string | null;
    email?: string | null;
    fullName?: { givenName: string | null; familyName: string | null } | null;
  }) => {
    setLoading(true);
    setError("");
    try {
      const data = await api.post<{ token: string; newUser: boolean }>(
        "/authorization-apple",
        payload,
        { auth: false },
      );
      await saveToken(data.token);
      if (Platform.OS === "web") {
        localStorage.setItem("is_new_user", String(data.newUser));
      } else {
        await SecureStore.setItemAsync("is_new_user", String(data.newUser));
      }
      onSuccess(data.newUser);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Apple sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
```

- [ ] **Step 2: Add Apple response effect after handleAppleBackendAuth**

The effect must be declared AFTER `handleAppleBackendAuth` to avoid TypeScript `used before declaration` error.

Find the end of `handleAppleBackendAuth` and add immediately after:

```typescript
  useEffect(() => {
    if (appleResponse?.type === "success") {
      handleAppleBackendAuth({
        authorizationCode: appleResponse.params.code ?? null,
        identityToken: null,
      });
    }
  }, [appleResponse]);
```

- [ ] **Step 3: Add handleAppleSignIn after the effect**

```typescript
  const handleAppleSignIn = async () => {
    if (Platform.OS === "web") {
      await applePromptAsync();
      return;
    }
    try {
      setLoading(true);
      setError("");
      const AppleAuth = require("expo-apple-authentication");
      const credential = await AppleAuth.signInAsync({
        requestedScopes: [
          AppleAuth.AppleAuthenticationScope.FULL_NAME,
          AppleAuth.AppleAuthenticationScope.EMAIL,
        ],
      });
      await handleAppleBackendAuth({
        identityToken: credential.identityToken ?? null,
        authorizationCode: credential.authorizationCode ?? null,
        user: credential.user ?? null,
        email: credential.email ?? null,
        fullName: credential.fullName
          ? {
              givenName: credential.fullName.givenName ?? null,
              familyName: credential.fullName.familyName ?? null,
            }
          : null,
      });
    } catch (e: unknown) {
      // ERR_REQUEST_CANCELED = user dismissed the Apple sheet — not an error
      if ((e as { code?: string }).code !== "ERR_REQUEST_CANCELED") {
        setError(e instanceof Error ? e.message : "Apple sign-in failed. Please try again.");
        setLoading(false);
      } else {
        setLoading(false);
      }
    }
  };
```

- [ ] **Step 4: Commit**

```bash
git add app/landing.tsx
git commit -m "feat: implement handleAppleSignIn and handleAppleBackendAuth"
```

---

## Task 4: Wire up Apple button and hide on Android

**Files:**
- Modify: `app/landing.tsx`

- [ ] **Step 1: Replace the Apple button placeholder**

Find the existing Apple button in the JSX (~line 459):

```typescript
{/* Apple button */}
<Pressable
  style={({ pressed }) => [auth.appleBtn, pressed && auth.appleBtnPressed]}
  onPress={() => alert("Apple Sign In coming soon!")}
  disabled={loading}
>
  <Ionicons name="logo-apple" size={20} color="#000000" />
  <Text style={auth.appleText}>Sign in with Apple</Text>
</Pressable>
```

Replace with:

```typescript
{/* Apple button — hidden on Android (Apple SDK not available) */}
{Platform.OS !== "android" && (
  <Pressable
    style={({ pressed }) => [auth.appleBtn, pressed && auth.appleBtnPressed]}
    onPress={handleAppleSignIn}
    disabled={loading || (Platform.OS === "web" && !appleRequest)}
  >
    <Ionicons name="logo-apple" size={20} color="#000000" />
    <Text style={auth.appleText}>Sign in with Apple</Text>
  </Pressable>
)}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/landing.tsx
git commit -m "feat: wire up Sign in with Apple button, hide on Android"
```

---

## Task 5: Manual verification

- [ ] **iOS (real device required — Apple Sign In does not work on simulator)**
  1. `npx expo run:ios` on a real device
  2. Open app → Get Started → tap "Sign in with Apple"
  3. Apple sheet appears with Face ID/Touch ID
  4. On success: navigates to garden or hello screen

- [ ] **Web**
  1. `npx expo start --web`
  2. Open in browser → Get Started → tap "Sign in with Apple"
  3. Redirects to `appleid.apple.com` login page
  4. On success: returns to app and navigates

- [ ] **Android — button not visible**
  1. `npx expo run:android`
  2. Open app → Get Started
  3. Only Google button visible, Apple button absent

---

## Backend request model summary

```json
{
  "identityToken": "eyJraWQiOiJXNldjT...",
  "authorizationCode": "c9f25e1234567890abcdef",
  "user": "001234.abc123def456.0123",
  "email": "user@privaterelay.appleid.com",
  "fullName": {
    "givenName": "John",
    "familyName": "Doe"
  }
}
```

| Field | iOS | Web |
|---|---|---|
| `identityToken` | JWT from Apple | `null` (backend exchanges `authorizationCode`) |
| `authorizationCode` | present | present |
| `user` | Apple user ID | `null` |
| `email` | first login only, then `null` | `null` |
| `fullName` | first login only, then `null` | `null` |

**Backend verification:**
- If `identityToken` present: verify JWT with Apple JWKS at `https://appleid.apple.com/auth/keys`, check `iss = https://appleid.apple.com`, check `aud = com.g3d0manz00.bugetGardenfront` (iOS) or Services ID (web)
- If `identityToken` null: exchange `authorizationCode` at `https://appleid.apple.com/auth/token` to obtain `id_token`, then verify that
- `sub` claim in `identityToken` = stable Apple user ID (same as `user` field)
- `email` may be `@privaterelay.appleid.com` — treat as valid
- On subsequent logins, `email` and `fullName` will be `null` — look up account by `sub`
- Expected response: `{ "token": "jwt...", "newUser": true }`
