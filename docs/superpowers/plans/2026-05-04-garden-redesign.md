# Garden Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `/garden` with a full green background, leaf counter overlay on the grid, and a scrollable white card below containing a line chart of flowers planted per day this month (mocked data).

**Architecture:** Remove the single-card wrapper; the page now has three vertical sections — month nav (on green), isometric grid (on green, with absolute leaf counter), and a white chart card that slides up from below. The chart is a new standalone component using `react-native-svg`.

**Tech Stack:** React Native, Expo Router, `react-native-svg` (already installed at v15.12.1), existing Nunito fonts.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `components/garden-flowers-chart.tsx` | Create | SVG line chart — flowers per day |
| `styles/tabs/garden.styles.ts` | Modify | Remove card styles; add green-layout + leaf counter + chart card styles |
| `app/(tabs)/garden.tsx` | Modify | Remove card wrapper, title, emoji strip, counter; add leaf overlay + chart card |

---

### Task 1: Create `GardenFlowersChart` component

**Files:**
- Create: `components/garden-flowers-chart.tsx`

- [ ] **Step 1: Create the component file**

```tsx
// components/garden-flowers-chart.tsx
import React, { useMemo, useState } from "react";
import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Polyline,
  Stop,
  Svg,
} from "react-native-svg";

const CHART_H = 110;
const PADDING_TOP = 10;
const PADDING_H = 6;
const PLOT_H = CHART_H - PADDING_TOP;

interface Props {
  data: Record<number, number>;
  daysInMonth: number;
  todayDay: number | null;
}

export function GardenFlowersChart({ data, daysInMonth, todayDay }: Props) {
  const [chartWidth, setChartWidth] = useState(0);

  const maxCount = useMemo(() => {
    const vals = Object.values(data);
    return vals.length ? Math.max(...vals) : 1;
  }, [data]);

  const plotW = chartWidth - PADDING_H * 2;

  const points = useMemo(() => {
    if (!chartWidth) return [];
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const count = data[day] ?? 0;
      const x = PADDING_H + (daysInMonth > 1 ? (i / (daysInMonth - 1)) * plotW : plotW / 2);
      const y = PADDING_TOP + PLOT_H - (count / maxCount) * PLOT_H;
      return { x, y, count, day };
    });
  }, [chartWidth, daysInMonth, data, maxCount, plotW]);

  const lineStr = useMemo(
    () => points.map((p) => `${p.x},${p.y}`).join(" "),
    [points],
  );

  const baseY = PADDING_TOP + PLOT_H;

  const areaPath = useMemo(() => {
    if (!points.length) return "";
    const first = points[0];
    const last = points[points.length - 1];
    return (
      `M${first.x},${baseY} ` +
      points.map((p) => `L${p.x},${p.y}`).join(" ") +
      ` L${last.x},${baseY} Z`
    );
  }, [points, baseY]);

  const totalFlowers = useMemo(
    () => Object.values(data).reduce((s, v) => s + v, 0),
    [data],
  );

  const todayPoint = todayDay != null ? points[todayDay - 1] ?? null : null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Flowers This Month</Text>
      <Text style={styles.total}>
        Total:{" "}
        <Text style={styles.totalHighlight}>{totalFlowers} flowers planted</Text>
      </Text>

      <View
        style={styles.chartArea}
        onLayout={(e: LayoutChangeEvent) =>
          setChartWidth(e.nativeEvent.layout.width)
        }
      >
        {chartWidth > 0 && (
          <Svg width={chartWidth} height={CHART_H}>
            <Defs>
              <LinearGradient id="gardenAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#79AE6F" stopOpacity="0.28" />
                <Stop offset="1" stopColor="#79AE6F" stopOpacity="0.02" />
              </LinearGradient>
            </Defs>

            {[0, 0.33, 0.66, 1].map((t) => (
              <Path
                key={t}
                d={`M${PADDING_H},${PADDING_TOP + t * PLOT_H} L${chartWidth - PADDING_H},${PADDING_TOP + t * PLOT_H}`}
                stroke="#e0efda"
                strokeWidth={1}
              />
            ))}

            <Path d={areaPath} fill="url(#gardenAreaGrad)" />

            <Polyline
              points={lineStr}
              fill="none"
              stroke="#79AE6F"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {points
              .filter((p) => p.count > 0 && p.day !== todayDay)
              .map((p) => (
                <Circle
                  key={p.day}
                  cx={p.x}
                  cy={p.y}
                  r={3}
                  fill="#79AE6F"
                  stroke="#f4f9f1"
                  strokeWidth={1.5}
                />
              ))}

            {todayPoint && (
              <Circle
                cx={todayPoint.x}
                cy={todayPoint.y}
                r={5}
                fill="#346739"
                stroke="#f4f9f1"
                strokeWidth={2}
              />
            )}
          </Svg>
        )}
      </View>

      <View style={styles.xLabels}>
        <Text style={styles.xLabel}>1</Text>
        <Text style={styles.xLabel}>8</Text>
        <Text style={styles.xLabel}>15</Text>
        <Text style={styles.xLabel}>22</Text>
        <Text style={styles.xLabel}>{daysInMonth}</Text>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#79AE6F" }]} />
          <Text style={styles.legendText}>flowers planted</Text>
        </View>
        {todayDay != null && (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#346739" }]} />
            <Text style={styles.legendText}>today</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%" },
  title: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 14,
    color: "#1b4d1b",
    marginBottom: 2,
  },
  total: {
    fontFamily: "Nunito_700Bold",
    fontSize: 11,
    color: "#5a8a3c",
    marginBottom: 12,
  },
  totalHighlight: {
    fontFamily: "Nunito_700Bold",
    color: "#346739",
  },
  chartArea: { width: "100%" },
  xLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    paddingHorizontal: 4,
  },
  xLabel: {
    fontFamily: "Nunito_700Bold",
    fontSize: 9,
    color: "#a0c090",
  },
  legend: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 9,
    color: "#7aa870",
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add components/garden-flowers-chart.tsx
git commit -m "feat(garden): add GardenFlowersChart SVG line chart component"
```

