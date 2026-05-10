# Mobile Notifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add daily local scheduled notifications on Android/iOS — user enables via toggle in settings and picks a reminder hour (whole hours, 0–23).

**Architecture:** A new `lib/notifications.ts` module owns all `expo-notifications` calls (request permission, schedule, cancel, persist hour to SecureStore). Settings wires the toggle and hour picker to this module. `app/(tabs)/_layout.tsx` calls `ensureScheduled()` on mount so the notification survives app updates/restarts.

**Tech Stack:** `expo-notifications` (new), `expo-secure-store` (already installed), React Native `Platform` guard for web no-ops.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `lib/notifications.ts` | **Create** | All notification logic: permission, schedule, cancel, SecureStore persistence |
| `app.json` | **Modify** | Add `expo-notifications` plugin config |
| `app/(tabs)/_layout.tsx` | **Modify** | Call `ensureScheduled()` on mount (startup re-schedule guard) |
| `app/settings.tsx` | **Modify** | Async toggle handler, hour state, hour picker row, toast for denied permission |
| `styles/settings.styles.ts` | **Modify** | Add `notifTimeRow`, `notifTimeLabel`, `notifTimeControls`, `notifTimeValue`, `toast`, `toastText` styles |

---

## Task 1: Install expo-notifications and configure app.json

**Files:**
- Modify: `app.json`

- [ ] **Step 1: Install the package**

```bash
npx expo install expo-notifications
```

Expected output: package added to `package.json`, no errors.

- [ ] **Step 2: Add plugin config to app.json**

In `app.json`, inside `"plugins": [...]`, add after `"expo-secure-store"`:

```json
[
  "expo-notifications",
  {
    "icon": "./assets/images/icon.jpg",
    "color": "#346739",
    "androidMode": "default"
  }
]
```

Final `plugins` array in `app.json`:
```json
"plugins": [
  "expo-router",
  [
    "@react-native-google-signin/google-signin",
    {
      "iosUrlScheme": "com.googleusercontent.apps.975323074001-re455uukp107dpf8l25q75nia9co29td"
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
  "expo-apple-authentication",
  [
    "expo-notifications",
    {
      "icon": "./assets/images/icon.jpg",
      "color": "#346739",
      "androidMode": "default"
    }
  ]
]
```

- [ ] **Step 3: Commit**

```bash
git add app.json package.json
git commit -m "feat: install expo-notifications"
```

---

## Task 2: Create lib/notifications.ts

**Files:**
- Create: `lib/notifications.ts`

- [ ] **Step 1: Create the file**

Create `lib/notifications.ts` with this exact content:

```ts
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const HOUR_KEY = "notif_hour";
const ENABLED_KEY = "notif_enabled";
const DEFAULT_HOUR = 20;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function getSavedHour(): Promise<number> {
  if (Platform.OS === "web") return DEFAULT_HOUR;
  const stored = await SecureStore.getItemAsync(HOUR_KEY);
  return stored !== null ? parseInt(stored, 10) : DEFAULT_HOUR;
}

export async function saveHour(hour: number): Promise<void> {
  if (Platform.OS === "web") return;
  await SecureStore.setItemAsync(HOUR_KEY, String(hour));
}

export async function requestPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function scheduleDaily(hour: number): Promise<void> {
  if (Platform.OS === "web") return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Money Garden 🌱",
      body: "Don't forget to log your expenses and income today!",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute: 0,
    },
  });
}

export async function cancelAll(): Promise<void> {
  if (Platform.OS === "web") return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function setEnabledFlag(value: boolean): Promise<void> {
  if (Platform.OS === "web") return;
  await SecureStore.setItemAsync(ENABLED_KEY, value ? "1" : "0");
}

export async function ensureScheduled(): Promise<void> {
  if (Platform.OS === "web") return;
  const enabled = await SecureStore.getItemAsync(ENABLED_KEY);
  if (enabled !== "1") return;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  if (scheduled.length === 0) {
    const hour = await getSavedHour();
    await scheduleDaily(hour);
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors related to `lib/notifications.ts`.

- [ ] **Step 3: Commit**

```bash
git add lib/notifications.ts
git commit -m "feat: add notifications module"
```

---

## Task 3: Startup re-schedule guard in app/(tabs)/_layout.tsx

**Files:**
- Modify: `app/(tabs)/_layout.tsx`

- [ ] **Step 1: Update the file**

Replace the entire `app/(tabs)/_layout.tsx` with:

```tsx
import { ensureScheduled } from "@/lib/notifications";
import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { NavTransition } from "@/lib/nav-direction";

