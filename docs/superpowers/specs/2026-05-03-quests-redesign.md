# Quests Page Redesign — 2026-05-03

## Goal

Redesign the Quests screen to match a reference design (Forest-app style) while staying true to the MoneyGarden green palette and Nunito typography. The overall layout switches from a two-tone (gradient header + white card) structure to a full-screen gradient with floating white cards.

## Decisions Made

- Daily/Monthly tabs: **kept**
- Progress stepper (3-step): **removed** — no supporting data
- "Learn more" per quest: **removed** — no description field in TaskDto
- Rewards row (coins + score): **kept** on each card

---

## Layout

### Background
Full-screen `LinearGradient` from `#2A4A2E` → `#346739` → `#79AE6F` (top to bottom), replacing the current two-tone structure. The gradient fills the entire screen including behind the NavMenu and SafeAreaView.

### Root structure
```
<PageTransition> (flex:1, no backgroundColor)
  <NavMenu />
  <LinearGradient colors={["#2A4A2E","#346739","#79AE6F"]} style={flex:1}>
    <SafeAreaView edges={["top"]} style={flex:1}>
      <HeaderSection />
      <TabToggle />
      <ScrollView>
        <SummaryCard />
        <QuestCards />
        <BonusCard />
      </ScrollView>
    </SafeAreaView>
  </LinearGradient>
</PageTransition>
```

---

## Components

### HeaderSection
- Title: "Quests" — `Nunito_900Black`, fontSize 32, color `#FFFFFF`, textAlign center
- Subtitle (dynamic):
  - daily → `"Complete daily quests for a bonus flower 🌸"`
  - monthly → `"Complete monthly quests for bonus coins 🌺"`
  - `Nunito_700Bold`, fontSize 14, color `#9FCB98`, textAlign center, marginTop 4
- Padding: paddingTop 16, paddingBottom 20, paddingHorizontal 20

### TabToggle
- Container: `backgroundColor: "rgba(0,0,0,0.18)"`, borderRadius 14, padding 4, marginHorizontal 20, marginBottom 20, flexDirection row
- Inactive tab: text `#FFFFFF`, `Nunito_800ExtraBold`, fontSize 14
- Active tab: `backgroundColor: "#FFFFFF"`, borderRadius 11, text color `#346739`

### SummaryCard
- Background: `rgba(255,255,255,0.15)`, borderRadius 20, border `1.5px rgba(255,255,255,0.35)`
- Layout: row, space-between, alignItems center, padding 18
- Left: 
  - Text "Complete all quests to unlock rewards." — `Nunito_800ExtraBold`, fontSize 14, color `#FFFFFF`
  - Progress pill below: `backgroundColor: "rgba(0,0,0,0.25)"`, borderRadius 20, paddingHorizontal 16, paddingVertical 6
    - Text `X/Y` — `Nunito_900Black`, fontSize 16, color `#FFFFFF`
- Right: emoji `🎁` fontSize 48
- marginHorizontal 20, marginBottom 16

### QuestCard
- Background: `#FFFFFF`, borderRadius 20, marginHorizontal 20, marginBottom 12
- Shadow: `shadowColor: "#1A3A1A"`, shadowOpacity 0.12, shadowRadius 8, elevation 3
- Padding: 18
- Layout (vertical):
  1. **Title row**: title text left + optional ✅ right if completed
     - `Nunito_800ExtraBold`, fontSize 15, color `#1A2A1A`, flex 1
  2. **Progress bar** (marginTop 12):
     - Container: height 24, borderRadius 12, backgroundColor `#E8F2E8`, overflow hidden
     - Fill: gradient `#346739` → `#52B788` (horizontal LinearGradient inside the bar), width `${progress * 100}%`
     - Count label: absolute centered, `Nunito_800ExtraBold`, fontSize 12, color `#FFFFFF` (or `#5A8A5A` if progress < 0.3)
  3. **Rewards row** (marginTop 10):
     - `+X coins · +Y budget score` — `Nunito_700Bold`, fontSize 12, color `#5A8A5A`

### BonusCard
- Background: `#FFFFFF`, borderRadius 20, marginHorizontal 20, marginBottom 16
- Border: `1.5px solid #52B788`
- Padding 16, alignItems center
- Text unchanged (existing bonusText style), restyled to match new card radius/margin

---

## Files Changed

| File | Change |
|------|--------|
| `app/(tabs)/quests.tsx` | Full restructure of layout and component tree |
| `styles/tabs/quests.styles.ts` | Full rewrite of all styles |

No new files needed. No API changes. No new dependencies (LinearGradient already imported).

---

## Edge Cases

- Progress bar count text: if `progress < 0.3`, text color switches to `#5A8A5A` (dark, readable on light bar background)
- Empty state: centered white text on gradient, no card wrapper
- Loading state: `ActivityIndicator color="#FFFFFF"` centered on gradient
- Web: `Platform.OS === "web" && { paddingTop: 56 }` applied to gradient top padding (same pattern as current header)
