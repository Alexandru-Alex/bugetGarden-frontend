# Store Page Design

**Date:** 2026-04-18  
**Status:** Approved

## Overview

A flower shop page accessible from the nav menu (Store item in secondary nav). Users can browse flowers available for purchase using gold coins, and tap a flower to see details and a buy button.

## Files

- `app/store.tsx` — screen component
- `styles/store.styles.ts` — all styles
- Nav menu: update `SECONDARY_ITEMS` Store entry path from `""` to `"/store"`

## Page Structure

- **Background:** `LinearGradient` with colors `["#346739", "#79AE6F"]` (same as all other pages)
- **Nav:** `<NavMenu />` absolutely positioned on top
- **Header:** Titlu "Store" centrat, gold coins display în dreapta (coin icon + `account.goldCoins`) — same layout pattern as dashboard
- **Body:** `FlatList` with `numColumns={2}`, scrollable, padding 16, `columnWrapperStyle` gap 12 between columns, `ItemSeparatorComponent` gap 12

## Flower Data

Hardcoded array (easily replaceable with API call later):

```ts
const FLOWERS = [
  { id: "rose",      name: "Rose",      image: require("@/flowers/rose.svg"),      price: 120 },
  { id: "tulip",     name: "Tulip",     image: require("@/flowers/tulip.svg"),     price: 80  },
  { id: "lavender",  name: "Lavender",  image: require("@/flowers/lavender.svg"),  price: 60  },
  { id: "peony",     name: "Peony",     image: require("@/flowers/peony.svg"),     price: 150 },
  { id: "bluebell",  name: "Bluebell",  image: require("@/flowers/bluebell.svg"),  price: 50  },
  { id: "marigold",  name: "Marigold",  image: require("@/flowers/marigold.svg"),  price: 70  },
  { id: "daisy",     name: "Daisy",     image: require("@/flowers/daisy.svg"),     price: 40  },
];
```

## Flower Card

Each card occupies ~50% screen width (minus padding + gap). Layout:

- White card, `borderRadius: 16`, subtle shadow/elevation
- SVG flower image centered, 100×100
- Flower name — `Nunito_700Bold`, `fontSize: 15`, `color: #333`
- Price row: small coin icon + number — `color: #346739`, `Nunito_700Bold`
- Pressable with pressed opacity feedback

## Detail Modal

Triggered on card tap. Follows existing `Modal` pattern (backdrop + card).

- Backdrop: `absoluteFill` `Pressable` with `rgba(0,0,0,0.4)` — closes modal on tap
- Card: `width: "100%"`, `maxWidth: 400`, `borderRadius: 20`, centered on screen
- Content:
  - Flower SVG 140×140, centered
  - Flower name — `Nunito_700Bold`, `fontSize: 22`
  - Short description — same mockup text for all flowers for now: `"A beautiful flower that brightens any garden. Perfect for adding color and life to your collection."`
  - Buy button: full-width, green `#346739`, coin icon + price — closes modal on tap (mockup, no actual purchase logic)

## Account / Gold Coins

- `useQuery` with `ACCOUNT_QUERY_KEY` from `dashboard.tsx` to get `account.goldCoins`
- Displayed in header top-right: coin icon (yellow) + number

## Navigation

- Route: `/store`
- Accessible from nav menu → avatar dropdown → Store
- Update `SECONDARY_ITEMS` in `components/nav-menu.tsx`: `{ label: "Store", ..., path: "/store" }`
- Auth guard: same pattern as other pages — `getStoredToken()` in `useEffect`, redirect to `/landing` if null
