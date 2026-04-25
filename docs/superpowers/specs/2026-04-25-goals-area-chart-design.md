# Goals Area Chart — Design Spec

**Date:** 2026-04-25

## Summary

Add a Goals Activity area chart to the Statistics page, showing deposited vs withdrawn amounts per period from `/statistics/goals`.

## Data

Endpoint: `GET /statistics/goals?period={YEAR|MONTH|WEEK|DAY}`

```ts
interface GoalsPeriodItem {
  label: string;
  deposited: number;
  withdrawn: number;
}
```

## Component

**File:** `components/stat-goals-chart.tsx`

- Built with `react-native-svg`
- Horizontally scrollable (`ScrollView horizontal`)
- Two areas rendered as SVG `<Polygon>`:
  - Deposited: fill `#79AE6F` at 25% opacity, line `#346739` solid
  - Withdrawn: fill `#FFAA44` at 35% opacity, line `#FFAA44` solid
- Dots (`<Circle>`) on each data point
- Period labels below X axis
- Legend row below chart: `● Deposited  ● Withdrawn`
- Chart height: 140px (same as existing charts)
- Props: `data: GoalsPeriodItem[]`

## Integration in statistics.tsx

- New query: `useQuery(["statistics-goals", activePeriod], GET /statistics/goals?period=${activePeriod})`
- Renders below existing `chartCard` as a separate card with title `"Goals Activity"`
- Visible on all 3 tabs (GENERAL, EXPENSES, INCOME)
- Uses existing `activePeriod` state — no new state
- Loading/empty states match existing pattern (ActivityIndicator / "No data for this period")

## Styles

New entries in `styles/tabs/statistics.styles.ts` for the goals card — reuses `chartCard`, `chartTitle`, `legend`, `legendItem`, `legendDot`, `legendText` styles already defined.
