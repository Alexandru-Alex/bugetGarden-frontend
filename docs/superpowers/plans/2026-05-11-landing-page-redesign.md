# Landing Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `app/index.tsx` (the `/` web marketing page) to match forestapp.cc style — split hero with app icon + store badges, intro section, garden section with real screenshot, updated CTA.

**Architecture:** Pure React Native Web UI restructure. No new component files — everything stays in `app/index.tsx` + `styles/index.styles.ts`. Two preview images copied from `F:/` into assets. No logic changes, no API changes.

**Tech Stack:** React Native Web, Reanimated 4, Expo Router, Nunito fonts (`Nunito_700Bold` / `Nunito_800ExtraBold` / `Nunito_900Black`), existing `FlowerPetals` + `GrassWave` components.

---

### Task 1: Copy preview assets into project

**Files:**
- Create: `assets/images/preview_phone.png`
- Create: `assets/images/preview_garden.jpg`

- [ ] **Step 1: Copy the two preview images**

```powershell
Copy-Item "F:\preview_2.png" "D:\IdeaProjects\bugetGarden-front\assets\images\preview_phone.png"
Copy-Item "F:\preview_3.jpg" "D:\IdeaProjects\bugetGarden-front\assets\images\preview_garden.jpg"
```

- [ ] **Step 2: Verify files exist**

```powershell
ls D:\IdeaProjects\bugetGarden-front\assets\images\preview_phone.png
ls D:\IdeaProjects\bugetGarden-front\assets\images\preview_garden.jpg
```

Expected: both files listed, non-zero size.

- [ ] **Step 3: Commit**

```bash
git add assets/images/preview_phone.png assets/images/preview_garden.jpg
git commit -m "assets: add preview_phone and preview_garden images"
```

---

### Task 2: Replace `StickyAppBtn` with `StickyNav`

**Files:**
- Modify: `app/index.tsx` — replace `StickyAppBtn` component and its usage
- Modify: `styles/index.styles.ts` — add `stickyNav`, `navBrand`, `navIcon`, `navName`, `navBtn`, `navBtnText`; remove `stickyAppBtn`, `appBtnPressable`, `appBtnText`

- [ ] **Step 1: Add new styles to `styles/index.styles.ts`**

Replace the `stickyAppBtn`, `appBtnPressable`, `appBtnText` entries with:

```typescript
stickyNav: {
  position: "fixed" as any,
  top: 0,
  left: 0,
  right: 0,
  zIndex: 100,
  flexDirection: "row" as any,
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: 32,
  paddingVertical: 14,
  backgroundColor: "rgba(52, 103, 57, 0.88)",
  ...Platform.select({ web: { backdropFilter: "blur(12px)" } as any }),
},
navBrand: {
  flexDirection: "row" as any,
  alignItems: "center",
  gap: 10,
},
navIcon: {
  width: 32,
  height: 32,
  borderRadius: 8,
},
navName: {
  fontFamily: "Nunito_800ExtraBold",
  fontSize: 16,
  color: "#ffffff",
  letterSpacing: 0.3,
},
navBtn: {
  backgroundColor: "rgba(255,255,255,0.15)",
  borderWidth: 1.5,
  borderColor: "rgba(255,255,255,0.7)",
  borderRadius: 24,
  paddingVertical: 8,
  paddingHorizontal: 20,
  ...Platform.select({ web: { backdropFilter: "blur(8px)" } as any }),
},
navBtnText: {
  color: "#ffffff",
  fontFamily: "Nunito_800ExtraBold",
  fontSize: 14,
  letterSpacing: 0.4,
},
```

- [ ] **Step 2: Replace `StickyAppBtn` component in `app/index.tsx`**

Remove `StickyAppBtn` entirely and add at the top of the file (after `BG_IMAGE`):

```typescript
const APP_ICON = require("@/assets/images/icon.jpg");

function StickyNav({ onPress }: { onPress: () => void }) {
  return (
    <View style={styles.stickyNav}>
      <View style={styles.navBrand}>
        <Image source={APP_ICON} style={styles.navIcon} />
        <Text style={styles.navName}>BudgetGarden</Text>
      </View>
      <Pressable style={styles.navBtn} onPress={onPress}>
        <Text style={styles.navBtnText}>Open App →</Text>
      </Pressable>
    </View>
  );
}
```

