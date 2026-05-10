# Appearance Settings Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an "Appearance" card below "Manage Account" in settings with Currency and Decimal Places rows that call PATCH `/accounts`.

**Architecture:** Extend `AccountDto` with `numberOfDecimals`, add two new `useMutation` hooks in `settings.tsx` for currency and decimal places PATCH, render a new card with two rows each opening a Modal — currency reuses the wheel-picker pattern from `hello.tsx`, decimal places shows a 3-option list.

**Tech Stack:** React Native, Expo Router, React Query (`useMutation`), Reanimated (not needed here), existing `CURRENCIES` list from `lib/currency.ts`.

---

## Files

| File | Action | Reason |
|---|---|---|
| `app/(tabs)/dashboard.tsx` | Modify | Add `numberOfDecimals?: number` to `AccountDto` |
| `styles/settings.styles.ts` | Modify | Add styles for appearance card + two modals |
| `app/settings.tsx` | Modify | Add Appearance card, state, mutations, modals |

---

### Task 1: Add `numberOfDecimals` to `AccountDto`

**Files:**
- Modify: `app/(tabs)/dashboard.tsx:19-27`

Current `AccountDto`:
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

- [ ] **Step 1: Add the field**

In `app/(tabs)/dashboard.tsx`, replace the `AccountDto` block with:

