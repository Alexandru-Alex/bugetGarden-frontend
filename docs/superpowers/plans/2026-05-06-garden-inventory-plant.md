# Garden Inventory & Plant Flow — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace mock garden data with real API integration and add an inventory bottom sheet for planting flowers on garden cells.

**Architecture:** Three focused units — a static image map (`lib/flower-images.ts`), a self-contained `InventorySheet` component (`components/inventory-sheet.tsx`), and an updated `garden.tsx` screen that wires them together via React Query. The sheet animates with Reanimated 4 (`useSharedValue` / `withTiming` / `runOnJS`), consistent with `store.tsx`.

**Tech Stack:** React Native, Expo Router, React Query (`useQuery`, `useMutation`, `useQueryClient`), Reanimated 4, `expo-image`.

---

### Task 1: Create `lib/flower-images.ts`

**Files:**
- Create: `lib/flower-images.ts`

`require()` calls must be static at bundle time — this map is the single source of truth used by both the garden grid and the inventory sheet.

- [ ] **Step 1: Create the file**

```ts
// lib/flower-images.ts
import { ImageSourcePropType } from "react-native";

const FLOWER_IMAGES: Record<string, ImageSourcePropType> = {
  "rose_v2.png":     require("../flowers/rose_v2.png"),
  "rose_v3.png":     require("../flowers/rose_v3.png"),
  "Tulip.png":       require("../flowers/Tulip.png"),
  "Lavender.png":    require("../flowers/Lavender.png"),
  "peony.png":       require("../flowers/peony.png"),
  "bluebell_v3.png": require("../flowers/bluebell_v3.png"),
  "marigold.png":    require("../flowers/marigold.png"),
  "daisy.png":       require("../flowers/daisy.png"),
  "Cosmos.png":      require("../flowers/Cosmos.png"),
  "hibiscus.png":    require("../flowers/hibiscus.png"),
  "Poppy_v2.png":    require("../flowers/Poppy_v2.png"),
  "Daffodil.png":    require("../flowers/Daffodil.png"),
  "yellow_tulip.png":    require("../flowers/yellow_tulip.png"),

};

export function flowerImage(imageUrl: string): ImageSourcePropType {
  return FLOWER_IMAGES[imageUrl] ?? FLOWER_IMAGES["daisy.png"];
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add lib/flower-images.ts
git commit -m "feat(garden): add static flower image map"
```

---

### Task 2: Add toast styles to `styles/tabs/garden.styles.ts`

**Files:**
- Modify: `styles/tabs/garden.styles.ts`

- [ ] **Step 1: Add `toast` and `toastText` after the existing `dayNumber` style**

Open `styles/tabs/garden.styles.ts` and add inside `StyleSheet.create({...})`, after `dayNumber`:

```ts
  toast: {
    position: "absolute",
    top: 120,
    alignSelf: "center",
    backgroundColor: "rgba(31,46,31,0.92)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 100,
  },
  toastText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
    color: "#fff",
    textAlign: "center",
  },
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add styles/tabs/garden.styles.ts
git commit -m "feat(garden): add toast styles to garden stylesheet"
```

---

### Task 3: Create `components/inventory-sheet.tsx`

**Files:**
- Create: `components/inventory-sheet.tsx`

The sheet renders as two sibling elements: a full-screen backdrop `Pressable` and an `Animated.View` that slides in from the bottom. When closing, `animateClose` runs the translateY animation, then calls the callback via `runOnJS` after the animation finishes — this ensures the parent only sets `sheetVisible = false` after the animation completes.

Inventory is fetched lazily: `inventoryEnabled` starts `false` and flips to `true` on first open, after which React Query caches it with `staleTime: Infinity`. It's invalidated after a successful plant so the count stays accurate.

- [ ] **Step 1: Create the file**