- [ ] **Step 3: Replace `<StickyAppBtn onPress={goToApp} />` with `<StickyNav onPress={goToApp} />` in `MarketingPage`**

```typescript
// Before:
<StickyAppBtn onPress={goToApp} />
// After:
<StickyNav onPress={goToApp} />
```

- [ ] **Step 4: Verify in browser**

Run `npx expo start --web` and open `http://localhost:8081`. The sticky nav at the top should show the BudgetGarden icon + "BudgetGarden" text on the left, and "Open App →" on the right.

- [ ] **Step 5: Commit**

```bash
git add app/index.tsx styles/index.styles.ts
git commit -m "feat: replace StickyAppBtn with StickyNav (icon + name + button)"
```

---

### Task 3: Rebuild `HeroSection` — split layout

**Files:**
- Modify: `app/index.tsx` — rewrite `HeroSection`, add `StoreBadge`, add `PREVIEW_PHONE` require
- Modify: `styles/index.styles.ts` — add hero split + phone + store badge styles

- [ ] **Step 1: Add hero split + store badge styles to `styles/index.styles.ts`**

Keep existing `heroSection`, `heroBg`, `overlay`, `petalsLayer`. Add these new entries:

```typescript
heroContent: {
  flexDirection: "row" as any,
  width: "100%" as any,
  flex: 1,
  zIndex: 3,
},
heroLeft: {
  flex: 1,
  justifyContent: "center",
  paddingHorizontal: 60,
  paddingVertical: 80,
},
heroRight: {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: 60,
},
heroAppIcon: {
  width: 72,
  height: 72,
  borderRadius: 18,
  marginBottom: 20,
},
heroTitle: {
  fontFamily: "Nunito_900Black",
  fontSize: 52,
  color: "#ffffff",
  lineHeight: 58,
  marginBottom: 10,
},
heroTagline: {
  fontFamily: "Nunito_800ExtraBold",
  fontSize: 18,
  color: "rgba(255,255,255,0.9)",
  marginBottom: 14,
},
heroBody: {
  fontFamily: "Nunito_700Bold",
  fontSize: 15,
  color: "rgba(255,255,255,0.72)",
  lineHeight: 24,
  maxWidth: 400,
  marginBottom: 32,
},
storeBadgesRow: {
  flexDirection: "row" as any,
  gap: 12,
  flexWrap: "wrap" as any,
},
storeBadge: {
  backgroundColor: "#000000",
  borderRadius: 10,
  paddingVertical: 10,
  paddingHorizontal: 18,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.25)",
  minWidth: 148,
  alignItems: "center",
},
storeBadgeSmall: {
  color: "rgba(255,255,255,0.75)",
  fontSize: 9,
  fontFamily: "Nunito_700Bold",
  letterSpacing: 0.6,
  textTransform: "uppercase" as any,
},
storeBadgeBig: {
  color: "#ffffff",
  fontSize: 15,
  fontFamily: "Nunito_800ExtraBold",
  letterSpacing: 0.2,
},
heroPhoneWrap: {
  width: 260,
  backgroundColor: "#111111",
  borderRadius: 44,
  padding: 10,
  shadowColor: "#000000",
  shadowOffset: { width: 0, height: 24 },
  shadowOpacity: 0.45,
  shadowRadius: 40,
  elevation: 20,
},
heroPhoneNotch: {
  width: 70,
  height: 10,
  backgroundColor: "#222222",
  borderRadius: 8,
  alignSelf: "center",
  marginBottom: 6,
},
heroPhoneScreen: {
  borderRadius: 34,
  overflow: "hidden",
  height: 520,
  backgroundColor: "#ffffff",
},
heroPhoneImage: {
  width: "100%" as any,
  height: "100%" as any,
},
```

Also remove the old `content`, `taglineWrap`, `tagline`, `btnWrapper`, `ctaButton`, `ctaButtonPressed`, `ctaText`, `pulseRing` styles — they were only used by the old hero content.