```ts
export interface AccountDto {
  email: string;
  displayName: string;
  goldCoins: number;
  totalScore: number;
  currency: string;
  numberOfDecimals?: number;
  avatarUrl?: string;
  provider: string;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors related to `AccountDto`.

- [ ] **Step 3: Commit**

```bash
git add app/(tabs)/dashboard.tsx
git commit -m "feat: add numberOfDecimals to AccountDto"
```

---

### Task 2: Add Appearance card styles to settings.styles.ts

**Files:**
- Modify: `styles/settings.styles.ts`

The existing `manageCard` / `manageCardTitle` / `manageRow` / `cardDivider` styles are reused for the card frame. We only need new styles for: the right-side value text on each row, the currency picker modal, and the decimal picker modal.

`ITEM_H = 48`, `PICKER_H = 144` (same constants as hello.tsx — define them locally in settings.styles.ts).

- [ ] **Step 1: Add constants and new styles**

At the top of `styles/settings.styles.ts`, after the existing `GREEN_DARK` / `GREEN_MED` exports, add:

```ts
export const ITEM_H = 48;
export const PICKER_H = ITEM_H * 3;
```

At the end of the `StyleSheet.create({...})` block (before the closing `}`), add:

```ts
  // Appearance card row right-side value
  appearanceRowValue: {
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
    color: "#6b7f6b",
    marginRight: 4,
  },
  // Currency picker modal
  currencyModal: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 360,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  currencyModalTitle: {
    fontFamily: "Nunito_900Black",
    fontSize: 18,
    color: "#1a2e1b",
    marginBottom: 16,
    textAlign: "center",
  },
  // Wheel picker (native)
  wheelContainer: {
    height: PICKER_H,
    borderWidth: 1.5,
    borderColor: "#9FCB98",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 16,
  },
  wheelHighlight: {
    position: "absolute",
    top: ITEM_H,
    left: 0,
    right: 0,
    height: ITEM_H,
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: "#9FCB98",
  },
  wheelScroll: { flex: 1 },
  wheelContent: { paddingVertical: ITEM_H },
  wheelItem: {
    height: ITEM_H,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 10,
  },
  wheelSymbol: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 18,
    color: "#346739",
    minWidth: 32,
  },
  wheelCode: {
    fontFamily: "Nunito_700Bold",
    fontSize: 15,
    color: "#346739",
    letterSpacing: 0.3,
  },
  wheelFadeTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: ITEM_H,
    zIndex: 2,
  },
  wheelFadeBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: ITEM_H,
    zIndex: 2,
  },
  // Web flat picker
  webPickerContainer: {
    borderWidth: 1.5,
    borderColor: "#9FCB98",
    borderRadius: 14,
    overflow: "hidden",
    maxHeight: ITEM_H * 5,
    marginBottom: 16,
  },
  webPickerScroll: { flex: 1 },
  webPickerItem: {
    height: ITEM_H,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 10,
  },
  webPickerItemSelected: { backgroundColor: "#346739" },
  webPickerSymbol: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 16,
    color: "#346739",
    minWidth: 32,
  },
  webPickerCode: {
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    color: "#346739",
    flex: 1,
    letterSpacing: 0.3,
  },
  webPickerTextSelected: { color: "#ffffff" },
  // Currency modal confirm button (same shape as nameModalBtnPrimary)
  currencyModalBtn: {
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#346739",
  },
  currencyModalBtnLabel: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 14,
    color: "#ffffff",
  },
  // Decimal places picker modal
  decimalModal: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 320,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  decimalModalTitle: {
    fontFamily: "Nunito_900Black",
    fontSize: 18,
    color: "#1a2e1b",
    marginBottom: 12,
    textAlign: "center",
  },
  decimalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 10,
  },
  decimalOptionSelected: { backgroundColor: "#f0f8ee" },
  decimalOptionValue: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 15,
    color: "#1a2e1b",
    minWidth: 18,
  },
  decimalOptionExample: {
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
    color: "#6b7f6b",
    flex: 1,
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
git commit -m "style: add appearance card and picker styles to settings"
```

---

### Task 3: Add Appearance card, mutations, and modals to settings.tsx

**Files:**
- Modify: `app/settings.tsx`

This task adds everything to settings.tsx in three sub-steps: imports + state + mutations, then the card JSX, then the two modal JSX blocks.

The currency picker modal mirrors the pattern in `hello.tsx`:
- Native: `ScrollView` with `snapToInterval={ITEM_H}` + fade gradients + highlight bar
- Web: flat scrollable list with Pressable items

The decimal places modal shows 3 Pressable rows for values 0 / 1 / 2.

Example strings per value:
- `0` → `"eg. 10"`
- `1` → `"eg. 10.4"`
- `2` → `"eg. 10.45"`

- [ ] **Step 1: Add imports**

In `app/settings.tsx`, add to the existing import from `"react"`:

```ts
import React, { useCallback, useEffect, useRef, useState } from "react";
```

Add new imports after the existing import lines:

```ts
import { CURRENCIES, currencySymbolFor, type Currency } from "@/lib/currency";
import { LinearGradient } from "expo-linear-gradient";  // already imported — no duplicate needed
import { ITEM_H, PICKER_H } from "@/styles/settings.styles";
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView as RNScrollView } from "react-native";
```

> Note: `LinearGradient` is already imported. `ScrollView` is already imported as `ScrollView`. To avoid naming conflict when needing `useRef` typed to a ScrollView, alias the import:

Replace the existing:
```ts
import { Image, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
```
with:
```ts
import { Image, Modal, NativeScrollEvent, NativeSyntheticEvent, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
```

Add after the `CURRENCIES` import (add at top with other lib imports):
```ts
import { CURRENCIES, currencySymbolFor, type Currency } from "@/lib/currency";
import { ITEM_H, PICKER_H } from "@/styles/settings.styles";
```

- [ ] **Step 2: Add state and refs**

Inside `SettingsScreen`, after the existing `const [showNameModal, setShowNameModal]` lines, add:

```ts
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [pendingCurrency, setPendingCurrency] = useState<Currency>("USD");
  const [showDecimalModal, setShowDecimalModal] = useState(false);
  const currencyScrollRef = useRef<RNScrollView>(null);
```

- [ ] **Step 3: Add mutations**

After the existing `updateName` mutation, add:

```ts
  const { mutate: updateCurrency, isPending: savingCurrency } = useMutation({
    mutationFn: (currency: string) =>
      api.patch("/accounts", { name: null, currency, numberOfDecimals: null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEY });
      setShowCurrencyModal(false);
    },
  });

  const { mutate: updateDecimals, isPending: savingDecimals } = useMutation({
    mutationFn: (numberOfDecimals: number) =>
      api.patch("/accounts", { name: null, currency: null, numberOfDecimals }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEY });
      setShowDecimalModal(false);
    },
  });
