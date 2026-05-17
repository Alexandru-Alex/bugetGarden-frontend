// app/store.tsx
import { NavMenu } from "@/components/nav-menu";
import { PageTransition } from "@/components/page-transition";
import { usePurchases } from "@/context/purchases-context";
import { api, getStoredToken } from "@/lib/api";
import { flowerImage } from "@/lib/flower-images";
import { styles } from "@/styles/tabs/store.styles";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect } from "expo-router";
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  ActivityIndicator,
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
  itemType: string;
  revenueCatId?: string;
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

function FeatureBanner({ imageUrl }: { imageUrl?: string }) {
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
      {imageUrl && (
        <View style={styles.bannerImgFrame}>
          <Image
            source={flowerImage(imageUrl)}
            style={styles.bannerImg}
            resizeMode="contain"
          />
        </View>
      )}
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

// ─── Tab Switcher ─────────────────────────────────────────────────────────────

function TabSwitcher({
  active,
  onChange,
}: {
  active: "flowers" | "premium";
  onChange: (tab: "flowers" | "premium") => void;
}) {
  return (
    <View style={tabStyles.row}>
      <Pressable
        style={[tabStyles.tab, active === "flowers" && tabStyles.tabActive]}
        onPress={() => onChange("flowers")}
      >
        <Text style={[tabStyles.label, active === "flowers" && tabStyles.labelActive]}>
          Flowers
        </Text>
      </Pressable>
      <Pressable
        style={[tabStyles.tab, active === "premium" && tabStyles.tabActive]}
        onPress={() => onChange("premium")}
      >
        <Text style={[tabStyles.label, active === "premium" && tabStyles.labelActive]}>
          Premium
        </Text>
      </Pressable>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.06)",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  label: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 14,
    color: "#8a968c",
  },
  labelActive: {
    color: "#1f4a25",
  },
});