- [ ] **Step 2: Add `StoreBadge` component and `PREVIEW_PHONE` constant in `app/index.tsx`**

Add after `APP_ICON` constant:

```typescript
const PREVIEW_PHONE = require("@/assets/images/preview_phone.png");

function StoreBadge({ label, store }: { label: string; store: string }) {
  return (
    <View style={styles.storeBadge}>
      <Text style={styles.storeBadgeSmall}>{label}</Text>
      <Text style={styles.storeBadgeBig}>{store}</Text>
    </View>
  );
}
```

- [ ] **Step 3: Rewrite `HeroSection` in `app/index.tsx`**

Replace the entire `HeroSection` function with:

```typescript
function HeroSection({ contentStyle, onGetStarted }: {
  contentStyle: any; onGetStarted: () => void;
}) {
  const time = useSharedValue(0);
  const { width } = useWindowDimensions();
  const compact = width < 860;

  return (
    <View style={styles.heroSection}>
      <View style={styles.heroBg}>
        <Image
          source={BG_IMAGE}
          style={{ width: "100%" as any, height: "100%" as any }}
          resizeMode="cover"
        />
        <GrassBoundary>
          <GrassWave time={time} />
        </GrassBoundary>
      </View>
      <View style={[StyleSheet.absoluteFill, styles.overlay]} />
      <View style={[StyleSheet.absoluteFill, styles.petalsLayer]} pointerEvents="none">
        <FlowerPetals />
      </View>
      <Animated.View
        style={[
          styles.heroContent,
          compact && { flexDirection: "column" as any, alignItems: "center" },
          contentStyle,
          Platform.select({ web: { userSelect: "none" } as any }),
        ]}
      >
        <View style={[styles.heroLeft, compact && { alignItems: "center", paddingHorizontal: 32 }]}>
          <Image source={APP_ICON} style={styles.heroAppIcon} />
          <Text style={[styles.heroTitle, compact && { textAlign: "center", fontSize: 38 }]}>
            BudgetGarden
          </Text>
          <Text style={[styles.heroTagline, compact && { textAlign: "center" }]}>
            Track your spending. Grow your garden.
          </Text>
          <Text style={[styles.heroBody, compact && { textAlign: "center" }]}>
            BudgetGarden is an app that helps you build healthy money habits and turn financial discipline into something you can see — a beautiful, growing garden.
          </Text>
          <View style={styles.storeBadgesRow}>
            <StoreBadge label="GET IT ON" store="Google Play" />
            <StoreBadge label="Download on the" store="App Store" />
          </View>
        </View>
        {!compact && (
          <View style={styles.heroRight}>
            <View style={styles.heroPhoneWrap}>
              <View style={styles.heroPhoneNotch} />
              <View style={styles.heroPhoneScreen}>
                <Image source={PREVIEW_PHONE} style={styles.heroPhoneImage} resizeMode="cover" />
              </View>
            </View>
          </View>
        )}
      </Animated.View>
    </View>
  );
}
```

- [ ] **Step 4: Update `HeroSection` call in `MarketingPage`**

The `HeroSection` no longer takes `btnStyle` or `pulseRingStyle`. Update the call and remove the unused shared values:

```typescript
// Remove these from MarketingPage:
const btnScale = useSharedValue(1);
const pulseRing = useSharedValue(0);
// and from the useEffect:
btnScale.value = withDelay(1200, withRepeat(withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }), -1, true));
pulseRing.value = withDelay(1400, withRepeat(withTiming(1, { duration: 1600, easing: Easing.out(Easing.quad) }), -1, false));
// and these animated styles:
const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));
const pulseRingStyle = useAnimatedStyle(() => ({
  transform: [{ scale: 1 + pulseRing.value * 0.55 }],
  opacity: 0.7 * (1 - pulseRing.value),
}));

// Update the JSX call:
<HeroSection contentStyle={contentStyle} onGetStarted={goToApp} />
```

- [ ] **Step 5: Add `useWindowDimensions` to the React Native import in `app/index.tsx`**

```typescript
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
```

- [ ] **Step 6: Remove unused imports**

Remove `ArcTitle` and `ThemedText` imports (no longer used in this file):