let _notifGuard = false;

export default function TabLayout() {
  useEffect(() => {
    if (_notifGuard) return;
    _notifGuard = true;
    ensureScheduled();
  }, []);

  return (
    <Stack
      screenOptions={() => ({
        headerShown: false,
        animation: NavTransition.isForward() ? "slide_from_right" : "slide_from_left",
      })}
    />
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "app/(tabs)/_layout.tsx"
git commit -m "feat: re-schedule notification on app startup"
```

---

## Task 4: Add styles for hour picker and toast to settings.styles.ts

**Files:**
- Modify: `styles/settings.styles.ts`

- [ ] **Step 1: Add new style entries**

In `styles/settings.styles.ts`, insert the following styles inside `StyleSheet.create({...})`, just before the closing `});` (after the `notifSubtext` block at the end):

```ts
  notifTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 10,
  },
  notifTimeLabel: {
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    color: "#6b7f6b",
    flex: 1,
  },
  notifTimeControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  notifTimeValue: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 15,
    color: "#346739",
    minWidth: 52,
    textAlign: "center",
  },
  toast: {
    position: "absolute",
    top: 120,
    alignSelf: "center",
    backgroundColor: "rgba(31,46,31,0.92)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 100,
  },
  toastText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
    color: "#fff",
    textAlign: "center",
  },
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add styles/settings.styles.ts
git commit -m "style: add notification hour picker and toast styles"
```

---

## Task 5: Wire notifications into settings.tsx

**Files:**
- Modify: `app/settings.tsx`

### Step 1 — Add imports

- [ ] At the top of `app/settings.tsx`, add the notifications import alongside existing imports:

```ts
import {
  cancelAll,
  ensureScheduled,
  getSavedHour,
  requestPermission,
  saveHour,
  scheduleDaily,
  setEnabledFlag,
} from "@/lib/notifications";
```

### Step 2 — Add new state variables

- [ ] Inside `SettingsScreen`, after the existing `const [notifEnabled, setNotifEnabled] = useState<boolean | undefined>(undefined);` line, add:

```ts
const [notifHour, setNotifHour] = useState(20);
const [notifToast, setNotifToast] = useState<string | null>(null);
const notifToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
```

### Step 3 — Load saved hour on mount

- [ ] Add a new `useEffect` after the existing `useEffect` that loads `account?.notification` (around line 63):

```ts
useEffect(() => {
  if (Platform.OS !== "web") {
    getSavedHour().then(setNotifHour);
  }
}, []);

useEffect(() => {
  return () => {
    if (notifToastTimer.current) clearTimeout(notifToastTimer.current);
  };
}, []);
```

### Step 4 — Add handleNotifToggle handler

- [ ] Add this handler function inside `SettingsScreen`, before the `return` statement (alongside the other handlers like `handleSync`, `handleSelectAvatar`, etc.):

```ts
const handleNotifToggle = async (val: boolean) => {
  if (val) {
    const granted = await requestPermission();
    if (!granted) {
      setNotifEnabled(false);
      if (notifToastTimer.current) clearTimeout(notifToastTimer.current);
      setNotifToast("Enable notifications in your device settings");
      notifToastTimer.current = setTimeout(() => setNotifToast(null), 3000);
      return;
    }
    setNotifEnabled(true);
    await setEnabledFlag(true);
    await saveHour(notifHour);
    await scheduleDaily(notifHour);
  } else {
    setNotifEnabled(false);
    await setEnabledFlag(false);
    await cancelAll();
  }
  updateNotification(val);
};
```

### Step 5 — Add handleHourChange handler

- [ ] Add this handler immediately after `handleNotifToggle`:

```ts
const handleHourChange = async (h: number) => {
  setNotifHour(h);
  await saveHour(h);
  await scheduleDaily(h);
};
```

### Step 6 — Replace the Switch onValueChange

- [ ] Find the Switch component in the notification card (around line 316–322):

```tsx
<Switch
  value={notifEnabled ?? false}
  onValueChange={(val) => { setNotifEnabled(val); updateNotification(val); }}
  disabled={savingNotification}
  trackColor={{ false: "#e0e0e0", true: "#9FCB98" }}
  thumbColor="#346739"