```tsx
// components/inventory-sheet.tsx
import { api } from "@/lib/api";
import { flowerImage } from "@/lib/flower-images";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface InventoryItemDto {
  inventoryId: string;
  shopItemId: string;
  name: string;
  imageUrl: string;
  rarity: string;
  quantity: number;
}

interface Props {
  visible: boolean;
  day: number | null;
  gardenId: string;
  month: number;
  year: number;
  onClose: () => void;
  onPlantError: () => void;
}

const SHEET_HEIGHT = 240;

function InventoryItemCard({
  item,
  onPress,
  disabled,
}: {
  item: InventoryItemDto;
  onPress: () => void;
  disabled: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.card, disabled && styles.cardDisabled]}
    >
      <Image
        source={flowerImage(item.imageUrl)}
        style={styles.cardImg}
        contentFit="contain"
      />
      <View style={styles.quantityBadge}>
        <Text style={styles.quantityText}>{item.quantity}</Text>
      </View>
      <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
    </Pressable>
  );
}

export function InventorySheet({
  visible,
  day,
  gardenId,
  month,
  year,
  onClose,
  onPlantError,
}: Props) {
  const translateY = useSharedValue(SHEET_HEIGHT);
  const queryClient = useQueryClient();
  const [inventoryEnabled, setInventoryEnabled] = useState(false);

  const { data: inventory = [], isLoading } = useQuery<InventoryItemDto[]>({
    queryKey: ["inventory"],
    queryFn: () => api.get("/inventory"),
    staleTime: Infinity,
    enabled: inventoryEnabled,
  });

  const { mutate: plant, isPending } = useMutation({
    mutationFn: ({ shopItemId }: { shopItemId: string }) =>
      api.post(`/garden/${gardenId}/cells/${day}/plant`, { shopItemId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["garden", month, year] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      animateClose(onClose);
    },
    onError: () => {
      animateClose(() => { onClose(); onPlantError(); });
    },
  });

  function animateClose(callback: () => void) {
    translateY.value = withTiming(SHEET_HEIGHT, { duration: 220 }, (finished) => {
      if (finished) runOnJS(callback)();
    });
  }

  function handleClose() {
    animateClose(onClose);
  }

  useEffect(() => {
    if (visible) {
      setInventoryEnabled(true);
      translateY.value = withTiming(0, { duration: 280 });
    }
  }, [visible]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  const items = inventory.filter((i) => i.quantity > 0);

  return (
    <>
      <Pressable style={styles.backdrop} onPress={handleClose} />
      <Animated.View style={[styles.sheet, animStyle]}>
        <View style={styles.handle} />
        <Text style={styles.title}>Select a flower</Text>

        {isLoading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Loading...</Text>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No flowers in inventory</Text>
            <Pressable
              style={styles.shopBtn}
              onPress={() => { onClose(); router.push("/store"); }}
            >
              <Text style={styles.shopBtnText}>Go to Shop</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {items.map((item) => (
              <InventoryItemCard
                key={item.inventoryId}
                item={item}
                disabled={isPending}
                onPress={() => plant({ shopItemId: item.shopItemId })}
              />
            ))}
          </ScrollView>
        )}
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
    minHeight: SHEET_HEIGHT,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#d0d8d0",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 8,
  },
  title: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 16,
    color: "#1f2e1f",
    textAlign: "center",
    marginBottom: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
    alignItems: "flex-start",
  },
  card: {
    width: 80,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    position: "relative",
  },
  cardDisabled: {
    opacity: 0.5,
  },
  cardImg: {
    width: 56,
    height: 56,
  },
  cardName: {
    fontFamily: "Nunito_700Bold",
    fontSize: 10,
    color: "#346739",
    textAlign: "center",
    marginTop: 4,
    maxWidth: 76,
  },
  quantityBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#346739",
    alignItems: "center",
    justifyContent: "center",
  },
  quantityText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Nunito_700Bold",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 12,
  },
  emptyText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    color: "#8a968c",
  },
  shopBtn: {
    backgroundColor: "#346739",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  shopBtnText: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 14,
    color: "#fff",
  },
});
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add components/inventory-sheet.tsx
git commit -m "feat(garden): add InventorySheet bottom sheet component"
```

---

### Task 4: Update `app/(tabs)/garden.tsx` — API integration + sheet wiring

**Files:**
- Modify: `app/(tabs)/garden.tsx`

