# Statistics — Category Breakdown Chart Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a stacked bar chart card below the existing two charts in `/statistics` that shows financial entries grouped by category per time period.

**Architecture:** A new self-contained component `stat-stacked-chart.tsx` receives the API data and renders a horizontally-scrollable stacked bar chart; `statistics.tsx` owns the query, formats the toast, and renders the card below the existing row.

**Tech Stack:** React Native, Expo Router, TanStack Query, TypeScript

---

### Task 1: Create `components/stat-stacked-chart.tsx`

**Files:**
- Create: `components/stat-stacked-chart.tsx`

- [ ] **Step 1: Create the component**

Create `components/stat-stacked-chart.tsx` with this full content:

```tsx
import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export interface CategoryEntryDto {
  name: string;
  color: string;
  icon: string;
  amount: number;
}

export interface CategoryPeriodDto {
  label: string;
  categories: CategoryEntryDto[];
}

interface Props {
  data: CategoryPeriodDto[];
  onSegmentPress: (entry: CategoryEntryDto, position: { x: number; y: number }) => void;
}

const BAR_WIDTH = 22;
const GROUP_GAP = 14;
const MAX_HEIGHT = 140;

export function StatStackedChart({ data, onSegmentPress }: Props) {
  const maxTotal = useMemo(() => {
    let m = 0;
    for (const period of data) {
      const total = period.categories.reduce((sum, c) => sum + c.amount, 0);
      if (total > m) m = total;
    }
    return m || 1;
  }, [data]);

  const groups = useMemo(
    () =>
      data.map((period) => {
        const total = period.categories.reduce((sum, c) => sum + c.amount, 0);
        return (
          <View key={period.label} style={styles.group}>
            <View style={styles.barWrapper}>
              {total === 0 ? (
                <View style={styles.emptyBar} />
              ) : (
                period.categories.map((cat) => {
                  const h = Math.max(2, (cat.amount / maxTotal) * MAX_HEIGHT);
                  return (
                    <Pressable
                      key={cat.name}
                      style={[styles.segment, { height: h, backgroundColor: cat.color }]}
                      onPress={(e) =>
                        onSegmentPress(cat, { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY })
                      }
                    />
                  );
                })
              )}
            </View>
            <Text style={styles.label} numberOfLines={2}>
              {period.label}
            </Text>
          </View>
        );
      }),
    [data, maxTotal, onSegmentPress],
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      {groups}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  group: {
    flexDirection: "column",
    alignItems: "center",
    marginRight: GROUP_GAP,
    width: BAR_WIDTH + 12,
  },
  barWrapper: {
    height: MAX_HEIGHT,
    width: BAR_WIDTH,
    justifyContent: "flex-end",
    flexDirection: "column",
    overflow: "hidden",
    borderRadius: 5,
  },
  segment: {
    width: BAR_WIDTH,
  },
  emptyBar: {
    width: BAR_WIDTH,
    height: 4,
    backgroundColor: "#E4EFE1",
    borderRadius: 5,
  },
  label: {
    marginTop: 6,
    fontSize: 9,
    fontFamily: "Nunito_700Bold",
    color: "#346739",
    textAlign: "center",
    width: BAR_WIDTH + 12,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add components/stat-stacked-chart.tsx
git commit -m "feat: add StatStackedChart component for category breakdown"
```

---

### Task 2: Integrate chart into `statistics.tsx`

**Files:**
- Modify: `app/(tabs)/statistics.tsx`

- [ ] **Step 1: Add the import**

At the top of `app/(tabs)/statistics.tsx`, add after the existing stat chart imports:

```tsx
import { CategoryEntryDto, CategoryPeriodDto, StatStackedChart } from "@/components/stat-stacked-chart";
```

- [ ] **Step 2: Add the categories query**

Inside `StatisticsContent`, after the `goalsData` query (around line 151), add:

```tsx
const { data: categoriesData = [], isLoading: categoriesLoading } = useQuery({
  queryKey: ["statistics-categories", activeTab, activePeriod],
  queryFn: () =>
    api.get<CategoryPeriodDto[]>(`/statistics/categories?type=${activeTab}&period=${activePeriod}`),
  staleTime: 5 * 60 * 1000,
});
```

- [ ] **Step 3: Add the segment press handler**

Inside `StatisticsContent`, after `handleGoalsDotPress`, add:

```tsx
const handleSegmentPress = useCallback(
  (entry: CategoryEntryDto, position: { x: number; y: number }) => {
    showToast(`${entry.name} • ${symbol}${formatAmount(entry.amount)}`, position);
  },
  [showToast, symbol],
);
```

- [ ] **Step 4: Add the chart card**

In the JSX, after the closing `</View>` of the `chartsRow` block (after the Goals chart card, around line 354), and before the `selectedBar` transactions section, add:

```tsx
<View style={styles.chartCard}>
  <Text style={styles.chartTitle}>Category Breakdown</Text>
  {categoriesLoading ? (
    <View style={styles.chartLoader}>
      <ActivityIndicator color="#346739" />
    </View>
  ) : categoriesData.length === 0 ? (
    <View style={styles.chartEmpty}>
      <Text style={styles.chartEmptyText}>No data for this period</Text>
    </View>
  ) : (
    <StatStackedChart data={categoriesData} onSegmentPress={handleSegmentPress} />
  )}
</View>
```

- [ ] **Step 5: Commit**

```bash
git add app/(tabs)/statistics.tsx
git commit -m "feat: integrate category breakdown stacked chart in statistics page"
```
