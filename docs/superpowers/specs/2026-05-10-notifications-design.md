# Mobile Notifications — Design Spec

**Date:** 2026-05-10  
**Status:** Approved

---

## Overview

Implement daily local scheduled notifications on mobile (Android + iOS) using `expo-notifications`. The user can enable/disable the reminder and choose an hour (whole hours only) from settings. The notification fires daily at the chosen time reminding the user to add expenses/income.

---

## Architecture

### New module: `lib/notifications.ts`

Single responsibility: all notification logic lives here. Exports:

- `requestPermission(): Promise<boolean>` — asks the OS for notification permission. Returns `true` if granted.
- `scheduleDaily(hour: number): Promise<void>` — cancels any existing scheduled notifications, then schedules a repeating daily notification at `hour:00`.
- `cancelAll(): Promise<void>` — cancels all scheduled notifications.
- `getSavedHour(): Promise<number>` — reads `notif_hour` from SecureStore, defaults to `20`.
- `saveHour(hour: number): Promise<void>` — persists `notif_hour` to SecureStore.

All functions are no-ops (return immediately) on `Platform.OS === 'web'`.

### `app.json` changes

Add `expo-notifications` plugin with:
- `icon`: app notification icon asset
- `color`: `#346739`
- Android: `useNextNotificationsApi: true`

### `app/_layout.tsx` — startup re-schedule

On mount, after the account query resolves: if `account.notification === true` and the platform is mobile, call `scheduleDaily(await getSavedHour())`. This re-schedules after OS clears notifications (app updates, device restarts, etc.).

Guard: only runs once per session using a module-level boolean flag.

---

## UI Changes — `app/settings.tsx`

### Toggle row (existing)

No change to the toggle itself. On `onValueChange`:
- **ON:** call `requestPermission()`. If granted → `scheduleDaily(savedHour)` + call backend PATCH. If denied → revert toggle to OFF + show inline toast "Enable notifications in your device settings".
- **OFF:** `cancelAll()` + call backend PATCH.

### New time picker row (inline, below toggle)

Visible only when `notifEnabled === true` and `Platform.OS !== 'web'`.

Layout:
```
[ Remind at:    < 20 >  ]
```

A horizontal row with a label "Remind at:" on the left and a simple hour picker on the right. The picker uses two `Pressable` chevron buttons (left/right) to increment/decrement the hour (0–23, wraps around). Displays as `HH:00` (zero-padded).

On hour change:
1. `saveHour(newHour)`
2. `scheduleDaily(newHour)` (internally cancels previous before rescheduling)

No modal, no scroll wheel — simple chevron controls keep the UI compact and avoid the web-incompatibility issues with ScrollView snap pickers.

State: `const [notifHour, setNotifHour] = useState(20)` — loaded from `getSavedHour()` in a `useEffect` when the component mounts.

---

## Notification Content

- **Title:** "Money Garden 🌱"
- **Body:** "Don't forget to log your expenses and income today!"
- **Trigger:** daily, repeating, at `hour:00` local time
- **Data:** `{}` (tap opens app home — default behavior)

---

## Permissions & Edge Cases

| Scenario | Behavior |
|---|---|
| Permission denied on first request | Toggle reverts to OFF, toast: "Enable notifications in your device settings" |
| iOS permission denied (can't re-request) | `Linking.openSettings()` offered via toast tap |
| Android permission denied | Can re-request next time user taps toggle ON |
| App updated / OS clears notifications | `_layout.tsx` startup guard re-schedules if `account.notification === true` |
| Web platform | All notification code is no-op (Platform.OS guard) |
| User logs out | `cancelAll()` called in logout flow |

---

## Dependencies

| Package | Action |
|---|---|
| `expo-notifications` | Install (`npx expo install expo-notifications`) |

No new backend endpoints. The existing `PATCH /accounts { notification }` is sufficient.

---

## Files Changed

| File | Change |
|---|---|
| `package.json` / `app.json` | Add `expo-notifications` |
| `lib/notifications.ts` | New file — all notification logic |
| `app/_layout.tsx` | Startup re-schedule guard |
| `app/settings.tsx` | Wire toggle + add hour picker row |
| `app/(tabs)/dashboard.tsx` | No change (AccountDto already has `notification`) |
