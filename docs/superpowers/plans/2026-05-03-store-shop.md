# Store / Shop Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/store` shop page where users browse 12 flowers with gold coins, tap a card to open a buy confirmation modal, and see a mock "purchased" toast.

**Architecture:** Two new files — `styles/tabs/store.styles.ts` for all styles, `app/(tabs)/store.tsx` for the full screen. Auth guard via `getStoredToken` + React Query `["account"]` cache for coin balance. All flower data is static mock in-file; no backend calls.

**Tech Stack:** React Native, Expo Router, React Query (`useQuery`), `expo-linear-gradient`, `react-native-safe-area-context`, `@expo/vector-icons` (Ionicons), `react-native-reanimated` (via PageTransition).

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `styles/tabs/store.styles.ts` | Create | All StyleSheet definitions for the screen |
| `app/(tabs)/store.tsx` | Create | Full screen: auth guard, header, banner, search, grid, modal, toast |

---

## Task 1: Create styles file

**Files:**
- Create: `styles/tabs/store.styles.ts`

- [ ] **Step 1: Create the styles file with all definitions**

```typescript
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F8F5",
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    paddingBottom: 32,
  },
  headerInner: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  headerInnerMobile: {
    paddingLeft: 64,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: "Nunito_900Black",
    fontSize: 28,
    color: "#ffffff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
    color: "#9FCB98",
  },
  coinBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#c8d0c0",
    borderRadius: 999,
    paddingVertical: 4,
    paddingLeft: 4,
    paddingRight: 14,
    marginLeft: 12,
  },
  coinImg: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  coinText: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 14,
    color: "#1a2a1d",
  },

  // ── Scroll ────────────────────────────────────────────────────────────────
  scroll: {
    flex: 1,
    marginTop: -20,
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 48,
    backgroundColor: "#F5F8F5",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  inner: {
    paddingHorizontal: 16,
  },
  innerWeb: {
    maxWidth: 900,
    alignSelf: "center",
    width: "100%",
  },

  // ── Feature banner ────────────────────────────────────────────────────────
  banner: {
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
    overflow: "hidden",
  },
  bannerLeft: {
    flex: 1,
  },
  bannerKicker: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(159,203,152,0.18)",
    borderWidth: 1,
    borderColor: "rgba(159,203,152,0.35)",
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  bannerKickerText: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 10,
    color: "#9FCB98",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  bannerTitle: {
    fontFamily: "Nunito_900Black",
    fontSize: 20,
    color: "#ffffff",
    lineHeight: 26,
    marginBottom: 6,
  },
  bannerTitleEm: {
    color: "#9FCB98",
  },
  bannerSubtitle: {
    fontFamily: "Nunito_700Bold",
    fontSize: 12,
    color: "rgba(255,255,255,0.82)",
    marginBottom: 12,
  },
  bannerCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ffffff",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignSelf: "flex-start",
  },
  bannerCtaText: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 12,
    color: "#1f4a25",
  },
  bannerImgCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#f4efe2",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.2)",
  },
  bannerImg: {
    width: "90%",
    height: "90%",
  },

  // ── Search bar ────────────────────────────────────────────────────────────
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e3e5dc",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    color: "#1a2a1d",
  },

  // ── Section header ────────────────────────────────────────────────────────
  sectionTitle: {
    fontFamily: "Nunito_900Black",
    fontSize: 18,
    color: "#1f4a25",
    marginBottom: 12,
  },

  // ── Grid ─────────────────────────────────────────────────────────────────
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },

  // ── Flower card ───────────────────────────────────────────────────────────
  card: {
    // width set dynamically via prop
  },
  cardBody: {
    backgroundColor: "#346739",
    borderRadius: 16,
    padding: 10,
    overflow: "hidden",
    marginBottom: 6,
  },
  cardBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 999,
    zIndex: 1,
  },
  cardBadgeText: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 9,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  cardImgCircle: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: "#f4efe2",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  cardImg: {
    width: "88%",
    height: "88%",
  },
  cardName: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 13,
    color: "#ffffff",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 2,
  },
  cardPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  cardCoinImg: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  cardPriceText: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 13,
    color: "#c99a2a",
  },

  // ── Buy modal ─────────────────────────────────────────────────────────────
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
  },
  modalImgCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f4efe2",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "#e3e5dc",
  },
  modalImg: {
    width: "88%",
    height: "88%",
  },
  modalName: {
    fontFamily: "Nunito_900Black",
    fontSize: 22,
    color: "#1f4a25",
    marginBottom: 8,
  },
  modalPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 24,
  },
  modalCoinImg: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  modalPrice: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 20,
    color: "#c99a2a",
  },
  modalBuyBtn: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#346739",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#1f4a25",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  modalBuyBtnText: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 15,
    color: "#ffffff",
  },
  modalCancelBtn: {
    paddingVertical: 10,
  },
  modalCancelText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    color: "#8a968c",
  },

  // ── Toast ─────────────────────────────────────────────────────────────────
  toast: {
    position: "absolute",
    top: 120,
    left: 20,
    right: 20,
    zIndex: 999,
    backgroundColor: "#346739",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  toastText: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 14,
    color: "#ffffff",
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add styles/tabs/store.styles.ts
git commit -m "feat(store): add store styles"
```