---

### Task 2: Update `garden.styles.ts`

**Files:**
- Modify: `styles/tabs/garden.styles.ts`

- [ ] **Step 1: Replace the entire file**

```ts
// styles/tabs/garden.styles.ts
import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#346739",
    ...(Platform.OS === "web" ? { minHeight: "100vh" as any, overflow: "hidden" } : {}),
  },
  bgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.10)",
  },
  safe: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingBottom: 40,
  },
  innerWrapper: {
    width: "100%",
    maxWidth: 700,
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  navBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  navArrow: {
    fontSize: 28,
    color: "#9FCB98",
    lineHeight: 30,
    fontFamily: "Nunito_800ExtraBold",
  },
  monthLabel: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 16,
    color: "#ffffff",
    minWidth: 150,
    textAlign: "center",
  },
  gridSection: {
    alignSelf: "stretch",
    position: "relative",
  },
  gridWrapper: {
    alignSelf: "stretch",
    paddingHorizontal: 4,
    overflow: "visible",
  },
  grid: {
    position: "relative",
    overflow: "visible",
  },
  leafCounter: {
    position: "absolute",
    bottom: 16,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0,0,0,0.28)",
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  leafIcon: {
    width: 18,
    height: 18,
    resizeMode: "contain",
  },
  leafCount: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 14,
    color: "#ffffff",
  },
  chartCard: {
    alignSelf: "stretch",
    backgroundColor: "#f4f9f1",
    borderRadius: 24,
    padding: 20,
    paddingBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  dayNumber: {
    fontFamily: "Nunito_700Bold",
    fontSize: 11,
    color: "#3a6a2a",
    fontWeight: "600",
    textAlign: "center",
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add styles/tabs/garden.styles.ts
git commit -m "feat(garden): update styles for green-bg layout, leaf counter, chart card"
```

---

### Task 3: Restructure `garden.tsx`

**Files:**
- Modify: `app/(tabs)/garden.tsx`

- [ ] **Step 1: Replace the entire file**