Key changes from the current file:
- Remove `MOCK_FLOWERS`, `flowers: Map<number, number>` state, `toggleFlower`, `FLOWER_COUNT`
- Add `GardenDto` / `GardenCellDto` / `PlantedFlowerDto` interfaces
- Add `useQuery(["garden", viewMonth + 1, viewYear])` — backend months are 1-indexed
- Add `selectedDay`, `sheetVisible`, `toastMsg` state + `toastTimer` ref
- `handleCellPress`: no-op if future or no garden data; toast if planted; else open sheet
- Replace `RoseFlower` with `expo-image` `Image` via `flowerImage(cell.flower.imageUrl)`
- Derive `plantedCells: Map<number, GardenCellDto>` from query data with `useMemo`
- Derive `chartData: Record<number, number>` — value `1` per planted day (chart sums counts)
- Render `<InventorySheet>` and toast outside `ScrollView`, inside `PageTransition`
- Border tiles use `Image` from `react-native` (renamed `RNImage`) — `expo-image` doesn't accept `require()` with `resizeMode="stretch"` reliably for these assets

- [ ] **Step 1: Replace `app/(tabs)/garden.tsx` with the full updated file**

```tsx
// app/(tabs)/garden.tsx
import { InventorySheet } from "@/components/inventory-sheet";
import { GardenFlowersChart } from "@/components/garden-flowers-chart";
import { GrassCube } from "@/components/grass-cube";
import { NavMenu } from "@/components/nav-menu";
import { PageTransition } from "@/components/page-transition";
import { api, getStoredToken } from "@/lib/api";
import { flowerImage } from "@/lib/flower-images";
import { styles } from "@/styles/tabs/garden.styles";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Redirect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Image as RNImage,
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
const INNER_COLS = 6;

const MONTH_NAMES = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

interface PlantedFlowerDto {
  name: string;
  imageUrl: string;
  rarity: string;
}

interface GardenCellDto {
  day: number;
  planted: boolean;
  plantedAt: string | null;
  flower: PlantedFlowerDto | null;
}

interface GardenDto {
  id: string;
  month: number;
  year: number;
  cells: GardenCellDto[];
}

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

  const [hovered, setHovered] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: gardenData } = useQuery<GardenDto>({
    queryKey: ["garden", viewMonth + 1, viewYear],
    queryFn: () => api.get(`/garden?month=${viewMonth + 1}&year=${viewYear}`),
    enabled: !!token,
  });

  const plantedCells = useMemo(() => {
    const map = new Map<number, GardenCellDto>();
    gardenData?.cells.forEach((c) => { if (c.planted) map.set(c.day, c); });
    return map;
  }, [gardenData]);

  const chartData = useMemo(() => {
    const result: Record<number, number> = {};
    plantedCells.forEach((_, day) => { result[day] = 1; });
    return result;
  }, [plantedCells]);

  function showToast(msg: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMsg(msg);
    toastTimer.current = setTimeout(() => setToastMsg(null), 3000);
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  };

  const handleCellPress = useCallback((day: number) => {
    if (isFutureMonth) return;
    if (!gardenData) return;
    const cell = gardenData.cells.find((c) => c.day === day);
    if (cell?.planted) {
      showToast("This flower cannot be moved");
      return;
    }
    setSelectedDay(day);
    setSheetVisible(true);
  }, [isFutureMonth, gardenData]);

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
              {!isCurrentMonth && (
                <Pressable onPress={nextMonth} style={styles.navBtn}>
                  <Text style={styles.navArrow}>›</Text>
                </Pressable>
              )}
              {isCurrentMonth && <View style={styles.navBtn} />}
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
                            <RNImage
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
                      const cell = plantedCells.get(day);
                      const hasFlower = !!cell;
                      const isHovered = hovered === day;

                      const cubeVariant = hasFlower
                        ? "flower"
                        : isHovered
                          ? "hovered"
                          : isFutureMonth
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
                            opacity: isFutureMonth ? 0.55 : 1,
                            transform: isHovered ? [{ translateY: -3 }] : [],
                          }}
                        >
                          <GrassCube size={CELL_SIZE} variant={cubeVariant} />

                          {hasFlower && cell.flower && (
                            <View
                              pointerEvents="none"
                              style={{
                                position: "absolute",
                                top: -CELL_SIZE * 0.6,
                                left: 8,
                                width: CELL_SIZE + 16,
                              }}
                            >
                              <Image
                                source={flowerImage(cell.flower.imageUrl)}
                                style={{ width: CELL_SIZE - 4, height: CELL_SIZE - 4 }}
                                contentFit="contain"
                              />
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
                            onPress={() => handleCellPress(day)}
                            // @ts-ignore
                            onHoverIn={() => !isFutureMonth && setHovered(day)}
                            // @ts-ignore
                            onHoverOut={() => setHovered(null)}
                            android_ripple={null}
                            style={{
                              position: "absolute",
                              top: CELL_SIZE * 0.05,
                              left: CELL_SIZE * 0.22,
                              width: CELL_SIZE * 0.56,
                              height: CELL_SIZE * 0.35,
                            }}
                          />
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>

              {/* Leaf counter */}
              <View style={styles.leafCounter} pointerEvents="none">
                <RNImage
                  source={require("../../assets/images/leaf_w.png")}
                  style={styles.leafIcon}
                />
                <Text style={styles.leafCount}>{plantedCells.size}</Text>
              </View>
            </View>
          </View>

          {/* Chart card — full width, outside innerWrapper */}
          <View style={styles.chartCard}>
            <GardenFlowersChart
              data={chartData}
              daysInMonth={daysInMonth}
              todayDay={isCurrentMonth ? now.getDate() : null}
            />
          </View>
        </ScrollView>
      </SafeAreaView>

      {toastMsg !== null && (
        <View style={styles.toast} pointerEvents="none">
          <Text style={styles.toastText}>{toastMsg}</Text>
        </View>
      )}

      {gardenData && (
        <InventorySheet
          visible={sheetVisible}
          day={selectedDay}
          gardenId={gardenData.id}
          month={viewMonth + 1}
          year={viewYear}
          onClose={() => setSheetVisible(false)}
          onPlantError={() => showToast("Something went wrong")}
        />
      )}
    </PageTransition>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: no errors. If you see errors about `Image` namespace collision (`expo-image` vs `react-native`), confirm the aliased import `import { Image as RNImage } from "react-native"` is used on border tile images.

- [ ] **Step 3: Commit**

```bash
git add app/(tabs)/garden.tsx
git commit -m "feat(garden): integrate real garden API + inventory plant flow"
```

---

### Task 5: Manual smoke test

- [ ] **Start the app**

Run: `npx expo start`

- [ ] **Verify garden loads real data**

Navigate to the Garden tab. Grid renders without errors. The leaf counter at bottom-right shows the actual count of planted flowers. Planted cells show the correct flower image.

- [ ] **Verify cell tap — empty cell**

Tap an empty cell in the current month. Inventory sheet animates up from the bottom. Handle bar and "Select a flower" title are visible.

- [ ] **Verify cell tap — planted cell**

Tap a cell that already has a flower. Toast "This flower cannot be moved" appears and disappears after 3 seconds. No sheet opens.

- [ ] **Verify planting a flower**

With at least one flower in inventory: tap empty cell → tap a flower card in the sheet → sheet closes, cell now shows the planted flower image, leaf counter increments.

- [ ] **Verify quantity badge**

In the sheet, each flower card shows the owned quantity in the green badge (top-right corner).

- [ ] **Verify empty inventory state**

If inventory is empty: open sheet → see "No flowers in inventory" text and "Go to Shop" button. Tapping "Go to Shop" closes the sheet and navigates to the Store tab.

- [ ] **Verify backdrop close**

Open the sheet and tap the dark backdrop. Sheet animates closed. No flower is planted.

- [ ] **Verify future month**

Navigate forward to a future month. Tap any cell. Nothing happens — no sheet, no toast.

- [ ] **Verify month navigation**

Switch months. Garden data reloads (React Query fetches new queryKey). Previous month's flowers display correctly.
