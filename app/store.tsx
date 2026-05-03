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
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Catalog ─────────────────────────────────────────────────────────────────

type FlowerTag = "new" | "rare" | "legendary" | "sale";

interface Flower {
  id: number;
  name: string;
  price: number;
  tag?: FlowerTag;
  image: number;
}

const TAG_STYLE: Record<FlowerTag, { bg: string; text: string }> = {
  new:       { bg: "#f2c94c", text: "#5a3c0a" },
  rare:      { bg: "#fff0c8", text: "#8a6310" },
  legendary: { bg: "#1f4a25", text: "#f2c94c" },
  sale:      { bg: "#d17a4a", text: "#ffffff" },
};

const CATALOG: Flower[] = [
  { id: 1,  name: "Rose",     price: 120, tag: "new",       image: require("../flowers/rose_v2.png") },
  { id: 2,  name: "Tulip",    price: 80,                    image: require("../flowers/Tulip.png") },
  { id: 3,  name: "Lavender", price: 60,                    image: require("../flowers/Lavender.png") },
  { id: 4,  name: "Peony",    price: 150, tag: "rare",      image: require("../flowers/peony.png") },
  { id: 5,  name: "Bluebell", price: 50,                    image: require("../flowers/bluebell_v3.png") },
  { id: 6,  name: "Marigold", price: 70,                    image: require("../flowers/marigold.png") },
  { id: 7,  name: "Daisy",    price: 40,  tag: "sale",      image: require("../flowers/daisy.png") },
  { id: 8,  name: "Cosmos",   price: 95,  tag: "new",       image: require("../flowers/Cosmos.png") },
  { id: 9,  name: "Hibiscus", price: 180, tag: "legendary", image: require("../flowers/hibiscus.png") },
  { id: 10, name: "Poppy",    price: 75,                    image: require("../flowers/Poppy_v2.png") },
  { id: 11, name: "Iris",     price: 85,                    image: require("../flowers/bluebell_v3.png") },
  { id: 12, name: "Lily",     price: 110,                   image: require("../flowers/daisy.png") },
];

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
      <View style={styles.bannerImgCircle}>
        <Image
          source={require("../flowers/peony.png")}
          style={styles.bannerImg}
          resizeMode="contain"
        />
      </View>
    </LinearGradient>
  );
}

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
    <Pressable style={[styles.card, { width: cardWidth }]} onPress={onPress}>
      <View style={styles.cardBody}>
        {tag && (
          <View style={[styles.cardBadge, { backgroundColor: tag.bg }]}>
            <Text style={[styles.cardBadgeText, { color: tag.text }]}>
              {flower.tag}
            </Text>
          </View>
        )}
        <View style={styles.cardImgCircle}>
          <Image source={flower.image} style={styles.cardImg} resizeMode="contain" />
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
  );
}

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
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable
          style={styles.modalCard}
          {...(Platform.OS === "web"
            ? { onClick: (e: any) => e.stopPropagation() }
            : undefined)}
        >
          <View style={styles.modalImgCircle}>
            <Image source={flower.image} style={styles.modalImg} resizeMode="contain" />
          </View>
          <Text style={styles.modalName}>{flower.name}</Text>
          <View style={styles.modalPriceRow}>
            <Image
              source={require("../assets/images/coin.png")}
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

// ─── Screen ───────────────────────────────────────────────────────────────────

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
                source={require("../assets/images/coin.png")}
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
