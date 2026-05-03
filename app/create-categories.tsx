import { NavMenu } from "@/components/nav-menu";
import { api, getStoredToken } from "@/lib/api";
import { styles } from "@/styles/create-categories.styles";
import { sharedStyles } from "@/styles/shared.styles";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useQuestProgress } from "@/hooks/use-quest-progress";
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

const ICON_ROWS = [
  // Food & Drink
  ["food", "coffee", "pizza", "beer", "cake-variant", "tea", "glass-wine", "ice-cream"],
  // Transport
  ["car", "airplane", "train", "motorbike", "bicycle", "bus", "taxi", "fuel"],
  // Home & Living
  ["home", "sofa", "television-play", "washing-machine", "lightbulb", "tools", "shower", "bed"],
  // Health & Sport
  ["hospital-box", "pill", "dumbbell", "heart", "soccer", "basketball", "tooth", "shoe-sneaker"],
  // Shopping & Style
  ["cart", "shopping", "gift", "tshirt-crew", "hanger", "shoe-heel", "camera", "sunglasses"],
  // Finance & Work
  ["bank", "wallet", "cash-multiple", "credit-card", "briefcase", "chart-line", "laptop", "phone"],
  // Education & Culture
  ["school", "book-open-variant", "palette", "music", "headphones", "guitar", "ticket", "gamepad-variant"],
  // Nature & Pets
  ["leaf", "flower", "paw", "dog", "cat", "tree", "fish", "dice-multiple"],
] as const;

const COLORS = [
  "#E05555", "#FF7043", "#E07B35", "#F4A623", "#F9C74F",
  "#5BAD6F", "#43AA8B", "#346739", "#2D9CDB", "#3A8FBF",
  "#5B6EAE", "#9B59B6", "#E91E8C", "#6C63FF", "#546E7A",
  "#795548", "#8D6E63", "#607D8B", "#37474F", "#455A64",
];

const COLOR_ROWS = [
  COLORS.slice(0, 5),
  COLORS.slice(5, 10),
  COLORS.slice(10, 15),
  COLORS.slice(15, 20),
];

export default function CreateCategoriesScreen() {
  const params = useLocalSearchParams<{
    categoryId?: string;
    name?: string;
    type?: CategoryType;
    icon?: string;
    color?: string;
    isSystem?: string;
  }>();

  const isEdit = !!params.categoryId;
  const canDelete = isEdit && params.isSystem !== "true";

  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [name, setName] = useState(params.name ?? "");
  const [type, setType] = useState<CategoryType>(params.type ?? "EXPENSE");
  const [selectedIcon, setSelectedIcon] = useState<string>(params.icon ?? ICON_ROWS[0][0]);
  const [selectedColor, setSelectedColor] = useState<string>(params.color ?? COLORS[0]);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { checkProgress } = useQuestProgress();

  useEffect(() => {
    getStoredToken().then(setToken);
  }, []);

  const deleteCategory = useMutation({
    mutationFn: () => api.delete(`/categories/${params.categoryId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      router.replace({ pathname: "/manage-categories", params: { deleted: "true" } });
      void checkProgress();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Could not delete category.";
      setErrorToast(msg);
      setTimeout(() => setErrorToast(null), 3000);
    },
  });

  const handleDelete = () => deleteCategory.mutate();

  const save = useMutation({
    mutationFn: () => {
      const body = { categoryName: name.trim(), type, icon: selectedIcon, color: selectedColor };
      if (isEdit) return api.put("/categories", { ...body, categoryId: params.categoryId });
      return api.post("/categories", body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      router.canGoBack() ? router.back() : router.replace("/manage-categories");
      void checkProgress();
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
        <View style={styles.headerTitleRow}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
            onPress={() => router.canGoBack() ? router.back() : router.replace("/manage-categories")}
          >
            <MaterialCommunityIcons name="chevron-left" size={22} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>
            {isEdit ? "Edit Category" : "New Category"}
          </Text>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <View style={sharedStyles.tabsExtension}>
        <View style={sharedStyles.typeRow}>
          {(["EXPENSE", "INCOME"] as CategoryType[]).map((t) => (
            <Pressable
              key={t}
              style={[sharedStyles.typeBtn, type === t && sharedStyles.typeBtnActive]}
              onPress={() => setType(t)}
            >
              <Text style={[sharedStyles.typeBtnText, type === t && sharedStyles.typeBtnTextActive]}>
                {t === "EXPENSE" ? "Expense" : "Income"}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

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

            {/* Color */}
            <Text style={styles.sectionLabel}>Color</Text>
            <View style={styles.colorGrid}>
              {COLOR_ROWS.map((row, rowIdx) => (
                <View key={rowIdx} style={styles.colorRow}>
                  {row.map((c) => (
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
              ))}
            </View>

            {/* Icon */}
            <Text style={styles.sectionLabel}>Icon</Text>
            <View style={styles.iconGrid}>
              {ICON_ROWS.map((row, rowIdx) => (
                <View key={rowIdx} style={styles.iconRow}>
                  {row.map((icon) => {
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
                          size={22}
                          color={selected ? selectedColor : "#79AE6F"}
                        />
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>

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

            {canDelete && (
              <Pressable
                style={({ pressed }) => [styles.deleteBtn, pressed && styles.deleteBtnPressed]}
                onPress={handleDelete}
              >
                <MaterialCommunityIcons name="trash-can-outline" size={18} color="#E05555" />
                <Text style={styles.deleteBtnText}>Delete Category</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {errorToast && (
        <View style={styles.toast}>
          <MaterialCommunityIcons name="alert-circle-outline" size={18} color="#FFFFFF" />
          <Text style={styles.toastText}>{errorToast}</Text>
        </View>
      )}
    </View>
  );
}