---

## Task 2: Create store.tsx — scaffold with catalog data, auth guard, header

**Files:**
- Create: `app/(tabs)/store.tsx`

- [ ] **Step 1: Create the file with imports, catalog data, and the screen shell**

```typescript
import { NavMenu } from "@/components/nav-menu";
import { PageTransition } from "@/components/page-transition";
import { api, getStoredToken } from "@/lib/api";
import { styles } from "@/styles/tabs/store.styles";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Catalog ────────────────────────────────────────────────────────────────

type FlowerTag = "new" | "rare" | "legendary" | "sale";

interface Flower {
  id: number;
  name: string;
  price: number;
  tag?: FlowerTag;
  image: ReturnType<typeof require>;
}

const TAG_STYLE: Record<FlowerTag, { bg: string; text: string }> = {
  new:       { bg: "#f2c94c", text: "#5a3c0a" },
  rare:      { bg: "#fff0c8", text: "#8a6310" },
  legendary: { bg: "#1f4a25", text: "#f2c94c" },
  sale:      { bg: "#d17a4a", text: "#ffffff" },
};

const CATALOG: Flower[] = [
  { id: 1,  name: "Rose",     price: 120, tag: "new",       image: require("../../flowers/rose_v2.png") },
  { id: 2,  name: "Tulip",    price: 80,                    image: require("../../flowers/Tulip.png") },
  { id: 3,  name: "Lavender", price: 60,                    image: require("../../flowers/Lavender.png") },
  { id: 4,  name: "Peony",    price: 150, tag: "rare",      image: require("../../flowers/peony.png") },
  { id: 5,  name: "Bluebell", price: 50,                    image: require("../../flowers/bluebell_v3.png") },
  { id: 6,  name: "Marigold", price: 70,                    image: require("../../flowers/marigold.png") },
  { id: 7,  name: "Daisy",    price: 40,  tag: "sale",      image: require("../../flowers/daisy.png") },
  { id: 8,  name: "Cosmos",   price: 95,  tag: "new",       image: require("../../flowers/Cosmos.png") },
  { id: 9,  name: "Hibiscus", price: 180, tag: "legendary", image: require("../../flowers/hibiscus.png") },
  { id: 10, name: "Poppy",    price: 75,                    image: require("../../flowers/Poppy_v2.png") },
  { id: 11, name: "Iris",     price: 85,                    image: require("../../flowers/bluebell_v3.png") },
  { id: 12, name: "Lily",     price: 110,                   image: require("../../flowers/daisy.png") },
];

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function StoreScreen() {
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [selectedFlower, setSelectedFlower] = useState<Flower | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [gridWidth, setGridWidth] = useState(0);
  const { width: screenWidth } = useWindowDimensions();

  const cols = screenWidth >= 600 ? 4 : 2;
  const GAP = 12;
  const cardWidth = gridWidth > 0 ? (gridWidth - (cols - 1) * GAP) / cols : 0;

  useEffect(() => { getStoredToken().then(setToken); }, []);

  const { data: account } = useQuery<{ goldCoins: number }>({
    queryKey: ["account"],
    queryFn: () => api.get("/accounts"),
    staleTime: Infinity,
    enabled: !!token,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return CATALOG;
    return CATALOG.filter(f => f.name.toLowerCase().includes(q));
  }, [search]);

  // All hooks above — safe to conditionally return now
  if (token === undefined) return null;
  if (!token) return <Redirect href="/landing" />;

  const handleBuy = () => {
    setSelectedFlower(null);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  return (
    <PageTransition style={styles.root}>
      <NavMenu />

      {toastVisible && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>Floare cumpărată! 🌸</Text>
        </View>
      )}

      <LinearGradient
        colors={["#2A4A2E", "#346739"]}
        style={[styles.header, Platform.OS === "web" && { paddingTop: 56 }]}
      >
        <SafeAreaView edges={["top"]}>
          <View style={[styles.headerInner, Platform.OS !== "web" && styles.headerInnerMobile]}>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Shop the garden</Text>
              <Text style={styles.headerSubtitle}>Fresh seasonal blooms and rare hybrids.</Text>
            </View>
            <View style={styles.coinBadge}>
              <Image
                source={require("../../assets/images/coin.png")}
                style={styles.coinImg}
              />
              <Text style={styles.coinText}>
                {account?.goldCoins?.toLocaleString() ?? "—"}
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.inner, Platform.OS === "web" && styles.innerWeb]}>

          <FeatureBanner />

          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={16} color="#8a968c" />
            <TextInput
              style={[
                styles.searchInput,
                Platform.OS === "web" && ({ outlineStyle: "none", outlineWidth: 0 } as any),
              ]}
              placeholder="Caută flori..."
              placeholderTextColor="#8a968c"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <Text style={styles.sectionTitle}>Popular this week</Text>

          <View
            style={styles.grid}
            onLayout={e => setGridWidth(e.nativeEvent.layout.width)}
          >
            {filtered.map(flower => (
              <FlowerCard
                key={flower.id}
                flower={flower}
                cardWidth={cardWidth}
                onPress={() => setSelectedFlower(flower)}
              />
            ))}
          </View>

        </View>
      </ScrollView>

      {selectedFlower && (
        <BuyModal
          flower={selectedFlower}
          onBuy={handleBuy}
          onClose={() => setSelectedFlower(null)}
        />
      )}
    </PageTransition>
  );
}
```

