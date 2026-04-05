# BudgetGarden Frontend — Project Guide

## Overview

A visually-rich, cross-platform (iOS, Android, Web) personal budgeting app with a garden metaphor. Early-stage product. Primary flows: landing → Google OAuth → dashboard with income/expense tracking. Heavy animation focus using Reanimated 4 and Skia shaders.

**Stack:** React 19 + React Native 0.81 + Expo 54 + Expo Router 6 + Reanimated 4 + react-native-skia 2.2

---

## Running the Project

```bash
npm install
npm run start         # Expo dev server (then press a/i/w)
npm run android       # Android emulator
npm run ios           # iOS simulator
npm run web           # Browser
npm run vercel-build  # Static web export
```

---

## Project Structure

```
app/
  _layout.tsx         # Root: ThemeProvider, SafeAreaProvider, fonts, Stack nav
  landing.tsx         # Landing screen + AuthModal (Google OAuth)
  (tabs)/
    _layout.tsx       # Tab nav — tab bar is hidden (display: "none")
    index.tsx         # Home: features, waitlist email signup
    dashboard.tsx     # Budget score, income/expense inputs
    roadmap.tsx       # Product roadmap (5 phases)

components/
  grass-wave.tsx      # Native: Skia RuntimeEffect shader (grass wave animation)
  grass-wave.web.tsx  # Web: WebGL fragment shader (same effect)
  flower-petals.tsx   # 22 falling animated petals (deterministic, no Math.random)
  animated-trees.tsx  # 15 trees + 5 floating coins (ambient background)
  themed-text.tsx     # Text with dark/light theme
  themed-view.tsx     # View with theme-aware background

hooks/
  use-color-scheme.ts
  use-theme-color.ts

constants/theme.ts    # Color palettes, font names
styles/tabs/          # StyleSheet objects for each tab screen
```

---

## Navigation

File-based routing via Expo Router. Flow:

```
landing (initialRouteName)
  → onSuccess: router.replace("/(tabs)")
      (tabs)/index        (home)
      (tabs)/roadmap
      (tabs)/dashboard
```

---

## Authentication

Google OAuth via `expo-auth-session`. Three client IDs (web, Android, iOS) hard-coded in `landing.tsx`.

**Login flow:**
1. `Google.useAuthRequest()` + `makeRedirectUri({ scheme: "bugetgardenfront", path: "auth" })`
2. Extract `accessToken` from response
3. `POST http://localhost:8080/authorization-google` `{ token, provider: "google" }`
4. `router.replace("/(tabs)")`

**Email/password auth:** UI exists but not implemented (TODO).

**Auth persistence:** None — user is logged out on app restart.

---

## Backend API

| Endpoint | Method | File | Notes |
|----------|--------|------|-------|
| `/login` | POST | landing.tsx | Uses `localhost:8080` (dev only!) |
| `/email-add` | POST | index.tsx | Waitlist; uses `no-cors` + URLSearchParams |
| `/monthly-income` | POST | dashboard.tsx | Production Railway URL |
| `/monthly-expenses` | POST | dashboard.tsx | Production Railway URL |

**Production base:** `https://bugetgarden-backend-production-7c3b.up.railway.app`

**Warning:** The login endpoint still points to `localhost:8080`, not the Railway URL.

---

## Platform-Specific Behavior

| Feature | iOS/Android | Web |
|---------|-------------|-----|
| Grass animation | `grass-wave.tsx` — Skia `RuntimeEffect` SKSL shader | `grass-wave.web.tsx` — WebGL fragment shader |
| Canvas API | `@shopify/react-native-skia` | HTML Canvas via `react-native-web` |

**Android-specific config (app.json):**
- `edgeToEdgeEnabled: true` — app renders behind status/nav bars; `SafeAreaProvider` handles insets
- `predictiveBackGestureEnabled: false`
- `newArchEnabled: true` (New Architecture / Fabric)

**Experiments:** `reactCompiler: true` (React Compiler enabled) — watch for Reanimated compatibility issues.

---

## Animations

All heavy animations use `react-native-reanimated` (v4) with `useSharedValue` + `useAnimatedStyle`. Worklets run on the UI thread via `react-native-worklets` (0.5.1).

**Known Android issue:** With `reactCompiler: true` + New Architecture, Reanimated animations may not fire on Android startup. The landing screen content (`fadeAnim`) is initialized at `opacity: 0` on iOS (fades in) and `opacity: 1` on Android (immediately visible) to work around this.

**Flower petals:** Deterministic layout (no `Math.random`) — consistent across re-renders.

---

## Key Config

```json
// app.json
{
  "scheme": "bugetgardenfront",        // deep link / OAuth redirect
  "userInterfaceStyle": "dark",        // forced dark mode
  "newArchEnabled": true,
  "experiments": { "reactCompiler": true, "typedRoutes": true }
}
```

No `.env` file — backend URLs and Google Client IDs are hard-coded in source.

---

## Known Issues / TODOs

- Login API still points to `localhost:8080` (not Railway URL)
- No auth token persistence (logout on app restart)
- Dashboard score history uses mock data (`MOCK_SCORE_HISTORY`) — real API call commented out
- Email/password auth UI exists but not wired up
- No input validation beyond basic email format check
- Error handling uses `alert()` everywhere
- Comments in the codebase are in Romanian
