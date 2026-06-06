# Insight Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a tappable "Insight Card" below the dashboard donut chart that shows human-readable financial insights (e.g. "📉 You spent 32% less on Food vs last month") derived from the active period's data.

**Architecture:** A pure utility module (`lib/insights.ts`) computes insights from four summary arrays (current + previous period, expense + income). A self-contained component (`components/insight-card.tsx`) renders the current insight with a Reanimated 4 fade transition and tap-to-advance. The dashboard fetches two extra React Query queries for the previous period and passes all data as props.

**Tech Stack:** React Native, Reanimated 4 (`useSharedValue`, `useAnimatedStyle`, `withTiming`, `withSequence`, `runOnJS`), React Query (`useQuery`), TypeScript.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `lib/types.ts` | Export `FinancialSummaryItem` (move from `dashboard.tsx`) |
| Create | `lib/insights.ts` | `getPreviousPeriodRange` + `computeInsights` pure functions |
| Create | `styles/tabs/insight-card.styles.ts` | All styles for `InsightCard` |
| Create | `components/insight-card.tsx` | Tappable insight card with fade animation |
| Modify | `app/(tabs)/dashboard.tsx` | Import `FinancialSummaryItem` from types, add prev-period queries, render `<InsightCard />` |

---

## Task 1: Export `FinancialSummaryItem` from `lib/types.ts`

**Files:**
- Modify: `lib/types.ts`
- Modify: `app/(tabs)/dashboard.tsx` (remove local interface, import from types)

- [ ] **Step 1: Add `FinancialSummaryItem` to `lib/types.ts`**

Append at the end of `lib/types.ts`:

```ts
export interface FinancialSummaryItem {
  name: string;
  color: string;
  total: string | number;
}
```

- [ ] **Step 2: Remove local interface and import from `app/(tabs)/dashboard.tsx`**

Replace the local definition in `dashboard.tsx`:
```ts
// REMOVE this block:
interface FinancialSummaryItem {
  name: string;
  color: string;
  total: string | number;
}
```

Add to the imports at the top of `dashboard.tsx`:
```ts
import { CategoryDto, FinancialSummaryItem } from "@/lib/types";
```
(Replace the existing `import { CategoryDto } from "@/lib/types";`)

- [ ] **Step 3: Verify the app still compiles**

Run: `npx expo export --platform web 2>&1 | tail -5`

Expected: no TypeScript errors mentioning `FinancialSummaryItem`.

- [ ] **Step 4: Commit**

```bash
git add lib/types.ts app/(tabs)/dashboard.tsx
git commit -m "refactor: export FinancialSummaryItem from lib/types"
```

---

## Task 2: Create `lib/insights.ts`

**Files:**
- Create: `lib/insights.ts`

- [ ] **Step 1: Create the file**

Create `lib/insights.ts` with the full content below:

