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
import { Image, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NavTransition } from "@/lib/nav-direction";
import { getLastSync, setLastSync, relativeTime } from "@/lib/sync";

export default function SettingsScreen() {
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [syncLabel, setSyncLabel] = useState(() => {
    const last = getLastSync();
    return last ? relativeTime(last) : "Never synced";
  });
  const rotation = useSharedValue(0);
  const syncIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  useEffect(() => {
    getStoredToken().then(setToken);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const last = getLastSync();
      if (last) setSyncLabel(relativeTime(last));
    }, 30_000);
    return () => clearInterval(id);
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

  const { mutate: updateName, isPending: savingName } = useMutation({
    mutationFn: (name: string) => api.patch("/accounts", { name, currency: null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEY });
      setShowNameModal(false);
    },
  });

  if (token === undefined) return null;
  if (!token) return <Redirect href="/landing" />;

  const currentAvatarUrl = localAvatarUrl ?? account?.avatarUrl ?? "gardener_1";
  const isLocalAccount = account?.provider === "local";

  const goToStore = () => {
    NavTransition.setDirection(pathname, "/store");
    router.replace("/store");
  };

  const handleSync = () => {
    rotation.value = withTiming(rotation.value + 360, { duration: 600 });
    queryClient.invalidateQueries();
    setLastSync(new Date());
    setSyncLabel("Just now");
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
          <View style={styles.profileRow}>
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
              <Pressable
                style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1 }]}
                onPress={() => {
                  setNameInput(account?.displayName ?? "");
                  setShowNameModal(true);
                }}
              >
                <View style={styles.profileNameWrapper}>
                  <Text style={styles.profileName} numberOfLines={1}>
                    {account?.displayName ?? "—"}
                  </Text>
                  <View style={styles.nameEditBadge}>
                    <Ionicons name="pencil" size={8} color="#fff" />
                  </View>
                </View>
              </Pressable>
              <Text style={styles.profileEmail} numberOfLines={1}>
                {account?.email ?? "—"}
              </Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <Pressable style={({ pressed }) => [styles.syncRow, pressed && styles.syncRowPressed]} onPress={handleSync}>
            <Animated.View style={syncIconStyle}>
              <Ionicons name="sync-outline" size={20} color="#346739" />
            </Animated.View>
            <Text style={styles.syncLabel}>Sync</Text>
            <Text style={styles.syncSubLabel}>{syncLabel}</Text>
          </Pressable>
        </View>

        <View style={styles.manageCard}>
          <Text style={styles.manageCardTitle}>Manage Account</Text>

          <View style={styles.cardDivider} />

          <Pressable
            style={({ pressed }) => [
              styles.manageRow,
              pressed && isLocalAccount && styles.manageRowPressed,
              !isLocalAccount && styles.manageRowDisabled,
            ]}
            onPress={() => router.push("/change-email")}
            disabled={!isLocalAccount}
          >
            <Ionicons
              name="mail-outline"
              size={20}
              color={isLocalAccount ? "#346739" : "#b0b8b0"}
            />
            <Text style={[styles.manageRowLabel, !isLocalAccount && styles.manageRowLabelDisabled]}>
              Change Email
            </Text>
            <Ionicons name="chevron-forward" size={16} color={isLocalAccount ? "#9FCB98" : "#c8cec8"} />
          </Pressable>

          <View style={styles.cardDivider} />

          <Pressable
            style={({ pressed }) => [
              styles.manageRow,
              pressed && isLocalAccount && styles.manageRowPressed,
              !isLocalAccount && styles.manageRowDisabled,
            ]}
            onPress={() => router.push("/change-password")}
            disabled={!isLocalAccount}
          >
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={isLocalAccount ? "#346739" : "#b0b8b0"}
            />
            <Text style={[styles.manageRowLabel, !isLocalAccount && styles.manageRowLabelDisabled]}>
              Change Password
            </Text>
            <Ionicons name="chevron-forward" size={16} color={isLocalAccount ? "#9FCB98" : "#c8cec8"} />
          </Pressable>
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

      <Modal
        visible={showNameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNameModal(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowNameModal(false)}>
          <Pressable
            style={styles.nameModal}
            {...(Platform.OS === "web" ? { onClick: (e: any) => e.stopPropagation() } : undefined)}
          >
            <Text style={styles.nameModalTitle}>Change Name</Text>
            <TextInput
              style={styles.nameInput}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Your name"
              placeholderTextColor="#9FCB98"
              autoFocus
              maxLength={50}
            />
            <View style={styles.nameModalButtons}>
              <Pressable
                style={({ pressed }) => [styles.nameModalBtn, { opacity: pressed ? 0.7 : 1 }]}
                onPress={() => setShowNameModal(false)}
              >
                <Text style={styles.nameModalBtnLabel}>Cancel</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.nameModalBtnPrimary, { opacity: pressed || savingName ? 0.7 : 1 }]}
                onPress={() => {
                  const trimmed = nameInput.trim();
                  if (trimmed) updateName(trimmed);
                }}
                disabled={savingName}
              >
                <Text style={styles.nameModalBtnPrimaryLabel}>
                  {savingName ? "Saving…" : "Save"}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
