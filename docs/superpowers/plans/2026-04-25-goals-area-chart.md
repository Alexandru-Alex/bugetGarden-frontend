# Goals Area Chart Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Goals Activity area chart card to the Statistics page showing deposited vs withdrawn per period from `/statistics/goals`.

**Architecture:** New `StatGoalsChart` component built with `react-native-svg` renders two filled areas + lines. A new `useQuery` in `StatisticsContent` fetches `/statistics/goals?period=...` using the existing `activePeriod` state. The card renders below the existing chart card on all tabs.

**Tech Stack:** react-native-svg 15.x, @tanstack/react-query 5.x, React Native StyleSheet

---

### Task 1: Create StatGoalsChart component

**Files:**
- Create: `components/stat-goals-chart.tsx`

- [ ] **Step 1: Create the file with this exact content**

```tsx
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Circle, Line, Polygon, Polyline, Svg, Text as SvgText } from "react-native-svg";

export interface GoalsPeriodItem {
  label: string;
  deposited: number;
  withdrawn: number;
}

interface Props {
  data: GoalsPeriodItem[];
}

const CHART_H = 120;
const CHART_W_PER_POINT = 52;
const PADDING_LEFT = 12;
const PADDING_RIGHT = 12;
const PADDING_TOP = 12;
const PADDING_BOTTOM = 24;
const PLOT_H = CHART_H - PADDING_TOP - PADDING_BOTTOM;

function toY(value: number, maxValue: number): number {
  return PADDING_TOP + PLOT_H - Math.max(2, (value / maxValue) * PLOT_H);
}

export function StatGoalsChart({ data }: Props) {
  const maxValue = useMemo(() => {
    let m = 0;
    for (const d of data) m = Math.max(m, d.deposited, d.withdrawn);
    return m || 1;
  }, [data]);

  const totalW = useMemo(
    () => PADDING_LEFT + data.length * CHART_W_PER_POINT + PADDING_RIGHT,
    [data.length],
  );

  const xs = useMemo(
    () => data.map((_, i) => PADDING_LEFT + i * CHART_W_PER_POINT + CHART_W_PER_POINT / 2),
    [data.length],
  );

  const baseY = PADDING_TOP + PLOT_H;

  const depositedPoints = useMemo(
    () => data.map((d, i) => `${xs[i]},${toY(d.deposited, maxValue)}`).join(" "),
    [data, xs, maxValue],
  );

  const withdrawnPoints = useMemo(
    () => data.map((d, i) => `${xs[i]},${toY(d.withdrawn, maxValue)}`).join(" "),
    [data, xs, maxValue],
  );

  const depositedArea = useMemo(
    () =>
      `${xs[0]},${baseY} ` +
      data.map((d, i) => `${xs[i]},${toY(d.deposited, maxValue)}`).join(" ") +
      ` ${xs[xs.length - 1]},${baseY}`,
    [data, xs, maxValue, baseY],
  );

  const withdrawnArea = useMemo(
    () =>
      `${xs[0]},${baseY} ` +
      data.map((d, i) => `${xs[i]},${toY(d.withdrawn, maxValue)}`).join(" ") +
      ` ${xs[xs.length - 1]},${baseY}`,
    [data, xs, maxValue, baseY],
  );

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <Svg width={totalW} height={CHART_H}>
        {/* baseline */}
        <Line
          x1={PADDING_LEFT}
          y1={baseY}
          x2={totalW - PADDING_RIGHT}
          y2={baseY}
          stroke="#E4EFE1"
          strokeWidth={1}
        />

        {/* deposited area */}
        <Polygon points={depositedArea} fill="#79AE6F" fillOpacity={0.22} />
        {/* withdrawn area */}
        <Polygon points={withdrawnArea} fill="#FFAA44" fillOpacity={0.32} />

        {/* deposited line */}
        <Polyline
          points={depositedPoints}
          fill="none"
          stroke="#346739"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {/* withdrawn line */}
        <Polyline
          points={withdrawnPoints}
          fill="none"
          stroke="#FFAA44"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* dots + labels */}
        {data.map((d, i) => (
          <React.Fragment key={d.label}>
            <Circle cx={xs[i]} cy={toY(d.deposited, maxValue)} r={3.5} fill="#346739" />
            <Circle cx={xs[i]} cy={toY(d.withdrawn, maxValue)} r={3.5} fill="#FFAA44" />
            <SvgText
              x={xs[i]}
              y={CHART_H - 4}
              textAnchor="middle"
              fontSize={9}
              fontFamily="Nunito_700Bold"
              fill="#346739"
            >
              {d.label}
            </SvgText>
          </React.Fragment>
        ))}
      </Svg>
    </ScrollView>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/stat-goals-chart.tsx
git commit -m "feat: add StatGoalsChart area chart component"
```

