# Statistics — Category Breakdown Chart

**Date:** 2026-04-26

## Overview

Add a stacked bar chart to the `/statistics` page that visualises financial entries grouped by category over time. Data comes from `GET /statistics/categories` and uses the same `type` and `period` query params as the existing charts.

## Endpoint

```
GET /statistics/categories?type={StatisticsType}&period={StatisticsPeriod}
```

Response shape:
```ts
interface CategoryPeriodDto {
  label: string;               // period label, e.g. "Jan 2024"
  categories: CategoryEntryDto[];
}
interface CategoryEntryDto {
  name: string;
  color: string;               // hex color owned by the category
  icon: string;                // MaterialCommunityIcons name
  amount: number;              // BigDecimal → number
}
```

## New Component: `components/stat-stacked-chart.tsx`

Props:
```ts
interface Props {
  data: CategoryPeriodDto[];
  onSegmentPress: (entry: CategoryEntryDto, position: { x: number; y: number }) => void;
}
```

Rendering:
- Horizontal `ScrollView` (same pattern as `stat-category-chart.tsx`)
- One bar group per `CategoryPeriodDto`, with period `label` below
- Each bar group is a column of stacked `Pressable` segments, one per `CategoryEntryDto`
- Segment height proportional to `amount` relative to the max total across all periods
- Segment background = `entry.color`
- Zero-amount periods render a short greyed placeholder bar

## Toast on Press

Pressing a segment calls `onSegmentPress` with the `CategoryEntryDto` and `{ x: pageX, y: pageY }`.  
The parent formats the toast as: `"CategoryName • $amount"` using the existing `showToast` + `formatAmount` helpers.

## Integration in `statistics.tsx`

New query added to `StatisticsContent`:
```ts
const { data: categoriesData = [], isLoading: categoriesLoading } = useQuery({
  queryKey: ["statistics-categories", activeTab, activePeriod],
  queryFn: () => api.get<CategoryPeriodDto[]>(
    `/statistics/categories?type=${activeTab}&period=${activePeriod}`
  ),
  staleTime: 5 * 60 * 1000,
});
```

New handler:
```ts
const handleSegmentPress = useCallback(
  (entry: CategoryEntryDto, position: { x: number; y: number }) => {
    showToast(`${entry.name} • ${symbol}${formatAmount(entry.amount)}`, position);
  },
  [showToast, symbol],
);
```

## Layout

The new chart is a **full-width card below the existing 2-chart row** (both narrow and wide screens). This avoids cramping 3 cards side-by-side at 768px.

```
[ Summary / Category chart ] [ Goals chart ]   ← existing row
[        Category Breakdown (full width)    ]   ← new card
[ Transactions list                         ]   ← existing
```

Card title: `"Category Breakdown"`

Loading and empty states follow the existing `chartLoader` / `chartEmpty` pattern.

## Out of Scope

- No static legend (categories are dynamic; the toast identifies each segment)
- No drill-down to transaction list from a segment press
- No changes to existing charts or tab/period selectors
