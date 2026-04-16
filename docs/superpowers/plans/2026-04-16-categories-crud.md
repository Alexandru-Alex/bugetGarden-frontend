# Categories CRUD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full categories management flow — a `manage-categories` list screen with Expenses/Income tabs and edit/delete per category, plus a `create-categories` form screen for creating and editing categories.

**Architecture:** `manage-categories.tsx` replaces the existing placeholder with a tabbed FlatList that fetches `GET /categories`, filters by type, and supports delete (`DELETE /categories/{id}`) and navigate-to-edit. `create-categories.tsx` is a new screen with a name input, type selector, icon picker, and color picker, handling both `POST /categories` (create) and `PATCH /categories/{id}` (edit) depending on whether `categoryId` param is present. Styles live in separate files under `styles/`. No test infrastructure exists in this project — skip test steps.

**Tech Stack:** Expo Router, React Native, React Query (`useQuery`, `useMutation`, `useQueryClient`), `@expo/vector-icons` (MaterialCommunityIcons), LinearGradient (expo-linear-gradient), `useSafeAreaInsets`

---

## File Map

| Action | File |
|--------|------|
| Modify | `lib/types.ts` — add `isSystem: boolean` to `CategoryDto` |
| Modify | `components/nav-menu.tsx` — wire `Categories` path to `/manage-categories` |
| Modify | `components/add-transaction-modal.tsx` — wire "Add more" to navigate `/create-categories` |
| Replace | `app/manage-categories.tsx` — tabbed category list with edit/delete |
| Create | `styles/manage-categories.styles.ts` — styles for manage-categories screen |
| Create | `app/create-categories.tsx` — create/edit category form |
| Create | `styles/create-categories.styles.ts` — styles for create-categories screen |

---

## Task 1: Update CategoryDto type

**Files:**
- Modify: `lib/types.ts`

- [ ] **Step 1: Add `isSystem` field**

Replace the entire file content:

```typescript
export interface CategoryDto {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  icon: string;
  color: string;
  isSystem: boolean;
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/types.ts
git commit -m "feat: add isSystem field to CategoryDto"
```

---

## Task 2: Wire Categories nav item + AddTransactionModal "Add more"

**Files:**
- Modify: `components/nav-menu.tsx:28-32`
- Modify: `components/add-transaction-modal.tsx`

- [ ] **Step 1: Wire Categories path in nav-menu**

In `components/nav-menu.tsx`, find the `SECONDARY_ITEMS` array (around line 27-32). Change the Categories item's `path` from `""` to `"/manage-categories"`:

```typescript
const SECONDARY_ITEMS = [
  { label: "Achievements", icon: "trophy-outline"     as const, path: "" },
  { label: "Store",        icon: "storefront-outline" as const, path: ""        },
  { label: "Categories",   icon: "pricetag-outline"   as const, path: "/manage-categories" },
  { label: "Settings",     icon: "settings-outline"   as const, path: ""     },
];
```

- [ ] **Step 2: Wire "Add more" in AddTransactionModal**

In `components/add-transaction-modal.tsx`, `onAddMore` is already called on the "Add more" Pressable. The caller (`dashboard.tsx`) currently passes:

```typescript
onAddMore={() => {
  setShowAddModal(false);
  setTimeout(() => router.push("/manage-categories"), 200);
}}
```

Change that callback in `app/(tabs)/dashboard.tsx` (around line 389-393) to navigate to `/create-categories` instead:

```typescript
onAddMore={() => {
  setShowAddModal(false);
  setTimeout(() => router.push("/create-categories"), 200);
}}
```

- [ ] **Step 3: Commit**

```bash
git add components/nav-menu.tsx app/(tabs)/dashboard.tsx
git commit -m "feat: wire Categories nav and Add more to create-categories"
```

---

## Task 3: Build manage-categories styles

**Files:**
- Create: `styles/manage-categories.styles.ts`

- [ ] **Step 1: Create the styles file**

```typescript
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F8F5",
  },

  // ── Header ──────────────────────────────────────────────────────────────────

  header: {
    paddingBottom: 0,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Nunito_900Black",
    color: "#FFFFFF",
    textAlign: "center",
    paddingTop: 12,
    marginBottom: 12,
  },
  headerSubRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  backBtnPressed: {
    backgroundColor: "rgba(255,255,255,0.28)",
  },
  headerSpacer: {
    width: 32,
  },

  // ── Tabs ────────────────────────────────────────────────────────────────────

  tabRow: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.18)",
    borderRadius: 14,
    padding: 4,
    marginTop: 14,
    marginBottom: 0,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 11,
  },
  tabActive: {
    backgroundColor: "#FFFFFF",
  },
  tabText: {
    fontSize: 14,
    fontFamily: "Nunito_800ExtraBold",
    color: "rgba(255,255,255,0.7)",
  },
  tabTextActive: {
    color: "#346739",
  },

  // ── List ────────────────────────────────────────────────────────────────────

  list: {
    flex: 1,
  },
  listContent: {
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },

  // ── Category card ────────────────────────────────────────────────────────────

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
    marginBottom: 8,
    shadowColor: "#346739",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  cardWide: {
    maxWidth: 480,
    alignSelf: "center",
    width: "100%",
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  cardName: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Nunito_800ExtraBold",
    color: "#1A2A1A",
  },
  systemBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F0F8F0",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  systemBadgeText: {
    fontSize: 11,
    fontFamily: "Nunito_700Bold",
    color: "#79AE6F",
  },
  actionRow: {
    flexDirection: "row",
    gap: 6,
  },
  editBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#EAF3E8",
    justifyContent: "center",
    alignItems: "center",
  },
  editBtnPressed: {
    backgroundColor: "#D5E9D2",
  },
  deleteBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#FFEAEA",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteBtnPressed: {
    backgroundColor: "#FFCECE",
  },

  // ── FAB ─────────────────────────────────────────────────────────────────────

  fab: {
    position: "absolute",
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#346739",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#346739",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  fabPressed: {
    backgroundColor: "#2A4A2E",
  },

  // ── States ───────────────────────────────────────────────────────────────────

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: "Nunito_700Bold",
    color: "#79AE6F",
    textAlign: "center",
    marginTop: 12,
  },
  errorText: {
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
    color: "#FF6B6B",
    textAlign: "center",
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add styles/manage-categories.styles.ts
git commit -m "feat: add manage-categories styles"
```