```ts
import { formatAmount } from "@/lib/currency";
import { formatDateISO } from "@/lib/date";
import { FinancialSummaryItem } from "@/lib/types";

export type InsightPeriod = "Day" | "Week" | "Month" | "Year" | "Period";

export interface Insight {
  key: string;
  text: string;
}

export function getPreviousPeriodRange(
  period: InsightPeriod,
  today: Date = new Date(),
): { start: string; end: string } | null {
  if (period === "Period") return null;

  const d = new Date(today);

  if (period === "Day") {
    d.setDate(d.getDate() - 1);
    const s = formatDateISO(d);
    return { start: s, end: s };
  }

  if (period === "Week") {
    const dow = d.getDay(); // 0 = Sunday
    const offsetToMonday = dow === 0 ? -6 : 1 - dow;
    const thisMonday = new Date(d);
    thisMonday.setDate(d.getDate() + offsetToMonday);
    const prevMonday = new Date(thisMonday);
    prevMonday.setDate(thisMonday.getDate() - 7);
    const prevSunday = new Date(prevMonday);
    prevSunday.setDate(prevMonday.getDate() + 6);
    return { start: formatDateISO(prevMonday), end: formatDateISO(prevSunday) };
  }

  if (period === "Month") {
    const prevStart = new Date(d.getFullYear(), d.getMonth() - 1, 1);
    const prevEnd = new Date(d.getFullYear(), d.getMonth(), 0);
    return { start: formatDateISO(prevStart), end: formatDateISO(prevEnd) };
  }

  // Year
  const prevYear = d.getFullYear() - 1;
  return { start: `${prevYear}-01-01`, end: `${prevYear}-12-31` };
}

function periodLabel(period: InsightPeriod): string {
  const map: Record<InsightPeriod, string> = {
    Day: "day",
    Week: "week",
    Month: "month",
    Year: "year",
    Period: "period",
  };
  return map[period];
}

export function computeInsights(
  curExpense: FinancialSummaryItem[],
  prevExpense: FinancialSummaryItem[],
  curIncome: FinancialSummaryItem[],
  prevIncome: FinancialSummaryItem[],
  symbol: string,
  decimals: number,
  period: InsightPeriod,
): Insight[] {
  const insights: Insight[] = [];
  const label = periodLabel(period);
  const hasPrev = prevExpense.length > 0 || prevIncome.length > 0;

  const curExpMap = new Map(curExpense.map((i) => [i.name, Number(i.total)]));
  const prevExpMap = new Map(prevExpense.map((i) => [i.name, Number(i.total)]));

  // 1. Biggest drop (category that shrank the most %)
  if (hasPrev) {
    let best: { name: string; pct: number } | null = null;
    for (const [name, cur] of curExpMap) {
      const prev = prevExpMap.get(name);
      if (!prev || prev === 0) continue;
      const pct = Math.round(((prev - cur) / prev) * 100);
      if (pct >= 10 && (!best || pct > best.pct)) best = { name, pct };
    }
    if (best) {
      insights.push({
        key: "biggest_drop",
        text: `📉 You spent ${best.pct}% less on ${best.name} vs last ${label}`,
      });
    }
  }

  // 2. Biggest spike (category that grew the most %)
  if (hasPrev) {
    let best: { name: string; pct: number } | null = null;
    for (const [name, cur] of curExpMap) {
      const prev = prevExpMap.get(name);
      if (!prev || prev === 0) continue;
      const pct = Math.round(((cur - prev) / prev) * 100);
      if (pct >= 10 && (!best || pct > best.pct)) best = { name, pct };
    }
    if (best) {
      insights.push({
        key: "biggest_spike",
        text: `📈 Spending on ${best.name} is up ${best.pct}% vs last ${label}`,
      });
    }
  }

  // 3. Top expense category
  const sorted = [...curExpMap.entries()].sort((a, b) => b[1] - a[1]);
  if (sorted.length > 0) {
    const [name, amount] = sorted[0];
    insights.push({
      key: "top_category",
      text: `🏆 Biggest expense: ${symbol}${formatAmount(amount, decimals)} on ${name}`,
    });
  }

  // 4. Savings rate
  const totalIncome = curIncome.reduce((s, i) => s + Number(i.total), 0);
  const totalExpense = curExpense.reduce((s, i) => s + Number(i.total), 0);
  if (totalIncome > 0) {
    const pct = Math.round(((totalIncome - totalExpense) / totalIncome) * 100);
    if (pct > 0) {
      insights.push({
        key: "savings_rate",
        text: `💰 You saved ${pct}% of your income this ${label}`,
      });
    }
  }

  // 5. Income coverage
  if (totalExpense > 0 && totalIncome > 0) {
    const pct = Math.round((totalIncome / totalExpense) * 100);
    insights.push({
      key: "income_cover",
      text: `✅ Your income covers ${pct}% of your expenses`,
    });
  }

  // 6. First-time category (in current but not in prev)
  if (hasPrev) {
    for (const [name] of curExpMap) {
      if (!prevExpMap.has(name)) {
        insights.push({
          key: "new_category",
          text: `✨ First time spending on ${name} this ${label}`,
        });
        break;
      }
    }
  }

  return insights;
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/insights.ts
git commit -m "feat: add insights utility (getPreviousPeriodRange + computeInsights)"
```

---

## Task 3: Create `styles/tabs/insight-card.styles.ts`

**Files:**
- Create: `styles/tabs/insight-card.styles.ts`

