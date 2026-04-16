import { NavMenu } from "@/components/nav-menu";
import { api, getStoredToken } from "@/lib/api";
import { styles } from "@/styles/create-categories.styles";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type CategoryType = "EXPENSE" | "INCOME";

const ICON_NAMES = [
  "food-outline", "cart-outline", "car-outline", "home-outline",
  "hospital-outline", "school-outline", "airplane-outline", "dumbbell",
  "music-note-outline", "phone-outline", "television-play", "wifi",
  "book-open-outline", "baby-outline", "paw-outline", "gift-outline",
  "coffee-outline", "gamepad-variant-outline", "tshirt-crew-outline", "tools",
  "train", "motorbike", "receipt-outline", "cash-multiple",
  "bank-outline", "wallet-outline", "chart-line", "briefcase-outline",
  "leaf-outline", "heart-outline", "fuel", "shopping-outline",
] as const;

const COLORS = [
  "#E05555", "#E07B35", "#D4A017", "#5BAD6F",
  "#346739", "#3A8FBF", "#5B6EAE", "#9B59B6",
  "#E91E8C", "#795548", "#607D8B", "#546E7A",
];

export default function CreateCategoriesScreen() {
  const params = useLocalSearchParams<{
    categoryId?: string;
    name?: string;
    type?: CategoryType;
    icon?: string;
    color?: string;
  }>();

  const isEdit = !!params.categoryId;

  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [name, setName] = useState(params.name ?? "");
  const [type, setType] = useState<CategoryType>(params.type ?? "EXPENSE");
  const [selectedIcon, setSelectedIcon] = useState<string>(params.icon ?? ICON_NAMES[0]);
  const [selectedColor, setSelectedColor] = useState<string>(params.color ?? COLORS[0]);

  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  useEffect(() => {
    getStoredToken().then(setToken);
  }, []);

  const save = useMutation({
    mutationFn: () => {
      const body = { name: name.trim(), type, icon: selectedIcon, color: selectedColor };
      if (isEdit) return api.patch(`/categories/${params.categoryId}`, body);
      return api.post("/categories", body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      router.canGoBack() ? router.back() : router.replace("/manage-categories");
    },
  });

  const canSave = name.trim().length > 0 && !save.isPending;

  const inputOutline = Platform.select({ web: { outlineStyle: "none" as any, outlineWidth: 0 } });

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
        ]}
      >
        <Text style={styles.headerTitle}>
          {isEdit ? "Edit Category" : "New Category"}
        </Text>
        <View style={styles.headerSubRow}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
            onPress={() => router.canGoBack() ? router.back() : router.replace("/manage-categories")}
          >
            <MaterialCommunityIcons name="chevron-left" size={22} color="#FFFFFF" />
          </Pressable>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.inner}>
            {/* Preview */}
            <View style={styles.previewRow}>
              <View style={[styles.previewIcon, { backgroundColor: selectedColor + "22" }]}>
                <MaterialCommunityIcons name={selectedIcon as any} size={38} color={selectedColor} />
              </View>
              <Text
                style={[styles.previewName, name.trim().length === 0 && styles.previewNamePlaceholder]}
                numberOfLines={2}
              >
                {name.trim().length > 0 ? name.trim() : "Category name"}
              </Text>
            </View>

            {/* Name */}
            <Text style={styles.sectionLabel}>Name</Text>
            <View style={styles.nameBox}>
              <TextInput
                style={[styles.nameInput, inputOutline]}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Groceries"
                placeholderTextColor="#B8D4B8"
                maxLength={40}
                returnKeyType="done"
              />
            </View>

            {/* Type */}
            <Text style={styles.sectionLabel}>Type</Text>
            <View style={styles.typeRow}>
              {(["EXPENSE", "INCOME"] as CategoryType[]).map((t) => (
                <Pressable
                  key={t}
                  style={[styles.typeBtn, type === t && styles.typeBtnActive]}
                  onPress={() => setType(t)}
                >
                  <Text style={[styles.typeBtnText, type === t && styles.typeBtnTextActive]}>
                    {t === "EXPENSE" ? "Expense" : "Income"}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Color */}
            <Text style={styles.sectionLabel}>Color</Text>
            <View style={styles.colorGrid}>
              {COLORS.map((c) => (
                <Pressable
                  key={c}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: c },
                    selectedColor === c && styles.colorSwatchSelected,
                  ]}
                  onPress={() => setSelectedColor(c)}
                />
              ))}
            </View>

            {/* Icon */}
            <Text style={styles.sectionLabel}>Icon</Text>
            <View style={styles.iconGrid}>
              {ICON_NAMES.map((icon) => {
                const selected = selectedIcon === icon;
                return (
                  <Pressable
                    key={icon}
                    style={[
                      styles.iconBtn,
                      selected && styles.iconBtnSelected,
                      selected && { borderColor: selectedColor, backgroundColor: selectedColor + "15" },
                    ]}
                    onPress={() => setSelectedIcon(icon)}
                  >
                    <MaterialCommunityIcons
                      name={icon as any}
                      size={26}
                      color={selected ? selectedColor : "#79AE6F"}
                    />
                  </Pressable>
                );
              })}
            </View>

            {/* Save */}
            <Pressable
              style={({ pressed }) => [
                styles.saveBtn,
                pressed && styles.saveBtnPressed,
                !canSave && styles.saveBtnDisabled,
              ]}
              onPress={() => { if (canSave) save.mutate(); }}
            >
              {save.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveBtnText}>{isEdit ? "Save Changes" : "Create Category"}</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
