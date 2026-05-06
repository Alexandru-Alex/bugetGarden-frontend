# Store Real API Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hardcoded `CATALOG` in `app/store.tsx` with real data from `GET /shop` and wire `POST /shop/{itemId}/buy` for purchases.

**Architecture:** Single-file rewrite of `app/store.tsx`. `ShopItemDto` replaces the local `Flower` type. `useQuery(["shop"])` replaces `CATALOG`. `useMutation` in `StoreScreen` handles the buy flow and invalidates `["shop"]` + `["account"]` on success. `flowerImage()` from `lib/flower-images.ts` (already exists) handles image resolution. Locked items (`isUnlocked: false`) are greyed with a lock icon.

**Tech Stack:** React Native, React Query (`useQuery`, `useMutation`, `useQueryClient`), `lib/flower-images.ts` (existing), `lib/api.ts` (existing).

---

### Task 1: Replace `app/store.tsx` with real API integration

**Files:**
- Modify: `app/store.tsx`

This is a full-file replacement. The changes span imports, types, sub-components, and the main screen component — they are interdependent so they must be applied together.

**What changes vs the current file:**

| Area | Before | After |
|------|--------|-------|
| Types | `FlowerTag`, `Flower`, `TAG_STYLE`, `CATALOG` | `ShopItemDto`, `RARITY_STYLE` |
| Images | `require("../flowers/...")` on each item | `flowerImage(item.imageUrl)` from `lib/flower-images` |
| Data | Local mock array | `useQuery(["shop"])` → `GET /shop` |
| Buy | Mock toast only | `useMutation` → `POST /shop/{id}/buy` + invalidate queries |
| Toast | `toastVisible: boolean` | `toastMsg: string \| null` (shows success or error message) |
| Locked | Not handled | `opacity: 0.5` + lock icon, press disabled |
| ProgressCard | `owned={0}` hardcoded | `owned = shopData.filter(i => i.ownedQuantity > 0).length` |
| BuyModal | `flower: Flower` | `flower: ShopItemDto`, `isPending: boolean` prop |

- [ ] **Step 1: Replace the file**

Write `D:\IdeaProjects\bugetGarden-front\app\store.tsx` with the following content:

```tsx
// app/store.tsx
import { NavMenu } from "@/components/nav-menu";
import { PageTransition } from "@/components/page-transition";
import { api, getStoredToken } from "@/lib/api";
import { flowerImage } from "@/lib/flower-images";
import { styles } from "@/styles/tabs/store.styles";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ShopItemDto {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  rarity: string;
  unlockActionType: string;
  unlockTargetCount: number;
  userProgress: number;
  isUnlocked: boolean;
  ownedQuantity: number;
}

const RARITY_STYLE: Record<string, { bg: string; text: string }> = {
  RARE:      { bg: "#fff0c8", text: "#8a6310" },
  LEGENDARY: { bg: "#1f4a25", text: "#f2c94c" },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function secondsUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.floor((midnight.getTime() - now.getTime()) / 1000);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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
      <View style={styles.bannerImgFrame}>
        <Image
          source={require("../flowers/peony.png")}
          style={styles.bannerImg}
          resizeMode="contain"
        />
      </View>
    </LinearGradient>
  );
}

function DailyBonusCard() {
  const [secs, setSecs] = useState(secondsUntilMidnight);

  useEffect(() => {
    const id = setInterval(() => setSecs(secondsUntilMidnight()), 1000);
    return () => clearInterval(id);
  }, []);

  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <View style={styles.infoCard}>
      <View style={styles.infoIconBadge}>
        <Ionicons name="time-outline" size={18} color="#346739" />
      </View>
      <Text style={styles.infoCardTitle}>Daily Bonus</Text>
      <Text style={styles.infoCardHint}>New quests in</Text>
      <Text style={styles.infoCountdown}>{pad(h)}:{pad(m)}:{pad(s)}</Text>
      <Text style={styles.infoCardMuted}>Resets at midnight</Text>
    </View>
  );
}

function ProgressCard({ owned, total }: { owned: number; total: number }) {
  const pct = total > 0 ? owned / total : 0;
  return (
    <View style={styles.infoCard}>
      <View style={styles.infoIconBadge}>
        <Ionicons name="leaf-outline" size={18} color="#346739" />
      </View>
      <Text style={styles.infoCardTitle}>Your Garden</Text>
      <Text style={styles.infoCardHint}>Flowers owned</Text>
      <Text style={styles.infoCountdown}>
        {owned}
        <Text style={styles.infoCountdownMuted}> / {total}</Text>
      </Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct * 100}%` }]} />
      </View>
    </View>
  );
}

