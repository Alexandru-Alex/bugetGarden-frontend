# Store Screen Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `app/store.tsx` cu atmosferă Light Meadow, banner decorativ, carduri cu 3 stări (normal/unlocked/locked) și modale bottom-sheet animate.

**Architecture:** Screen-ul este rescris complet: `FlatList` cu `numColumns` înlocuit cu `ScrollView` + `flexWrap` pentru carduri cu lățime fixă centrate. Starea unlocked/locked derivă din `account.ownedFlowerIds`. Două componente modale separate (`BuyModal`, `LockedModal`) cu animație slide-up via `Animated` API.

**Tech Stack:** React Native, Expo Router, `react-native-svg` (deja instalat), `expo-linear-gradient`, `@tanstack/react-query`, `expo-image`

---

## File Map

| Fișier | Acțiune | Responsabilitate |
|--------|---------|-----------------|
| `app/(tabs)/dashboard.tsx` | Modifică | Adaugă `ownedFlowerIds` la `AccountDto` |
| `styles/store.styles.ts` | Rescrie complet | Toate stilurile noului design |
| `app/store.tsx` | Rescrie complet | Componente `FlowerCard`, `BuyModal`, `LockedModal`, `StoreScreen` |

---

### Task 1: Adaugă `ownedFlowerIds` la `AccountDto`

**Files:**
- Modify: `app/(tabs)/dashboard.tsx:18-24`

- [ ] **Step 1: Adaugă câmpul opțional la interfață**

În `app/(tabs)/dashboard.tsx`, înlocuiește blocul `AccountDto`:

```typescript
export interface AccountDto {
  email: string;
  displayName: string;
  goldCoins: number;
  totalScore: number;
  currency: string;
  ownedFlowerIds?: string[];
}
```

- [ ] **Step 2: Verifică că TypeScript compilează**

```bash
cd /d/IdeaProjects/bugetGarden-front && npx tsc --noEmit
```

Expected: nicio eroare legată de `AccountDto`.

- [ ] **Step 3: Commit**

```bash
git add app/tabs/dashboard.tsx
git commit -m "feat(store): add ownedFlowerIds to AccountDto"
```

---

### Task 2: Rescrie `styles/store.styles.ts`

**Files:**
- Rewrite: `styles/store.styles.ts`

- [ ] **Step 1: Înlocuiește tot conținutul fișierului**

