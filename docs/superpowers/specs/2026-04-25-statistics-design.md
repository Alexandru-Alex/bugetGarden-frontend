# Statistics Page — Design Spec
**Date:** 2026-04-25  
**Status:** Approved

---

## Overview

A statistics page (`app/(tabs)/statistics.tsx`) that displays a grouped bar chart of financial data across three tab types and four time periods. Tapping a bar loads the underlying transactions for that data point.

---

## API Contracts

### Summary endpoint
```
GET /statistics/summary?type=GENERAL|EXPENSES|INCOME&period=YEAR|MONTH|WEEK|DAY
```
Response:
```ts
interface SummaryItem {
  label: string;      // e.g. "Apr 2026", "2024", "Week 15"
  income: number;     // BigDecimal from backend
  expenses: number;
}
```

### Transactions endpoint
```
GET /statistics/transactions?type=GENERAL|EXPENSES|INCOME&period=YEAR|MONTH|WEEK|DAY&referenceDate=YYYY-MM-DD
```
`referenceDate` is derived from the bar's label:
- MONTH period, label "Apr 2026" → `2026-04-01`
- YEAR period, label "2024" → `2024-01-01`
- WEEK/DAY periods: parse from label accordingly

Response:
```ts
interface TransactionItem {
  id: string;
  amount: number;
  description: string;
  entryDate: string;   // LocalDate from backend → ISO string
  categoryName: string;
  icon: string;
  color: string;
}
```

---

## UI Structure

```
NavMenu
SafeAreaView (top)
  ScrollView
    Tab selector: [GENERAL] [EXPENSES] [INCOME]   ← pill style
    Period selector: [YEAR] [MONTH] [WEEK] [DAY]  ← chip style, below tabs
    Bar chart (Skia Canvas)
      3 bars per label: income | expense | profit/loss
      X-axis: label names
      Y-axis: implicit (bar height proportional to max value)
    Toast (position:absolute, top:120, timeout 3s)  ← replaces Alert
    Transaction list (conditional, below chart)
      Each row: icon circle + category + description + amount + date
```

**Default state on mount:** type=GENERAL, period=MONTH.

---

## Bar Chart Implementation

Built with `@shopify/react-native-skia` v2.x (`Skia.RuntimeEffect` API). No new libraries.

- Canvas measured via `onLayout` (not `useWindowDimensions`) for accurate width.
- Each group: 3 `<RoundedRect>` bars side by side, gap between groups.
- Bar colors:
  - Income: `#79AE6F`
  - Expense: `#FF6B6B`
  - Profit/Loss: `#346739` (positive) / `#FFAA44` (negative)
- Labels rendered with Skia `<Text>` below each group.
- Heavy bar calculations (positions, heights) memoized with `useMemo`.

### Tap detection
`<Canvas onTouch>` with Skia touch handler maps touch X/Y to bar group and bar type.
- Income or Expense bar tapped → show toast + fetch transactions.
- Profit bar tapped → show toast with profit value only, no transactions fetch.

---

## State & Data

```ts
type StatTab    = "GENERAL" | "EXPENSES" | "INCOME";
type StatPeriod = "YEAR" | "MONTH" | "WEEK" | "DAY";

// React Query keys
["statistics-summary", tab, period]           // staleTime: 5min
["statistics-transactions", type, period, referenceDate]  // no staleTime (always fresh)
```

Selected bar state:
```ts
interface SelectedBar {
  barType: "income" | "expense" | "profit";
  item: SummaryItem;
}
```

---

## Toast

- Inline `<View>` positioned `position:"absolute"`, `top:120`, centered horizontally.
- Shows formatted amount + label (e.g. "Income: $3,200.00 — Apr 2026").
- Auto-dismisses after 3 seconds via `setTimeout`.
- Uses `useRef` for the timeout to avoid stale closure leaks.

---

## Transaction List

- Appears below chart after a bar tap (income or expense only).
- Loading state: `<ActivityIndicator>`.
- Each row: colored icon circle (`MaterialCommunityIcons`), category name, description, amount, formatted date.
- Currency symbol from `currencySymbolFor(account?.currency)` — never hardcoded.
- Empty state: "No transactions found for this period."

---

## Files

| File | Role |
|------|------|
| `app/(tabs)/statistics.tsx` | Screen, state, queries |
| `styles/tabs/statistics.styles.ts` | All styles |
| `components/stat-bar-chart.tsx` | Skia canvas bar chart component |

---

## Out of Scope

- Editing or deleting transactions from this screen.
- Pagination of transactions.
- Animations on bar chart (static render only).
