import { Ionicons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, Modal, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api, logout } from "../lib/api";
import { NavTransition } from "../lib/nav-direction";

const DRAWER_WIDTH = 200;
const GREEN_DARK = "#346739";
const BAR_HEIGHT = 56;

const MENU_ITEMS = [
  { label: "Dashboard",  icon: "home-outline"        as const, path: "/dashboard"  },
  { label: "Garden",     icon: "leaf-outline"        as const, path: "/garden"     },
  { label: "Score",      icon: "ribbon-outline"      as const, path: "/score"      },
  { label: "Statistics", icon: "stats-chart-outline" as const, path: "/statistics" },
];

const SECONDARY_ITEMS = [
  { label: "Achievements", icon: "trophy-outline"     as const, path: "" },
  { label: "Store",        icon: "storefront-outline" as const, path: ""        },
  { label: "Tags",         icon: "pricetag-outline"   as const, path: ""         },
  { label: "Settings",     icon: "settings-outline"   as const, path: ""     },
];

const LOGOUT_ITEM = { label: "Log Out", icon: "log-out-outline" as const };

// ─── Web tab bar ─────────────────────────────────────────────────────────────

function WebNavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { width } = useWindowDimensions();
  const compact = width < 500;

  const isSecondaryActive = SECONDARY_ITEMS.some(item => pathname === item.path);

  const navigate = (path: string) => {
    setDropdownOpen(false);
    if (pathname === path) return;
    NavTransition.setDirection(pathname, path);
    router.replace(path as any);
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    queryClient.clear();
    router.replace("/landing" as any);
  };

  return (
    <View style={[webStyles.bar, compact && webStyles.barCompact]}>
      <View style={webStyles.tabs}>
        {MENU_ITEMS.map(({ label, icon, path }) => {
          const active = pathname === path || (path === "/garden" && pathname.startsWith("/garden"));
          return (
            <Pressable
              key={path}
              style={({ pressed }) => [
                webStyles.tab,
                compact && webStyles.tabCompact,
                pressed && webStyles.tabPressed,
              ]}
              onPress={() => {
                if (pathname === path) return;
                NavTransition.setDirection(pathname, path);
                router.replace(path as any);
              }}
            >
              <Ionicons name={icon} size={compact ? 22 : 18} color={active ? "#FFE566" : "rgba(255,255,255,0.75)"} />
              {!compact && (
                <Text style={[webStyles.tabLabel, active && webStyles.tabLabelActive]}>
                  {label}
                </Text>
              )}
              {active && <View style={[webStyles.activeUnderline, compact && webStyles.activeUnderlineCompact]} />}
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={() => setDropdownOpen(v => !v)}
        style={[webStyles.avatarBtn, (dropdownOpen || isSecondaryActive) && webStyles.avatarBtnActive]}
      >
        <Image
          source={require("../assets/avatars/gardener_1.png")}
          style={webStyles.avatarImg}
        />
        {isSecondaryActive && <View style={webStyles.avatarUnderline} />}
      </Pressable>

      {dropdownOpen && (
        <Modal visible transparent animationType="none" onRequestClose={() => setDropdownOpen(false)}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setDropdownOpen(false)} />
          <View style={webStyles.dropdown}>
            {SECONDARY_ITEMS.map(({ label, icon, path }) => {
              const active = pathname === path;
              return (
                <Pressable
                  key={path}
                  style={({ pressed }) => [
                    webStyles.dropdownItem,
                    active && webStyles.dropdownItemActive,
                    pressed && webStyles.dropdownItemPressed,
                  ]}
                  onPress={() => navigate(path)}
                >
                  <Ionicons name={icon} size={17} color={active ? GREEN_DARK : "#555"} />
                  <Text style={[webStyles.dropdownLabel, active && webStyles.dropdownLabelActive]}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
            <View style={webStyles.dropdownDivider} />
            <Pressable
              style={({ pressed }) => [webStyles.dropdownItem, pressed && webStyles.dropdownItemPressed]}
              onPress={handleLogout}
            >
              <Ionicons name={LOGOUT_ITEM.icon} size={17} color="#c0392b" />
              <Text style={[webStyles.dropdownLabel, webStyles.dropdownLabelLogout]}>
                {LOGOUT_ITEM.label}
              </Text>
            </Pressable>
          </View>
        </Modal>
      )}
    </View>
  );
}

// ─── Mobile hamburger + drawer ────────────────────────────────────────────────

function MobileNavMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const { data: account } = useQuery<{ displayName: string }>({
    queryKey: ["account"],
    queryFn: () => api.get("/accounts"),
    staleTime: Infinity,
  });
  const translateX = useSharedValue(-DRAWER_WIDTH);

  const openMenu = () => {
    setOpen(true);
    translateX.value = withTiming(0, { duration: 260, easing: Easing.out(Easing.cubic) });
  };

  const closeMenu = () => {
    translateX.value = withTiming(-DRAWER_WIDTH, { duration: 200, easing: Easing.in(Easing.cubic) });
    setTimeout(() => setOpen(false), 210);
  };

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const navigate = (path: string) => {
    if (pathname === path) { closeMenu(); return; }
    closeMenu();
    setTimeout(() => {
      NavTransition.setDirection(pathname, path);
      router.replace(path as any);
    }, 220);
  };

  const handleLogout = async () => {
    closeMenu();
    await logout();
    queryClient.clear();
    setTimeout(() => router.replace("/landing" as any), 220);
  };

  return (
    <>
      <Pressable
        onPress={openMenu}
        style={[mobileStyles.hamburgerBtn, { top: insets.top + 8 }]}
        hitSlop={10}
      >
        <View style={mobileStyles.line} />
        <View style={mobileStyles.line} />
        <View style={mobileStyles.line} />
      </Pressable>

      {open && (
        <Modal visible transparent animationType="none" onRequestClose={closeMenu}>
          <Pressable style={mobileStyles.backdrop} onPress={closeMenu} />
          <Animated.View style={[mobileStyles.drawer, drawerStyle, { paddingTop: insets.top + 20 }]}>
            <View style={mobileStyles.drawerHeader}>
              <Image
                source={require("../assets/avatars/gardener_1.png")}
                style={mobileStyles.drawerAvatar}
              />
              <Text style={mobileStyles.drawerTitle}>{account?.displayName ?? "user"}</Text>
            </View>
            <View style={mobileStyles.divider} />

            {MENU_ITEMS.map(({ label, icon, path }) => (
              <Pressable
                key={path}
                style={({ pressed }) => [mobileStyles.menuItem, pressed && mobileStyles.menuItemPressed]}
                onPress={() => navigate(path)}
              >
                <Ionicons name={icon} size={22} color="#ffffff" />
                <Text style={mobileStyles.menuLabel}>{label}</Text>
              </Pressable>
            ))}

            <View style={mobileStyles.divider} />

            {SECONDARY_ITEMS.map(({ label, icon, path }) => (
              <Pressable
                key={path}
                style={({ pressed }) => [mobileStyles.menuItem, pressed && mobileStyles.menuItemPressed]}
                onPress={() => navigate(path)}
              >
                <Ionicons name={icon} size={20} color="rgba(255,255,255,0.7)" />
                <Text style={mobileStyles.menuLabelSecondary}>{label}</Text>
              </Pressable>
            ))}

            <View style={mobileStyles.divider} />

            <Pressable
              style={({ pressed }) => [mobileStyles.menuItem, pressed && mobileStyles.menuItemPressed]}
              onPress={handleLogout}
            >
              <Ionicons name={LOGOUT_ITEM.icon} size={20} color="rgba(255, 120, 100, 0.9)" />
              <Text style={mobileStyles.menuLabelLogout}>{LOGOUT_ITEM.label}</Text>
            </Pressable>
          </Animated.View>
        </Modal>
      )}
    </>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function NavMenu() {
  return Platform.OS === "web" ? <WebNavBar /> : <MobileNavMenu />;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const webStyles = StyleSheet.create({
  bar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: BAR_HEIGHT,
    zIndex: 100,
    backgroundColor: "rgba(38, 78, 43, 0.92)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    gap: 8,
  },
  barCompact: {
    paddingHorizontal: 12,
    gap: 4,
  },
  tabs: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    position: "relative",
  },
  tabCompact: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 0,
  },
  tabPressed: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  tabLabel: {
    fontFamily: "Nunito_700Bold",
    fontSize: 15,
    color: "rgba(255,255,255,0.75)",
  },
  tabLabelActive: {
    color: "#FFE566",
  },
  activeUnderline: {
    position: "absolute",
    bottom: 2,
    left: 14,
    right: 14,
    height: 2,
    borderRadius: 1,
    backgroundColor: "#FFE566",
  },
  activeUnderlineCompact: {
    left: 10,
    right: 10,
  },
  avatarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    position: "relative",
    marginLeft: 4,
  },
  avatarBtnActive: {
    borderColor: "#FFE566",
  },
  avatarImg: {
    width: 32,
    height: 32,
  },
  avatarUnderline: {
    position: "absolute",
    bottom: -6,
    left: 0,
    right: 0,
    height: 2,
    borderRadius: 1,
    backgroundColor: "#FFE566",
  },
  dropdown: {
    position: "absolute",
    top: BAR_HEIGHT + 6,
    right: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
    minWidth: 180,
    zIndex: 200,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  dropdownItemActive: {
    backgroundColor: "rgba(52, 103, 57, 0.08)",
  },
  dropdownItemPressed: {
    backgroundColor: "rgba(52, 103, 57, 0.12)",
  },
  dropdownLabel: {
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    color: "#333",
  },
  dropdownLabelActive: {
    color: GREEN_DARK,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.08)",
    marginVertical: 4,
    marginHorizontal: 8,
  },
  dropdownLabelLogout: {
    color: "#c0392b",
  },
});

const mobileStyles = StyleSheet.create({
  hamburgerBtn: {
    position: "absolute",
    left: 16,
    zIndex: 100,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(52, 103, 57, 0.88)",
    borderRadius: 10,
  },
  line: {
    width: 20,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: "#ffffff",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.38)",
  },
  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: GREEN_DARK,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 12,
    paddingHorizontal: 20,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  drawerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  drawerTitle: {
    fontFamily: "Nunito_700Bold",
    fontSize: 18,
    color: "#ffffff",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  menuItemPressed: {
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  menuLabel: {
    fontFamily: "Nunito_700Bold",
    fontSize: 17,
    color: "#ffffff",
  },
  menuLabelSecondary: {
    fontFamily: "Nunito_700Bold",
    fontSize: 15,
    color: "rgba(255,255,255,0.7)",
  },
  menuLabelLogout: {
    fontFamily: "Nunito_700Bold",
    fontSize: 15,
    color: "rgba(255, 120, 100, 0.9)",
  },
});