```typescript
import { StyleSheet } from "react-native";

export const COLORS = {
  bannerTop: "#346739",
  bannerBottom: "#4a8c50",
  stripTop: "#81c784",
  stripBottom: "#4CAF50",
  stripGrey: "#ccc",
  stripGreyBottom: "#bbb",
  pageBg: "#e8f5e9",
  cardShadow: "rgba(76,175,80,0.2)",
  priceTag: "#FFE566",
  priceText: "#7a5200",
  unlockedBorder: "#4CAF50",
  coinText: "#FFE566",
};

export const styles = StyleSheet.create({
  // ─── Root ─────────────────────────────────────────────────────────────────
  root: { flex: 1, backgroundColor: COLORS.pageBg },
  gradient: { flex: 1 },

  // ─── Banner ───────────────────────────────────────────────────────────────
  banner: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 18,
    alignItems: "center",
    overflow: "hidden",
  },
  bannerDecor: {
    position: "absolute",
    opacity: 0.13,
  },
  bannerTitle: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 20,
    color: "#fff",
    letterSpacing: 0.3,
  },
  bannerSubtitle: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 11,
    color: "rgba(255,255,255,0.68)",
    marginTop: 3,
  },
  coinBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.22)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
  },
  coinText: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 14,
    color: COLORS.coinText,
  },

  // ─── Grid ─────────────────────────────────────────────────────────────────
  scrollContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    padding: 12,
    paddingBottom: 32,
  },

  // ─── Card ─────────────────────────────────────────────────────────────────
  card: {
    width: 124,
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "rgba(76,175,80,1)",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  cardUnlocked: {
    borderWidth: 2.5,
    borderColor: COLORS.unlockedBorder,
  },
  cardLocked: {
    shadowOpacity: 0.05,
    elevation: 2,
  },

  // strip (top coloured area)
  strip: {
    height: 54,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  circle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: "#fff",
    overflow: "hidden",
    marginBottom: -27,
    backgroundColor: "#66bb6a",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 5,
  },
  circleGrey: { backgroundColor: "#aaa" },
  flowerImage: { width: "100%", height: "100%" },

  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.36)",
    alignItems: "center",
    justifyContent: "center",
  },
  lockEmoji: { fontSize: 24 },

  // body
  cardBody: { paddingTop: 34, paddingBottom: 13, paddingHorizontal: 10, alignItems: "center" },
  cardName: { fontFamily: "Nunito_700Bold", fontSize: 13, color: "#1a3a1f" },
  cardNameGrey: { color: "#aaa" },

  priceTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.priceTag,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 6,
    shadowColor: "rgba(255,200,0,1)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  priceTagGrey: {
    backgroundColor: "#f0f0f0",
    shadowOpacity: 0,
    elevation: 0,
  },
  priceText: { fontFamily: "Nunito_800ExtraBold", fontSize: 11, color: COLORS.priceText },
  priceTextGrey: { color: "#bbb" },

  unlockedTag: {
    backgroundColor: "rgba(76,175,80,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 6,
  },
  unlockedTagText: { fontFamily: "Nunito_800ExtraBold", fontSize: 10, color: "#2e7d32" },

  unlockedBadge: {
    position: "absolute",
    top: -10,
    right: -10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.priceTag,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 2,
  },
  unlockedBadgeText: { fontSize: 13 },

  leafDecor: {
    position: "absolute",
    bottom: -5,
    left: -5,
    fontSize: 40,
    opacity: 0.07,
  },

  // ─── Modals ───────────────────────────────────────────────────────────────
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  sheet: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 20,
  },
  modalBanner: {
    height: 120,
    alignItems: "center",
    justifyContent: "flex-end",
    overflow: "visible",
  },
  modalImageWrap: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 4,
    borderColor: "#fff",
    overflow: "hidden",
    backgroundColor: "#66bb6a",
    marginBottom: -38,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 2,
  },
  modalImageWrapGrey: { backgroundColor: "#888" },
  modalImageGreyed: { opacity: 0.8 },
  modalLockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.38)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalLockEmoji: { fontSize: 36 },

  modalBody: { paddingTop: 52, paddingBottom: 36, paddingHorizontal: 24, alignItems: "center" },
  modalName: { fontFamily: "Nunito_800ExtraBold", fontSize: 26, color: "#1a3a1f", marginBottom: 6 },
  modalNameGrey: { color: "#777" },
  modalUnlockedTag: {
    backgroundColor: "rgba(76,175,80,0.12)",
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 10,
  },
  modalUnlockedTagText: { fontFamily: "Nunito_800ExtraBold", fontSize: 11, color: "#2e7d32" },
  modalDesc: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 13,
    color: "#777",
    lineHeight: 22,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 24,
  },
  modalDescGrey: { color: "#aaa" },

  buyBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: "rgba(255,200,0,1)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  buyBtnDisabled: {
    backgroundColor: "#efefef",
    shadowOpacity: 0,
    elevation: 0,
  },
  buyBtnText: { fontFamily: "Nunito_800ExtraBold", fontSize: 16, color: COLORS.priceText },
  buyBtnTextDisabled: { color: "#bbb" },

  lockInfoBox: {
    width: "100%",
    backgroundColor: "#f9fafb",
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#eee",
  },
  lockInfoTitle: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 11,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  lockInfoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  lockInfoText: { fontFamily: "Nunito_600SemiBold", fontSize: 13, color: "#999", flex: 1 },
  lockInfoBold: { fontFamily: "Nunito_800ExtraBold", color: "#555" },
  lockInfoNeed: { fontFamily: "Nunito_800ExtraBold", color: "#FF6B6B" },

  modalClose: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 12,
    color: "#ccc",
    marginTop: 16,
  },
});
```

- [ ] **Step 2: Verifică TypeScript**

```bash
cd /d/IdeaProjects/bugetGarden-front && npx tsc --noEmit
```

Expected: nicio eroare în `store.styles.ts`.

- [ ] **Step 3: Commit**

