# Manage Account Settings Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Manage Account" card to the settings page with Change Email and Change Password rows, disabled/grayed when the account provider is not `local`, each opening a dedicated form screen.

**Architecture:** Extend `AccountDto` with a `provider` field; add the card to `settings.tsx` with conditional disabled state; create two new screens (`change-email.tsx`, `change-password.tsx`) using the existing `edit-entry` pattern (green gradient header + KAV + ScrollView + inline toast/error); register both routes in `_layout.tsx`.

**Tech Stack:** React Native, Expo Router, React Query (`useMutation`), `api.patch()` from `lib/api.ts`, `LinearGradient`, `Ionicons`, `useSafeAreaInsets`

---

### Task 1: Add `provider` to `AccountDto`

**Files:**
- Modify: `app/(tabs)/dashboard.tsx:19-26`

- [ ] **Step 1: Add the `provider` field to `AccountDto`**

In `app/(tabs)/dashboard.tsx`, update the interface:

```ts
export interface AccountDto {
  email: string;
  displayName: string;
  goldCoins: number;
  totalScore: number;
  currency: string;
  avatarUrl?: string;
  provider: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/(tabs)/dashboard.tsx
git commit -m "feat: add provider field to AccountDto"
```

---

### Task 2: Add Manage Account card styles

**Files:**
- Modify: `styles/settings.styles.ts`

- [ ] **Step 1: Add styles for the Manage Account card at end of `StyleSheet.create` in `styles/settings.styles.ts`**

Add these entries inside the existing `StyleSheet.create({...})` block, after `avatarOptionImg`:

```ts
  manageCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  manageCardTitle: {
    fontFamily: "Nunito_900Black",
    fontSize: 13,
    color: "#6b7f6b",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
  },
  manageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 14,
  },
  manageRowPressed: {
    opacity: 0.7,
  },
  manageRowDisabled: {
    opacity: 0.4,
  },
  manageRowLabel: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 14,
    color: "#1a2e1b",
    flex: 1,
  },
  manageRowLabelDisabled: {
    color: "#b0b8b0",
  },
```

- [ ] **Step 2: Commit**

```bash
git add styles/settings.styles.ts
git commit -m "feat: add Manage Account card styles to settings"
```

---

### Task 3: Add Manage Account card to `settings.tsx`

**Files:**
- Modify: `app/settings.tsx`

- [ ] **Step 1: Add router import and Ionicons (already imported), then add the card JSX after `</View>` that closes `profileCard` and before `</ScrollView>`**

At the top of the component, `router` is already imported. `Ionicons` is already imported.

After the closing `</View>` of `profileCard` (line 151), add:

```tsx
        <View style={styles.manageCard}>
          <Text style={styles.manageCardTitle}>Manage Account</Text>

          <View style={styles.cardDivider} />

          <Pressable
            style={({ pressed }) => [
              styles.manageRow,
              pressed && account?.provider === "local" && styles.manageRowPressed,
              account?.provider !== "local" && styles.manageRowDisabled,
            ]}
            onPress={() => account?.provider === "local" && router.push("/change-email")}
            disabled={account?.provider !== "local"}
          >
            <Ionicons
              name="mail-outline"
              size={20}
              color={account?.provider === "local" ? "#346739" : "#b0b8b0"}
            />
            <Text
              style={[
                styles.manageRowLabel,
                account?.provider !== "local" && styles.manageRowLabelDisabled,
              ]}
            >
              Change Email
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={account?.provider === "local" ? "#9FCB98" : "#c8cec8"}
            />
          </Pressable>

          <View style={styles.cardDivider} />

          <Pressable
            style={({ pressed }) => [
              styles.manageRow,
              pressed && account?.provider === "local" && styles.manageRowPressed,
              account?.provider !== "local" && styles.manageRowDisabled,
            ]}
            onPress={() => account?.provider === "local" && router.push("/change-password")}
            disabled={account?.provider !== "local"}
          >
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={account?.provider === "local" ? "#346739" : "#b0b8b0"}
            />
            <Text
              style={[
                styles.manageRowLabel,
                account?.provider !== "local" && styles.manageRowLabelDisabled,
              ]}
            >
              Change Password
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={account?.provider === "local" ? "#9FCB98" : "#c8cec8"}
            />
          </Pressable>
        </View>
```