function FlowerCard({
  flower,
  cardWidth,
  onPress,
}: {
  flower: ShopItemDto;
  cardWidth: number;
  onPress: () => void;
}) {
  const tag = RARITY_STYLE[flower.rarity] ?? null;
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.card, { width: cardWidth }, animStyle]}>
      <Pressable
        onPress={flower.isUnlocked ? onPress : undefined}
        onHoverIn={() => { if (flower.isUnlocked) scale.value = withTiming(1.04, { duration: 140 }); }}
        onHoverOut={() => { scale.value = withTiming(1, { duration: 140 }); }}
        style={!flower.isUnlocked ? { opacity: 0.5 } : undefined}
      >
        <View style={styles.cardBody}>
          {tag && (
            <View style={[styles.cardBadge, { backgroundColor: tag.bg }]}>
              <Text style={[styles.cardBadgeText, { color: tag.text }]}>
                {flower.rarity.toLowerCase()}
              </Text>
            </View>
          )}
          <View style={styles.cardImgFrame}>
            <Image
              source={flowerImage(flower.imageUrl)}
              style={styles.cardImg}
              resizeMode="contain"
            />
            {!flower.isUnlocked && (
              <View style={{
                position: "absolute",
                top: 0, left: 0, right: 0, bottom: 0,
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Ionicons name="lock-closed" size={28} color="rgba(0,0,0,0.5)" />
              </View>
            )}
          </View>
          <Text style={styles.cardName}>{flower.name}</Text>
        </View>
        <View style={styles.cardPriceRow}>
          <Image
            source={require("../assets/images/coin.png")}
            style={styles.cardCoinImg}
          />
          <Text style={styles.cardPriceText}>{flower.price}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function BuyModal({
  flower,
  onBuy,
  onClose,
  isPending,
}: {
  flower: ShopItemDto;
  onBuy: () => void;
  onClose: () => void;
  isPending: boolean;
}) {
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable
          style={styles.modalCard}
          {...(Platform.OS === "web"
            ? { onClick: (e: any) => e.stopPropagation() }
            : undefined)}
        >
          <View style={styles.modalImgFrame}>
            <Image
              source={flowerImage(flower.imageUrl)}
              style={styles.modalImg}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.modalName}>{flower.name}</Text>
          <View style={styles.modalPriceRow}>
            <Image
              source={require("../assets/images/coin.png")}
              style={styles.modalCoinImg}
            />
            <Text style={styles.modalPrice}>{flower.price}</Text>
          </View>
          <Pressable style={styles.modalBuyBtn} onPress={onBuy} disabled={isPending}>
            {isPending
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={styles.modalBuyBtnText}>Buy</Text>
            }
          </Pressable>
          <Pressable style={styles.modalCancelBtn} onPress={onClose} disabled={isPending}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function StoreScreen() {
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [selectedFlower, setSelectedFlower] = useState<ShopItemDto | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [gridWidth, setGridWidth] = useState(0);
  const [gridOffsetY, setGridOffsetY] = useState(0);
  const { width: screenWidth } = useWindowDimensions();
  const queryClient = useQueryClient();

  const isWide = Platform.OS === "web" && screenWidth >= 600;
  const cols = screenWidth >= 600 ? 4 : 2;
  const GAP = 12;
  const cardWidth = gridWidth > 0 ? (gridWidth - (cols - 1) * GAP) / cols : 0;

  useEffect(() => { getStoredToken().then(setToken); }, []);

  useEffect(() => {
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current); };
  }, []);

  const { data: account } = useQuery<{ goldCoins: number }>({
    queryKey: ["account"],
    queryFn: () => api.get("/accounts"),
    staleTime: Infinity,
    enabled: !!token,
  });

  const { data: shopData = [] } = useQuery<ShopItemDto[]>({
    queryKey: ["shop"],
    queryFn: () => api.get("/shop"),
    staleTime: Infinity,
    enabled: !!token,
  });

  const { mutate: buyFlower, isPending } = useMutation({
    mutationFn: (itemId: string) => api.post(`/shop/${itemId}/buy`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop"] });
      queryClient.invalidateQueries({ queryKey: ["account"] });
      setSelectedFlower(null);
      showToast("Flower purchased! 🌸");
    },
    onError: (err: Error) => {
      setSelectedFlower(null);
      showToast(err.message || "Purchase failed");
    },
  });

  function showToast(msg: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMsg(msg);
    toastTimer.current = setTimeout(() => setToastMsg(null), 3000);
  }

  const owned = shopData.filter(i => i.ownedQuantity > 0).length;
  const total = shopData.length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return shopData;
    return shopData.filter(f => f.name.toLowerCase().includes(q));
  }, [search, shopData]);

  if (token === undefined) return null;
  if (!token) return <Redirect href="/landing" />;

  return (
    <PageTransition style={styles.root}>
      <NavMenu />

      {toastMsg !== null && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMsg}</Text>
        </View>
      )}

      <LinearGradient
        colors={["#2A4A2E", "#346739"]}
        style={[styles.header, Platform.OS === "web" && { paddingTop: 56, paddingBottom: 48 }]}
      >
        <SafeAreaView edges={["top"]}>
          <View style={[styles.headerInner, (Platform.OS !== "web" || screenWidth < 600) && styles.headerInnerMobile]}>
            <View
              style={[styles.headerText, (Platform.OS !== "web" || screenWidth >= 600) && styles.headerTextWeb]}
              pointerEvents={Platform.OS !== "web" || screenWidth >= 600 ? "none" : "auto"}
            >
              <Text style={styles.headerTitle}>Shop the garden</Text>
              <Text style={styles.headerSubtitle}>Fresh seasonal blooms and rare hybrids.</Text>
            </View>
            <View style={styles.coinWidget}>
              <Image
                source={require("../assets/images/coin.png")}
                style={styles.coinImg}
              />
              <View style={styles.coinBadge}>
                <Text style={styles.coinText}>
                  {account?.goldCoins?.toLocaleString() ?? "—"}
                </Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isWide ? (
          <View style={styles.webContentRow}>
            <View style={styles.webSpacer} />
            <View style={[styles.inner, styles.innerWeb]}>
              <FeatureBanner />
              <View style={styles.searchBar}>
                <Ionicons name="search-outline" size={16} color="#8a968c" />
                <TextInput
                  style={[
                    styles.searchInput,
                    ({ outlineStyle: "none", outlineWidth: 0 } as any),
                  ]}
                  placeholder="Search flowers..."
                  placeholderTextColor="#8a968c"
                  value={search}
                  onChangeText={setSearch}
                />
              </View>
              <Text style={styles.sectionTitle}>Popular this week</Text>
              <View
                style={styles.grid}
                onLayout={e => {
                  setGridWidth(e.nativeEvent.layout.width);
                  setGridOffsetY(e.nativeEvent.layout.y);
                }}
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
            <View style={[styles.sideCol, { marginTop: gridOffsetY }]}>
              <DailyBonusCard />
              <ProgressCard owned={owned} total={total} />
            </View>
          </View>
        ) : (
          <View style={styles.inner}>
            <FeatureBanner />
            <View style={styles.infoRow}>
              <DailyBonusCard />
              <ProgressCard owned={owned} total={total} />
            </View>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={16} color="#8a968c" />
              <TextInput
                style={[
                  styles.searchInput,
                  Platform.OS === "web" && ({ outlineStyle: "none", outlineWidth: 0 } as any),
                ]}
                placeholder="Search flowers..."
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
        )}
      </ScrollView>

      {selectedFlower && (
        <BuyModal
          flower={selectedFlower}
          onBuy={() => buyFlower(selectedFlower.id)}
          onClose={() => setSelectedFlower(null)}
          isPending={isPending}
        />
      )}
    </PageTransition>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: no errors. Common issues to watch for:
