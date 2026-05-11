# Landing Page Redesign — BudgetGarden (Forest-style)

**Date:** 2026-05-11
**Status:** Approved

## Overview

Redesign `app/index.tsx` (the `/` web marketing page) to match the visual style and structure of forestapp.cc. Web-only — native users are redirected to `/landing` immediately.

## Reference

forestapp.cc — clean split hero, app store badges, alternating feature sections with phone mockups, nature aesthetic.

## Assets

- `assets/images/icon.jpg` — app icon (plant + coin, green bg)
- `F:/preview_2.png` → copy to `assets/images/preview_phone.png` — single phone screenshot (Welcome screen)
- `F:/preview_3.jpg` → copy to `assets/images/preview_garden.jpg` — isometric garden with flowers
- Google Play badge: standard SVG/PNG badge (sourced inline or from assets)
- App Store badge: standard SVG/PNG badge

## Page Structure

1. **Sticky nav** — app icon small + "BudgetGarden" wordmark left, "Open App →" button right
2. **Hero section** — full viewport, dark green bg, split left/right
3. **Intro section** — white bg, large centered headline + 3 icon pillars
4. **Garden section** — light green bg, preview_3 image + text
5. **Feature sections** — existing 3 features (Budget Score, Coins, Garden grid), cleaned up
6. **Final CTA section**
7. **Footer**

---

## Section Details

### 1. Sticky Nav

- Left: `icon.jpg` (32px rounded) + "BudgetGarden" text
- Right: "Open App →" button (outline white, blurred bg)
- Background: transparent → solid `#346739` on scroll (web `position: fixed`)
- Replaces current sticky "App →" button

### 2. Hero Section — Split Layout (Option A)

- Full viewport height, `#346739` background
- **Left column (50%):**
  - App icon `icon.jpg` — 72px, rounded-xl, subtle shadow
  - H1: "BudgetGarden" (large, Nunito Black, white)
  - Tagline: "Track your spending. Grow your garden."
  - Body: "BudgetGarden is an app that helps you build healthy money habits and turn financial discipline into something you can see — a beautiful, growing garden."
  - Google Play badge (SVG inline)
  - App Store badge (SVG inline)
- **Right column (50%):**
  - Phone frame (CSS mockup, dark border, rounded) with `preview_phone.png` inside as `<Image>`
  - Placeholder white screen if image not yet available
- Existing `FlowerPetals` + `GrassWave` decorative layer kept

### 3. Intro Section

- White background, `paddingVertical: 100`
- Centered headline: "The app that makes budgeting feel rewarding"
- Centered subtitle: "Stop dreading your finances. BudgetGarden turns every saving into a coin, every coin into a flower, and every flower into a garden that reflects who you are."
- 3 icon pills in a row:
  - 💰 "Track" — "Log income & expenses"
  - 🪙 "Earn" — "Get coins for saving"
  - 🌿 "Grow" — "Build your garden"

### 4. Garden Section

- Background: `#f0faf0` (light green)
- Layout: text left, `preview_garden.jpg` right (large, slightly rotated 2deg, shadow)
- H2: "Grow your own garden"
- Body: "Stay consistent with your budget and watch your garden come to life. Every saving adds a new flower to your world — a living, visual reminder of your financial progress."
- CTA button: "Start Growing →" (green, links to `/landing`)

### 5. Feature Sections (existing, cleaned up)

Three alternating sections, existing mockups kept but phone frame refined:
- Budget Score (text left, phone right, white bg)
- Earn Coins (phone left, text right, tinted bg)
- Grow Your Garden grid (text left, phone right, white bg)

### 6. Final CTA Section

- `#346739` background (dark green, not white like before)
- Headline: "Start your garden today" (white)
- Subtitle: "Track spending. Earn coins. Grow your garden." (light green)
- Button: white pill, green text

### 7. Footer

- Dark green `#346739`, minimal
- "© 2026 BudgetGarden"

---

## Phone Frame

CSS-only frame, no library:
- `width: 240px`, `borderRadius: 40px`, `backgroundColor: #111`
- 8px padding, notch bar at top
- `preview_phone.png` fills the inner screen via `<Image resizeMode="cover">`

---

## Files to Change

- `app/index.tsx` — full restructure; new sections added; `StickyAppBtn` → `StickyNav`
- `styles/index.styles.ts` — new styles for all new sections
- `assets/images/preview_phone.png` — copy from `F:/preview_2.png`
- `assets/images/preview_garden.jpg` — copy from `F:/preview_3.jpg`

## Files NOT Changed

- `app/landing.tsx` — untouched (auth screen)
- `components/flower-petals.tsx` — reused as-is
- `components/grass-wave.tsx` — reused as-is
- `components/arc-title.tsx` — removed from hero (replaced by text + icon)