```tsx
// app/(tabs)/garden.tsx
import { GardenFlowersChart } from "@/components/garden-flowers-chart";
import { GrassCube } from "@/components/grass-cube";
import { NavMenu } from "@/components/nav-menu";
import { PageTransition } from "@/components/page-transition";
import { RoseFlower } from "@/components/rose-flower";
import { getStoredToken } from "@/lib/api";
import { styles } from "@/styles/tabs/garden.styles";
import { Redirect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Polygon } from "react-native-svg";

const MAX_CELL_SIZE = 100;
const ROWS = 7;
const COLS = 7;
const INNER_ROWS = 6;
const INNER_COLS = 6;

const MONTH_NAMES = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

const MOCK_FLOWERS: Record<number, number> = {
  2: 1, 4: 2, 8: 1, 9: 3, 12: 2, 13: 1,
  16: 3, 18: 1, 23: 2, 24: 1, 27: 3, 29: 1,
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export default function GardenScreen() {
  const [token, setToken] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    getStoredToken().then(setToken);
  }, []);

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const isCurrentMonth =
    viewYear === now.getFullYear() && viewMonth === now.getMonth();
  const isFutureMonth =
    viewYear > now.getFullYear() ||
    (viewYear === now.getFullYear() && viewMonth > now.getMonth());

  const [gridContainerW, setGridContainerW] = useState(0);
  const CELL_SIZE = gridContainerW > 0
    ? Math.min(MAX_CELL_SIZE, Math.floor(gridContainerW * 2 / (COLS + ROWS)))
    : 0;

  const isoXOffset = (ROWS - 1) * (CELL_SIZE / 2);
  const isoW = (COLS + ROWS - 2) * (CELL_SIZE / 2) + CELL_SIZE;
  const isoH = (COLS + ROWS - 2) * (CELL_SIZE / 4) + CELL_SIZE;

  const tiles = useMemo(() =>
    Array.from({ length: ROWS }, (_, r) =>
      Array.from({ length: COLS }, (_, c) => ({ r, c }))
    ).flat().sort((a, b) => (a.r + a.c) - (b.r + b.c)),
    [],
  );

  const FLOWER_COUNT = 5;
  const [flowers, setFlowers] = useState<Map<number, number>>(new Map());
  const [hovered, setHovered] = useState<number | null>(null);

  const toggleFlower = useCallback((day: number) => {
    setFlowers((prev) => {
      const next = new Map(prev);
      const current = next.get(day);
      if (current === undefined) {
        next.set(day, 0);
      } else if (current < FLOWER_COUNT - 1) {
        next.set(day, current + 1);
      } else {
        next.delete(day);
      }
      return next;
    });
  }, []);

  const prevMonth = () => {
    setFlowers(new Map());
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    setFlowers(new Map());
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  if (token === undefined) return null;
  if (!token) return <Redirect href="/landing" />;

  return (
    <PageTransition style={styles.container}>
      <View style={[StyleSheet.absoluteFill, styles.bgOverlay]} pointerEvents="none" />
      <NavMenu />

      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.innerWrapper}>
            {/* Month navigator */}
            <View style={styles.monthNav}>
              <Pressable onPress={prevMonth} style={styles.navBtn}>
                <Text style={styles.navArrow}>‹</Text>
              </Pressable>
              <Text style={styles.monthLabel}>
                {MONTH_NAMES[viewMonth]} {viewYear}
              </Text>
              <Pressable onPress={nextMonth} style={styles.navBtn}>
                <Text style={styles.navArrow}>›</Text>
              </Pressable>
            </View>

            {/* Grid + leaf counter */}
            <View style={styles.gridSection}>
              <View
                style={styles.gridWrapper}
                onLayout={(e) => setGridContainerW(e.nativeEvent.layout.width)}
              >
                <View style={{ paddingTop: CELL_SIZE * 0.65, paddingBottom: 8, alignItems: "center" }}>
                  <View style={[styles.grid, { width: isoW, height: isoH }]}>
                    {CELL_SIZE > 0 && tiles.map(({ r: row, c: col }) => {
                      const x = isoXOffset + (col - row) * (CELL_SIZE / 2);
                      const y = (col + row) * (CELL_SIZE / 4);

                      const isCorner = row === 0 && col === 0;
                      const isFenceRight = row === 0 && col > 0;
                      const isFenceLeft = col === 0 && row > 0;
                      const isBorder = isCorner || isFenceRight || isFenceLeft;

                      if (isBorder) {
                        const src = isCorner
                          ? require("../../gradina/colt.png")
                          : isFenceRight
                            ? require("../../gradina/gard_dreapta.png")
                            : require("../../gradina/gard_stanga.png");

                        const scale = 1.30;
                        const imgSize = CELL_SIZE * scale;
                        const offsetX = -(CELL_SIZE * (scale - 1)) / 2;
                        const offsetY = -(CELL_SIZE * (scale - 1)) * 0.65 - CELL_SIZE * 0.07;

                        return (
                          <View
                            key={`${row}-${col}`}
                            pointerEvents="none"
                            style={{
                              position: "absolute",
                              left: x,
                              top: y,
                              width: CELL_SIZE,
                              height: CELL_SIZE,
                              overflow: "visible",
                            }}
                          >
                            <Image
                              source={src}
                              style={{
                                position: "absolute",
                                left: offsetX,
                                top: offsetY,
                                width: imgSize,
                                height: imgSize,
                              }}
                              resizeMode="stretch"
                            />
                          </View>
                        );
                      }

                      const day = (row - 1) * INNER_COLS + (col - 1) + 1;
                      const isOutOfMonth = day > daysInMonth;
                      const hasFlower = flowers.has(day);
                      const flowerIndex = flowers.get(day) ?? 0;
                      const isHovered = hovered === day;
                      const isFuture = isFutureMonth;

                      const cubeVariant = hasFlower
                        ? "flower"
                        : isHovered
                          ? "hovered"
                          : isFuture
                            ? "future"
                            : "normal";

                      return (
                        <View
                          key={`${row}-${col}`}
                          pointerEvents="box-none"
                          style={{
                            position: "absolute",
                            left: x,
                            top: y,
                            width: CELL_SIZE,
                            height: CELL_SIZE,
                            overflow: "visible",
                            opacity: isFuture ? 0.55 : 1,
                            transform: isHovered ? [{ translateY: -3 }] : [],
                          }}
                        >
                          <GrassCube size={CELL_SIZE} variant={cubeVariant} />

                          {hasFlower && (
                            <View
                              pointerEvents="none"
                              style={{
                                position: "absolute",
                                top: -CELL_SIZE * 0.6,
                                left: 8,
                                width: CELL_SIZE + 16,
                              }}
                            >
                              <RoseFlower size={CELL_SIZE - 4} flowerIndex={flowerIndex} />
                            </View>
                          )}

                          {!hasFlower && isHovered && (
                            <Svg
                              viewBox="0 0 100 50"
                              width={CELL_SIZE}
                              height={CELL_SIZE / 2}
                              // @ts-ignore
                              pointerEvents="none"
                              style={{ position: "absolute", top: 0, left: 0 }}
                            >
                              <Polygon
                                points="50,2 97,26 50,48 3,26"
                                fill="rgba(255,255,255,0.22)"
                                stroke="rgba(255,255,255,0.6)"
                                strokeWidth="2.5"
                              />
                            </Svg>
                          )}

                          {!hasFlower && isHovered && (
                            <View
                              pointerEvents="none"
                              style={{
                                position: "absolute",
                                top: CELL_SIZE * 0.08,
                                left: 0,
                                right: 0,
                                alignItems: "center",
                              }}
                            >
                              <Text style={styles.dayNumber}>+</Text>
                            </View>
                          )}

                          <Pressable
                            onPress={() => !isFuture && toggleFlower(day)}
                            // @ts-ignore
                            onHoverIn={() => !isFuture && setHovered(day)}
                            // @ts-ignore
                            onHoverOut={() => setHovered(null)}
                            android_ripple={null}
                            style={{ position: "absolute", top: CELL_SIZE * 0.05, left: CELL_SIZE * 0.22, width: CELL_SIZE * 0.56, height: CELL_SIZE * 0.35 }}
                          />
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>

              {/* Leaf counter */}
              <View style={styles.leafCounter} pointerEvents="none">
                <Image
                  source={require("../../assets/images/leaf_w.png")}
                  style={styles.leafIcon}
                />
                <Text style={styles.leafCount}>{flowers.size}</Text>
              </View>
            </View>

            {/* Chart card */}
            <View style={styles.chartCard}>
              <GardenFlowersChart
                data={MOCK_FLOWERS}
                daysInMonth={daysInMonth}
                todayDay={isCurrentMonth ? now.getDate() : null}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </PageTransition>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors. If there are errors, fix them before committing.

- [ ] **Step 3: Commit**

```bash
git add app/(tabs)/garden.tsx
git commit -m "feat(garden): restructure page — green bg, leaf counter, flowers chart"
```

---

## Self-Review

**Spec coverage:**
- ✅ Green background throughout — `container.backgroundColor: "#346739"`
- ✅ Remove emoji strip, title, card wrapper, pill counter — gone from garden.tsx
- ✅ Month nav: white text on green, no background pill — `monthLabel` color `#ffffff`, `monthNav` has no background
- ✅ Leaf counter: `leaf_w.png` + `flowers.size`, bottom-right, absolute over grid — `leafCounter` style
- ✅ Line chart with area fill, dots, today marker, legend — `GardenFlowersChart`
- ✅ Mocked data `MOCK_FLOWERS` — defined in garden.tsx
- ✅ `todayDay` passed only when `isCurrentMonth` — ✅
- ✅ No new libraries — `react-native-svg` already installed
- ✅ Grid logic unchanged — tile rendering code copy-pasted verbatim

**Placeholder scan:** No TBD or TODO found.

**Type consistency:**
- `GardenFlowersChart` props: `data: Record<number, number>`, `daysInMonth: number`, `todayDay: number | null` — used consistently across Task 1 and Task 3.
- `MOCK_FLOWERS` is `Record<number, number>` — matches `data` prop type.
- `flowers.size` is `number` — matches `leafCount` text rendering.
