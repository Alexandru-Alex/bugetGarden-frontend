# Spec: Store Real API Integration

**Date:** 2026-05-06

## Overview

Replace the hardcoded `CATALOG` in `app/store.tsx` with real data from `GET /shop`. Wire the buy flow to `POST /shop/{itemId}/buy`. Locked items (`isUnlocked: false`) are shown greyed with a lock icon and cannot be purchased.

---

## API

### GET /shop
Returns `ShopItemDto[]`:
```ts
interface ShopItemDto {
  id: string;
  name: string;
  description: string;
  imageUrl: string;          // filename e.g. "rose_v2.png" — use flowerImage()
  price: number;
  rarity: string;            // e.g. "COMMON", "RARE", "LEGENDARY"
  unlockActionType: string;
  unlockTargetCount: number;
  userProgress: number;
  isUnlocked: boolean;
  ownedQuantity: number;
}
```

Fetched with `useQuery(["shop"])`, `staleTime: Infinity`, `enabled: !!token`.

### POST /shop/{itemId}/buy
Uses `ShopItemDto.id` as `itemId`. Returns 204.

On success:
- `invalidateQueries(["shop"])` — refreshes `ownedQuantity` and any state changes
- `invalidateQueries(["account"])` — refreshes `goldCoins` in the coin widget
- Close `BuyModal`
- Show toast "Flower purchased! 🌸"

On error:
- Show toast with error message from API response (e.g. "Insufficient coins")
- Keep modal open

---

## Component Changes

All changes are in `app/store.tsx`. No new files.

### Remove
- `type FlowerTag`, `interface Flower`, `TAG_STYLE`, `CATALOG` — all deleted
- `owned={0}` hardcoded in `ProgressCard`

### Add
```ts
interface ShopItemDto {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  rarity: string;
  unlockActionType: string;
  unlockTargetCount: number;
  userProgress: number;
  isUnlocked: boolean;
  ownedQuantity: number;
}
```

### Rarity → Tag style mapping

Replace `TAG_STYLE: Record<FlowerTag, ...>` with a record keyed by rarity strings returned by the backend. Fallback: no tag rendered if `rarity` not in map.

```ts
const RARITY_STYLE: Record<string, { bg: string; text: string }> = {
  RARE:      { bg: "#fff0c8", text: "#8a6310" },
  LEGENDARY: { bg: "#1f4a25", text: "#f2c94c" },
};
// COMMON → no tag rendered
```

### FlowerCard

Props: `flower: ShopItemDto` (renamed from `Flower`).

- Image: `flowerImage(flower.imageUrl)` from `lib/flower-images.ts`
- Tag: `RARITY_STYLE[flower.rarity]` — render badge only if entry exists
- Locked state (`!flower.isUnlocked`):
  - `opacity: 0.5` on the card
  - `Ionicons name="lock-closed"` overlay centered on the image area
  - `onPress` disabled (no modal opens)
- Hover scale animation unchanged

### BuyModal

Props: `flower: ShopItemDto`, `onBuy: () => void`, `onClose: () => void`, `isPending: boolean`.

- Display: image via `flowerImage(flower.imageUrl)`, name, price — unchanged
- Buy button: calls `onBuy()` prop; disabled when `isPending`; shows `ActivityIndicator` instead of text when `isPending`
- Mutation lives in `StoreScreen` via `useMutation`:
  - `mutationFn`: `POST /shop/${selectedFlower.id}/buy`
  - `onSuccess`: invalidate `["shop"]` + `["account"]`, close modal, toast "Flower purchased! 🌸"
  - `onError`: close modal, toast with error message from API

### ProgressCard

```ts
const owned = shopData?.filter(i => i.ownedQuantity > 0).length ?? 0;
const total = shopData?.length ?? 0;
```

Passed to `<ProgressCard owned={owned} total={total} />` from `StoreScreen`.

### Search

Filter on `item.name.toLowerCase()` — same logic, now on real data.

---

## File Changes

| File | Action |
|------|--------|
| `app/store.tsx` | Update — remove mock, add ShopItemDto, wire API |
