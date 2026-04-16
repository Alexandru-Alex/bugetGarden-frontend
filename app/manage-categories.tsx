import { NavMenu } from "@/components/nav-menu";
import { api, getStoredToken } from "@/lib/api";
import { CategoryDto } from "@/lib/types";
import { styles } from "@/styles/manage-categories.styles";
import { sharedStyles } from "@/styles/shared.styles";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Tab = "expenses" | "income";

const COLS = 4;

export default function ManageCategoriesScreen() {
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<Tab>("expenses");
  const [showToast, setShowToast] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    getStoredToken().then(setToken);
  }, []);

  const { data: categories = [], isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get<CategoryDto[]>("/categories"),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });

  const activeType = activeTab === "expenses" ? "EXPENSE" : "INCOME";
  const filtered = categories.filter((c) => c.type === activeType);

  const rows: CategoryDto[][] = [];
  for (let i = 0; i < filtered.length; i += COLS) {
    rows.push(filtered.slice(i, i + COLS));
  }

  const handlePress = (cat: CategoryDto) => {
    if (cat.system) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
      return;
    }
    router.push({
      pathname: "/create-categories",
      params: {
        categoryId: cat.id,
        name: cat.name,
        type: cat.type,
        icon: cat.icon,
        color: cat.color,
        isSystem: cat.system ? "true" : "false",
      },
    });
  };

  if (token === undefined) return null;
  if (!token) return <Redirect href="/landing" />;

  return (
    <View style={styles.root}>
      <NavMenu />
      <LinearGradient
        colors={["#2A4A2E", "#346739"]}
        style={[styles.header, { paddingTop: Platform.OS === "web" ? 56 : insets.top + 56 }]}
      >
        <View style={styles.headerTitleRow}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
            onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)/dashboard")}
          >
            <MaterialCommunityIcons name="chevron-left" size={22} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Categories</Text>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <View style={sharedStyles.tabsExtension}>
        <View style={sharedStyles.typeRow}>
          {(["expenses", "income"] as Tab[]).map((tab) => (
            <Pressable
              key={tab}
              style={[sharedStyles.typeBtn, activeTab === tab && sharedStyles.typeBtnActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[sharedStyles.typeBtnText, activeTab === tab && sharedStyles.typeBtnTextActive]}>
                {tab === "expenses" ? "Expenses" : "Income"}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#346739" />
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Could not load categories. Pull to retry.</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.centered}>
          <MaterialCommunityIcons name="tag-off-outline" size={48} color="#C8DFC6" />
          <Text style={styles.emptyText}>No {activeTab} categories yet</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        >
          <View style={styles.iconGrid}>
            {rows.map((row, rowIdx) => (
              <View key={rowIdx} style={styles.iconRow}>
                {row.map((item) => (
                  <Pressable
                    key={item.id}
                    style={({ pressed }) => [
                      styles.iconTile,
                      { backgroundColor: pressed ? item.color + "30" : item.color + "18" },
                    ]}
                    onPress={() => handlePress(item)}
                  >
                    <MaterialCommunityIcons name={item.icon as any} size={22} color={item.color} />
                  </Pressable>
                ))}
              </View>
            ))}
          </View>

          <Pressable
            style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
            onPress={() =>
              router.push({
                pathname: "/create-categories",
                params: { type: activeType },
              })
            }
          >
            <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
          </Pressable>
        </ScrollView>
      )}
      {showToast && (
        <View style={styles.toast}>
          <MaterialCommunityIcons name="lock-outline" size={18} color="#FFFFFF" />
          <Text style={styles.toastText}>System category — cannot be edited</Text>
        </View>
      )}
    </View>
  );
}
