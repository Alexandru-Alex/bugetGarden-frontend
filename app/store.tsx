import { NavMenu } from "@/components/nav-menu";
import { ACCOUNT_QUERY_KEY, AccountDto } from "@/app/(tabs)/dashboard";
import { api, getStoredToken } from "@/lib/api";
import { styles } from "@/styles/store.styles";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
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
import { SvgProps } from "react-native-svg";

import BluebellSvg from "@/flowers/bluebell.svg";
import DaisySvg from "@/flowers/daisy.svg";
import LavenderSvg from "@/flowers/lavender.svg";
import MarigoldSvg from "@/flowers/marigold.svg";
import PeonySvg from "@/flowers/peony.svg";
import RoseSvg from "@/flowers/rose.svg";
import TulipSvg from "@/flowers/tulip.svg";

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
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={styles.modalCard}
          onPress={Platform.OS === "web" ? (e) => (e as any).stopPropagation() : undefined}
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
      <LinearGradient colors={["#346739", "#79AE6F"]} style={styles.gradient}>
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
