import { NavMenu } from "@/components/nav-menu";
import { api, getStoredToken } from "@/lib/api";
import { CategoryDto } from "@/lib/types";
import { styles } from "@/styles/manage-categories.styles";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Tab = "expenses" | "income";

export default function ManageCategoriesScreen() {
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<Tab>("expenses");
  const { width } = useWindowDimensions();
  const compact = width < 500;
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  useEffect(() => {
    getStoredToken().then(setToken);
  }, []);

  const { data: categories = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get<CategoryDto[]>("/categories"),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });

  const deleteCategory = useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });

  const activeType = activeTab === "expenses" ? "EXPENSE" : "INCOME";
  const filtered = categories.filter((c) => c.type === activeType);

  const handleEdit = (cat: CategoryDto) => {
    router.push({
      pathname: "/create-categories",
      params: {
        categoryId: cat.id,
        name: cat.name,
        type: cat.type,
        icon: cat.icon,
        color: cat.color,
      },
    });
  };

  const handleDelete = (cat: CategoryDto) => {
    Alert.alert(
      "Delete Category",
      `Are you sure you want to delete "${cat.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteCategory.mutate(cat.id),
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: CategoryDto }) => (
    <View style={[styles.card, !compact && styles.cardWide]}>
      <View style={[styles.iconBox, { backgroundColor: item.color + "18" }]}>
        <MaterialCommunityIcons name={item.icon as any} size={26} color={item.color} />
      </View>
      <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
      {item.isSystem ? (
        <View style={styles.systemBadge}>
          <MaterialCommunityIcons name="lock-outline" size={12} color="#79AE6F" />
          <Text style={styles.systemBadgeText}>System</Text>
        </View>
      ) : (
        <View style={styles.actionRow}>
          <Pressable
            style={({ pressed }) => [styles.editBtn, pressed && styles.editBtnPressed]}
            onPress={() => handleEdit(item)}
          >
            <MaterialCommunityIcons name="pencil-outline" size={18} color="#346739" />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.deleteBtn, pressed && styles.deleteBtnPressed]}
            onPress={() => handleDelete(item)}
          >
            <MaterialCommunityIcons name="trash-can-outline" size={18} color="#E05555" />
          </Pressable>
        </View>
      )}
    </View>
  );

  if (token === undefined) return null;
  if (!token) return <Redirect href="/landing" />;

  return (
    <View style={styles.root}>
      <NavMenu />
      <LinearGradient
        colors={["#2A4A2E", "#346739"]}
        style={[
          styles.header,
          { paddingTop: Platform.OS === "web" ? 56 : insets.top + 56 },
          { paddingBottom: 16 },
        ]}
      >
        <Text style={styles.headerTitle}>Categories</Text>
        <View style={styles.headerSubRow}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
            onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)/dashboard")}
          >
            <MaterialCommunityIcons name="chevron-left" size={22} color="#FFFFFF" />
          </Pressable>
          <View style={styles.tabRow}>
            {(["expenses", "income"] as Tab[]).map((tab) => (
              <Pressable
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab === "expenses" ? "Expenses" : "Income"}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

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
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={false}
        />
      )}

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
    </View>
  );
}
