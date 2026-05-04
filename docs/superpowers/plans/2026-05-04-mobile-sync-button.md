# Mobile Sync Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a sticky sync button at the bottom of the mobile drawer that shows last sync time and invalidates all React Query caches on press.

**Architecture:** All changes are confined to `MobileNavMenu` in `components/nav-menu.tsx`. The drawer interior is restructured into a `ScrollView` (existing items) + fixed footer (sync button). Sync state is local to the component; no persistence.

**Tech Stack:** React Native, Reanimated 4 (`useSharedValue`, `useAnimatedStyle`, `withTiming`), React Query (`useQueryClient`), Ionicons, `useSafeAreaInsets`

---

## Files

- Modify: `components/nav-menu.tsx`

---

### Task 1: Add `relativeTime` helper

**Files:**
- Modify: `components/nav-menu.tsx`

- [ ] **Step 1: Add helper function above `MobileNavMenu`**

Add this function immediately above the `function MobileNavMenu()` declaration (around line 149):

```ts
function relativeTime(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.floor(hours / 24)} d ago`;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors in `components/nav-menu.tsx`

- [ ] **Step 3: Commit**

```bash
git add components/nav-menu.tsx
git commit -m "feat(sync): add relativeTime helper to nav-menu"
```

---

### Task 2: Add sync state + interval to `MobileNavMenu`

**Files:**
- Modify: `components/nav-menu.tsx`

- [ ] **Step 1: Update React import to include `useEffect`**

Change the React import in `MobileNavMenu` — the file currently imports `React, { useState }`. Change to:

```ts
import React, { useEffect, useState } from "react";
```

- [ ] **Step 2: Add sync state and interval inside `MobileNavMenu`**

After the existing `const translateX = useSharedValue(-DRAWER_WIDTH);` line (around line 160), add:

```ts
const [lastSync, setLastSync] = useState<Date | null>(null);
const [syncLabel, setSyncLabel] = useState("Never synced");

useEffect(() => {
  if (!lastSync) return;
  setSyncLabel(relativeTime(lastSync));
  const id = setInterval(() => setSyncLabel(relativeTime(lastSync)), 30_000);
  return () => clearInterval(id);
}, [lastSync]);
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add components/nav-menu.tsx
git commit -m "feat(sync): add sync state and label interval to MobileNavMenu"
```

---

### Task 3: Add rotation shared value + sync handler

**Files:**
- Modify: `components/nav-menu.tsx`

- [ ] **Step 1: Add rotation shared value after the other shared values**

After `const translateX = useSharedValue(-DRAWER_WIDTH);`, add:

```ts
const rotation = useSharedValue(0);
const syncIconStyle = useAnimatedStyle(() => ({
  transform: [{ rotate: `${rotation.value}deg` }],
}));
```

- [ ] **Step 2: Add `handleSync` function inside `MobileNavMenu`**

After the `handleLogout` function, add:

```ts
const handleSync = () => {
  rotation.value = withTiming(rotation.value + 360, { duration: 600 });
  queryClient.invalidateQueries();
  const now = new Date();
  setLastSync(now);
  setSyncLabel("Just now");
};
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add components/nav-menu.tsx
git commit -m "feat(sync): add rotation animation and handleSync in MobileNavMenu"
```

---

### Task 4: Restructure drawer body + add sync footer JSX

**Files:**
- Modify: `components/nav-menu.tsx`

- [ ] **Step 1: Wrap existing drawer content in a `ScrollView`**

The `<Animated.View style={[mobileStyles.drawer, ...]}>` currently holds all items directly. Wrap the inner content (from `<View style={mobileStyles.drawerHeader}>` down through the Log Out `<Pressable>`) in a `ScrollView`:

```tsx
<Animated.View style={[mobileStyles.drawer, drawerStyle, { paddingTop: insets.top + 20 }]}>
  <ScrollView
    style={{ flex: 1 }}
    showsVerticalScrollIndicator={false}
    contentContainerStyle={{ paddingBottom: 8 }}
  >
    <View style={mobileStyles.drawerHeader}>
      <Image
        source={require("../assets/avatars/gardener_1.png")}
        style={mobileStyles.drawerAvatar}
      />
      <Text style={mobileStyles.drawerTitle}>{account?.displayName ?? "user"}</Text>
    </View>
    <View style={mobileStyles.divider} />

    {MENU_ITEMS.map(({ label, icon, path }) => (
      <Pressable
        key={path}
        style={({ pressed }) => [mobileStyles.menuItem, pressed && mobileStyles.menuItemPressed]}
        onPress={() => navigate(path)}
      >
        <Ionicons name={icon} size={22} color="#ffffff" />
        <Text style={mobileStyles.menuLabel}>{label}</Text>
      </Pressable>
    ))}

    <View style={mobileStyles.divider} />

    {SECONDARY_ITEMS.map(({ label, icon, path }) => (
      <Pressable
        key={path}
        style={({ pressed }) => [mobileStyles.menuItem, pressed && mobileStyles.menuItemPressed]}
        onPress={() => navigate(path)}
      >
        <Ionicons name={icon} size={20} color="rgba(255,255,255,0.7)" />
        <Text style={mobileStyles.menuLabelSecondary}>{label}</Text>
      </Pressable>
    ))}

    <View style={mobileStyles.divider} />

    <Pressable
      style={({ pressed }) => [mobileStyles.menuItem, pressed && mobileStyles.menuItemPressed]}
      onPress={handleLogout}
    >
      <Ionicons name={LOGOUT_ITEM.icon} size={20} color="rgba(255, 120, 100, 0.9)" />
      <Text style={mobileStyles.menuLabelLogout}>{LOGOUT_ITEM.label}</Text>
    </Pressable>
  </ScrollView>

  {/* Sync footer */}
  <View style={mobileStyles.syncDivider} />
  <Pressable
    style={({ pressed }) => [
      mobileStyles.menuItem,
      pressed && mobileStyles.menuItemPressed,
      { marginBottom: insets.bottom },
    ]}
    onPress={handleSync}
  >
    <Animated.View style={syncIconStyle}>
      <Ionicons name="sync-outline" size={20} color="rgba(255,255,255,0.7)" />
    </Animated.View>
    <View>
      <Text style={mobileStyles.menuLabelSecondary}>Sync</Text>
      <Text style={mobileStyles.syncSubLabel}>{syncLabel}</Text>
    </View>
  </Pressable>
</Animated.View>
```

- [ ] **Step 2: Add `ScrollView` to the React Native import**

Find the existing import:

```ts
import { Image, Modal, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
```

Add `ScrollView`:

```ts
import { Image, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
```

- [ ] **Step 3: Add new styles to `mobileStyles`**

In the `mobileStyles` StyleSheet, add after `menuLabelLogout`:

```ts
syncDivider: {
  height: 1,
  backgroundColor: "rgba(255,255,255,0.25)",
  marginBottom: 4,
},
syncSubLabel: {
  fontFamily: "Nunito_700Bold",
  fontSize: 12,
  color: "rgba(255,255,255,0.45)",
},
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 5: Verify the app runs on mobile**

```bash
npx expo start
```

Open on a physical device or Android emulator. Open the drawer (hamburger), scroll through items, verify:
- Sync button is fixed at the bottom, always visible
- Shows "Never synced" initially
- Pressing it spins the icon and updates to "Just now"
- After 1 min it updates to "1 min ago"
- Drawer stays open after pressing sync

- [ ] **Step 6: Commit**

```bash
git add components/nav-menu.tsx
git commit -m "feat(sync): add sync footer to mobile drawer with animated icon and relative time"
```
