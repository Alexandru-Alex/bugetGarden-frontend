# Edit Entry Screen — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a full-screen edit page where the user can update an entry's amount, description, and date, or delete it.

**Architecture:** Entry cards in `category-entries.tsx` become pressable and navigate to a new `edit-entry` route with the entry's data as params. The edit page calls `PUT /financial-entries/{id}` to save changes and `DELETE /financial-entries/{id}` to delete, then invalidates the list query and navigates back.

**Tech Stack:** Expo Router, React Query (`useMutation`), existing `api` client (`lib/api.ts`), existing `DatePickerField` component, `formatDateISO` from `lib/date.ts`.

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `lib/api.ts` | Add `api.put` and `api.delete` methods |
| Create | `styles/edit-entry.styles.ts` | All styles for the edit page |
| Create | `app/edit-entry.tsx` | Edit/delete form page |
| Modify | `app/_layout.tsx` | Register `edit-entry` Stack.Screen |
| Modify | `app/category-entries.tsx` | Make entry cards pressable, push to edit-entry |

---

## Task 1: Add `put` and `delete` to the API client

**Files:**
- Modify: `lib/api.ts`

- [ ] **Step 1: Add `put` and `delete` methods to `api` object in `lib/api.ts`**

Open `lib/api.ts`. After the `patch` method (ends around line 106), add the following two methods inside the `api` object before the closing `}`:

```ts
  async put<T = unknown>(path: string, body: unknown): Promise<T> {
    const headers = await buildHeaders({ "Content-Type": "application/json" });
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await extractErrorMessage(res));
    const text = await res.text();
    if (!text) return undefined as T;
    try {
      return JSON.parse(text) as T;
    } catch {
      return text as T;
    }
  },

  async delete(path: string): Promise<void> {
    const headers = await buildHeaders();
    const res = await fetch(`${BASE_URL}${path}`, { method: "DELETE", headers });
    if (!res.ok) throw new Error(await extractErrorMessage(res));
  },
```

- [ ] **Step 2: Commit**

```bash
git add lib/api.ts
git commit -m "feat: add put and delete methods to api client"
```

---

## Task 2: Create styles

**Files:**
- Create: `styles/edit-entry.styles.ts`

- [ ] **Step 1: Create `styles/edit-entry.styles.ts`**

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

  // ── Header ──────────────────────────────────────────────────────────────────

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

  // ── Form ─────────────────────────────────────────────────────────────────────

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

  // ── Amount ───────────────────────────────────────────────────────────────────

  amountBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F8F0",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: "#C8DFC6",
  },
  currencySymbol: {
    fontSize: 28,
    fontFamily: "Nunito_900Black",
    color: "#346739",
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontFamily: "Nunito_900Black",
    color: "#346739",
    padding: 0,
    ...inputOutline,
  },

  // ── Description ──────────────────────────────────────────────────────────────

  commentBox: {
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
  commentIcon: {
    marginRight: 8,
  },
  commentInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Nunito_700Bold",
    color: "#346739",
    padding: 0,
    ...inputOutline,
  },

  // ── Date ─────────────────────────────────────────────────────────────────────

  dateWrap: {
    marginBottom: 32,
  },

  // ── Buttons ──────────────────────────────────────────────────────────────────

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
  deleteBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E53935",
  },
  deleteBtnPressed: {
    backgroundColor: "#FFF0F0",
  },
  deleteBtnText: {
    fontSize: 15,
    fontFamily: "Nunito_800ExtraBold",
    color: "#E53935",
    letterSpacing: 0.3,
  },

  // ── Error ─────────────────────────────────────────────────────────────────────

  errorText: {
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
    color: "#E53935",
    textAlign: "center",
    marginBottom: 12,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add styles/edit-entry.styles.ts
git commit -m "feat: add edit-entry styles"
```

---

## Task 3: Create the edit-entry page

**Files:**
- Create: `app/edit-entry.tsx`

- [ ] **Step 1: Create `app/edit-entry.tsx`**

```tsx
import { api } from "@/lib/api";
import { formatDateISO } from "@/lib/date";
import { inputOutline, styles } from "@/styles/edit-entry.styles";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DatePickerField } from "@/components/date-picker-field";

