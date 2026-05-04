# Garden Page Redesign

**Date:** 2026-05-04

## Overview

Redesign `/garden` (app/(tabs)/garden.tsx) to match the visual direction of the reference design: green background throughout, isometric grid in the center, and a scrollable white chart card below showing flowers planted per day this month.

## Layout

```
┌──────────────────────────────┐
│  NavMenu (unchanged)         │  dark green #1b4d1b
├──────────────────────────────┤
│  ‹  May 2026  ›              │  white text on green bg
│                              │
│  ┌────────────────────────┐  │
│  │  Isometric grid        │  │  green bg, grid unchanged
│  │              🌿 12     │  │  leaf_w.png + count, bottom-right
│  └────────────────────────┘  │
├──────────────────────────────┤  ← rounded top corners
│  Flowers This Month    ⓘ    │  white card, scrollable
│  Total: 12 flowers planted   │
│                              │
│  [line chart — days 1-31]    │
│                              │
│  1    8    15    22    31    │
│  ● flowers planted           │
│  ● today                     │
└──────────────────────────────┘
```

## Sections

### 1. Page background
- Background color: `#346739` (green) throughout, replacing the current card-based layout.
- Remove: emoji strip (`gardenStrip`), "My Garden 🌱" title, the outer `card` wrapper, and the `🌸 x/y flowers planted` counter text.

### 2. Month navigator
- Kept as-is functionally (prev/next month, year rollover, clears flowers on change).
- Visually: white text `May 2026`, arrows `‹ ›` in `#9FCB98`, no background pill — floats directly on green.

### 3. Isometric grid
- Grid code and logic completely unchanged.
- Leaf counter overlay: `assets/images/leaf_w.png` (18×18, white tint) + `flowers.size` (live count from grid state — how many tiles the user has planted this session), positioned `absolute` bottom-right inside the grid container, semi-transparent dark pill background.

### 4. Flowers-this-month chart card
- Positioned below the grid, rounded top corners (24px), background `#f4f9f1`.
- Uses `react-native-svg` (already in project) — no new library.

**Chart spec:**
- Type: line chart with area fill below the line.
- X axis: days 1–31 (or days in month). Labels at day 1, ~8, 15, 22, 31.
- Y axis: flowers planted on that day (0–max). No explicit Y labels needed; horizontal grid lines at 25%, 50%, 75%, 100% of max.
- Line color: `#79AE6F`. Area fill: gradient from `#79AE6F` 25% opacity → transparent.
- Dots on each data point with a flower value > 0: `#79AE6F` filled, white stroke.
- Today marker: larger dot `#346739` with white stroke.
- Legend: two items — green dot "flowers planted", dark green dot "today".
- Title: "Flowers This Month" bold `#1b4d1b` + total count in `#346739`.

**Mocked data (until real API exists):**
```ts
const MOCK_FLOWERS: Record<number, number> = {
  2: 1, 4: 2, 8: 1, 9: 3, 12: 2, 13: 1,
  16: 3, 18: 1, 23: 2, 24: 1, 27: 3, 29: 1,
};
```
Total = 12. This replaces the interactive `flowers` state for the chart (the grid still uses its own state).

## Files to change

| File | Change |
|------|--------|
| `app/(tabs)/garden.tsx` | Remove card wrapper, emoji strip, title, counter; add leaf overlay + chart card |
| `styles/tabs/garden.styles.ts` | Remove unused styles; add new styles for green layout, leaf counter, chart card |
| `components/garden-flowers-chart.tsx` | New component — line chart using react-native-svg |

## Constraints

- No new libraries — use `react-native-svg` (already installed).
- Grid logic and isometric rendering: zero changes.
- Mocked data only for the chart; shape is `Record<number, number>` (day → count) for easy swap to real API later.
- All text in English.
