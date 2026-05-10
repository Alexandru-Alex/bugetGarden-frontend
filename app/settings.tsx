import { NavMenu } from "@/components/nav-menu";
import { AccountDto, ACCOUNT_QUERY_KEY } from "@/app/(tabs)/dashboard";
import { api, getStoredToken } from "@/lib/api";
import { avatarSource, AVATAR_KEYS } from "@/lib/avatars";
import { styles } from "@/styles/settings.styles";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, useRouter, usePathname } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, Modal, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NavTransition } from "@/lib/nav-direction";

export default function SettingsScreen() {
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  useEffect(() => {
    getStoredToken().then(setToken);
  }, []);

  const { data: account } = useQuery<AccountDto>({
    queryKey: ACCOUNT_QUERY_KEY,
    queryFn: () => api.get("/accounts"),
    staleTime: Infinity,
    enabled: !!token,
  });

  const { mutate: updateAvatar } = useMutation({
    mutationFn: (avatarUrl: string) => api.patch("/accounts/avatar", { avatarUrl }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEY }),
  });

  if (token === undefined) return null;
  if (!token) return <Redirect href="/landing" />;

  const currentAvatarUrl = localAvatarUrl ?? account?.avatarUrl ?? "gardener_1";

  const goToStore = () => {
    NavTransition.setDirection(pathname, "/store");
    router.replace("/store");
  };

  const handleSelectAvatar = (key: string) => {
    setLocalAvatarUrl(key);
    setShowAvatarModal(false);
    updateAvatar(key);
  };

  return (
    <View style={styles.root}>
      <NavMenu />
      <LinearGradient
        colors={["#2A4A2E", "#346739"]}
        style={[styles.header, { paddingTop: Platform.OS === "web" ? 56 : insets.top + 56 }]}
      >
        <Text style={styles.headerTitle}>Settings</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={goToStore} style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}>
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

        <View style={styles.profileCard}>
          <Pressable
            style={({ pressed }) => [styles.avatarBtn, { opacity: pressed ? 0.8 : 1 }]}
            onPress={() => setShowAvatarModal(true)}
          >
            <Image source={avatarSource(currentAvatarUrl)} style={styles.avatar} resizeMode="cover" />
            <View style={styles.avatarEditBadge}>
              <Ionicons name="pencil" size={9} color="#fff" />
            </View>
          </Pressable>
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

      <Modal
        visible={showAvatarModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAvatarModal(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowAvatarModal(false)}>
          <Pressable
            style={styles.avatarModal}
            {...(Platform.OS === "web" ? { onClick: (e: any) => e.stopPropagation() } : undefined)}
          >
            <Text style={styles.avatarModalTitle}>Choose Avatar</Text>
            <View style={styles.avatarRow}>
              {AVATAR_KEYS.map((key) => (
                <Pressable
                  key={key}
                  style={({ pressed }) => [
                    styles.avatarOption,
                    currentAvatarUrl === key && styles.avatarOptionSelected,
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={() => handleSelectAvatar(key)}
                >
                  <Image source={avatarSource(key)} style={styles.avatarOptionImg} resizeMode="cover" />
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
