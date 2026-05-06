// components/inventory-sheet.tsx
import { api } from "@/lib/api";
import { flowerImage } from "@/lib/flower-images";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface InventoryItemDto {
  inventoryId: string;
  shopItemId: string;
  name: string;
  imageUrl: string;
  rarity: string;
  quantity: number;
}

interface Props {
  visible: boolean;
  day: number | null;
  gardenId: string;
  month: number;
  year: number;
  onClose: () => void;
  onPlantError: () => void;
}

const SHEET_HEIGHT = 240;

function InventoryItemCard({
  item,
  onPress,
  disabled,
}: {
  item: InventoryItemDto;
  onPress: () => void;
  disabled: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.card, disabled && styles.cardDisabled]}
    >
      <Image
        source={flowerImage(item.imageUrl)}
        style={styles.cardImg}
        contentFit="contain"
      />
      <View style={styles.quantityBadge}>
        <Text style={styles.quantityText}>{item.quantity}</Text>
      </View>
      <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
    </Pressable>
  );
}

export function InventorySheet({
  visible,
  day,
  gardenId,
  month,
  year,
  onClose,
  onPlantError,
}: Props) {
  const translateY = useSharedValue(SHEET_HEIGHT);
  const queryClient = useQueryClient();
  const [inventoryEnabled, setInventoryEnabled] = useState(false);

  const { data: inventory = [], isLoading } = useQuery<InventoryItemDto[]>({
    queryKey: ["inventory"],
    queryFn: () => api.get("/inventory"),
    staleTime: Infinity,
    enabled: inventoryEnabled,
  });

  const { mutate: plant, isPending } = useMutation({
    mutationFn: ({ shopItemId }: { shopItemId: string }) =>
      api.post(`/garden/${gardenId}/cells/${day}/plant`, { shopItemId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["garden", month, year] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      animateClose(onClose);
    },
    onError: () => {
      animateClose(() => { onClose(); onPlantError(); });
    },
  });

  function animateClose(callback: () => void) {
    translateY.value = withTiming(SHEET_HEIGHT, { duration: 220 }, (finished) => {
      if (finished) runOnJS(callback)();
    });
  }

  function handleClose() {
    animateClose(onClose);
  }

  useEffect(() => {
    if (visible) {
      setInventoryEnabled(true);
      translateY.value = withTiming(0, { duration: 280 });
    }
  }, [visible]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  const items = inventory.filter((i) => i.quantity > 0);

  return (
    <>
      <Pressable style={styles.backdrop} onPress={handleClose} />
      <Animated.View style={[styles.sheet, animStyle]}>
        <View style={styles.handle} />
        <Text style={styles.title}>Select a flower</Text>

        {isLoading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Loading...</Text>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No flowers in inventory</Text>
            <Pressable
              style={styles.shopBtn}
              onPress={() => { onClose(); router.push("/store"); }}
            >
              <Text style={styles.shopBtnText}>Go to Shop</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {items.map((item) => (
              <InventoryItemCard
                key={item.inventoryId}
                item={item}
                disabled={isPending}
                onPress={() => plant({ shopItemId: item.shopItemId })}
              />
            ))}
          </ScrollView>
        )}
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
    minHeight: SHEET_HEIGHT,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#d0d8d0",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 8,
  },
  title: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 16,
    color: "#1f2e1f",
    textAlign: "center",
    marginBottom: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
    alignItems: "flex-start",
  },
  card: {
    width: 80,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    position: "relative",
  },
  cardDisabled: {
    opacity: 0.5,
  },
  cardImg: {
    width: 56,
    height: 56,
  },
  cardName: {
    fontFamily: "Nunito_700Bold",
    fontSize: 10,
    color: "#346739",
    textAlign: "center",
    marginTop: 4,
    maxWidth: 76,
  },
  quantityBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#346739",
    alignItems: "center",
    justifyContent: "center",
  },
  quantityText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Nunito_700Bold",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 12,
  },
  emptyText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    color: "#8a968c",
  },
  shopBtn: {
    backgroundColor: "#346739",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  shopBtnText: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 14,
    color: "#fff",
  },
});
