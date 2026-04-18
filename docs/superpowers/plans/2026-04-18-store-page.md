# Store Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a `/store` page where users browse flowers available for purchase using gold coins, with a 2-column scrollable grid and a detail modal per flower.

**Architecture:** Single screen `app/store.tsx` with externalized styles in `styles/store.styles.ts`, following the existing page pattern (LinearGradient + NavMenu + useSafeAreaInsets). SVG flowers are loaded via `react-native-svg-transformer` (requires `metro.config.js` setup). The nav menu Store item is wired to `/store`.

**Tech Stack:** Expo Router, React Native, react-native-svg-transformer, expo-linear-gradient, @tanstack/react-query, react-native-safe-area-context

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `metro.config.js` | SVG transformer config so `import Svg from '*.svg'` works |
| Create | `svg.d.ts` | TypeScript module declaration for `*.svg` imports |
| Create | `styles/store.styles.ts` | All styles for the store screen |
| Create | `app/store.tsx` | Store screen: auth guard, header, FlatList grid, modal |
| Modify | `components/nav-menu.tsx` | Set Store path to `"/store"` |

---

## Task 1: Set up SVG transformer

**Files:**
- Create: `metro.config.js`
- Create: `svg.d.ts`

- [ ] **Step 1: Install react-native-svg-transformer**

```bash
npx expo install react-native-svg-transformer
```

Expected: package added to node_modules, no errors.

- [ ] **Step 2: Create metro.config.js in project root**

```js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer"),
};
config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts.filter((ext) => ext !== "svg"),
  sourceExts: [...config.resolver.sourceExts, "svg"],
};

module.exports = config;
```

- [ ] **Step 3: Create TypeScript declaration for SVG modules**

Create `svg.d.ts` in the project root:

```ts
declare module "*.svg" {
  import React from "react";
  import { SvgProps } from "react-native-svg";
  const content: React.FC<SvgProps>;
  export default content;
}
```

- [ ] **Step 4: Commit**

```bash
git add metro.config.js svg.d.ts package.json package-lock.json
git commit -m "chore: add react-native-svg-transformer for SVG flower imports"
```

---

## Task 2: Create store styles

**Files:**
- Create: `styles/store.styles.ts`

- [ ] **Step 1: Create the styles file**

```ts
import { StyleSheet } from "react-native";

export const GREEN_DARK = "#346739";
export const GREEN_MED = "#79AE6F";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fff",
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerInner: {
    width: "100%",
    maxWidth: 480,
    flexDirection: "row",
    alignItems: "center",
  },
  headerSpacer: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: "Nunito_900Black",
    fontSize: 28,
    color: "#fff",
    flex: 1,
    textAlign: "center",
  },
  coinWidget: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  coinImage: {
    width: 40,
    height: 40,
    resizeMode: "contain",
    marginRight: -15,
    zIndex: 1,
  },
  coinRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    paddingLeft: 20,
    paddingRight: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  coinAmount: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 14,
    color: "#FFE566",
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  columnWrapper: {
    gap: 12,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardName: {
    fontFamily: "Nunito_700Bold",
    fontSize: 15,
    color: "#333",
  },
  cardPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardPriceCoin: {
    width: 18,
    height: 18,
    resizeMode: "contain",
  },
  cardPrice: {
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    color: GREEN_DARK,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  modalName: {
    fontFamily: "Nunito_900Black",
    fontSize: 22,
    color: "#333",
  },
  modalDescription: {
    fontFamily: "Nunito_400Regular",
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  buyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: GREEN_DARK,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 4,
  },
  buyBtnPressed: {
    opacity: 0.8,
  },
  buyBtnCoin: {
    width: 22,
    height: 22,
    resizeMode: "contain",
  },
  buyBtnText: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 16,
    color: "#FFE566",
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add styles/store.styles.ts
git commit -m "feat: add store page styles"
```

---

## Task 3: Create store screen

**Files:**
- Create: `app/store.tsx`

- [ ] **Step 1: Create app/store.tsx**