- `flowerImage` import path: `@/lib/flower-images` resolves via tsconfig `@/*` alias
- `useMutation` import: must come from `@tanstack/react-query` alongside `useQuery`
- `ActivityIndicator`: must be in the react-native import list
- `useRef`: must be in the React import list

- [ ] **Step 3: Commit**

```bash
git add app/store.tsx
git commit -m "feat(store): integrate real shop API with buy mutation and locked items"
```

---

### Task 2: Manual smoke test

- [ ] **Start the app**

Run: `npx expo start`

- [ ] **Verify shop loads real data**

Navigate to the Store tab. Grid renders flowers from `GET /shop`. No hardcoded names ("Rose", "Tulip" etc.) unless the backend actually returns them.

- [ ] **Verify coin display**

Coin widget in header shows real `goldCoins` from account API.

- [ ] **Verify locked items**

Items where `isUnlocked: false` appear greyed (opacity 0.5) with a lock icon. Tapping them does nothing — no modal opens.

- [ ] **Verify unlocked items**

Tapping an unlocked item opens `BuyModal` with correct image and price.

- [ ] **Verify buy flow**

Confirm purchase in modal. Button shows spinner while pending. On success: modal closes, toast "Flower purchased! 🌸" appears for 3s, coin balance decreases, `ownedQuantity` increases (ProgressCard updates).

- [ ] **Verify buy error**

If purchase fails (e.g. insufficient coins), modal closes and error toast shows the API error message.

- [ ] **Verify rarity tags**

Items with `rarity: "RARE"` show a tag. Items with `rarity: "LEGENDARY"` show a different tag. Items with other rarity values show no tag.

- [ ] **Verify search**

Type in the search bar — filters items by name from real data.

- [ ] **Verify ProgressCard**

"Flowers owned" shows correct count of items where `ownedQuantity > 0` / total items.