```

- [ ] **Step 4: Add handler callbacks**

After the existing `handleSelectAvatar` function, add:

```ts
  const handleOpenCurrency = useCallback(() => {
    const current = (account?.currency ?? "USD") as Currency;
    setPendingCurrency(current);
    setShowCurrencyModal(true);
    const idx = CURRENCIES.findIndex((c) => c.code === current);
    setTimeout(() => currencyScrollRef.current?.scrollTo({ y: idx * ITEM_H, animated: false }), 80);
  }, [account?.currency]);

  const handleCurrencyScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
      const clamped = Math.max(0, Math.min(CURRENCIES.length - 1, idx));
      setPendingCurrency(CURRENCIES[clamped].code);
    },
    []
  );

  const decimalExamples: Record<number, string> = { 0: "eg. 10", 1: "eg. 10.4", 2: "eg. 10.45" };
```

- [ ] **Step 5: Add the Appearance card JSX**

In the `<ScrollView>` content (after the closing `</View>` of `manageCard`), add:

```tsx
        <View style={[styles.manageCard, { marginTop: 16 }]}>
          <Text style={styles.manageCardTitle}>Appearance</Text>

          <View style={styles.cardDivider} />

          <Pressable
            style={({ pressed }) => [styles.manageRow, pressed && styles.manageRowPressed]}
            onPress={handleOpenCurrency}
          >
            <Ionicons name="globe-outline" size={20} color="#346739" />
            <Text style={styles.manageRowLabel}>Currency</Text>
            <Text style={styles.appearanceRowValue}>
              {currencySymbolFor(account?.currency)}{"  "}{account?.currency ?? "—"}
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#9FCB98" />
          </Pressable>

          <View style={styles.cardDivider} />

          <Pressable
            style={({ pressed }) => [styles.manageRow, pressed && styles.manageRowPressed]}
            onPress={() => setShowDecimalModal(true)}
          >
            <Ionicons name="calculator-outline" size={20} color="#346739" />
            <Text style={styles.manageRowLabel}>Decimal places</Text>
            <Text style={styles.appearanceRowValue}>
              {account?.numberOfDecimals ?? 2}{"  "}({decimalExamples[account?.numberOfDecimals ?? 2]})
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#9FCB98" />
          </Pressable>
        </View>