```bash
git add styles/store.styles.ts
git commit -m "feat(store): rewrite styles for Light Meadow redesign"
```

---

### Task 3: Rescrie `app/store.tsx` — tipuri, date, `FlowerCard`

**Files:**
- Rewrite: `app/store.tsx` (această task acoperă importuri + tipuri + date + componenta `FlowerCard`)

- [ ] **Step 1: Înlocuiește importurile și tipurile**

Înlocuiește tot conținutul `app/store.tsx` cu:

```tsx
import { ACCOUNT_QUERY_KEY, AccountDto } from "@/app/(tabs)/dashboard";
import { NavMenu, BAR_HEIGHT } from "@/components/nav-menu";
import { api, getStoredToken } from "@/lib/api";
import { COLORS, styles } from "@/styles/store.styles";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FlowerDef {
  id: string;
  name: string;
  image: ReturnType<typeof require>;
  price: number;
  description: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const FLOWERS: FlowerDef[] = [
  { id: "rose",     name: "Rose",     image: require("@/flowers/rose.svg"),     price: 120, description: "A timeless symbol of love and beauty. Its velvety petals and rich fragrance make it the crown jewel of any garden." },
  { id: "tulip",    name: "Tulip",    image: require("@/flowers/tulip.svg"),    price: 80,  description: "Elegant and cheerful, tulips bring a burst of spring color. Available in every shade, they brighten even the gloomiest day." },
  { id: "lavender", name: "Lavender", image: require("@/flowers/lavender.svg"), price: 60,  description: "Soothing and fragrant, lavender calms the senses and attracts pollinators. A must-have for any peaceful garden corner." },
  { id: "peony",    name: "Peony",    image: require("@/flowers/peony.svg"),    price: 150, description: "Lush and romantic, peonies bloom in spectacular clouds of petals. Their sweet scent and full blooms are truly show-stopping." },
  { id: "bluebell", name: "Bluebell", image: require("@/flowers/bluebell.svg"), price: 50,  description: "Delicate woodland charmers that carpet the ground in a sea of blue. They bring a magical, fairy-tale feel to shaded spots." },
  { id: "marigold", name: "Marigold", image: require("@/flowers/marigold.svg"), price: 70,  description: "Vibrant and hardy, marigolds glow like little suns. They naturally repel pests and keep your garden healthy and bright." },
  { id: "daisy",    name: "Daisy",    image: require("@/flowers/daisy.svg"),    price: 40,  description: "Simple, cheerful, and beloved by all. Daisies symbolize innocence and new beginnings — perfect for a fresh garden start." },
];
```

- [ ] **Step 2: Adaugă componenta `FlowerCard` imediat după date**

```tsx
// ─── Flower Card ──────────────────────────────────────────────────────────────

interface FlowerCardProps {
  flower: FlowerDef;
  canAfford: boolean;
  isUnlocked: boolean;
  onPress: () => void;
}

function FlowerCard({ flower, canAfford, isUnlocked, onPress }: FlowerCardProps) {
  const isLocked = !canAfford && !isUnlocked;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isUnlocked && styles.cardUnlocked,
        isLocked && styles.cardLocked,
        { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.96 : 1 }] },
      ]}
    >
      {isUnlocked && (
        <View style={styles.unlockedBadge}>
          <Text style={styles.unlockedBadgeText}>🌱</Text>
        </View>
      )}

      <Text style={[styles.leafDecor, { transform: [{ rotate: "20deg" }] }]}>🌿</Text>

      {/* Strip */}
      <LinearGradient
        colors={isLocked ? [COLORS.stripGrey, COLORS.stripGreyBottom] : [COLORS.stripTop, COLORS.stripBottom]}
        style={styles.strip}
      >
        <View style={[styles.circle, isLocked && styles.circleGrey]}>
          <Image
            source={flower.image}
            style={[styles.flowerImage, isLocked && { filter: "grayscale(1) brightness(0.82)" }]}
            contentFit="cover"
          />
          {isLocked && (
            <View style={styles.lockOverlay}>
              <Text style={styles.lockEmoji}>🔒</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Body */}
      <View style={styles.cardBody}>
        <Text style={[styles.cardName, isLocked && styles.cardNameGrey]}>{flower.name}</Text>

        {isUnlocked ? (
          <View style={styles.unlockedTag}>
            <Text style={styles.unlockedTagText}>🌱 Unlocked</Text>
          </View>
        ) : (
          <View style={[styles.priceTag, isLocked && styles.priceTagGrey]}>
            <Text style={[styles.priceText, isLocked && styles.priceTextGrey]}>
              🪙 {flower.price}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}
```