- [ ] **Step 2: Commit**

```bash
git add app/settings.tsx
git commit -m "feat: add Manage Account card to settings screen"
```

---

### Task 4: Create shared styles for account change screens

**Files:**
- Create: `styles/change-account.styles.ts`

- [ ] **Step 1: Create the styles file**

```ts
import { Platform, StyleSheet } from "react-native";

export const inputOutline = Platform.select({
  web: { outlineStyle: "none" as any, outlineWidth: 0 },
});

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F8F5",
  },
  header: {
    paddingBottom: 28,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Nunito_900Black",
    color: "#FFFFFF",
    textAlign: "center",
    paddingTop: 12,
    marginBottom: 10,
  },
  headerSubRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  backBtnPressed: {
    backgroundColor: "rgba(255,255,255,0.28)",
  },
  headerSpacer: {
    width: 32,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 48,
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: "Nunito_700Bold",
    color: "#7AAA7A",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F8F0",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: "#C8DFC6",
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Nunito_700Bold",
    color: "#346739",
    padding: 0,
    ...inputOutline,
  },
  saveBtn: {
    backgroundColor: "#346739",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 12,
  },
  saveBtnPressed: {
    backgroundColor: "#2A4A2E",
  },
  saveBtnDisabled: {
    backgroundColor: "#C8DFC6",
  },
  saveBtnText: {
    fontSize: 17,
    fontFamily: "Nunito_900Black",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  errorText: {
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
    color: "#E53935",
    textAlign: "center",
    marginBottom: 12,
  },
  toast: {
    position: "absolute",
    top: 120,
    left: 32,
    right: 32,
    backgroundColor: "#346739",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  toastText: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 14,
    color: "#ffffff",
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add styles/change-account.styles.ts
git commit -m "feat: add shared styles for change-account screens"
```

---

### Task 5: Create `app/change-email.tsx`

**Files:**
- Create: `app/change-email.tsx`

- [ ] **Step 1: Create the screen**

```tsx
import { NavMenu } from "@/components/nav-menu";
import { api } from "@/lib/api";
import { ACCOUNT_QUERY_KEY } from "@/app/(tabs)/dashboard";
import { inputOutline, styles } from "@/styles/change-account.styles";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ChangeEmailScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: () => api.patch("/accounts/email", { currentPassword, newEmail }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEY });
      setToastVisible(true);
      toastTimer.current = setTimeout(() => {
        setToastVisible(false);
        router.canGoBack() ? router.back() : router.replace("/settings");
      }, 2000);
    },
  });

  const canSubmit = currentPassword.length > 0 && newEmail.includes("@") && !isPending;
  const errorMsg = error?.message ?? null;

  return (
    <View style={styles.root}>
      <NavMenu />
      <LinearGradient
        colors={["#2A4A2E", "#346739"]}
        style={[styles.header, { paddingTop: Platform.OS === "web" ? 56 : insets.top + 56 }]}
      >
        <Text style={styles.headerTitle}>Change Email</Text>
        <View style={styles.headerSubRow}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
            onPress={() => router.canGoBack() ? router.back() : router.replace("/settings")}
          >
            <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
          </Pressable>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionLabel}>Current Password</Text>
          <View style={styles.inputBox}>
            <Ionicons name="lock-closed-outline" size={18} color="#79AE6F" style={styles.inputIcon} />
            <TextInput
              style={[styles.textInput, inputOutline]}
              value={currentPassword}
              onChangeText={(t) => { reset(); setCurrentPassword(t); }}
              placeholder="Enter current password"
              placeholderTextColor="#B8D4B8"
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.sectionLabel}>New Email</Text>
          <View style={styles.inputBox}>
            <Ionicons name="mail-outline" size={18} color="#79AE6F" style={styles.inputIcon} />
            <TextInput
              style={[styles.textInput, inputOutline]}
              value={newEmail}
              onChangeText={(t) => { reset(); setNewEmail(t); }}
              placeholder="Enter new email"
              placeholderTextColor="#B8D4B8"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

          <Pressable
            style={({ pressed }) => [
              styles.saveBtn,
              pressed && styles.saveBtnPressed,
              !canSubmit && styles.saveBtnDisabled,
            ]}
            onPress={() => mutate()}
            disabled={!canSubmit}
          >
            <Text style={styles.saveBtnText}>{isPending ? "Saving…" : "Save"}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      {toastVisible && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>Email updated successfully</Text>
        </View>
      )}
    </View>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/change-email.tsx
git commit -m "feat: add Change Email screen"
```