function FlowerCard({
  flower,
  cardWidth,
  onPress,
  priceLabel,
}: {
  flower: ShopItemDto;
  cardWidth: number;
  onPress: () => void;
  priceLabel?: string;
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
          {priceLabel ? (
            <Text style={styles.cardPriceMoney}>{priceLabel}</Text>
          ) : (
            <>
              <Image source={require("../assets/images/coin.png")} style={styles.cardCoinImg} />
              <Text style={styles.cardPriceText}>{flower.price}</Text>
            </>
          )}
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
  priceLabel,
}: {
  flower: ShopItemDto;
  onBuy: () => void;
  onClose: () => void;
  isPending: boolean;
  priceLabel?: string;
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
          <Text style={styles.modalDescription}>{flower.description}</Text>
          <View style={styles.modalPriceRow}>
            {priceLabel ? (
              <Text style={styles.modalPriceMoney}>{priceLabel}</Text>
            ) : (
              <>
                <Image source={require("../assets/images/coin.png")} style={styles.modalCoinImg} />
                <Text style={styles.modalPrice}>{flower.price}</Text>
              </>
            )}
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
  const [activeTab, setActiveTab] = useState<"flowers" | "premium">("flowers");
  const isWeb = Platform.OS === "web";
  const effectiveTab = isWeb ? "flowers" : activeTab;
  const [search, setSearch] = useState("");
  const [selectedFlower, setSelectedFlower] = useState<ShopItemDto | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [gridWidth, setGridWidth] = useState(0);
  const [gridOffsetY, setGridOffsetY] = useState(0);
  const { width: screenWidth } = useWindowDimensions();
  const queryClient = useQueryClient();
  const { loginUser, offerings, purchase } = usePurchases();
  const [isPremiumPending, setIsPremiumPending] = useState(false);

  const isWide = Platform.OS === "web" && screenWidth >= 600;
  const cols = screenWidth >= 600 ? 4 : 2;
  const GAP = 12;
  const fallbackWidth = screenWidth - 32; // 16px padding fiecare parte
  const cardWidth = ((gridWidth > 0 ? gridWidth : fallbackWidth) - (cols - 1) * GAP) / cols;

  useEffect(() => { getStoredToken().then(setToken); }, []);

  useEffect(() => {
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current); };
  }, []);

  const { data: account } = useQuery<{ goldCoins: number; email: string; id: string }>({
    queryKey: ["account"],
    queryFn: () => api.get("/accounts"),
    staleTime: Infinity,
    enabled: !!token,
  });

  // Link RC purchases to the logged-in user by account ID (stable, not PII)
  useEffect(() => {
    if (account?.id) loginUser(account.id);
  }, [account?.id, loginUser]);

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

  const bannerImageUrl = shopData.find(i => i.name === "Banner_flower")?.imageUrl;
  const allItems = useMemo(() => shopData.filter(i => i.name !== "Banner_flower"), [shopData]);

  const flowers      = useMemo(() => allItems.filter(i => !i.itemType || i.itemType === "flower"), [allItems]);
  const premiumItems = useMemo(() => allItems.filter(i => i.itemType === "coins"), [allItems]);

  const owned = flowers.filter(i => i.isUnlocked).length;
  const total = flowers.length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return flowers;
    return flowers.filter(f => f.name.toLowerCase().includes(q));
  }, [search, flowers]);

  const findPackage = useCallback((item: ShopItemDto) => {
    if (!offerings || !item.revenueCatId) return undefined;
    const allPkgs = Object.values(offerings.all).flatMap(o => o.availablePackages);
    return allPkgs.find(p => p.product.identifier === item.revenueCatId);
  }, [offerings]);

  const rcPriceFor = useCallback((item: ShopItemDto): string | undefined => {
    return findPackage(item)?.product.priceString;
  }, [findPackage]);

  const handlePremiumBuy = useCallback(async (item: ShopItemDto) => {
    const pkg = findPackage(item);
    if (!pkg) {
      showToast("Product not available");
      return;
    }
    setIsPremiumPending(true);
    try {
      await purchase(pkg);
      queryClient.invalidateQueries({ queryKey: ["shop"] });
      queryClient.invalidateQueries({ queryKey: ["account"] });
      setSelectedFlower(null);
      showToast("Purchase successful!");
    } catch (e) {
      if ((e as any)?.userCancelled === true) {
        setSelectedFlower(null);
        return;
      }
      showToast("Purchase failed. Please try again.");
    } finally {
      setIsPremiumPending(false);
    }
  }, [offerings, purchase, queryClient]);

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
              style={[styles.headerText, (Platform.OS === "web" && screenWidth >= 600) && styles.headerTextWeb]}
              pointerEvents={Platform.OS === "web" && screenWidth >= 600 ? "none" : "auto"}
            >
              <Text style={[styles.headerTitle, isWide && styles.headerTitleWeb]} numberOfLines={1} adjustsFontSizeToFit>Shop the garden</Text>
              <Text style={styles.headerSubtitle} numberOfLines={1} adjustsFontSizeToFit>Fresh seasonal blooms and rare hybrids.</Text>
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
              <FeatureBanner imageUrl={bannerImageUrl} />
              {Platform.OS !== "web" && <TabSwitcher active={activeTab} onChange={setActiveTab} />}
              {effectiveTab === "flowers" ? (
                <>
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
                </>
              ) : (
                <View
                  style={styles.grid}
                  onLayout={e => setGridWidth(e.nativeEvent.layout.width)}
                >
                  {premiumItems.map(item => (
                    <FlowerCard
                      key={item.id}
                      flower={item}
                      cardWidth={cardWidth}
                      priceLabel={rcPriceFor(item) ?? `$${item.price}`}
                      onPress={() => setSelectedFlower(item)}
                    />
                  ))}
                </View>
              )}
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
            {!isWeb && <TabSwitcher active={activeTab} onChange={setActiveTab} />}
            {activeTab === "flowers" ? (
              <>
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
              </>
            ) : (
              <View
                style={styles.grid}
                onLayout={e => setGridWidth(e.nativeEvent.layout.width)}
              >
                {premiumItems.map(item => (
                  <FlowerCard
                    key={item.id}
                    flower={item}
                    cardWidth={cardWidth}
                    priceLabel={rcPriceFor(item) ?? `$${item.price}`}
                    onPress={() => setSelectedFlower(item)}
                  />
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {selectedFlower && (
        <BuyModal
          flower={selectedFlower}
          onBuy={
            selectedFlower.itemType === "coins"
              ? () => handlePremiumBuy(selectedFlower)
              : () => buyFlower(selectedFlower.id)
          }
          onClose={() => setSelectedFlower(null)}
          isPending={selectedFlower.itemType === "coins" ? isPremiumPending : isPending}
          priceLabel={selectedFlower.itemType === "coins" ? (rcPriceFor(selectedFlower) ?? `$${selectedFlower.price}`) : undefined}
        />
      )}

    </PageTransition>
  );
}