- [ ] **Step 3: Verifică TypeScript**

```bash
cd /d/IdeaProjects/bugetGarden-front && npx tsc --noEmit
```

Expected: nicio eroare.

- [ ] **Step 4: Commit**

```bash
git add app/store.tsx
git commit -m "feat(store): add FlowerCard component with 3 states"
```

---

### Task 4: Adaugă `BuyModal`

**Files:**
- Modify: `app/store.tsx` (adaugă după `FlowerCard`)

- [ ] **Step 1: Adaugă hook-ul de animație și componenta `BuyModal`**

Imediat după `FlowerCard`, adaugă:

```tsx
// ─── Shared slide-up hook ─────────────────────────────────────────────────────

function useSlideUp(visible: boolean) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, {
      toValue: visible ? 1 : 0,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
  }, [visible]);
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [600, 0] });
  return translateY;
}

// ─── Buy Modal ────────────────────────────────────────────────────────────────

interface BuyModalProps {
  flower: FlowerDef | null;
  isUnlocked: boolean;
  onClose: () => void;
  onBuy: () => void;
}

function BuyModal({ flower, isUnlocked, onClose, onBuy }: BuyModalProps) {
  const translateY = useSlideUp(!!flower);

  return (
    <Modal visible={!!flower} transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <Pressable onPress={Platform.OS === "web" ? (e) => (e as any).stopPropagation() : undefined}>
            {/* Banner verde */}
            <LinearGradient colors={[COLORS.bannerTop, COLORS.bannerBottom]} style={styles.modalBanner}>
              <Text style={[styles.bannerDecor, { top: -10, left: -10, fontSize: 80, transform: [{ rotate: "-15deg" }] }]}>🌿</Text>
              <Text style={[styles.bannerDecor, { top: 8, right: 14, fontSize: 32, opacity: 0.14 }]}>🌸</Text>
              {flower && (
                <View style={styles.modalImageWrap}>
                  <Image source={flower.image} style={styles.flowerImage} contentFit="cover" />
                </View>
              )}
            </LinearGradient>

            {/* Body */}
            <View style={styles.modalBody}>
              <Text style={styles.modalName}>{flower?.name}</Text>

              {isUnlocked && (
                <View style={styles.modalUnlockedTag}>
                  <Text style={styles.modalUnlockedTagText}>🌱 Unlocked — poți primi din quests</Text>
                </View>
              )}

              <Text style={styles.modalDesc}>{flower?.description}</Text>

              <Pressable
                style={({ pressed }) => [styles.buyBtn, { opacity: pressed ? 0.85 : 1 }]}
                onPress={onBuy}
              >
                <LinearGradient
                  colors={["#FFE566", "#f5d020"]}
                  style={[styles.buyBtn, { width: "100%" }]}
                >
                  <Text style={styles.buyBtnText}>
                    🪙 {flower?.price} — {isUnlocked ? "Cumpără din nou" : "Cumpără"}
                  </Text>
                </LinearGradient>
              </Pressable>

              <Pressable onPress={onClose}>
                <Text style={styles.modalClose}>✕ Închide</Text>
              </Pressable>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
```

- [ ] **Step 2: Verifică TypeScript**

```bash
cd /d/IdeaProjects/bugetGarden-front && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add app/store.tsx
git commit -m "feat(store): add BuyModal with slide-up animation"
```

---

### Task 5: Adaugă `LockedModal`

**Files:**
- Modify: `app/store.tsx` (adaugă după `BuyModal`)

- [ ] **Step 1: Adaugă componenta `LockedModal`**

