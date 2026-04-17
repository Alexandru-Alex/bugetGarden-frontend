# Goals Page — Design Spec
Date: 2026-04-18

## Overview

A new Goals page where users can set savings goals with a target amount, track progress manually, and visualize each goal with a colored animated progress bar.

---

## Navigation

- Add `Goals` entry to `SECONDARY_ITEMS` in `components/nav-menu.tsx`, between Budgets and Settings.
- Icon: `flag-outline` (Ionicons)
- Route: `/goals`
- File: `app/goals.tsx`
- Styles: `styles/goals.styles.ts`

---

## Data Model

```ts
interface GoalDto {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  color: string;       // hex, user-picked
  deadline?: string;   // ISO date string, optional (e.g. "2026-12-01")
}
```

**Mock data** is hardcoded for now (no API calls). 3–4 sample goals with varied colors and progress levels, including at least one completed (savedAmount >= targetAmount).

---

## Screen Layout

### Header

- `LinearGradient` `["#2A4A2E", "#346739"]` — same as Budgets
- Title: "Goals"
- Summary card row: "Total Saved" and "Total Target" (summed across all goals)
- Uses `useSafeAreaInsets` for top padding, `paddingTop: Platform.OS === "web" ? 56 : insets.top + 56`

### List

`ScrollView` below the header. Each goal renders a card:

- Colored circle/dot accent using the goal's `color`
- Goal name (bold)
- `savedAmount / targetAmount` formatted with currency symbol
- Optional deadline shown as subdued text (e.g. "by Dec 2026")
- Progress bar (see below)
- "Completed" badge when `savedAmount >= targetAmount`
- `···` menu button → opens action modal (Add funds / Delete)

### Progress Bar

- Track: light grey rounded pill
- Fill: animated width using Reanimated `withTiming` (600ms, `Easing.out(Easing.cubic)`) on mount
- Fill color: goal's chosen `color`
- At 100%: fill color stays, badge "Completed" appears, pulse animation on the bar using `withSequence` + `withTiming` on opacity (two pulses, 400ms each)

---

## Modals

### Create Goal Modal

Triggered by a FAB (`+` button, bottom-right, same green as primary color).

Fields:
1. **Name** — TextInput, free text
2. **Target amount** — TextInput, `keyboardType="number-pad"`, digits only
3. **Deadline** — optional text input for month/year (e.g. "12/2026"), displayed as subdued placeholder
4. **Color picker** — 20-color grid, same colors and layout as `create-categories.tsx`

Actions: Cancel / Create

### Add Funds Modal

Opened from the `···` menu on a goal card.

Displays: goal name, current progress bar (static), currency input "Amount to add".

Action: Confirm → updates `savedAmount` in local state (mock only for now).

### Delete Goal

Triggered from `···` menu. No confirmation modal — direct delete from local state (mock). Matches pattern from Budgets delete.

---

## Color Picker

Reuse the same 20-color palette and grid layout from `create-categories.tsx`. Selected color gets a checkmark overlay.

---

## Currency

Uses `currencySymbolFor(account?.currency)` — reads account from React Query cache (`ACCOUNT_QUERY_KEY`). Falls back to `$` if not loaded.

---

## Mock Data

```ts
const MOCK_GOALS: GoalDto[] = [
  { id: "1", name: "Emergency Fund",  targetAmount: 5000, savedAmount: 3200, color: "#4A90D9" },
  { id: "2", name: "Vacation",        targetAmount: 2000, savedAmount: 2000, color: "#E67E22", deadline: "2026-07-01" },
  { id: "3", name: "New Laptop",      targetAmount: 1500, savedAmount: 400,  color: "#9B59B6", deadline: "2026-12-01" },
  { id: "4", name: "Car Repair Fund", targetAmount: 800,  savedAmount: 120,  color: "#E74C3C" },
];
```

---

## Future (not in scope now)

- Replace mock data with real API: `GET /goals`, `POST /goals`, `POST /goals/:id/contribute`, `DELETE /goals/:id`
- Deadline date picker (native)
- Reorder goals via drag
