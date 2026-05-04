# Achievements — Badge Images Design

**Date:** 2026-05-04

## Goal

Replace the current emoji+gradient circle badge in the Achievements screen with the actual badge image returned by the API (`assets/badges/badge_X.png`). Locked achievements show the badge in greyscale (web: CSS filter; native: grey overlay) with a lock icon overlay.

## API Contract

The `/achievements` endpoint already returns a `badge` field (e.g. `"badge_4"`), but it is missing from the `AchievementDto` interface.

```ts
// lib/quests-api.ts — add to AchievementDto
badge: string; // e.g. "badge", "badge_1" … "badge_8"
```

## Badge Image Map

A static require map in `achievements.tsx` covering all 9 badge files:

```ts
const BADGE_IMAGES: Record<string, ReturnType<typeof require>> = {
  badge:   require("@/assets/badges/badge.png"),
  badge_1: require("@/assets/badges/badge_1.png"),
  badge_2: require("@/assets/badges/badge_2.png"),
  badge_3: require("@/assets/badges/badge_3.png"),
  badge_4: require("@/assets/badges/badge_4.png"),
  badge_5: require("@/assets/badges/badge_5.png"),
  badge_6: require("@/assets/badges/badge_6.png"),
  badge_7: require("@/assets/badges/badge_7.png"),
  badge_8: require("@/assets/badges/badge_8.png"),
};
```

Fallback: if `a.badge` is not in the map, use `BADGE_IMAGES["badge"]`.

## Badge Display — AchievementRow

Replace the emoji+gradient/locked blocks inside `badgeRing` with:

### Unlocked
```tsx
<Image
  source={BADGE_IMAGES[a.badge] ?? BADGE_IMAGES["badge"]}
  style={styles.badgeImage}
/>
```
Ring border color stays difficulty-based (`cfg.ring`).

### Locked
```tsx
<View style={styles.badgeImageWrapper}>
  <Image
    source={BADGE_IMAGES[a.badge] ?? BADGE_IMAGES["badge"]}
    style={[
      styles.badgeImage,
      Platform.select({ web: { filter: "grayscale(100%)" } as any }),
    ]}
  />
  <View style={styles.badgeGreyOverlay} />
  <Text style={styles.lockIcon}>🔒</Text>
</View>
```
Ring border color stays grey (`#DEDEDE`).

## Styles (achievements.styles.ts)

**Add:**
- `badgeImage`: `{ width: "100%", height: "100%", borderRadius: 26 }`
- `badgeImageWrapper`: `{ flex: 1, borderRadius: 26, overflow: "hidden", position: "relative" }`
- `badgeGreyOverlay`: `{ ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(180,180,180,0.7)", borderRadius: 26 }`

**Remove (no longer used):**
- `badgeEmoji`
- `badgeGradient`
- `badgeGradientLocked`

The `LinearGradient` import in `achievements.tsx` can also be removed if no longer used elsewhere in the file.

## Files Changed

| File | Change |
|------|--------|
| `lib/quests-api.ts` | Add `badge: string` to `AchievementDto` |
| `app/(tabs)/achievements.tsx` | Add BADGE_IMAGES map; update `AchievementRow` badge section |
| `styles/tabs/achievements.styles.ts` | Add new styles, remove unused ones |