export default function EditEntryScreen() {
  const { entryId, amount: initialAmount, description: initialDescription, entryDate: initialDate, symbol, categoryId } =
    useLocalSearchParams<{
      entryId: string;
      amount: string;
      description: string;
      entryDate: string;
      symbol: string;
      categoryId: string;
    }>();

  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState(initialAmount ?? "");
  const [description, setDescription] = useState(initialDescription ?? "");
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (initialDate) {
      const [year, month, day] = initialDate.split("-").map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date();
  });

  const handleAmountChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) return;
    if (parts[1] !== undefined && parts[1].length > 2) return;
    setAmount(cleaned);
  };

  const saveMutation = useMutation({
    mutationFn: () =>
      api.put(`/financial-entries/${entryId}`, {
        amount,
        description,
        entryDate: formatDateISO(selectedDate),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-entries", categoryId] });
      router.back();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/financial-entries/${entryId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-entries", categoryId] });
      router.back();
    },
  });

  const handleDelete = () => {
    Alert.alert(
      "Delete entry?",
      "This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate(),
        },
      ],
    );
  };

  const canSave = amount.length > 0 && parseFloat(amount) > 0;
  const isBusy = saveMutation.isPending || deleteMutation.isPending;
  const error = saveMutation.error?.message ?? deleteMutation.error?.message ?? null;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#2A4A2E", "#346739"]}
        style={[
          styles.header,
          { paddingTop: Platform.OS === "web" ? 56 : insets.top + 56 },
        ]}
      >
        <Text style={styles.headerTitle}>Edit Entry</Text>
        <View style={styles.headerSubRow}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
            onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)/dashboard")}
          >
            <MaterialCommunityIcons name="chevron-left" size={22} color="#FFFFFF" />
          </Pressable>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
          {/* Amount */}
          <Text style={styles.sectionLabel}>Amount</Text>
          <View style={styles.amountBox}>
            <Text style={styles.currencySymbol}>{symbol}</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={handleAmountChange}
              placeholder="0.00"
              placeholderTextColor="#B8D4B8"
              keyboardType="decimal-pad"
              maxLength={12}
            />
          </View>

          {/* Description */}
          <Text style={styles.sectionLabel}>Description</Text>
          <View style={styles.commentBox}>
            <MaterialCommunityIcons
              name="pencil-outline"
              size={18}
              color="#79AE6F"
              style={styles.commentIcon}
            />
            <TextInput
              style={styles.commentInput}
              value={description}
              onChangeText={setDescription}
              placeholder="Add a description..."
              placeholderTextColor="#B8D4B8"
              maxLength={120}
              returnKeyType="done"
            />
          </View>

          {/* Date */}
          <Text style={styles.sectionLabel}>Date</Text>
          <View style={styles.dateWrap}>
            <DatePickerField value={selectedDate} onChange={setSelectedDate} />
          </View>

          {/* Error */}
          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Save */}
          <Pressable
            style={({ pressed }) => [
              styles.saveBtn,
              pressed && styles.saveBtnPressed,
              (!canSave || isBusy) && styles.saveBtnDisabled,
            ]}
            onPress={() => {
              if (!canSave || isBusy) return;
              saveMutation.mutate();
            }}
          >
            {saveMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveBtnText}>Save</Text>
            )}
          </Pressable>

          {/* Delete */}
          <Pressable
            style={({ pressed }) => [styles.deleteBtn, pressed && styles.deleteBtnPressed]}
            onPress={handleDelete}
            disabled={isBusy}
          >
            {deleteMutation.isPending ? (
              <ActivityIndicator size="small" color="#E53935" />
            ) : (
              <Text style={styles.deleteBtnText}>Delete entry</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/edit-entry.tsx
git commit -m "feat: add edit-entry screen"
```

---

## Task 4: Register the route in the root layout

**Files:**
- Modify: `app/_layout.tsx`

- [ ] **Step 1: Add Stack.Screen for edit-entry in `app/_layout.tsx`**

After the existing `manage-categories` Stack.Screen (line 59), add:

```tsx
<Stack.Screen name="edit-entry" options={{ headerShown: false }} />
```

- [ ] **Step 2: Commit**

```bash
git add app/_layout.tsx
git commit -m "feat: register edit-entry route"
```

---

## Task 5: Make entry cards pressable in category-entries

**Files:**
- Modify: `app/category-entries.tsx`

- [ ] **Step 1: Update `renderItem` to wrap the card in a Pressable**

Replace the current `renderItem` function (lines 142–157):

```tsx
const renderItem = ({ item }: { item: FinancialEntryDto }) => (
  <Pressable
    style={({ pressed }) => [
      styles.entryCard,
      !compact && styles.entryCardWide,
      pressed && styles.entryCardPressed,
    ]}
    onPress={() =>
      router.push({
        pathname: "/edit-entry",
        params: {
          entryId: item.id,
          amount: String(item.amount),
          description: item.description ?? "",
          entryDate: item.entryDate,
          symbol,
          categoryId,
        },
      })
    }
  >
    <View style={[styles.iconBox, { backgroundColor: item.color + "18" }]}>
      <MaterialCommunityIcons name={item.icon as any} size={24} color={item.color} />
    </View>
    <View style={styles.entryCenter}>
      <Text style={styles.entryCategory}>{item.categoryName}</Text>
      {!!item.description && (
        <Text style={styles.entryDescription} numberOfLines={1}>{item.description}</Text>
      )}
    </View>
    <Text style={styles.entryAmount}>
      {symbol}{formatAmount(item.amount)}
    </Text>
  </Pressable>
);
```

- [ ] **Step 2: Add `entryCardPressed` style to `styles/category-entries.styles.ts`**

In `styles/category-entries.styles.ts`, after the `entryCardWide` style block, add:

```ts
entryCardPressed: {
  opacity: 0.75,
},
```

- [ ] **Step 3: Commit**

```bash
git add app/category-entries.tsx styles/category-entries.styles.ts
git commit -m "feat: make entry cards pressable, navigate to edit-entry"
```

---

## Self-Review

**Spec coverage:**
- ✅ Tapping entry card navigates to new page — Task 5
- ✅ Edit amount — Task 3
- ✅ Edit description — Task 3
- ✅ Edit date — Task 3
- ✅ PUT `/financial-entries/{id}` — Tasks 1, 3
- ✅ DELETE `/financial-entries/{id}` with confirmation — Tasks 1, 3
- ✅ Invalidate list query on success — Task 3
- ✅ Navigate back on success — Task 3
- ✅ Register route — Task 4
- ✅ Styles in separate file — Task 2

**Placeholder scan:** None found.

**Type consistency:**
- `api.put` / `api.delete` defined in Task 1, used in Task 3 ✅
- `styles` + `inputOutline` exported from `edit-entry.styles.ts` in Task 2, imported in Task 3 ✅
- `entryCardPressed` added in Task 5 and referenced in Task 5 ✅
