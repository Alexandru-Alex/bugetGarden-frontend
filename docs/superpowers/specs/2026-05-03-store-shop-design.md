# Store / Shop Page Design

**Date:** 2026-05-03
**Route:** `/store` → `app/(tabs)/store.tsx`

---

## Overview

A shop page where users browse and buy flowers using their gold coins. MVP with mock purchase flow — no backend API yet.

---

## Files

| File | Purpose |
|------|---------|
| `app/(tabs)/store.tsx` | Screen component |
| `styles/tabs/store.styles.ts` | All styles |

---

## Page Structure

```
StoreScreen
├── NavMenu                          (existing component)
├── LinearGradient header (#2A4A2E → #346739)
│   ├── "Shop the garden" (title, Nunito_900Black)
│   ├── "Fresh seasonal blooms and rare hybrids." (subtitle)
│   └── CoinBadge — goldCoins from useQuery(["account"])
├── ScrollView (maxWidth 900, centered on web)
│   ├── FeatureBanner
│   ├── SearchBar
│   ├── Section header "Popular this week"
│   └── Flower grid — 2 col mobile, 4 col web (width >= 600)
└── BuyModal (shown on flower card tap)
    ├── Flower image + name + price in coins
    ├── "Cumpără" button → mock toast + close
    └── "Anulare" button → close
```

---

## Auth Guard

Same pattern as `achievements.tsx`:
- `useState<string | null | undefined>(undefined)` for token
- `useEffect` calls `getStoredToken().then(setToken)`
- Returns `null` while `undefined`, `<Redirect href="/landing" />` if `null`

---

## Coin Balance

Read from the existing `["account"]` React Query cache (same as dashboard). No mutation — goldCoins display only. No deduction on mock purchase.

---

## Feature Banner

- Dark green gradient background (`#2A4A2E` → `#346739`)
- Left column: sparkle kicker "Spring", headline "Grow a brighter garden", subtitle "Members save up to 30% on the Spring collection.", CTA button "Shop drop"
- Right column: peony image in a circular container
- Static — CTA button does nothing for now

---

## Search Bar

- White pill input with search icon (Ionicons `search-outline`)
- Controlled by local `useState<string>("")`
- Filters the flower grid live by name (case-insensitive)
- `outlineStyle: "none"` on web per existing pattern

---

## Flower Grid

- Responsive columns: `useWindowDimensions().width >= 600 ? 4 : 2`
- Rendered as a `View` with `flexDirection: "row"`, `flexWrap: "wrap"` (not FlatList — avoids nested scroll issues inside ScrollView)
- Each card: green card body, circular image, flower name, price row with coin icon

### Card tap
Tapping a card sets `selectedFlower` state → opens `BuyModal`

---

## Flower Catalog (mock, defined in file)

| # | Name | Price | Tag | Image |
|---|------|-------|-----|-------|
| 1 | Rose | 120 | new | `flowers/rose_v2.png` |
| 2 | Tulip | 80 | — | `flowers/Tulip.png` |
| 3 | Lavender | 60 | — | `flowers/Lavender.png` |
| 4 | Peony | 150 | rare | `flowers/peony.png` |
| 5 | Bluebell | 50 | — | `flowers/bluebell_v3.png` |
| 6 | Marigold | 70 | — | `flowers/marigold.png` |
| 7 | Daisy | 40 | sale | `flowers/daisy.png` |
| 8 | Cosmos | 95 | new | `flowers/Cosmos.png` |
| 9 | Hibiscus | 180 | legendary | `flowers/hibiscus.png` |
| 10 | Poppy | 75 | — | `flowers/Poppy_v2.png` |
| 11 | Iris | 85 | — | `flowers/bluebell_v3.png` (fallback) |
| 12 | Lily | 110 | — | `flowers/daisy.png` (fallback) |

### Tags
| Tag | Badge color | Text color |
|-----|------------|------------|
| new | `#f2c94c` (gold) | `#5a3c0a` |
| rare | `#fff0c8` | `#8a6310` |
| legendary | `#1f4a25` | `#f2c94c` |
| sale | `#d17a4a` | `#ffffff` |

---

## Buy Modal

- Follows existing modal width pattern: KAV with `width: "100%", paddingHorizontal: 20` + card with `width: "100%", maxWidth: 400`
- Backdrop: `absoluteFill Pressable` with `onClick: e.stopPropagation()` on card (web pattern)
- Content: flower image (large, circular), name, coin price
- "Cumpără" button: green, triggers inline toast (`position: absolute, top: 120`) that disappears after 3s — per existing toast pattern (Alert.alert doesn't work)
- "Anulare" button: closes modal

---

## Colors

Consistent with existing palette:
- `#1f4a25` dark green
- `#346739` medium green
- `#79AE6F` light green
- `#9FCB98` pale green
- `#f2c94c` gold (coins)
- `#c99a2a` dark gold
- `#d17a4a` warm orange (sale tag)
- `#F5F8F5` page background

---

## Out of Scope (MVP)

- Real purchase API
- Cart / checkout flow
- Category chip filters
- "Growing now" section
- Pagination