```tsx
import { NavMenu } from "@/components/nav-menu";
import { ACCOUNT_QUERY_KEY, AccountDto } from "@/app/(tabs)/dashboard";
import { api, getStoredToken } from "@/lib/api";
import { styles } from "@/styles/store.styles";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BluebellSvg from "@/flowers/bluebell.svg";
import DaisySvg from "@/flowers/daisy.svg";
import LavenderSvg from "@/flowers/lavender.svg";
import MarigoldSvg from "@/flowers/marigold.svg";
import PeonySvg from "@/flowers/peony.svg";
import RoseSvg from "@/flowers/rose.svg";
import TulipSvg from "@/flowers/tulip.svg";
import { SvgProps } from "react-native-svg";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FlowerDef {
  id: string;
  name: string;
  Component: React.FC<SvgProps>;
  price: number;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const FLOWERS: FlowerDef[] = [
  { id: "rose",     name: "Rose",     Component: RoseSvg,     price: 120 },
  { id: "tulip",    name: "Tulip",    Component: TulipSvg,    price: 80  },
  { id: "lavender", name: "Lavender", Component: LavenderSvg, price: 60  },
  { id: "peony",    name: "Peony",    Component: PeonySvg,    price: 150 },
  { id: "bluebell", name: "Bluebell", Component: BluebellSvg, price: 50  },
  { id: "marigold", name: "Marigold", Component: MarigoldSvg, price: 70  },
  { id: "daisy",    name: "Daisy",    Component: DaisySvg,    price: 40  },
];

const FLOWER_DESCRIPTION =
  "A beautiful flower that brightens any garden. Perfect for adding color and life to your collection.";

// ─── Flower Card ──────────────────────────────────────────────────────────────

function FlowerCard({ flower, onPress }: { flower: FlowerDef; onPress: () => void }) {
  const { Component } = flower;
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <Component width={100} height={100} />
      <Text style={styles.cardName}>{flower.name}</Text>
      <View style={styles.cardPriceRow}>
        <Image source={require("@/assets/images/coin.png")} style={styles.cardPriceCoin} />
        <Text style={styles.cardPrice}>{flower.price}</Text>
      </View>
    </Pressable>
  );
}

// ─── Flower Modal ─────────────────────────────────────────────────────────────

function FlowerModal({ flower, onClose }: { flower: FlowerDef; onClose: () => void }) {
  const { Component } = flower;
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        {...(Platform.OS === "web" ? { onClick: (e: any) => e.stopPropagation() } : {})}
      >
        <Pressable
          style={styles.modalCard}
          onPress={(e) => { if (Platform.OS === "web") (e as any).stopPropagation(); }}
        >
          <Component width={140} height={140} />
          <Text style={styles.modalName}>{flower.name}</Text>
          <Text style={styles.modalDescription}>{FLOWER_DESCRIPTION}</Text>
          <Pressable
            style={({ pressed }) => [styles.buyBtn, pressed && styles.buyBtnPressed]}
            onPress={onClose}
          >
            <Image source={require("@/assets/images/coin.png")} style={styles.buyBtnCoin} />
            <Text style={styles.buyBtnText}>{flower.price}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function StoreScreen() {
  const insets = useSafeAreaInsets();
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [selectedFlower, setSelectedFlower] = useState<FlowerDef | null>(null);

  useEffect(() => {
    getStoredToken().then(setToken);
  }, []);

  const { data: account } = useQuery<AccountDto>({
    queryKey: ACCOUNT_QUERY_KEY,
    queryFn: () => api.get("/accounts"),
    enabled: !!token,
    staleTime: Infinity,
  });

  const navBarHeight = Platform.OS === "web" ? 56 : 0;

  if (token === null) return <Redirect href="/landing" />;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#346739", "#79AE6F"]}
        style={styles.gradient}
      >
        <NavMenu />
        <View style={[styles.header, { paddingTop: insets.top + navBarHeight + 16 }]}>
          <View style={styles.headerInner}>
            <View style={styles.headerSpacer} />
            <Text style={styles.headerTitle}>Store</Text>
            <View style={styles.coinWidget}>
              <Image source={require("@/assets/images/coin.png")} style={styles.coinImage} />
              <View style={styles.coinRow}>
                <Text style={styles.coinAmount}>{account?.goldCoins ?? 0}</Text>
              </View>
            </View>
          </View>
        </View>

        <FlatList
          data={FLOWERS}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          renderItem={({ item }) => (
            <FlowerCard flower={item} onPress={() => setSelectedFlower(item)} />
          )}
        />
      </LinearGradient>

      {selectedFlower && (
        <FlowerModal flower={selectedFlower} onClose={() => setSelectedFlower(null)} />
      )}
    </View>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/store.tsx
git commit -m "feat: add store screen with flower grid and detail modal"
```

---

## Task 4: Wire up nav menu

**Files:**
- Modify: `components/nav-menu.tsx:29`

- [ ] **Step 1: Update Store path in SECONDARY_ITEMS**

In `components/nav-menu.tsx`, find the SECONDARY_ITEMS array and change the Store entry's `path` from `""` to `"/store"`:

```ts
const SECONDARY_ITEMS = [
  { label: "Achievements", icon: "trophy-outline"     as const, path: ""       },
  { label: "Store",        icon: "storefront-outline" as const, path: "/store" },
  { label: "Categories",   icon: "pricetag-outline"   as const, path: "/manage-categories" },
  { label: "Budgets",      icon: "wallet-outline"     as const, path: "/budgets" },
  { label: "Goals",        icon: "flag-outline"       as const, path: "/goals" },
  { label: "Settings",     icon: "settings-outline"   as const, path: ""     },
];
```

- [ ] **Step 2: Commit**

```bash
git add components/nav-menu.tsx
git commit -m "feat: wire Store nav menu item to /store route"
```

---

## Self-Review

**Spec coverage:**
- ✅ Page at `/store` accessible from nav menu
- ✅ Gold coins in header (right side, symmetric spacer for centered title)
- ✅ 2-column scrollable FlatList grid
- ✅ Each card: SVG flower, name, price in coins
- ✅ Tap card → modal with flower image, name, description, Buy button
- ✅ Buy button closes modal (mockup, no real purchase)
- ✅ Auth guard (redirect to /landing if no token)
- ✅ Prices hardcoded (easy to replace with API)
- ✅ Styles in separate file (`styles/store.styles.ts`)

**Placeholder scan:** No TBDs. Prices are hardcoded integers as agreed.

**Type consistency:** `FlowerDef` defined once in Task 3 and used only in that file. `AccountDto` and `ACCOUNT_QUERY_KEY` imported from `dashboard.tsx` consistently.
