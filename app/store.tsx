import { ACCOUNT_QUERY_KEY, AccountDto } from "@/app/(tabs)/dashboard";
import { BAR_HEIGHT, NavMenu } from "@/components/nav-menu";
import { api, getStoredToken } from "@/lib/api";
import { styles } from "@/styles/store.styles";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  Image as RNImage,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  { id: "bluebell", name: "Bluebell", image: require("@/flowers/bluebell_v3.png"), price: 50,  description: "Delicate woodland charmers that carpet the ground in a sea of blue. They bring a magical, fairy-tale feel to shaded spots." },
  { id: "marigold", name: "Marigold", image: require("@/flowers/marigold.svg"), price: 70,  description: "Vibrant and hardy, marigolds glow like little suns. They naturally repel pests and keep your garden healthy and bright." },
  { id: "daisy",    name: "Daisy",    image: require("@/flowers/daisy.svg"),    price: 40,  description: "Simple, cheerful, and beloved by all. Daisies symbolize innocence and new beginnings — perfect for a fresh garden start." },
];

// ─── Flower Card ──────────────────────────────────────────────────────────────

function FlowerCard({ flower, onPress }: { flower: FlowerDef; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.cardWrapper, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <View style={styles.card}>
        <View style={styles.imageFrame}>
          <Image source={flower.image} style={{ width: 112, height: 112 }} contentFit="cover" />
        </View>
        <Text style={styles.cardName}>{flower.name}</Text>
      </View>
      <View style={styles.cardPriceRow}>
        <RNImage source={require("@/assets/images/coin.png")} style={styles.cardPriceCoin} />
        <Text style={styles.cardPrice}>{flower.price}</Text>
      </View>
    </Pressable>
  );
}

// ─── Flower Modal ─────────────────────────────────────────────────────────────

function FlowerModal({ flower, onClose }: { flower: FlowerDef; onClose: () => void }) {
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={styles.modalCard}
          onPress={Platform.OS === "web" ? (e) => (e as any).stopPropagation() : undefined}
        >
          <View style={styles.modalImageFrame}>
            <Image source={flower.image} style={{ width: 150, height: 150 }} contentFit="cover" />
          </View>
          <Text style={styles.modalName}>{flower.name}</Text>
          <Text style={styles.modalDescription}>{flower.description}</Text>
          <Pressable
            style={({ pressed }) => [styles.buyBtn, pressed && styles.buyBtnPressed]}
            onPress={onClose}
          >
            <RNImage source={require("@/assets/images/coin.png")} style={styles.buyBtnCoin} />
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

  const navBarHeight = Platform.OS === "web" ? BAR_HEIGHT : 0;
  if (token === undefined) return null;
  if (token === null) return <Redirect href="/landing" />;

  return (
    <View style={styles.root}>
      <LinearGradient colors={["#f5f5f5", "#ffffff"]} style={styles.gradient}>
        <NavMenu />
        <View style={[styles.topBar, { marginTop: insets.top + navBarHeight + 8 }]}>
          <View style={styles.coinWidget}>
            <RNImage source={require("@/assets/images/coin.png")} style={styles.coinImage} />
            <View style={styles.coinBadge}>
              <Text style={styles.coinAmount}>{account?.goldCoins ?? 0}</Text>
            </View>
          </View>
        </View>

        <View style={styles.listOuter}>
          <FlatList
            style={styles.list}
            data={FLOWERS.length % 2 === 0 ? FLOWERS : [...FLOWERS, null]}
            keyExtractor={(item) => item?.id ?? "__empty__"}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.columnWrapper}
            renderItem={({ item }) =>
              item ? (
                <FlowerCard flower={item} onPress={() => setSelectedFlower(item)} />
              ) : (
                <View style={styles.cardWrapper} />
              )
            }
          />
        </View>
      </LinearGradient>

      {selectedFlower && (
        <FlowerModal flower={selectedFlower} onClose={() => setSelectedFlower(null)} />
      )}
    </View>
  );
}