---

### Task 6: Create `app/change-password.tsx`

**Files:**
- Create: `app/change-password.tsx`

- [ ] **Step 1: Create the screen**

```tsx
import { NavMenu } from "@/components/nav-menu";
import { api } from "@/lib/api";
import { inputOutline, styles } from "@/styles/change-account.styles";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ChangePasswordScreen() {
  const insets = useSafeAreaInsets();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: () => api.patch("/accounts/password", { currentPassword, newPassword }),
    onSuccess: () => {
      setToastVisible(true);
      toastTimer.current = setTimeout(() => {
        setToastVisible(false);
        router.canGoBack() ? router.back() : router.replace("/settings");
      }, 2000);
    },
  });

  const canSubmit = currentPassword.length > 0 && newPassword.length > 0 && !isPending;
  const errorMsg = error?.message ?? null;

  return (
    <View style={styles.root}>
      <NavMenu />
      <LinearGradient
        colors={["#2A4A2E", "#346739"]}
        style={[styles.header, { paddingTop: Platform.OS === "web" ? 56 : insets.top + 56 }]}
      >
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={styles.headerSubRow}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
            onPress={() => router.canGoBack() ? router.back() : router.replace("/settings")}
          >
            <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
          </Pressable>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionLabel}>Current Password</Text>
          <View style={styles.inputBox}>
            <Ionicons name="lock-closed-outline" size={18} color="#79AE6F" style={styles.inputIcon} />
            <TextInput
              style={[styles.textInput, inputOutline]}
              value={currentPassword}
              onChangeText={(t) => { reset(); setCurrentPassword(t); }}
              placeholder="Enter current password"
              placeholderTextColor="#B8D4B8"
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.sectionLabel}>New Password</Text>
          <View style={styles.inputBox}>
            <Ionicons name="key-outline" size={18} color="#79AE6F" style={styles.inputIcon} />
            <TextInput
              style={[styles.textInput, inputOutline]}
              value={newPassword}
              onChangeText={(t) => { reset(); setNewPassword(t); }}
              placeholder="Enter new password"
              placeholderTextColor="#B8D4B8"
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

          <Pressable
            style={({ pressed }) => [
              styles.saveBtn,
              pressed && styles.saveBtnPressed,
              !canSubmit && styles.saveBtnDisabled,
            ]}
            onPress={() => mutate()}
            disabled={!canSubmit}
          >
            <Text style={styles.saveBtnText}>{isPending ? "Saving…" : "Save"}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      {toastVisible && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>Password updated successfully</Text>
        </View>
      )}
    </View>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/change-password.tsx
git commit -m "feat: add Change Password screen"
```

---

### Task 7: Register routes in `_layout.tsx`

**Files:**
- Modify: `app/_layout.tsx`

- [ ] **Step 1: Add `Stack.Screen` entries for the two new screens**

Inside the `<Stack initialRouteName="landing">` block in `app/_layout.tsx`, after the existing `settings` entry:

```tsx
            <Stack.Screen name="change-email" options={{ headerShown: false }} />
            <Stack.Screen name="change-password" options={{ headerShown: false }} />
```

- [ ] **Step 2: Commit**

```bash
git add app/_layout.tsx
git commit -m "feat: register change-email and change-password routes"
```
