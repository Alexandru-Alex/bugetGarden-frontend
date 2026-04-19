# Store Screen Redesign

**Date:** 2026-04-19  
**File:** `app/store.tsx` + `styles/store.styles.ts`

## Context

The current store screen has a plain white/light gradient background with a basic 2-column grid of flower cards. It looks empty and has no visual identity. This spec describes the redesign.

## Design Decisions

### Atmosphere — Light Meadow
- Background: `linear-gradient(160deg, #e8f5e9, #f1f8e9)` — green pastel
- White cards on green background (intentionally different from the dark mode used elsewhere in the app — the shop is a special, cheerful space)

### Page Structure — Decorative Banner + Centered Grid

**Banner (top):**
- `linear-gradient(135deg, #346739, #4a8c50)` background
- Decorative emoji overlays in corners (`🌿`, `🌸`, `🌼`, `🌷`) at low opacity
- Title: "🌸 Garden Shop"
- Subtitle: "Cumpără flori pentru grădina ta"
- Coin balance badge: dark pill with `🪙 X monede` in `#FFE566`
- SVG wave at the bottom of the banner transitioning into the background

**Grid:**
- Cards are fixed width (not `flex: 1`) — `~124px` wide
- Centered via `flexWrap: wrap` + `justifyContent: center`
- 2 cards per row naturally on mobile, no forced `numColumns`

### Card Design — 3 states

**Normal (can buy):**
- White card, `borderRadius: 16`
- Green top strip (`linear-gradient(135deg, #81c784, #4CAF50)`) — `height: 54`
- Flower image in circle (`72×72`) floating over the strip with `marginBottom: -27`, white border, green shadow
- Flower name in dark green
- Price badge: `#FFE566` pill with `🪙 X` in dark amber
- Colored shadow: `rgba(76,175,80,0.2)`
- Decorative `🌿` emoji in bottom-left corner at `opacity: 0.07`

**Unlocked (bought at least once):**
- Everything from Normal +
- `outline: 2.5px solid #4CAF50`
- Yellow badge (`#FFE566` circle) top-right corner with `🌱` emoji
- Price replaced by `🌱 Unlocked` tag in green

**Locked (cannot afford — not yet purchased):**
- Grey top strip (`linear-gradient(135deg, #ccc, #bbb)`)
- Image: `grayscale(1) brightness(0.82)` filter
- Lock overlay on image circle: `rgba(0,0,0,0.36)` + `🔒` emoji centered
- Price badge: grey (`#f0f0f0` / `#bbb` text)
- Card shadow is minimal (no colored glow)
- Tapping opens the locked modal (not the buy modal)

### Modals

**Buy modal (Normal + Unlocked cards):**
- Bottom sheet, slides up from bottom (`translateY` animation)
- Banner: same green gradient as page header, with `🌿` and `🌸` decorations
- Flower image (104×104) floating out of banner with white border + shadow
- Flower name (26px bold)
- If unlocked: small green tag "🌱 Unlocked — poți primi din quests"
- Description text (italic, grey)
- Full-width yellow CTA button: `🪙 X — Cumpără` or `🪙 X — Cumpără din nou`

**Locked modal (Locked cards):**
- Same bottom sheet structure
- Banner is grey gradient (`#9e9e9e → #757575`)
- Image has `grayscale` + lock overlay (same as card)
- Name in grey
- Description in lighter grey
- Info box: "🔒 Cum deblochezi" — shows needed coins and how many more are required (`price - currentBalance`)
- CTA button: disabled grey — "🔒 Monede insuficiente"

## Coin Balance

The coin balance shown in the banner comes from `account?.goldCoins` (existing `useQuery` hook). The locked/unlocked logic compares `account.goldCoins >= flower.price` for affordability and `ownedFlowerIds.includes(flower.id)` for unlocked state.

> **Open question:** The backend needs to return which flowers the user has previously purchased. A new field `ownedFlowerIds: string[]` on `AccountDto` is assumed, or a separate endpoint.

## Color Reference

| Usage | Value |
|---|---|
| Page background | `linear-gradient(160deg, #e8f5e9, #f1f8e9)` |
| Banner | `linear-gradient(135deg, #346739, #4a8c50)` |
| Card strip | `linear-gradient(135deg, #81c784, #4CAF50)` |
| Card shadow | `rgba(76,175,80,0.2)` |
| Price badge | `#FFE566` bg, `#7a5200` text |
| Unlocked badge | `#FFE566` bg, `🌱` emoji |
| Locked strip | `linear-gradient(135deg, #ccc, #bbb)` |
| Coin text | `#FFE566` |
| Buy button | `linear-gradient(135deg, #FFE566, #f5d020)` |

## Files to Change

- `app/store.tsx` — screen component (layout, card components, modal components)
- `styles/store.styles.ts` — all styles (full rewrite)
- `app/(tabs)/dashboard.tsx` or `lib/api.ts` — add `ownedFlowerIds` to `AccountDto` if not present