```tsx
// ─── Locked Modal ─────────────────────────────────────────────────────────────

interface LockedModalProps {
  flower: FlowerDef | null;
  goldCoins: number;
  onClose: () => void;
}

function LockedModal({ flower, goldCoins, onClose }: LockedModalProps) {
  const translateY = useSlideUp(!!flower);
  const need = flower ? flower.price - goldCoins : 0;

  return (
    <Modal visible={!!flower} transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <Pressable onPress={Platform.OS === "web" ? (e) => (e as any).stopPropagation() : undefined}>
            {/* Banner gri */}
            <LinearGradient colors={["#9e9e9e", "#757575"]} style={styles.modalBanner}>
              <Text style={[styles.bannerDecor, { top: -10, left: -10, fontSize: 80, transform: [{ rotate: "-15deg" }] }]}>🌿</Text>
              {flower && (
                <View style={[styles.modalImageWrap, styles.modalImageWrapGrey]}>
                  <Image source={flower.image} style={[styles.flowerImage, styles.modalImageGreyed]} contentFit="cover" />
                  <View style={styles.modalLockOverlay}>
                    <Text style={styles.modalLockEmoji}>🔒</Text>
                  </View>
                </View>
              )}
            </LinearGradient>

            {/* Body */}
            <View style={styles.modalBody}>
              <Text style={[styles.modalName, styles.modalNameGrey]}>{flower?.name}</Text>
              <Text style={[styles.modalDesc, styles.modalDescGrey]}>{flower?.description}</Text>

              {/* Info box */}
              <View style={styles.lockInfoBox}>
                <Text style={styles.lockInfoTitle}>🔒 Cum deblochezi</Text>
                <View style={styles.lockInfoRow}>
                  <Text style={{ fontSize: 16 }}>🪙</Text>
                  <Text style={styles.lockInfoText}>
                    Strânge{" "}
                    <Text style={styles.lockInfoBold}>{flower?.price} monede</Text>
                    {" "}(mai ai nevoie de{" "}
                    <Text style={styles.lockInfoNeed}>{need}</Text>
                    )
                  </Text>
                </View>
              </View>

              {/* Buton dezactivat */}
              <View style={[styles.buyBtn, styles.buyBtnDisabled]}>
                <Text style={styles.buyBtnTextDisabled}>🔒 Monede insuficiente</Text>
              </View>

              <Pressable onPress={onClose}>
                <Text style={styles.modalClose}>✕ Închide</Text>
              </Pressable>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
```

- [ ] **Step 2: Verifică TypeScript**

```bash
cd /d/IdeaProjects/bugetGarden-front && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add app/store.tsx
git commit -m "feat(store): add LockedModal with grey banner and unlock hint"
```

---

### Task 6: Rescrie `StoreScreen` — layout principal

**Files:**
- Modify: `app/store.tsx` (înlocuiește `StoreScreen`)

- [ ] **Step 1: Adaugă `StoreScreen` la finalul fișierului**