/>
```

Replace with:

```tsx
<Switch
  value={notifEnabled ?? false}
  onValueChange={handleNotifToggle}
  disabled={savingNotification}
  trackColor={{ false: "#e0e0e0", true: "#9FCB98" }}
  thumbColor="#346739"
/>
```

### Step 7 — Add hour picker row

- [ ] Immediately after the closing `</View>` of the `manageRow` that contains the Switch (after line 323), and before `{Platform.OS !== "web" && <View style={styles.cardDivider} />}`, add:

```tsx
{notifEnabled && Platform.OS !== "web" && (
  <>
    <View style={styles.cardDivider} />
    <View style={styles.notifTimeRow}>
      <Text style={styles.notifTimeLabel}>Remind at:</Text>
      <View style={styles.notifTimeControls}>
        <Pressable onPress={() => handleHourChange((notifHour - 1 + 24) % 24)}>
          <Ionicons name="chevron-back" size={20} color="#346739" />
        </Pressable>
        <Text style={styles.notifTimeValue}>
          {String(notifHour).padStart(2, "0")}:00
        </Text>
        <Pressable onPress={() => handleHourChange((notifHour + 1) % 24)}>
          <Ionicons name="chevron-forward" size={20} color="#346739" />
        </Pressable>
      </View>
    </View>
  </>
)}
```

### Step 8 — Add toast overlay

- [ ] Inside the root `<View style={styles.root}>` (the outermost view returned by `SettingsScreen`), add the toast as the last child before the closing `</View>`:

```tsx
{notifToast !== null && (
  <View style={styles.toast} pointerEvents="none">
    <Text style={styles.toastText}>{notifToast}</Text>
  </View>
)}
```

### Step 9 — Verify TypeScript

- [ ] Run:

```bash
npx tsc --noEmit
```

Expected: no errors.

### Step 10 — Commit

- [ ] 

```bash
git add app/settings.tsx
git commit -m "feat: wire daily notification scheduling to settings toggle and hour picker"
```

---

## Task 6: Manual verification on device/emulator

- [ ] **Build and run on Android:**

```bash
npx expo run:android
```

- [ ] **Test: Enable toggle**
  - Open Settings → Notification card
  - Toggle "Remind everyday" ON
  - Expected: OS permission dialog appears (first time); after granting, toggle stays ON and "Remind at: 20:00" row appears below

- [ ] **Test: Change hour**
  - Tap the `<` and `>` chevrons to change the hour
  - Expected: display updates (e.g. `19:00`, `21:00`); notification is rescheduled silently

- [ ] **Test: Disable toggle**
  - Toggle OFF
  - Expected: toggle goes OFF, hour picker disappears

- [ ] **Test: Permission denied**
  - Reset app permissions via device settings, then toggle ON again and deny permission
  - Expected: toggle reverts to OFF, toast "Enable notifications in your device settings" appears for 3 seconds

- [ ] **Test: Startup re-schedule**
  - Enable notifications, force-close the app, reopen it
  - Expected: notification still fires at the chosen hour (verify via `adb shell cmd notification list` or wait for the time)

- [ ] **Commit verification result**

```bash
git commit --allow-empty -m "chore: verified notifications on Android"
```