---

## Task 4: Build manage-categories screen

**Files:**
- Replace: `app/manage-categories.tsx`

- [ ] **Step 1: Replace the placeholder with the full screen**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add app/manage-categories.tsx
git commit -m "feat: implement manage-categories screen with tabs, edit, delete"
```

---

## Task 5: Build create-categories styles

**Files:**
- Create: `styles/create-categories.styles.ts`

- [ ] **Step 1: Create the styles file**

```typescript
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F8F5",
  },

  // ── Header ──────────────────────────────────────────────────────────────────

  header: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Nunito_900Black",
    color: "#FFFFFF",
    textAlign: "center",
    paddingTop: 12,
    marginBottom: 10,
  },
  headerSubRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  backBtnPressed: {
    backgroundColor: "rgba(255,255,255,0.28)",
  },
  headerSpacer: {
    width: 32,
  },

  // ── Scroll ───────────────────────────────────────────────────────────────────

  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  inner: {
    maxWidth: 480,
    alignSelf: "center",
    width: "100%",
  },

  // ── Preview ──────────────────────────────────────────────────────────────────

  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginBottom: 28,
  },
  previewIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  previewName: {
    fontSize: 20,
    fontFamily: "Nunito_900Black",
    color: "#1A2A1A",
    maxWidth: 200,
  },
  previewNamePlaceholder: {
    color: "#B8D4B8",
  },

  // ── Section label ────────────────────────────────────────────────────────────

  sectionLabel: {
    fontSize: 11,
    fontFamily: "Nunito_700Bold",
    color: "#79AE6F",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 4,
  },

  // ── Name input ───────────────────────────────────────────────────────────────

  nameBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: "#C8DFC6",
    shadowColor: "#346739",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  nameInput: {
    fontSize: 16,
    fontFamily: "Nunito_800ExtraBold",
    color: "#1A2A1A",
    padding: 0,
  },

  // ── Type selector ────────────────────────────────────────────────────────────

  typeRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#C8DFC6",
  },
  typeBtnActive: {
    backgroundColor: "#346739",
    borderColor: "#346739",
  },
  typeBtnText: {
    fontSize: 14,
    fontFamily: "Nunito_800ExtraBold",
    color: "#79AE6F",
  },
  typeBtnTextActive: {
    color: "#FFFFFF",
  },

  // ── Color picker ─────────────────────────────────────────────────────────────

  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  colorSwatch: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 2.5,
    borderColor: "transparent",
  },
  colorSwatchSelected: {
    borderColor: "#1A2A1A",
  },

  // ── Icon picker ──────────────────────────────────────────────────────────────

  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 32,
  },
  iconBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#C8DFC6",
  },
  iconBtnSelected: {
    borderWidth: 2.5,
  },

  // ── Save button ───────────────────────────────────────────────────────────────

  saveBtn: {
    backgroundColor: "#346739",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 4,
  },
  saveBtnPressed: {
    backgroundColor: "#2A4A2E",
  },
  saveBtnDisabled: {
    backgroundColor: "#C8DFC6",
  },
  saveBtnText: {
    fontSize: 17,
    fontFamily: "Nunito_900Black",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add styles/create-categories.styles.ts
git commit -m "feat: add create-categories styles"
```

---

## Task 6: Build create-categories screen

**Files:**
- Create: `app/create-categories.tsx`

- [ ] **Step 1: Create the screen**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add app/create-categories.tsx
git commit -m "feat: implement create-categories screen with icon and color pickers"
```

---

## Self-Review Checklist

- [x] **Spec coverage:** types updated ✓, nav wired ✓, Add more wired ✓, manage-categories tabs+list+edit+delete ✓, create-categories form+create+edit ✓, isSystem guard on edit/delete ✓
- [x] **Placeholder scan:** no TBDs, all code blocks complete
- [x] **Type consistency:** `CategoryDto` (with `isSystem`) used throughout; `CategoryType = "EXPENSE" | "INCOME"` consistent across both screens; `api.delete`, `api.post`, `api.patch` match `lib/api.ts` signatures
- [x] **Router back guard:** `router.canGoBack() ? router.back() : router.replace(...)` used in both screens, matching project pattern from memory
