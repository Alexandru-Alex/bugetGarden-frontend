# Notification Settings Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Notification" card to the settings page with a daily-reminder toggle (backed by `AccountDto.isNotification`) and a link to OS notification settings.

**Architecture:** Extend `AccountDto` with `isNotification`, add a `useMutation` for patching it, render a new card after the Appearance card using existing `manageCard` styles plus two new style entries.

**Tech Stack:** React Native, Expo Router, React Query (`useMutation`), `Linking` from `react-native`, `Switch` from `react-native`, Ionicons.

---

### Task 1: Extend AccountDto with isNotification

**Files:**
- Modify: `app/(tabs)/dashboard.tsx:19-28`

- [ ] **Step 1: Add `isNotification` to the interface**

In `app/(tabs)/dashboard.tsx`, update `AccountDto`:

```typescript
export interface AccountDto {
  email: string;
  displayName: string;
  goldCoins: number;
  totalScore: number;
  currency: string;
  numberOfDecimals?: number;
  avatarUrl?: string;
  provider: string;
  isNotification?: boolean;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors related to `isNotification`

- [ ] **Step 3: Commit**

```bash
git add app/(tabs)/dashboard.tsx
git commit -m "feat: add isNotification to AccountDto"
```

---

### Task 2: Add new styles for the Notification card

**Files:**
- Modify: `styles/settings.styles.ts`

- [ ] **Step 1: Add `notifLabelGroup` and `notifSubtext` to the StyleSheet**

In `styles/settings.styles.ts`, append inside the `StyleSheet.create({...})` call, after the last entry (`webPickerTextSelected`, `currencyModalBtn`, etc.):

```typescript
  notifLabelGroup: {
    flex: 1,
    gap: 2,
  },
  notifSubtext: {
    fontFamily: "Nunito_700Bold",
    fontSize: 12,
    color: "#6b7f6b",
  },
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add styles/settings.styles.ts
git commit -m "style: add notifLabelGroup and notifSubtext for notification card"
```

---

### Task 3: Add mutation and Notification card UI in settings.tsx

**Files:**
- Modify: `app/settings.tsx`

- [ ] **Step 1: Add `Switch` and `Linking` to the React Native import**

At the top of `app/settings.tsx`, update the React Native import line (currently line 12):

```typescript
import { Image, Linking, Modal, NativeScrollEvent, NativeSyntheticEvent, Platform, Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
```

- [ ] **Step 2: Add `updateNotification` mutation after the `updateDecimals` mutation (around line 89)**

```typescript
  const { mutate: updateNotification } = useMutation({
    mutationFn: (isNotification: boolean) =>
      api.patch("/accounts", { name: null, currency: null, numberOfDecimals: null, isNotification }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEY }),
  });
```

- [ ] **Step 3: Add the Notification card after the Appearance card closing `</View>` (around line 292)**

Insert immediately after `</View>` that closes the Appearance card:

```tsx
        <View style={[styles.manageCard, { marginTop: 16 }]}>
          <Text style={styles.manageCardTitle}>Notification</Text>

          <View style={styles.cardDivider} />

          <View style={styles.manageRow}>
            <Ionicons name="notifications-outline" size={20} color="#346739" />
            <View style={styles.notifLabelGroup}>
              <Text style={styles.manageRowLabel}>Remind everyday</Text>
              <Text style={styles.notifSubtext}>Remind to add expenses/income</Text>
            </View>
            <Switch
              value={account?.isNotification ?? false}
              onValueChange={(val) => updateNotification(val)}
              trackColor={{ false: "#e0e0e0", true: "#9FCB98" }}
              thumbColor="#346739"
            />
          </View>

          <View style={styles.cardDivider} />

          <Pressable
            style={({ pressed }) => [styles.manageRow, pressed && styles.manageRowPressed]}
            onPress={() => Linking.openSettings()}
          >
            <Ionicons name="settings-outline" size={20} color="#346739" />
            <Text style={styles.manageRowLabel}>Notification settings</Text>
            <Ionicons name="chevron-forward" size={16} color="#9FCB98" />
          </Pressable>
        </View>
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add app/settings.tsx
git commit -m "feat: add Notification card with daily reminder toggle and notification settings link"
```
