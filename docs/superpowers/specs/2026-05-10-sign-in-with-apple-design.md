# Sign in with Apple — Design Spec

**Date:** 2026-05-10  
**Platforms:** iOS (native), Web  
**Endpoint:** `POST /authorization-apple`

---

## Overview

Implement Sign in with Apple in `AuthModal` (landing.tsx). The existing Apple button placeholder (`alert("coming soon")`) is replaced with a real handler. Two codepaths: `expo-apple-authentication` on iOS, `expo-auth-session` (Apple OIDC) on Web. Android hides the button entirely.

---

## Prerequisites

### Apple Developer Console
- **Sign In with Apple** capability enabled on the App ID (bundle: `com.g3d0m.bugetgardenfront`)
- A **Services ID** for web OAuth (identifier e.g. `com.g3d0m.bugetgardenfront.web`)
  - Redirect URI registered: `https://bugetgardenfront.vercel.app` (prod) + `https://auth.expo.io` (Expo Go dev)

### Package
- Install `expo-apple-authentication` (~7.x, compatible with Expo SDK 54)
- Add plugin to `app.json` plugins array: `"expo-apple-authentication"`

---

## Request Model — `POST /authorization-apple`

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

| Field | Type | Required | Notes |
|---|---|---|---|
| `identityToken` | `string` (JWT) | Yes | Verify against Apple JWKS at `https://appleid.apple.com/auth/keys`. Audience must match bundle ID (iOS) or Service ID (web). |
| `authorizationCode` | `string` | No | Can be used for server-to-server token exchange if needed. |
| `user` | `string` | No | Stable Apple user ID. Present on every iOS call; on web only on first login. |
| `email` | `string \| null` | No | **Only returned on first sign-in.** Apple hides it on subsequent logins. Backend must persist it at account creation. |
| `fullName.givenName` | `string \| null` | No | Only on first sign-in. |
| `fullName.familyName` | `string \| null` | No | Only on first sign-in. |

**Expected response (identical to `/authorization-google`):**
```json
{ "token": "jwt...", "newUser": true }
```

---

## iOS Flow

Uses `expo-apple-authentication`:

```
AppleAuthentication.signInAsync({
  requestedScopes: [FULL_NAME, EMAIL]
})
→ { identityToken, authorizationCode, user, email, fullName }
→ POST /authorization-apple
→ { token, newUser } → saveToken → navigate
```

- Call `signInAsync` only on iOS (`Platform.OS === "ios"`)
- `expo-apple-authentication` is not available on Android/web — import must be guarded or lazy-required

---

## Web Flow

Uses `expo-auth-session` (already installed) with Apple OIDC:

```
useAuthRequest({
  clientId: APPLE_SERVICE_ID,
  scopes: ["name", "email"],
  redirectUri: makeRedirectUri(...),
  responseType: "code id_token",
  usePKCE: false,
})
→ response.params.id_token (= identityToken)
→ response.params.code (= authorizationCode)
→ POST /authorization-apple
→ { token, newUser } → saveToken → navigate
```

Apple OIDC discovery: `https://appleid.apple.com`

Note: `email` and `name` are returned in the `id_token` JWT on first login only, not as separate params. The `user` field is the `sub` claim inside the decoded `identityToken`.

---

## UI Changes

- Apple button: replaces `alert("coming soon")` with `handleAppleSignIn()`
- Button hidden on Android: wrap with `{Platform.OS !== "android" && <Pressable .../>}`
- `disabled` condition: `loading || (Platform.OS === "web" && !appleRequest)`
- No new styles needed — existing `auth.appleBtn` / `auth.appleBtnPressed` / `auth.appleText` styles are used

---

## Files Changed

| File | Change |
|---|---|
| `app/landing.tsx` | Add `handleAppleSignIn`, wire up Apple button, hide on Android |
| `app.json` | Add `expo-apple-authentication` to plugins |

---

## Backend Notes

- Verify `identityToken` (JWT) using Apple's public JWKS at `https://appleid.apple.com/auth/keys`
- Check `aud` claim: must match bundle ID on iOS (`com.g3d0m.bugetgardenfront`) or Service ID on web
- Check `iss` claim: must be `https://appleid.apple.com`
- `sub` claim = stable Apple user ID (same as `user` field sent from client)
- `email` may be a private relay address (`@privaterelay.appleid.com`) — treat as valid
- On subsequent logins, `email` in request body will be `null` — look up account by `sub`/`user`
