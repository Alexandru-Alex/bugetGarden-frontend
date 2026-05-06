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
              <View style={styles.cardLockOverlay}>
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
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
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