- [ ] **Step 2: Commit (file still needs sub-components — that's fine, they come next)**

```bash
git add app/"(tabs)"/store.tsx
git commit -m "feat(store): scaffold screen with auth guard, header, coin badge"
```

---

## Task 3: Add FeatureBanner component (inside store.tsx)

**Files:**
- Modify: `app/(tabs)/store.tsx` — add `FeatureBanner` function before the `export default`

- [ ] **Step 1: Add the FeatureBanner function**

Add this function after the `CATALOG` constant and before `export default function StoreScreen`:

```typescript
function FeatureBanner() {
  return (
    <LinearGradient
      colors={["#2A4A2E", "#1f4a25"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.banner}
    >
      <View style={styles.bannerLeft}>
        <View style={styles.bannerKicker}>
          <Ionicons name="sparkles" size={10} color="#9FCB98" />
          <Text style={styles.bannerKickerText}>Spring</Text>
        </View>
        <Text style={styles.bannerTitle}>
          Grow a <Text style={styles.bannerTitleEm}>brighter</Text> garden
        </Text>
        <Text style={styles.bannerSubtitle}>
          Members save up to 30% on the Spring collection.
        </Text>
        <Pressable style={styles.bannerCta}>
          <Text style={styles.bannerCtaText}>Shop drop</Text>
          <Ionicons name="chevron-forward" size={12} color="#1f4a25" />
        </Pressable>
      </View>
      <View style={styles.bannerImgCircle}>
        <Image
          source={require("../../flowers/peony.png")}
          style={styles.bannerImg}
          resizeMode="contain"
        />
      </View>
    </LinearGradient>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/"(tabs)"/store.tsx
git commit -m "feat(store): add feature banner"
```

---

## Task 4: Add FlowerCard component (inside store.tsx)

**Files:**
- Modify: `app/(tabs)/store.tsx` — add `FlowerCard` function

- [ ] **Step 1: Add the FlowerCard function** after `FeatureBanner` and before `export default`:

```typescript
function FlowerCard({
  flower,
  cardWidth,
  onPress,
}: {
  flower: Flower;
  cardWidth: number;
  onPress: () => void;
}) {
  const tag = flower.tag ? TAG_STYLE[flower.tag] : null;

  return (
    <Pressable
      style={[styles.card, { width: cardWidth }]}
      onPress={onPress}
    >
      <View style={styles.cardBody}>
        {tag && (
          <View style={[styles.cardBadge, { backgroundColor: tag.bg }]}>
            <Text style={[styles.cardBadgeText, { color: tag.text }]}>
              {flower.tag}
            </Text>
          </View>
        )}
        <View style={styles.cardImgCircle}>
          <Image
            source={flower.image}
            style={styles.cardImg}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.cardName}>{flower.name}</Text>
      </View>
      <View style={styles.cardPriceRow}>
        <Image
          source={require("../../assets/images/coin.png")}
          style={styles.cardCoinImg}
        />
        <Text style={styles.cardPriceText}>{flower.price}</Text>
      </View>
    </Pressable>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/"(tabs)"/store.tsx
git commit -m "feat(store): add flower card component"
```

---

## Task 5: Add BuyModal component (inside store.tsx)

**Files:**
- Modify: `app/(tabs)/store.tsx` — add `BuyModal` function

- [ ] **Step 1: Add the BuyModal function** after `FlowerCard` and before `export default`:

```typescript
function BuyModal({
  flower,
  onBuy,
  onClose,
}: {
  flower: Flower;
  onBuy: () => void;
  onClose: () => void;
}) {
  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable
          style={styles.modalCard}
          {...(Platform.OS === "web"
            ? { onClick: (e: any) => e.stopPropagation() }
            : undefined)}
        >
          <View style={styles.modalImgCircle}>
            <Image
              source={flower.image}
              style={styles.modalImg}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.modalName}>{flower.name}</Text>
          <View style={styles.modalPriceRow}>
            <Image
              source={require("../../assets/images/coin.png")}
              style={styles.modalCoinImg}
            />
            <Text style={styles.modalPrice}>{flower.price}</Text>
          </View>
          <Pressable style={styles.modalBuyBtn} onPress={onBuy}>
            <Text style={styles.modalBuyBtnText}>Cumpără</Text>
          </Pressable>
          <Pressable style={styles.modalCancelBtn} onPress={onClose}>
            <Text style={styles.modalCancelText}>Anulare</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/"(tabs)"/store.tsx
git commit -m "feat(store): add buy confirmation modal with mock toast"
```

---

## Task 6: Verify

- [ ] **Step 1: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors in `app/(tabs)/store.tsx` or `styles/tabs/store.styles.ts`.

- [ ] **Step 2: Start dev server and test manually**

```bash
npx expo start
```

Verify on mobile (or web):
1. `/store` route opens (navigate via Store in the menu)
2. Header shows "Shop the garden" + coin balance from account
3. Feature banner is visible with peony image
4. Search filters flower grid live
5. 2 columns on mobile, 4 columns on web (resize browser to verify)
6. Tap a flower card → buy modal opens with image, name, price
7. Tap "Cumpără" → modal closes, green toast appears for 3 seconds
8. Tap "Anulare" or backdrop → modal closes
9. Tap backdrop on web → modal closes (stopPropagation working)

- [ ] **Step 3: Final commit if any tweaks were needed**

```bash
git add -p
git commit -m "feat(store): polish store page layout and visual tweaks"
```
