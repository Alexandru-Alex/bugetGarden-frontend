# Edit Entry Screen — Design Spec

**Date:** 2026-04-15  
**Status:** Approved

---

## Overview

When the user taps an entry card in `category-entries.tsx`, a new full-screen page opens where they can edit the entry's amount, description, and date, or delete the entry entirely.

---

## Navigation

- Entry cards in `CategoryEntriesScreen` become `Pressable` wrappers.
- On press: `router.push("edit-entry")` with params: `{ id, amount, description, entryDate, categoryId, symbol }`.
- New route registered in `app/_layout.tsx` as `<Stack.Screen name="edit-entry" options={{ headerShown: false }} />`.
- After a successful save or delete: `queryClient.invalidateQueries(["financial-entries", categoryId])` then `router.back()`.

---

## Page: `app/edit-entry.tsx`

### Header
- LinearGradient `#2A4A2E → #346739`, same style as `category-entries.tsx`.
- Title: "Edit Entry" (centered).
- Back button (chevron-left) on the left, symmetric spacer on the right.
- `paddingTop` via `useSafeAreaInsets` on native, fixed `56` on web.

### Form
Scrollable `ScrollView` with `KeyboardAvoidingView`. Three fields, all pre-filled from route params:

1. **Amount** — numeric `TextInput`, same style as `AddTransactionModal` (large font, green, decimal validation: no letters, max 2 decimal places).
2. **Description** — single-line `TextInput`, optional, max 120 chars.
3. **Date** — reuses existing `<DatePickerField>` component.

### Save Button
- Green `#346739`, full-width, label "Save".
- Disabled + spinner while `isPending`.
- Calls `PUT /financial-entries/{id}` with body `{ amount, description, entryDate }`.
  - `amount` sent as string (backend accepts `BigDecimal` from string).
  - `entryDate` formatted as `YYYY-MM-DD` via existing `formatDateISO`.

### Delete Button
- Outline style, red `#E53935`, below Save, label "Delete entry".
- On press: `Alert.alert` with title "Delete entry?" and confirm/cancel actions.
- On confirm: `DELETE /financial-entries/{id}` (no body).

### Mutations
- `useMutation` for PUT (save).
- `useMutation` for DELETE.
- Both `onSuccess`: `queryClient.invalidateQueries(["financial-entries", categoryId])` → `router.back()`.
- Both `onError`: show inline error text below the Save button.

---

## Styles

Separate file: `styles/edit-entry.styles.ts`, following the project convention (`styles/*.styles.ts`).

---

## API

| Method | Path | Body |
|--------|------|------|
| PUT | `/financial-entries/{id}` | `{ amount: string, description: string, entryDate: string }` |
| DELETE | `/financial-entries/{id}` | — |

---

## Out of Scope

- Changing the category — not supported on this screen.
- Changing the entry type (EXPENSE/INCOME).
