import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React, { useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DRAWER_WIDTH = 240;
const GREEN_DARK = "#346739";
const BAR_HEIGHT = 56;

const MENU_ITEMS = [
  { label: "Garden",     icon: "leaf-outline"        as const, path: "/garden"     },
  { label: "Dashboard",  icon: "home-outline"        as const, path: "/dashboard"  },
  { label: "Statistics", icon: "stats-chart-outline" as const, path: "/statistics" },
];

// ─── Web tab bar ─────────────────────────────────────────────────────────────

function WebNavBar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={webStyles.bar}>
      <View style={webStyles.tabs}>
        {MENU_ITEMS.map(({ label, icon, path }) => {
          const active = pathname === path || (path === "/garden" && pathname.startsWith("/garden"));
          return (
            <Pressable
              key={path}
              style={({ pressed }) => [webStyles.tab, pressed && webStyles.tabPressed]}
              onPress={() => router.replace(path as any)}
            >
              <Ionicons name={icon} size={18} color={active ? "#FFE566" : "rgba(255,255,255,0.75)"} />
              <Text style={[webStyles.tabLabel, active && webStyles.tabLabelActive]}>
                {label}
              </Text>
              {active && <View style={webStyles.activeUnderline} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ─── Mobile hamburger + drawer ────────────────────────────────────────────────

function MobileNavMenu() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
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
    closeMenu();
    setTimeout(() => router.replace(path as any), 220);
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
            <Text style={mobileStyles.drawerTitle}>BudgetGarden</Text>
            <View style={mobileStyles.divider} />
            {MENU_ITEMS.map(({ label, icon, path }) => (
              <Pressable
                key={path}
                style={({ pressed }) => [mobileStyles.menuItem, pressed && mobileStyles.menuItemPressed]}
                onPress={() => navigate(path)}
              >
                <Ionicons name={icon} size={22} color={GREEN_DARK} />
                <Text style={mobileStyles.menuLabel}>{label}</Text>
              </Pressable>
            ))}
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
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 12,
    paddingHorizontal: 20,
  },
  drawerTitle: {
    fontFamily: "Pacifico_400Regular",
    fontSize: 22,
    color: GREEN_DARK,
    marginBottom: 14,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5EDE5",
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
    backgroundColor: "#F0F8F0",
  },
  menuLabel: {
    fontFamily: "Nunito_700Bold",
    fontSize: 17,
    color: "#1a3320",
  },
});