- [ ] **Step 1: Create the styles file**

Create `styles/tabs/insight-card.styles.ts`:

```ts
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    marginHorizontal: 24,
    marginTop: 16,
    backgroundColor: "#F0F7EF",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#C8E0C5",
    paddingVertical: 22,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 14,
  },
  cardPressed: {
    opacity: 0.85,
  },
  insightText: {
    fontSize: 15,
    fontFamily: "Nunito_700Bold",
    color: "#2A4A2E",
    textAlign: "center",
    lineHeight: 22,
  },
  dots: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#C8E0C5",
  },
  dotActive: {
    backgroundColor: "#346739",
  },
  skeleton: {
    height: 18,
    width: "70%",
    borderRadius: 9,
    backgroundColor: "#C8E0C5",
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add styles/tabs/insight-card.styles.ts
git commit -m "feat: add insight card styles"
```

---

## Task 4: Create `components/insight-card.tsx`

**Files:**
- Create: `components/insight-card.tsx`

- [ ] **Step 1: Create the component**

Create `components/insight-card.tsx`:

```tsx
import { computeInsights, InsightPeriod } from "@/lib/insights";
import { FinancialSummaryItem } from "@/lib/types";
import { styles } from "@/styles/tabs/insight-card.styles";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface InsightCardProps {
  expenseItems: FinancialSummaryItem[];
  incomeItems: FinancialSummaryItem[];
  prevExpenseItems: FinancialSummaryItem[];
  prevIncomeItems: FinancialSummaryItem[];
  symbol: string;
  decimals: number;
  period: InsightPeriod;
  isLoading?: boolean;
}

export function InsightCard({
  expenseItems,
  incomeItems,
  prevExpenseItems,
  prevIncomeItems,
  symbol,
  decimals,
  period,
  isLoading,
}: InsightCardProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const opacity = useSharedValue(1);
  const skeletonOpacity = useSharedValue(0.4);

  const insights = useMemo(
    () =>
      computeInsights(
        expenseItems,
        prevExpenseItems,
        incomeItems,
        prevIncomeItems,
        symbol,
        decimals,
        period,
      ),
    [expenseItems, prevExpenseItems, incomeItems, prevIncomeItems, symbol, decimals, period],
  );

  // Reset to first insight when period or data changes
  useEffect(() => {
    setActiveIndex(0);
  }, [period, expenseItems, incomeItems]);

  useEffect(() => {
    if (!isLoading) return;
    skeletonOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700 }),
        withTiming(0.4, { duration: 700 }),
      ),
      -1,
      false,
    );
  }, [isLoading]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const skeletonStyle = useAnimatedStyle(() => ({ opacity: skeletonOpacity.value }));

  if (!isLoading && insights.length === 0) return null;

  function handleTap() {
    if (insights.length <= 1) return;
    const nextIndex = (activeIndex + 1) % insights.length;
    opacity.value = withTiming(0, { duration: 150 }, (finished) => {
      if (finished) {
        runOnJS(setActiveIndex)(nextIndex);
        opacity.value = withTiming(1, { duration: 200 });
      }
    });
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={handleTap}
    >
      {isLoading ? (
        <Animated.View style={[styles.skeleton, skeletonStyle]} />
      ) : (
        <Animated.Text style={[styles.insightText, animatedStyle]}>
          {insights[activeIndex]?.text ?? ""}
        </Animated.Text>
      )}

      {!isLoading && insights.length > 1 && (
        <View style={styles.dots}>
          {insights.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      )}
    </Pressable>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/insight-card.tsx
git commit -m "feat: add InsightCard component"
```

---

## Task 5: Integrate into dashboard

**Files:**
- Modify: `app/(tabs)/dashboard.tsx`

- [ ] **Step 1: Add previous-period query keys and computation**

In `dashboard.tsx`, add the following after the existing `expenseSummaryPath` / `incomeSummaryPath` declarations (around line 44):

```ts
import { getPreviousPeriodRange } from "@/lib/insights";
import { InsightCard } from "@/components/insight-card";
```

Add these lines after `const endDate = useMemo(...)`:

```ts
const prevPeriodRange = useMemo(
  () => getPreviousPeriodRange(activePeriod),
  [activePeriod],
);
```