```tsx
// ─── Screen ───────────────────────────────────────────────────────────────────

export default function StoreScreen() {
  const insets = useSafeAreaInsets();
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [buyFlower, setBuyFlower] = useState<FlowerDef | null>(null);
  const [lockedFlower, setLockedFlower] = useState<FlowerDef | null>(null);

  useEffect(() => { getStoredToken().then(setToken); }, []);

  const { data: account } = useQuery<AccountDto>({
    queryKey: ACCOUNT_QUERY_KEY,
    queryFn: () => api.get("/accounts"),
    enabled: !!token,
    staleTime: Infinity,
  });

  const navBarHeight = Platform.OS === "web" ? BAR_HEIGHT : 0;
  if (token === undefined) return null;
  if (token === null) return <Redirect href="/landing" />;

  const goldCoins = account?.goldCoins ?? 0;
  const ownedIds = account?.ownedFlowerIds ?? [];

  function handleCardPress(flower: FlowerDef) {
    const canAfford = goldCoins >= flower.price;
    const isUnlocked = ownedIds.includes(flower.id);
    if (!canAfford && !isUnlocked) {
      setLockedFlower(flower);
    } else {
      setBuyFlower(flower);
    }
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={["#e8f5e9", "#f1f8e9"]} style={styles.gradient}>
        <NavMenu />

        {/* Banner */}
        <LinearGradient
          colors={[COLORS.bannerTop, COLORS.bannerBottom]}
          style={[styles.banner, { paddingTop: insets.top + navBarHeight + 18 }]}
        >
          <Text style={[styles.bannerDecor, { top: -12, left: -12, fontSize: 72, transform: [{ rotate: "-15deg" }] }]}>🌿</Text>
          <Text style={[styles.bannerDecor, { bottom: -12, right: -12, fontSize: 72, transform: [{ rotate: "15deg" }] }]}>🌸</Text>
          <Text style={[styles.bannerDecor, { top: 10, right: 14, fontSize: 30, opacity: 0.16 }]}>🌼</Text>
          <Text style={[styles.bannerDecor, { top: 22, left: 16, fontSize: 22, opacity: 0.16 }]}>🌷</Text>
          <Text style={styles.bannerTitle}>🌸 Garden Shop</Text>
          <Text style={styles.bannerSubtitle}>Cumpără flori pentru grădina ta</Text>
          <View style={styles.coinBadge}>
            <Text style={styles.coinText}>🪙 {goldCoins} monede</Text>
          </View>
        </LinearGradient>

        {/* Wave SVG */}
        <Svg width="100%" height={24} viewBox="0 0 400 24" style={{ marginTop: -1 }}>
          <Path d="M0,24 C100,0 300,0 400,24 L400,0 L0,0 Z" fill={COLORS.bannerBottom} />
        </Svg>

        {/* Grid */}
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.scrollContent}>
            {FLOWERS.map((flower) => {
              const canAfford = goldCoins >= flower.price;
              const isUnlocked = ownedIds.includes(flower.id);
              return (
                <FlowerCard
                  key={flower.id}
                  flower={flower}
                  canAfford={canAfford}
                  isUnlocked={isUnlocked}
                  onPress={() => handleCardPress(flower)}
                />
              );
            })}
          </View>
        </ScrollView>
      </LinearGradient>

      <BuyModal
        flower={buyFlower}
        isUnlocked={buyFlower ? ownedIds.includes(buyFlower.id) : false}
        onClose={() => setBuyFlower(null)}
        onBuy={() => setBuyFlower(null)}
      />
      <LockedModal
        flower={lockedFlower}
        goldCoins={goldCoins}
        onClose={() => setLockedFlower(null)}
      />
    </View>
  );
}
```

- [ ] **Step 2: Verifică TypeScript**

```bash
cd /d/IdeaProjects/bugetGarden-front && npx tsc --noEmit
```

Expected: nicio eroare.

- [ ] **Step 3: Commit**

```bash
git add app/store.tsx
git commit -m "feat(store): rewrite StoreScreen with banner, wave, and centered grid"
```

---

## Self-Review

> **Notă pentru implementare:** `filter: "grayscale(1)"` nu funcționează în React Native nativ. În Task 3/Task 5, înlocuiește overlayer-ul cu `backgroundColor: "rgba(160,160,160,0.55)"` în loc de `rgba(0,0,0,0.36)` și șterge proprietatea `filter` de pe `Image`. Efectul gri vine din overlay.

**Spec coverage:**
- ✅ Light Meadow background (`#e8f5e9 → #f1f8e9`)
- ✅ Banner verde decorativ cu emoji + wave SVG
- ✅ Carduri fixe centrate (nu full-width)
- ✅ Imagini fill în cerc (`contentFit="cover"`)
- ✅ Card normal: strip + floating image + yellow price badge + shadow + leaf
- ✅ Card unlocked: yellow 🌱 badge colț + green border + "Unlocked" tag
- ✅ Card locked: grey strip + lock overlay + grey price
- ✅ Buy modal: bottom sheet + green banner + floating image + yellow CTA
- ✅ Locked modal: bottom sheet + grey banner + lock overlay + "cum deblochezi" box + disabled btn
- ✅ `ownedFlowerIds` pe `AccountDto`

**Placeholder scan:** nicio secțiune TBD/TODO.

**Type consistency:** `FlowerDef`, `BuyModalProps`, `LockedModalProps`, `FlowerCardProps` — toate definite în Task 3 și utilizate consistent în Task 4-6. `COLORS` din `store.styles.ts` utilizat cu aceleași chei în tot `store.tsx`.