```typescript
// Remove:
import { ArcTitle } from "@/components/arc-title";
import { ThemedText } from "@/components/themed-text";
```

- [ ] **Step 7: Verify in browser**

Run app and open `/`. The hero should show: left side with icon, title "BudgetGarden", tagline, body, two black store badge buttons. Right side (desktop only) shows the phone with `preview_phone.png`.

- [ ] **Step 8: Commit**

```bash
git add app/index.tsx styles/index.styles.ts
git commit -m "feat: hero split layout with app icon, store badges, and phone mockup"
```

---

### Task 4: Add `IntroSection` with SVG illustrations

**Files:**
- Create: `assets/images/illustrations/` — 3 SVG files copied from `F:\Financial-Illustration-Pack-128634428\finance\svg\`
- Modify: `app/index.tsx` — add `IntroSection` component
- Modify: `styles/index.styles.ts` — add intro styles

- [ ] **Step 1: Copy the 3 SVG illustrations into the project**

```powershell
New-Item -ItemType Directory -Force -Path "D:\IdeaProjects\bugetGarden-front\assets\images\illustrations"
Copy-Item "F:\Financial-Illustration-Pack-128634428\finance\svg\Budget planning Illustration.svg" "D:\IdeaProjects\bugetGarden-front\assets\images\illustrations\illus_track.svg"
Copy-Item "F:\Financial-Illustration-Pack-128634428\finance\svg\Financial growth illustration.svg" "D:\IdeaProjects\bugetGarden-front\assets\images\illustrations\illus_earn.svg"
Copy-Item "F:\Financial-Illustration-Pack-128634428\finance\svg\Man Celebrating Financial Freedom Illustration.svg" "D:\IdeaProjects\bugetGarden-front\assets\images\illustrations\illus_grow.svg"
```

- [ ] **Step 2: Add intro styles to `styles/index.styles.ts`**

```typescript
introSection: {
  width: "100%" as any,
  backgroundColor: "#ffffff",
  paddingVertical: 100,
  paddingHorizontal: 60,
  alignItems: "center",
},
introTitle: {
  fontFamily: "Nunito_900Black",
  fontSize: 38,
  color: "#346739",
  textAlign: "center",
  maxWidth: 640,
  marginBottom: 18,
  lineHeight: 50,
},
introSub: {
  fontFamily: "Nunito_700Bold",
  fontSize: 17,
  color: "#666666",
  textAlign: "center",
  maxWidth: 560,
  lineHeight: 28,
  marginBottom: 60,
},
introPillsRow: {
  flexDirection: "row" as any,
  gap: 24,
  justifyContent: "center",
  flexWrap: "wrap" as any,
},
introPill: {
  alignItems: "center",
  backgroundColor: "#f8fdf8",
  borderRadius: 20,
  paddingVertical: 28,
  paddingHorizontal: 32,
  width: 220,
  gap: 8,
},
introPillImage: {
  width: 120,
  height: 120,
  marginBottom: 4,
},
introPillLabel: {
  fontFamily: "Nunito_800ExtraBold",
  fontSize: 15,
  color: "#346739",
},
introPillSub: {
  fontFamily: "Nunito_700Bold",
  fontSize: 13,
  color: "#79AE6F",
  textAlign: "center",
},
```

- [ ] **Step 3: Add `IntroSection` component to `app/index.tsx`**

Add the illustration requires after `PREVIEW_GARDEN`:

```typescript
const ILLUS_TRACK = require("@/assets/images/illustrations/illus_track.svg");
const ILLUS_EARN  = require("@/assets/images/illustrations/illus_earn.svg");
const ILLUS_GROW  = require("@/assets/images/illustrations/illus_grow.svg");
```

Add the `IntroSection` function after `StoreBadge`:

```typescript
function IntroSection() {
  const pills = [
    { img: ILLUS_TRACK, label: "Track", sub: "Log income & expenses" },
    { img: ILLUS_EARN,  label: "Earn",  sub: "Get coins for saving" },
    { img: ILLUS_GROW,  label: "Grow",  sub: "Build your garden" },
  ];
  return (
    <View style={styles.introSection}>
      <Text style={styles.introTitle}>The app that makes budgeting feel rewarding</Text>
      <Text style={styles.introSub}>
        Stop dreading your finances. BudgetGarden turns every saving into a coin, every coin into a flower, and every flower into a garden that reflects who you are.
      </Text>
      <View style={styles.introPillsRow}>
        {pills.map((p) => (
          <View key={p.label} style={styles.introPill}>
            <Image source={p.img} style={styles.introPillImage} resizeMode="contain" />
            <Text style={styles.introPillLabel}>{p.label}</Text>
            <Text style={styles.introPillSub}>{p.sub}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
```

- [ ] **Step 4: Insert `<IntroSection />` in `MarketingPage` scroll content**

In `MarketingPage` return, add it right after `<HeroSection ... />` and before the first `<FeatureSection`:

```typescript
<HeroSection contentStyle={contentStyle} onGetStarted={goToApp} />
<IntroSection />
<FeatureSection ... />
```

- [ ] **Step 5: Verify in browser**

Scroll past the hero — a white section should appear with large green title, subtitle, and 3 cards each showing an SVG illustration (budget planning, financial growth, celebrating freedom), label, and sub-text.

- [ ] **Step 6: Commit**

```bash
git add assets/images/illustrations/ app/index.tsx styles/index.styles.ts
git commit -m "feat: add intro section with SVG financial illustrations"
```

---

### Task 5: Add `GardenSection`

**Files:**
- Modify: `app/index.tsx` — add `GardenSection` component and `PREVIEW_GARDEN` constant
- Modify: `styles/index.styles.ts` — add garden section styles

- [ ] **Step 1: Add garden section styles to `styles/index.styles.ts`**

```typescript
gardenSection: {
  width: "100%" as any,
  backgroundColor: "#f0faf0",
  paddingVertical: 100,
  paddingHorizontal: 100,
},
gardenRow: {
  flexDirection: "row" as any,
  alignItems: "center",
  justifyContent: "center",
  gap: 60,
  maxWidth: 1040,
  alignSelf: "center",
  width: "100%" as any,
},
gardenTextCol: {
  flex: 1,
  maxWidth: 420,
},
gardenTitle: {
  fontFamily: "Nunito_900Black",
  fontSize: 36,
  color: "#346739",
  marginBottom: 16,
  lineHeight: 44,
},
gardenBody: {
  fontFamily: "Nunito_700Bold",
  fontSize: 16,
  color: "#555555",
  lineHeight: 26,
  marginBottom: 28,
},
gardenBtn: {
  backgroundColor: "#346739",
  paddingVertical: 13,
  paddingHorizontal: 28,
  borderRadius: 50,
  alignSelf: "flex-start",
  shadowColor: "#346739",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 10,
  elevation: 6,
},
gardenBtnText: {
  fontFamily: "Nunito_800ExtraBold",
  fontSize: 15,
  color: "#ffffff",
  letterSpacing: 0.3,
},
gardenImageCol: {
  flex: 1,
  maxWidth: 480,
  alignItems: "center",
},
gardenImage: {
  width: "100%" as any,
  aspectRatio: 1.15,
  borderRadius: 20,
  shadowColor: "#346739",
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 0.18,
  shadowRadius: 28,
},
```

- [ ] **Step 2: Add `PREVIEW_GARDEN` constant and `GardenSection` component to `app/index.tsx`**

Add after `PREVIEW_PHONE`:

```typescript
const PREVIEW_GARDEN = require("@/assets/images/preview_garden.jpg");

function GardenSection({ onPress }: { onPress: () => void }) {
  const { width } = useWindowDimensions();
  const compact = width < 860;
  return (
    <View style={styles.gardenSection}>
      <View style={[styles.gardenRow, compact && { flexDirection: "column" as any }]}>
        <View style={styles.gardenTextCol}>
          <Text style={styles.gardenTitle}>Grow your own garden</Text>
          <Text style={styles.gardenBody}>
            Stay consistent with your budget and watch your garden come to life. Every saving adds a new flower to your world — a living, visual reminder of your financial progress.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.gardenBtn, pressed && { opacity: 0.88 }]}
            onPress={onPress}
          >
            <Text style={styles.gardenBtnText}>Start Growing →</Text>
          </Pressable>
        </View>
        <View style={styles.gardenImageCol}>
          <Image source={PREVIEW_GARDEN} style={styles.gardenImage} resizeMode="cover" />
        </View>
      </View>
    </View>
  );
}
```

- [ ] **Step 3: Insert `<GardenSection />` in `MarketingPage` after `<IntroSection />`**

```typescript
<IntroSection />
<GardenSection onPress={goToApp} />
<FeatureSection ... />
```

- [ ] **Step 4: Verify in browser**

Scroll to the garden section — light green background, text on the left, the isometric garden image on the right with slight rounding, "Start Growing →" green button.

- [ ] **Step 5: Commit**

```bash
git add app/index.tsx styles/index.styles.ts
git commit -m "feat: add garden section with preview_garden image and CTA"
```

---

### Task 6: Update CTA section to dark green background

**Files:**
- Modify: `styles/index.styles.ts` — update `ctaSection`, `ctaSectionTitle`, `ctaSectionSub`, `ctaSectionBtn`, `ctaSectionBtnPressed`, `ctaSectionBtnText`

- [ ] **Step 1: Update CTA styles in `styles/index.styles.ts`**

```typescript
ctaSection: {
  width: "100%" as any,
  backgroundColor: "#346739",
  paddingVertical: 100,
  alignItems: "center",
  gap: 12,
},
ctaSectionTitle: {
  fontFamily: "Nunito_900Black",
  fontSize: 36,
  color: "#ffffff",
  textAlign: "center",
},
ctaSectionSub: {
  fontFamily: "Nunito_700Bold",
  fontSize: 16,
  color: "#9FCB98",
  textAlign: "center",
  marginBottom: 16,
},
ctaSectionBtn: {
  backgroundColor: "#ffffff",
  paddingVertical: 14,
  paddingHorizontal: 36,
  borderRadius: 50,
  shadowColor: "#000000",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.2,
  shadowRadius: 14,
  elevation: 8,
},
ctaSectionBtnPressed: {
  backgroundColor: "#f0f0f0",
  transform: [{ scale: 0.97 }],
},
ctaSectionBtnText: {
  fontFamily: "Nunito_800ExtraBold",
  fontSize: 17,
  color: "#346739",
  letterSpacing: 0.4,
},
```

- [ ] **Step 2: Verify in browser**

Scroll to the bottom CTA section — dark green background, white title "Start your garden today", light green subtitle, white pill button with green text.

- [ ] **Step 3: Commit**

```bash
git add styles/index.styles.ts
git commit -m "feat: CTA section dark green background with inverted white button"
```

---

### Task 7: Final visual pass — verify all sections

- [ ] **Step 1: Run dev server**

```powershell
npx expo start --web
```

- [ ] **Step 2: Check desktop layout (browser width > 860px)**

Scroll through full page and verify all 9 sections:
1. Sticky nav: icon + "BudgetGarden" left, "Open App →" right, translucent green bg
2. Hero: icon, "BudgetGarden" H1, tagline, body, two black store badge buttons (left); phone with `preview_phone.png` (right)
3. Intro: white bg, large green title, subtitle, 3 pills (💰 🪙 🌿)
4. Garden: light green bg (#f0faf0), text left, `preview_garden.jpg` right, "Start Growing →" button
5. Budget Score feature section (text left, phone right, white bg)
6. Earn Coins feature section (phone left, text right, tinted bg)
7. Grow Your Garden feature section (text left, phone right, white bg)
8. CTA: dark green bg, white title, light green subtitle, white button with green text
9. Footer: dark green, "2026 Money Garden"

- [ ] **Step 3: Check compact layout (resize browser to < 860px)**

Verify:
1. Hero: stacked, centered — only left column content (no phone on narrow)
2. Garden section: text above, image below
3. No horizontal overflow on any section

- [ ] **Step 4: Commit any remaining fixes**

```bash
git add app/index.tsx styles/index.styles.ts
git commit -m "fix: landing page visual pass adjustments"
```
