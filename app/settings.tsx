import { NavMenu } from "@/components/nav-menu";
import { AccountDto, ACCOUNT_QUERY_KEY } from "@/app/(tabs)/dashboard";
import { api, getStoredToken } from "@/lib/api";
import { avatarSource, AVATAR_KEYS } from "@/lib/avatars";
import { CURRENCIES, currencySymbolFor, type Currency } from "@/lib/currency";
import { styles, ITEM_H, PICKER_H } from "@/styles/settings.styles";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, useRouter, usePathname } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Image, Linking, Modal, NativeScrollEvent, NativeSyntheticEvent, Platform, Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
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
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [pendingCurrency, setPendingCurrency] = useState<Currency>("USD");
  const [showDecimalModal, setShowDecimalModal] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const currencyScrollRef = useRef<ScrollView>(null);
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

  useEffect(() => {
    if (account?.isNotification !== undefined) setNotifEnabled(account.isNotification);
  }, [account?.isNotification]);

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

  const { mutate: updateCurrency, isPending: savingCurrency } = useMutation({
    mutationFn: (currency: string) =>
      api.patch("/accounts", { name: null, currency, numberOfDecimals: null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEY });
      setShowCurrencyModal(false);
    },
  });

  const { mutate: updateDecimals, isPending: savingDecimals } = useMutation({
    mutationFn: (numberOfDecimals: number) =>
      api.patch("/accounts", { name: null, currency: null, numberOfDecimals }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEY });
      setShowDecimalModal(false);
    },
  });

  const { mutate: updateNotification, isPending: savingNotification } = useMutation({
    mutationFn: (isNotification: boolean) =>
      api.patch("/accounts", { name: null, currency: null, numberOfDecimals: null, isNotification }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEY }),
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

  const handleOpenCurrency = useCallback(() => {
    const current = (account?.currency ?? "USD") as Currency;
    setPendingCurrency(current);
    setShowCurrencyModal(true);
    const idx = CURRENCIES.findIndex((c) => c.code === current);
    setTimeout(() => currencyScrollRef.current?.scrollTo({ y: idx * ITEM_H, animated: false }), 80);
  }, [account?.currency]);

  const handleCurrencyScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
      const clamped = Math.max(0, Math.min(CURRENCIES.length - 1, idx));
      setPendingCurrency(CURRENCIES[clamped].code);
    },
    []
  );

  const decimalExamples: Record<number, string> = { 0: "eg. 10", 1: "eg. 10.4", 2: "eg. 10.45" };

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
                <Text style={styles.profileName} numberOfLines={1}>
                  {account?.displayName ?? "—"}
                </Text>
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

        <View style={[styles.manageCard, { marginTop: 16 }]}>
          <Text style={styles.manageCardTitle}>Appearance</Text>

          <View style={styles.cardDivider} />

          <Pressable
            style={({ pressed }) => [styles.manageRow, pressed && styles.manageRowPressed]}
            onPress={handleOpenCurrency}
          >
            <Ionicons name="globe-outline" size={20} color="#346739" />
            <Text style={styles.manageRowLabel}>Currency</Text>
            <Text style={styles.appearanceRowValue}>
              {currencySymbolFor(account?.currency)}{"  "}{account?.currency ?? "—"}
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#9FCB98" />
          </Pressable>

          <View style={styles.cardDivider} />

          <Pressable
            style={({ pressed }) => [styles.manageRow, pressed && styles.manageRowPressed]}
            onPress={() => setShowDecimalModal(true)}
          >
            <Ionicons name="calculator-outline" size={20} color="#346739" />
            <Text style={styles.manageRowLabel}>Decimal places</Text>
            <Text style={styles.appearanceRowValue}>
              {account?.numberOfDecimals ?? 2}{"  "}({decimalExamples[account?.numberOfDecimals ?? 2]})
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#9FCB98" />
          </Pressable>
        </View>

        <View style={[styles.manageCard, { marginTop: 16 }]}>
          <Text style={styles.manageCardTitle}>Notification</Text>

          <View style={styles.cardDivider} />

          <View style={styles.manageRow}>
            <Ionicons name="notifications-outline" size={20} color="#346739" />
            <View style={styles.notifLabelGroup}>
              <Text style={styles.manageRowLabel}>Remind everyday</Text>
              <Text style={styles.notifSubtext}>Remind to add expenses/income</Text>
            </View>
            <Switch
              value={notifEnabled}
              onValueChange={(val) => { setNotifEnabled(val); updateNotification(val); }}
              disabled={savingNotification}
              trackColor={{ false: "#e0e0e0", true: "#9FCB98" }}
              thumbColor="#346739"
            />
          </View>

          <View style={styles.cardDivider} />

          <Pressable
            style={({ pressed }) => [styles.manageRow, pressed && styles.manageRowPressed]}
            onPress={() => Linking.openSettings()}
          >
            <Ionicons name="settings-outline" size={20} color="#346739" />
            <Text style={styles.manageRowLabel}>Notification settings</Text>
            <Ionicons name="chevron-forward" size={16} color="#9FCB98" />
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

      <Modal
        visible={showCurrencyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowCurrencyModal(false)}>
          <Pressable
            style={styles.currencyModal}
            {...(Platform.OS === "web" ? { onClick: (e: any) => e.stopPropagation() } : undefined)}
          >
            <Text style={styles.currencyModalTitle}>Currency</Text>

            {Platform.OS === "web" ? (
              <View style={styles.webPickerContainer}>
                <ScrollView style={styles.webPickerScroll} showsVerticalScrollIndicator={false}>
                  {CURRENCIES.map(({ code, symbol }) => (
                    <Pressable
                      key={code}
                      style={[
                        styles.webPickerItem,
                        pendingCurrency === code && styles.webPickerItemSelected,
                      ]}
                      onPress={() => updateCurrency(code)}
                    >
                      <Text style={[styles.webPickerSymbol, pendingCurrency === code && styles.webPickerTextSelected]}>
                        {symbol}
                      </Text>
                      <Text style={[styles.webPickerCode, pendingCurrency === code && styles.webPickerTextSelected]}>
                        {code}
                      </Text>
                      {pendingCurrency === code && (
                        <Ionicons name="checkmark" size={16} color="#ffffff" />
                      )}
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            ) : (
              <View style={styles.wheelContainer}>
                <ScrollView
                  ref={currencyScrollRef}
                  style={styles.wheelScroll}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ITEM_H}
                  decelerationRate="fast"
                  scrollEventThrottle={16}
                  onMomentumScrollEnd={handleCurrencyScrollEnd}
                  onScrollEndDrag={handleCurrencyScrollEnd}
                  contentContainerStyle={styles.wheelContent}
                >
                  {CURRENCIES.map(({ code, symbol }) => (
                    <Pressable
                      key={code}
                      style={styles.wheelItem}
                      onPress={() => {
                        const idx = CURRENCIES.findIndex((c) => c.code === code);
                        currencyScrollRef.current?.scrollTo({ y: idx * ITEM_H, animated: true });
                        setPendingCurrency(code);
                      }}
                    >
                      <Text style={styles.wheelSymbol}>{symbol}</Text>
                      <Text style={styles.wheelCode}>{code}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
                <LinearGradient
                  colors={["#ffffff", "rgba(255,255,255,0)"]}
                  style={styles.wheelFadeTop}
                  pointerEvents="none"
                />
                <LinearGradient
                  colors={["rgba(255,255,255,0)", "#ffffff"]}
                  style={styles.wheelFadeBottom}
                  pointerEvents="none"
                />
                <View style={styles.wheelHighlight} pointerEvents="none" />
              </View>
            )}

            {Platform.OS !== "web" && (
              <Pressable
                style={({ pressed }) => [styles.currencyModalBtn, { opacity: pressed || savingCurrency ? 0.7 : 1 }]}
                onPress={() => updateCurrency(pendingCurrency)}
                disabled={savingCurrency}
              >
                <Text style={styles.currencyModalBtnLabel}>
                  {savingCurrency ? "Saving…" : "Save"}
                </Text>
              </Pressable>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={showDecimalModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDecimalModal(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowDecimalModal(false)}>
          <Pressable
            style={styles.decimalModal}
            {...(Platform.OS === "web" ? { onClick: (e: any) => e.stopPropagation() } : undefined)}
          >
            <Text style={styles.decimalModalTitle}>Decimal Places</Text>
            {([0, 1, 2] as const).map((val) => {
              const selected = (account?.numberOfDecimals ?? 2) === val;
              return (
                <Pressable
                  key={val}
                  style={({ pressed }) => [
                    styles.decimalOption,
                    selected && styles.decimalOptionSelected,
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => updateDecimals(val)}
                  disabled={savingDecimals}
                >
                  <Text style={styles.decimalOptionValue}>{val}</Text>
                  <Text style={styles.decimalOptionExample}>({decimalExamples[val]})</Text>
                  {selected && <Ionicons name="checkmark" size={16} color="#346739" />}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