- [ ] **Step 2: Add two new useQuery calls**

Add these two queries after the existing `incomeSummaryItems` query (around line 227):

```ts
const { data: prevExpenseSummaryItems = [], isLoading: prevExpenseLoading } = useQuery({
  queryKey: ["summary", "EXPENSE", "prev", activePeriod, startDate, endDate],
  queryFn: () =>
    api.get<FinancialSummaryItem[]>(
      `/financial-entries/summary?type=EXPENSE&start=${prevPeriodRange!.start}&end=${prevPeriodRange!.end}`,
    ),
  enabled: !!token && prevPeriodRange !== null,
  staleTime: 30_000,
});

const { data: prevIncomeSummaryItems = [], isLoading: prevIncomeLoading } = useQuery({
  queryKey: ["summary", "INCOME", "prev", activePeriod, startDate, endDate],
  queryFn: () =>
    api.get<FinancialSummaryItem[]>(
      `/financial-entries/summary?type=INCOME&start=${prevPeriodRange!.start}&end=${prevPeriodRange!.end}`,
    ),
  enabled: !!token && prevPeriodRange !== null,
  staleTime: 30_000,
});
```

- [ ] **Step 3: Render `<InsightCard />` in the ScrollView**

In the `ScrollView`, after the closing `</View>` of the existing white card (the `<View style={styles.card}>` block, around line 375), add:

```tsx
<InsightCard
  expenseItems={expenseSummaryItems ?? []}
  incomeItems={incomeSummaryItems ?? []}
  prevExpenseItems={prevExpenseSummaryItems}
  prevIncomeItems={prevIncomeSummaryItems}
  symbol={symbol}
  decimals={decimals}
  period={activePeriod}
  isLoading={prevExpenseLoading || prevIncomeLoading}
/>
```

- [ ] **Step 4: Include new refetch calls in `onRefresh`**

The `onRefresh` callback currently calls `refetchExpenseSummary` and `refetchIncomeSummary`. Update it to also invalidate prev-period queries by adding `refetchPrevExpenseSummary` and `refetchPrevIncomeSummary` destructured from the two new `useQuery` hooks:

```ts
// Destructure refetch from both new queries (add `refetch: refetchPrevExpenseSummary` and `refetch: refetchPrevIncomeSummary`)
const { ..., refetch: refetchPrevExpenseSummary } = useQuery({ ... }); // prevExpense
const { ..., refetch: refetchPrevIncomeSummary } = useQuery({ ... }); // prevIncome

// In onRefresh:
await Promise.all([
  refetchAccount(),
  refetchExpenseSummary(),
  refetchIncomeSummary(),
  refetchPrevExpenseSummary(),
  refetchPrevIncomeSummary(),
]);
```

- [ ] **Step 5: Verify no TypeScript errors**

Run: `npx expo export --platform web 2>&1 | tail -10`

Expected: build succeeds with no errors.

- [ ] **Step 6: Commit**

```bash
git add app/(tabs)/dashboard.tsx
git commit -m "feat: integrate InsightCard into dashboard with previous-period queries"
```

---

## Self-Review Checklist

- [x] `FinancialSummaryItem` exported from `lib/types.ts` and imported everywhere — Task 1 covers this
- [x] `getPreviousPeriodRange` returns `null` for `Period` — yes, query `enabled` guards against it
- [x] All 6 insight types from spec — covered in `computeInsights`
- [x] Skeleton loading state — skeleton pulse in `InsightCard` with `isLoading` prop
- [x] Fade transition on tap — `withTiming` + `runOnJS` pattern in `handleTap`
- [x] Pagination dots — rendered when `insights.length > 1`
- [x] `activeIndex` resets when period/data changes — `useEffect` in Task 4
- [x] `onRefresh` includes new fetches — Task 5 Step 4
- [x] Card hidden when no insights — `if (!isLoading && insights.length === 0) return null`
- [x] All text in English — yes, all insight strings are English
- [x] `period` prop typed as `InsightPeriod` which matches `Period` from dashboard — both are `"Day" | "Week" | "Month" | "Year" | "Period"`
