# Achievements Badge Images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace emoji+gradient circles in the Achievements screen with the actual badge PNG images returned by the API.

**Architecture:** Add `badge` to the DTO, build a static require map for all 9 badge assets, swap the badge section of `AchievementRow` to render an `Image` (unlocked = full opacity; locked = grey overlay + lock icon on web true greyscale via CSS filter).

**Tech Stack:** React Native, Expo, TypeScript

---

## File Map

| File | Action |
|------|--------|
| `lib/quests-api.ts` | Add `badge: string` to `AchievementDto` |
| `styles/tabs/achievements.styles.ts` | Add `badgeImage`, `badgeImageWrapper`, `badgeGreyOverlay`; remove `badgeEmoji`, `badgeGradient`, `badgeGradientLocked` |
| `app/(tabs)/achievements.tsx` | Add `BADGE_IMAGES` map; rewrite badge section in `AchievementRow`; remove unused `LinearGradient` import |

---

### Task 1: Add `badge` field to `AchievementDto`

**Files:**
- Modify: `lib/quests-api.ts`

- [ ] **Step 1: Add the field**

Open `lib/quests-api.ts`. The `AchievementDto` interface currently looks like:

```ts
export interface AchievementDto {
  id: string;
  title: string;
  currentCount: number;
  targetCount: number;
  unlocked: boolean;
  coinReward: number;
  difficulty: "easy" | "medium" | "hard";
}
```

Change it to:

```ts
export interface AchievementDto {
  id: string;
  title: string;
  badge: string;
  currentCount: number;
  targetCount: number;
  unlocked: boolean;
  coinReward: number;
  difficulty: "easy" | "medium" | "hard";
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors related to `AchievementDto`

- [ ] **Step 3: Commit**

```bash
git add lib/quests-api.ts
git commit -m "feat(achievements): add badge field to AchievementDto"
```

---

### Task 2: Update styles

**Files:**
- Modify: `styles/tabs/achievements.styles.ts`

- [ ] **Step 1: Replace badge-related styles**

In `styles/tabs/achievements.styles.ts`, find and remove the three old styles (`badgeEmoji`, `badgeGradient`, `badgeGradientLocked`) and add three new ones.

Remove these entries from the `StyleSheet.create({...})` call:

```ts
  badgeGradient: {
    flex: 1,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeGradientLocked: {
    backgroundColor: "#E8E8E8",
    position: "relative",
  },
  badgeEmoji: {
    fontSize: 26,
    lineHeight: 30,
  },
```

Add these in their place (inside the same `StyleSheet.create` block, under the `// ── Badge ring + gradient` comment):

```ts
  badgeImageWrapper: {
    flex: 1,
    borderRadius: 26,
    overflow: "hidden",
  },
  badgeImage: {
    width: "100%",
    height: "100%",
    borderRadius: 26,
  },
  badgeGreyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(180,180,180,0.7)",
  },
```

The `lockIcon` style already exists — leave it as-is.

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add styles/tabs/achievements.styles.ts
git commit -m "feat(achievements): swap badge styles — image wrapper replaces emoji/gradient"
```

---

### Task 3: Update AchievementRow to render badge images

**Files:**
- Modify: `app/(tabs)/achievements.tsx`

- [ ] **Step 1: Add the BADGE_IMAGES require map**

At the top of `app/(tabs)/achievements.tsx`, after the existing imports, add:

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

- [ ] **Step 2: Replace the badge section inside AchievementRow**

In `AchievementRow`, find the `{/* Badge */}` block:

```tsx
      {/* Badge */}
      <View style={[styles.badgeRing, a.unlocked && { borderColor: cfg.ring }]}>
        {a.unlocked ? (
          <LinearGradient
            colors={cfg.gradient}
            start={{ x: 0.15, y: 0 }}
            end={{ x: 0.85, y: 1 }}
            style={styles.badgeGradient}
          >
            <Text style={styles.badgeEmoji}>{cfg.emoji}</Text>
          </LinearGradient>
        ) : (
          <View style={[styles.badgeGradient, styles.badgeGradientLocked]}>
            <Text style={[styles.badgeEmoji, { opacity: 0.28 }]}>{cfg.emoji}</Text>
            <Text style={styles.lockIcon}>🔒</Text>
          </View>
        )}
      </View>
```

Replace it with:

```tsx
      {/* Badge */}
      <View style={[styles.badgeRing, a.unlocked && { borderColor: cfg.ring }]}>
        {a.unlocked ? (
          <Image
            source={BADGE_IMAGES[a.badge] ?? BADGE_IMAGES["badge"]}
            style={styles.badgeImage}
          />
        ) : (
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
        )}
      </View>
```

- [ ] **Step 3: Add Image to imports and remove LinearGradient**

At the top of `app/(tabs)/achievements.tsx`, the React Native import line currently is:

```ts
import { ActivityIndicator, Platform, ScrollView, Text, View } from "react-native";
```

Change it to:

```ts
import { ActivityIndicator, Image, Platform, ScrollView, Text, View } from "react-native";
```

Remove the `LinearGradient` import line:

```ts
import { LinearGradient } from "expo-linear-gradient";
```

(The header `LinearGradient` in the JSX above `ScrollView` still uses it — check: if it does, keep the import. If the only usage was inside `AchievementRow`, remove it.)

> **Note:** The page header uses `LinearGradient` for the green gradient background. Keep the import — only the `AchievementRow` internal usage was removed.

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 5: Verify the app renders**

Start the dev server: `npx expo start`
Open the Achievements tab. Confirm:
- Unlocked achievements show the badge image at full opacity with a coloured ring
- Locked achievements show the badge image under a grey wash with a 🔒 icon in the corner
- On web: locked badges appear greyscale (CSS filter)
- No TypeScript or console errors

- [ ] **Step 6: Commit**

```bash
git add app/(tabs)/achievements.tsx
git commit -m "feat(achievements): render badge PNG images — greyscale+lock for locked"
```