---

### Task 2: Wire query and render card in statistics.tsx

**Files:**
- Modify: `app/(tabs)/statistics.tsx`

- [ ] **Step 1: Add import at the top of the file (after existing stat imports, line ~2)**

Add to the existing import block:
```tsx
import { GoalsPeriodItem, StatGoalsChart } from "@/components/stat-goals-chart";
```

- [ ] **Step 2: Add the goals query inside `StatisticsContent` (after the summaryData query, ~line 147)**

```tsx
const { data: goalsData = [], isLoading: goalsLoading } = useQuery({
  queryKey: ["statistics-goals", activePeriod],
  queryFn: () => api.get<GoalsPeriodItem[]>(`/statistics/goals?period=${activePeriod}`),
  staleTime: 5 * 60 * 1000,
});
```

- [ ] **Step 3: Add goals card in JSX — insert after the closing `</View>` of the existing `chartCard` (after line ~312), before `{selectedBar && ...}`**

```tsx
<View style={styles.chartCard}>
  <Text style={styles.chartTitle}>Goals Activity</Text>
  {goalsLoading ? (
    <View style={styles.chartLoader}>
      <ActivityIndicator color="#346739" />
    </View>
  ) : goalsData.length === 0 ? (
    <View style={styles.chartEmpty}>
      <Text style={styles.chartEmptyText}>No data for this period</Text>
    </View>
  ) : (
    <StatGoalsChart data={goalsData} />
  )}
  <View style={styles.legend}>
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: "#346739" }]} />
      <Text style={styles.legendText}>Deposited</Text>
    </View>
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: "#FFAA44" }]} />
      <Text style={styles.legendText}>Withdrawn</Text>
    </View>
  </View>
</View>
```

- [ ] **Step 4: Commit**

```bash
git add app/(tabs)/statistics.tsx
git commit -m "feat: add Goals Activity chart to statistics page"
```

---

### Task 3: Verify visually

- [ ] **Step 1: Start the app**

```bash
npx expo start
```

- [ ] **Step 2: Check these things on the Statistics page**
  - Goals Activity card appears below the existing chart on all 3 tabs (General / Expenses / Income)
  - Switching period (YEAR / MONTH / WEEK / DAY) refreshes both charts
  - Loading spinner shows while fetching
  - "No data for this period" shows when backend returns empty array
  - Green line (Deposited) and orange line (Withdrawn) render with filled areas underneath
  - Labels below each point are readable
  - Chart scrolls horizontally when there are many data points
  - Legend shows `● Deposited  ● Withdrawn`

- [ ] **Step 3: If backend not available, test with mock data**

Temporarily replace the query result for smoke testing:
```tsx
const goalsData: GoalsPeriodItem[] = [
  { label: "Jan", deposited: 500, withdrawn: 100 },
  { label: "Feb", deposited: 800, withdrawn: 200 },
  { label: "Mar", deposited: 300, withdrawn: 150 },
  { label: "Apr", deposited: 950, withdrawn: 300 },
  { label: "May", deposited: 700, withdrawn: 50 },
];
```

Remove mock data before final commit.
