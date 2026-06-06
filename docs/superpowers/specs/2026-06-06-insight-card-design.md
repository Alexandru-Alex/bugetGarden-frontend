# Insight Card — Design Spec
Date: 2026-06-06

## Overview

A single "Insight Card" placed on the Dashboard below the existing white chart card. It shows one human-readable financial insight at a time derived from the user's data. The user taps the card to cycle through up to 5 insights. The goal is to make the dashboard feel alive and worth opening for pleasure, not just obligation.

---

## Data Strategy

**Approach:** One extra fetch for the previous period (Approach B).

The dashboard already fetches `expenseSummaryItems` and `incomeSummaryItems` for the active period. The insight card adds two more queries — previous-period expense and income summaries — using the existing `/financial-entries/summary?type=X&start=Y&end=Z` endpoint.

### Previous period computation (`lib/insights.ts`)

| Active period | Previous period start          | Previous period end            |
|---------------|-------------------------------|-------------------------------|
| Day           | yesterday                      | yesterday                      |
| Week          | Monday of last week            | Sunday of last week            |
| Month         | 1st of last calendar month     | last day of last calendar month|
| Year          | Jan 1 of last calendar year    | Dec 31 of last calendar year   |
| Period        | null — no comparison           | null                           |

When the period is `Period` (custom date range), comparison insights are skipped; only non-comparative insights are shown.

---

## Insight Pool

Insights are computed client-side from the four summary arrays. Each insight is skipped if its data is missing, zero, or would produce a misleading result. The pool is evaluated in priority order; all valid insights are collected and shown in rotation.

| # | Key          | Template                                                          | Requires              | Skip if                        |
|---|--------------|-------------------------------------------------------------------|-----------------------|--------------------------------|
| 1 | `biggest_drop`  | "📉 You spent {X}% less on {cat} vs last {period}"           | prevExpense + curExpense | drop < 10% or prev = 0      |
| 2 | `biggest_spike` | "📈 Spending on {cat} is up {X}% vs last {period}"           | prevExpense + curExpense | spike < 10% or prev = 0     |
| 3 | `top_category`  | "🏆 Biggest expense: {sym}{amount} on {cat}"                 | curExpense            | no expense items               |
| 4 | `savings_rate`  | "💰 You saved {X}% of your income this {period}"             | curExpense + curIncome | income ≤ 0                   |
| 5 | `income_cover`  | "✅ Your income covers {X}% of your expenses"                | curExpense + curIncome | expense = 0                   |
| 6 | `new_category`  | "✨ First time spending on {cat} this {period}"              | prevExpense + curExpense | category appeared in prev too |

Minimum 1 insight always available (top_category or income_cover). If zero valid insights, the card is hidden.

---

## Component Architecture

### `lib/insights.ts`
- `getPreviousPeriodRange(period, today)` → `{ start: string; end: string } | null`
- `computeInsights(cur, prev, curIncome, prevIncome, symbol, decimals, period)` → `Insight[]`
- Pure functions, no React, fully unit-testable.

### `components/insight-card.tsx`
Props:
```ts
interface InsightCardProps {
  expenseItems: FinancialSummaryItem[];
  incomeItems: FinancialSummaryItem[];
  prevExpenseItems: FinancialSummaryItem[];
  prevIncomeItems: FinancialSummaryItem[];
  symbol: string;
  decimals: number;
  period: Period;
}
```
State: `activeIndex` (integer, wraps on tap).

Behaviour:
- Tap card → `activeIndex = (activeIndex + 1) % insights.length`
- Fade animation between insights (Reanimated 4 `useSharedValue` opacity)
- Pagination dots (max 5) at bottom
- If `insights.length === 0`, renders nothing (`null`)

### Dashboard integration (`app/(tabs)/dashboard.tsx`)
- Two new `useQuery` calls: `prevExpenseSummary`, `prevIncomeSummary`
- Query keys: `["summary", "EXPENSE", "prev", activePeriod, ...]` and income equivalent
- Enabled when `prevPeriodRange !== null && !!token`
- Pass all four arrays + symbol/decimals/period as props to `<InsightCard />`
- Place `<InsightCard />` inside the `ScrollView`, below the existing `<View style={styles.card}>`

---

## Visual Design

- Card background: `#F0F7EF` (light green tint), matching app palette
- Border: `1px solid #C8E0C5`
- Border radius: 16
- Padding: 20px horizontal, 18px vertical
- Insight text: 15px, `#2A4A2E`, centered, `fontWeight: "500"`
- Pagination dots: 6px circles, active = `#346739`, inactive = `#C8E0C5`
- No header label on the card (the insight text is self-explanatory)
- Tap feedback: `opacity: 0.85` pressed state

---

## Styles

New file: `styles/tabs/insight-card.styles.ts`

---

## Handling Loading & Edge Cases

- While `prevExpenseSummary` is loading: show a skeleton pulse (single line, width 70%, opacity animated)
- If both prev queries return empty: skip comparison insights, show non-comparative ones
- Period = "Period": fetch no previous period, show only top_category / savings_rate / income_cover
- No data at all: card renders `null` (hidden)

---

## Out of Scope

- Backend insight endpoint (future)
- Push notifications for insights
- Persistent "insight of the day" (no rotation persistence between sessions)
- Gamification tie-in (insight → quest trigger)
