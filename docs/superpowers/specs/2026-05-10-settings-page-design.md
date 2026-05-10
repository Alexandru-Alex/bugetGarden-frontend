# Settings Page — Design Spec

**Date:** 2026-05-10

## Overview

A new `app/settings.tsx` screen accessible from the navigation menu under "Settings". The page follows the existing page pattern: `PageTransition` wrapper + `NavMenu` + `ScrollView` content.

## Route & Navigation

- File: `app/settings.tsx`
- Route: `/settings`
- Register in `app/_layout.tsx` as `<Stack.Screen name="settings" options={{ headerShown: false }} />`
- Update `SECONDARY_ITEMS` in `components/nav-menu.tsx`: change Settings path from `""` to `"/settings"`
- Styles in: `styles/settings.styles.ts`

## Layout (top to bottom)

### 1. Header — "Settings" title

Plain text title "Settings" rendered over a light background, consistent with other secondary pages. Uses `SafeAreaView` with `useSafeAreaInsets` for top padding on mobile.

### 2. Shop Banner

- `LinearGradient` from `#2A4A2E` → `#346739` → `#4a8050`, `border-radius: 16`
- Left side: small uppercase kicker label "Shop", bold white headline "Visit the shop to buy flowers for your garden", small "Go to Store ›" pill button
- Right side: `coin.png` image (`assets/images/coin.png`), size ~56×56
- Entire banner wrapped in `Pressable`; on press: navigate to `/store` via `router.replace("/store")`

### 3. Profile Card

- White card, `border-radius: 16`, subtle shadow
- Left: `gardener_1.png` avatar (`assets/avatars/gardener_1.png`), 56×56, circular with green border
- Right: `displayName` (bold, dark) and `email` (muted, smaller) from the `["account"]` React Query cache (`/accounts` endpoint returns `AccountDto` with `displayName` and `email`)
- Uses `useQuery` with `queryKey: ["account"]` and `staleTime: Infinity` — same query already used by `nav-menu.tsx` so no extra network request

## Data

- Account query key: `["account"]` — `GET /accounts` → `{ displayName, email, ... }`
- Token guard: same pattern as `store.tsx` — `getStoredToken()` on mount, redirect to `/landing` if null

## Auth Guard

```
const [token, setToken] = useState<string | null | undefined>(undefined);
useEffect(() => { getStoredToken().then(setToken); }, []);
if (token === undefined) return null;
if (!token) return <Redirect href="/landing" />;
```

## Files to create / modify

| Action | File |
|--------|------|
| Create | `app/settings.tsx` |
| Create | `styles/settings.styles.ts` |
| Modify | `app/_layout.tsx` — add Stack.Screen for "settings" |
| Modify | `components/nav-menu.tsx` — fix Settings path to "/settings" |
