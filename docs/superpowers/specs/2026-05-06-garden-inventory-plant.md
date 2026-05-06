# Spec: Garden Inventory & Plant Flow

**Date:** 2026-05-06

## Overview

When a user taps an empty garden cell, a bottom sheet slides up showing their flower inventory. Tapping a flower in the sheet plants it on that day (irreversible). Tapping an already-planted cell shows a toast. If inventory is empty, the sheet shows an empty state with a "Go to Shop" link.

---

## API Integration

Replace all mock data in `garden.tsx` with real API calls via `lib/api.ts`.

### GET /garden?month=X&year=Y
Returns `GardenDto`:
```ts
interface GardenDto {
  id: string;           // UUID — used in plant endpoint
  month: number;
  year: number;
  cells: GardenCellDto[];
}

interface GardenCellDto {
  day: number;
  planted: boolean;
  plantedAt: string | null;
  flower: PlantedFlowerDto | null;
}

interface PlantedFlowerDto {
  name: string;
  imageUrl: string;     // filename e.g. "rose_v2.png"
  rarity: string;
}
```

Fetched with `useQuery(["garden", month, year])`. Refetched on month navigation. Garden state is derived from `cells` array — no local `flowers` Map.

### GET /inventory
Returns `InventoryItemDto[]`:
```ts
interface InventoryItemDto {
  inventoryId: string;
  shopItemId: string;
  name: string;
  imageUrl: string;     // filename e.g. "rose_v2.png"
  rarity: string;
  quantity: number;
}
```

Fetched with `useQuery(["inventory"])`, `staleTime: Infinity`. Lazy — query enabled only after first sheet open. Invalidated after a successful plant.

### POST /garden/{gardenId}/cells/{day}/plant
Body: `{ shopItemId: string }`. Returns 204.

Called on flower tap in sheet. On success: close sheet, `invalidateQueries(["garden", month, year])` and `invalidateQueries(["inventory"])`.

---

## Image Mapping

New file `lib/flower-images.ts`. `require()` must be static at bundle time.

```ts
// lib/flower-images.ts
import { ImageSourcePropType } from "react-native";

const FLOWER_IMAGES: Record<string, ImageSourcePropType> = {
  "rose_v2.png":    require("../flowers/rose_v2.png"),
  "rose_v3.png":    require("../flowers/rose_v3.png"),
  "Tulip.png":      require("../flowers/Tulip.png"),
  "Lavender.png":   require("../flowers/Lavender.png"),
  "peony.png":      require("../flowers/peony.png"),
  "bluebell_v3.png":require("../flowers/bluebell_v3.png"),
  "marigold.png":   require("../flowers/marigold.png"),
  "daisy.png":      require("../flowers/daisy.png"),
  "Cosmos.png":     require("../flowers/Cosmos.png"),
  "hibiscus.png":   require("../flowers/hibiscus.png"),
  "Poppy_v2.png":   require("../flowers/Poppy_v2.png"),
  "Daffodil.png":   require("../flowers/Daffodil.png"),
};

export function flowerImage(imageUrl: string): ImageSourcePropType {
  return FLOWER_IMAGES[imageUrl] ?? FLOWER_IMAGES["daisy.png"];
}
```

Used in both `InventorySheet` and garden grid cells.

---

## Components

### `components/inventory-sheet.tsx`

Props:
```ts
interface Props {
  visible: boolean;
  day: number | null;
  gardenId: string;
  month: number;
  year: number;
  onClose: () => void;
}
```

Structure:
- Backdrop: `Pressable` with `StyleSheet.absoluteFill`, `backgroundColor: rgba(0,0,0,0.4)`, press → `onClose`. Only rendered when `visible`.
- Sheet: `Animated.View` `position: absolute`, `bottom: 0`, `left: 0`, `right: 0`. `translateY` animated with `useSharedValue` — `0` when open, `sheetHeight` when closed.
- Handle bar: 36×4 rounded pill centered at top of sheet.
- Title: "Select a flower" (Nunito_800ExtraBold).
- Content: `ScrollView` horizontal with `InventoryItemCard` per item.
- Empty state: centered text "No flowers in inventory" + `Pressable` button "Go to Shop" → `router.push("/store")` + `onClose`.

Animation: `withTiming(0, { duration: 280 })` on open, `withTiming(sheetHeight, { duration: 220 })` on close (close first, then set `visible = false` via `onAnimationEnd`).

### `InventoryItemCard`

Internal to `inventory-sheet.tsx`:
- 80×80 container, white card with borderRadius 12, shadow.
- `Image` 56×56 `resizeMode="contain"` from `flowerImage(item.imageUrl)`.
- Quantity badge: absolute top-right, circle 20×20, `backgroundColor: "#346739"`, white text quantity.
- Press → calls `POST /garden/{gardenId}/cells/{day}/plant` with `shopItemId`. Disabled while mutation is in-flight.

### Updated `app/(tabs)/garden.tsx`

- Remove `MOCK_FLOWERS`, `flowers` state, `toggleFlower`.
- Add `useQuery(["garden", viewMonth, viewYear])` for garden data.
- Add `useState<number | null>(null)` for `selectedDay`.
- Add `useState<boolean>(false)` for `sheetVisible`.
- Cell tap logic:
  - If `isFutureMonth`: no-op.
  - If `cell.planted`: show toast "This flower cannot be moved".
  - Else: `setSelectedDay(day)`, `setSheetVisible(true)`.
- Render `InventorySheet` at root level (outside ScrollView) with `selectedDay`, `gardenId` from query data.
- Render flowers on cells using `flowerImage(cell.flower.imageUrl)` via a plain `Image` (replacing `RoseFlower` hardcoded).

---

## Toast

Reuse existing pattern (position absolute, top 120, 3s timeout). Two messages:
- `"This flower cannot be moved"` — on planted cell tap.
- `"Something went wrong"` — on plant mutation error.

---

## File Changes

| File | Action |
|------|--------|
| `lib/flower-images.ts` | Create |
| `components/inventory-sheet.tsx` | Create |
| `app/(tabs)/garden.tsx` | Update — API integration + sheet wiring |
| `styles/tabs/garden.styles.ts` | Update — add toast style if missing |
