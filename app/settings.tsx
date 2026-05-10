import { NavMenu } from "@/components/nav-menu";
import { PageTransition } from "@/components/page-transition";
import { AccountDto, ACCOUNT_QUERY_KEY } from "@/app/(tabs)/dashboard";
import { api, getStoredToken } from "@/lib/api";
import { styles } from "@/styles/settings.styles";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, useRouter, usePathname } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NavTransition } from "@/lib/nav-direction";

export default function SettingsScreen() {
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    getStoredToken().then(setToken);
  }, []);

  const { data: account } = useQuery<AccountDto>({
    queryKey: ACCOUNT_QUERY_KEY,
    queryFn: () => api.get("/accounts"),
    staleTime: Infinity,
    enabled: !!token,
  });

  if (token === undefined) return null;
  if (!token) return <Redirect href="/landing" />;

  const goToStore = () => {
    NavTransition.setDirection(pathname, "/store");
    router.replace("/store");
  };

  return (
    <PageTransition style={styles.root}>
      <NavMenu />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 64 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Settings</Text>

        {/* Shop banner */}
        <Pressable onPress={goToStore}>
          <LinearGradient
            colors={["#2A4A2E", "#346739", "#4a8050"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.banner}
          >
            <View style={styles.bannerLeft}>
              <Text style={styles.bannerKicker}>Shop</Text>
              <Text style={styles.bannerTitle}>
                Visit the shop to buy flowers for your garden
              </Text>
              <View style={styles.bannerCta}>
                <Text style={styles.bannerCtaText}>Go to Store</Text>
                <Ionicons name="chevron-forward" size={12} color="#FFE566" />
              </View>
            </View>
            <Image
              source={require("../assets/images/coin.png")}
              style={styles.bannerCoinImg}
              resizeMode="contain"
            />
          </LinearGradient>
        </Pressable>

        {/* Profile card */}
        <View style={styles.profileCard}>
          <Image
            source={require("../assets/avatars/gardener_1.png")}
            style={styles.avatar}
            resizeMode="cover"
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName} numberOfLines={1}>
              {account?.displayName ?? "—"}
            </Text>
            <Text style={styles.profileEmail} numberOfLines={1}>
              {account?.email ?? "—"}
            </Text>
          </View>
        </View>
      </ScrollView>
    </PageTransition>
  );
}
