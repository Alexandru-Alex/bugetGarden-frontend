import React from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { PurchasesPackage } from "react-native-purchases";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { usePurchases } from "@/context/purchases-context";
import { COIN_PACKAGE_IDS } from "@/lib/purchases";

const COIN_ORDER = [
  COIN_PACKAGE_IDS.COINS_1000,
  COIN_PACKAGE_IDS.COINS_500,
  COIN_PACKAGE_IDS.COINS_250,
];

function CoinPackageRow({
  pkg,
  onPress,
  disabled,
}: {
  pkg: PurchasesPackage;
  onPress: () => void;
  disabled: boolean;
}) {
  const coins = COIN_LABEL[pkg.product.identifier] ?? pkg.product.title;

  return (
    <Pressable
      style={({ pressed }) => [styles.packageRow, pressed && styles.packageRowPressed]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.packageLeft}>
        <Image source={require("../assets/images/coin.png")} style={styles.packageCoin} />
        <Text style={styles.packageCoins}>{coins}</Text>
      </View>
      <View style={styles.packagePriceChip}>
        <Text style={styles.packagePrice}>{pkg.product.priceString}</Text>
      </View>
    </Pressable>
  );
}

const COIN_LABEL: Record<string, string> = {
  [COIN_PACKAGE_IDS.COINS_1000]: "1,000 Coins",
  [COIN_PACKAGE_IDS.COINS_500]:  "500 Coins",
  [COIN_PACKAGE_IDS.COINS_250]:  "250 Coins",
};

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function BuyCoinsModal({ visible, onClose }: Props) {
  const { offerings, isLoading, error, purchase, restore } = usePurchases();
  const queryClient = useQueryClient();

  const coinPackages: PurchasesPackage[] = React.useMemo(() => {
    const all = offerings?.current?.availablePackages ?? [];
    return COIN_ORDER
      .map((id) => all.find((p) => p.product.identifier === id))
      .filter((p): p is PurchasesPackage => p !== undefined);
  }, [offerings]);

  const handlePurchase = async (pkg: PurchasesPackage) => {
    try {
      await purchase(pkg);
      // Refresh the coin balance — backend credits coins via RC webhook
      queryClient.invalidateQueries({ queryKey: ["account"] });
      onClose();
    } catch {
      // error displayed via context
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={styles.card}
          {...(Platform.OS === "web"
            ? { onClick: (e: any) => e.stopPropagation() }
            : undefined)}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Buy Coins</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#346739" />
            </Pressable>
          </View>

          <Text style={styles.subtitle}>
            Coins let you unlock flowers and grow your garden.
          </Text>

          {/* Packages */}
          {isLoading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#346739" />
            </View>
          )}

          {!isLoading && error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          {!isLoading && !error && coinPackages.length === 0 && (
            <Text style={styles.emptyText}>
              No products available. Check your RevenueCat configuration.
            </Text>
          )}

          {!isLoading && coinPackages.map((pkg) => (
            <CoinPackageRow
              key={pkg.identifier}
              pkg={pkg}
              onPress={() => handlePurchase(pkg)}
              disabled={isLoading}
            />
          ))}

          {/* Restore */}
          <Pressable style={styles.restoreBtn} onPress={restore} disabled={isLoading}>
            <Text style={styles.restoreText}>Restore purchases</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 20,
    color: "#1f4a25",
  },
  closeBtn: {
    padding: 4,
  },
  subtitle: {
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
    color: "#6b7c6d",
    marginBottom: 20,
  },
  loadingRow: {
    alignItems: "center",
    paddingVertical: 24,
  },
  errorText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
    color: "#c0392b",
    textAlign: "center",
    marginBottom: 12,
  },
  emptyText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
    color: "#8a968c",
    textAlign: "center",
    marginBottom: 12,
  },
  packageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f4f8f4",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  packageRowPressed: {
    opacity: 0.75,
  },
  packageLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  packageCoin: {
    width: 28,
    height: 28,
  },
  packageCoins: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 16,
    color: "#1f4a25",
  },
  packagePriceChip: {
    backgroundColor: "#346739",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  packagePrice: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 14,
    color: "#fff",
  },
  restoreBtn: {
    alignItems: "center",
    marginTop: 8,
    paddingVertical: 8,
  },
  restoreText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
    color: "#8a968c",
    textDecorationLine: "underline",
  },
});
