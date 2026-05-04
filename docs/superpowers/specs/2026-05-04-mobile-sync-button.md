# Mobile Sync Button — Design Spec

**Date:** 2026-05-04  
**Status:** Approved

## Overview

Add a sync button at the very bottom of the mobile drawer (`MobileNavMenu` in `components/nav-menu.tsx`). It shows when data was last refreshed and lets the user manually invalidate all React Query caches.

## Location

`components/nav-menu.tsx` — `MobileNavMenu` component only (mobile, not web).

## Layout

The drawer interior becomes a flex column:
- `ScrollView` (flex: 1) — contains all existing menu items (header, main items, secondary items, log out)
- Fixed footer — sync button, always visible at the drawer's bottom edge, above safe area

## Sync Button

```
[ 🔄 ]  Sync
         Last sync: 3 min ago
```

- **Icon**: `sync-outline` (Ionicons), 20px, white
- **Label**: "Sync" — `Nunito_700Bold`, 15px, `rgba(255,255,255,0.7)`
- **Subtitle**: "Last sync: X min ago" or "Never synced" — `Nunito_700Bold`, 12px, `rgba(255,255,255,0.45)`
- **Layout**: row — icon on the left, two-line text block on the right
- **Pressed state**: `rgba(255,255,255,0.1)` background, `borderRadius: 10`
- **Divider**: thin `rgba(255,255,255,0.25)` line above the footer

## State

```ts
const [lastSync, setLastSync] = useState<Date | null>(null);
const [syncLabel, setSyncLabel] = useState("Never synced");
```

- `lastSync` — in-memory only, resets on app restart (no persistence needed)
- `syncLabel` — derived string, recalculated every 30s via `setInterval`
- Interval starts after first sync; cleared on component unmount

## Relative Time Logic

```
< 1 min   → "Just now"
1–59 min  → "X min ago"
1–23 h    → "X h ago"
≥ 24 h    → "X d ago"
```

## Press Behavior

1. Call `queryClient.invalidateQueries()` — invalidates all cached queries
2. Set `lastSync` to `new Date()`
3. Spin the sync icon 360° (Reanimated `withTiming`, 600ms) — one shot, not loop
4. Update `syncLabel` immediately to "Just now"
5. Drawer stays open — user sees the update happen and closes manually

## Icon Animation

- `useSharedValue(0)` for rotation degrees
- On press: `rotation.value = withTiming(rotation.value + 360, { duration: 600 })`
- `useAnimatedStyle` maps to `rotate` transform
- Uses `Animated.View` (Reanimated) wrapping the icon

## What Does NOT Change

- Web nav (`WebNavBar`) — untouched
- All existing drawer items, styles, and navigation logic
- Drawer width, open/close animation