```

- [ ] **Step 6: Add Currency picker Modal**

After the closing `</Modal>` of the name modal, add:

```tsx
      <Modal
        visible={showCurrencyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowCurrencyModal(false)}>
          <Pressable
            style={styles.currencyModal}
            {...(Platform.OS === "web" ? { onClick: (e: any) => e.stopPropagation() } : undefined)}
          >
            <Text style={styles.currencyModalTitle}>Currency</Text>

            {Platform.OS === "web" ? (
              <View style={styles.webPickerContainer}>
                <ScrollView style={styles.webPickerScroll} showsVerticalScrollIndicator={false}>
                  {CURRENCIES.map(({ code, symbol }) => (
                    <Pressable
                      key={code}
                      style={[
                        styles.webPickerItem,
                        pendingCurrency === code && styles.webPickerItemSelected,
                      ]}
                      onPress={() => {
                        updateCurrency(code);
                      }}
                    >
                      <Text style={[styles.webPickerSymbol, pendingCurrency === code && styles.webPickerTextSelected]}>
                        {symbol}
                      </Text>
                      <Text style={[styles.webPickerCode, pendingCurrency === code && styles.webPickerTextSelected]}>
                        {code}
                      </Text>
                      {pendingCurrency === code && (
                        <Ionicons name="checkmark" size={16} color="#ffffff" />
                      )}
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            ) : (
              <View style={styles.wheelContainer}>
                <ScrollView
                  ref={currencyScrollRef}
                  style={styles.wheelScroll}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ITEM_H}
                  decelerationRate="fast"
                  scrollEventThrottle={16}
                  onMomentumScrollEnd={handleCurrencyScrollEnd}
                  onScrollEndDrag={handleCurrencyScrollEnd}
                  contentContainerStyle={styles.wheelContent}
                >
                  {CURRENCIES.map(({ code, symbol }) => (
                    <Pressable
                      key={code}
                      style={styles.wheelItem}
                      onPress={() => {
                        const idx = CURRENCIES.findIndex((c) => c.code === code);
                        currencyScrollRef.current?.scrollTo({ y: idx * ITEM_H, animated: true });
                        setPendingCurrency(code);
                      }}
                    >
                      <Text style={styles.wheelSymbol}>{symbol}</Text>
                      <Text style={styles.wheelCode}>{code}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
                <LinearGradient
                  colors={["#ffffff", "rgba(255,255,255,0)"]}
                  style={styles.wheelFadeTop}
                  pointerEvents="none"
                />
                <LinearGradient
                  colors={["rgba(255,255,255,0)", "#ffffff"]}
                  style={styles.wheelFadeBottom}
                  pointerEvents="none"
                />
                <View style={styles.wheelHighlight} pointerEvents="none" />
              </View>
            )}

            {Platform.OS !== "web" && (
              <Pressable
                style={({ pressed }) => [styles.currencyModalBtn, { opacity: pressed || savingCurrency ? 0.7 : 1 }]}
                onPress={() => updateCurrency(pendingCurrency)}
                disabled={savingCurrency}
              >
                <Text style={styles.currencyModalBtnLabel}>
                  {savingCurrency ? "Saving…" : "Save"}
                </Text>
              </Pressable>
            )}
          </Pressable>
        </Pressable>
      </Modal>
```

- [ ] **Step 7: Add Decimal places Modal**

After the currency Modal closing tag, add:

```tsx
      <Modal
        visible={showDecimalModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDecimalModal(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowDecimalModal(false)}>
          <Pressable
            style={styles.decimalModal}
            {...(Platform.OS === "web" ? { onClick: (e: any) => e.stopPropagation() } : undefined)}
          >
            <Text style={styles.decimalModalTitle}>Decimal Places</Text>
            {([0, 1, 2] as const).map((val) => {
              const selected = (account?.numberOfDecimals ?? 2) === val;
              return (
                <Pressable
                  key={val}
                  style={({ pressed }) => [
                    styles.decimalOption,
                    selected && styles.decimalOptionSelected,
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => updateDecimals(val)}
                  disabled={savingDecimals}
                >
                  <Text style={styles.decimalOptionValue}>{val}</Text>
                  <Text style={styles.decimalOptionExample}>({decimalExamples[val]})</Text>
                  {selected && <Ionicons name="checkmark" size={16} color="#346739" />}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
```

- [ ] **Step 8: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add app/settings.tsx styles/settings.styles.ts app/(tabs)/dashboard.tsx
git commit -m "feat: add Appearance card with currency and decimal places pickers to settings"
```

---

## Self-Review

**Spec coverage:**
- ✅ Appearance card below Manage Account
- ✅ Currency row — shows current symbol + code, taps open wheel picker modal
- ✅ Wheel picker native / flat list web (mirrors hello.tsx pattern)
- ✅ PATCH `/accounts` with `{ currency, name: null, numberOfDecimals: null }`
- ✅ Decimal places row — shows value + example
- ✅ 0 / 1 / 2 options with examples
- ✅ PATCH `/accounts` with `{ numberOfDecimals, name: null, currency: null }`
- ✅ `AccountDto` extended with `numberOfDecimals`
- ✅ All styles in `settings.styles.ts`

**Placeholder scan:** None found.

**Type consistency:**
- `Currency` type from `lib/currency.ts` used consistently for `pendingCurrency`
- `ITEM_H` / `PICKER_H` exported from `settings.styles.ts` and imported in `settings.tsx`
- `RNScrollView` alias used for the ref type to avoid collision with the `ScrollView` component import
- `decimalExamples` typed as `Record<number, string>` — keys 0/1/2 match all call sites
