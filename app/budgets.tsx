import { NavMenu } from "@/components/nav-menu";
import { api, getStoredToken } from "@/lib/api";
import { CategoryDto } from "@/lib/types";
import { styles } from "@/styles/budgets.styles";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useMemo, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BudgetItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  limit: number;
  spent: number;
  remaining: number;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_BUDGETED: BudgetItem[] = [
  { id: "1", name: "Food", icon: "food", color: "#E67E22", limit: 500, spent: 320, remaining: 180 },
  { id: "2", name: "Transport", icon: "car", color: "#3498DB", limit: 200, spent: 170, remaining: 30 },
  { id: "3", name: "Entertainment", icon: "ticket", color: "#9B59B6", limit: 150, spent: 40, remaining: 110 },
];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function progressColor(spent: number, limit: number): string {
  const pct = spent / limit;
  if (pct > 0.8) return "#E74C3C";
  if (pct > 0.6) return "#FFE566";
  return "#79AE6F";
}

function progressWidth(spent: number, limit: number): `${number}%` {
  return `${Math.min(Math.round((spent / limit) * 100), 100)}%`;
}

function formatAmount(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function BudgetsScreen() {
  const insets = useSafeAreaInsets();
  const [token, setToken] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    getStoredToken().then(setToken);
  }, []);

  const [period, setPeriod] = useState(() => {
    const d = new Date();
    return { month: d.getMonth() + 1, year: d.getFullYear() };
  });
  const [budgeted, setBudgeted] = useState<BudgetItem[]>(MOCK_BUDGETED);
  const [modalCategory, setModalCategory] = useState<CategoryDto | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [budgetInput, setBudgetInput] = useState("");
  const [menuItem, setMenuItem] = useState<BudgetItem | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get<CategoryDto[]>("/categories"),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });

  const { totalBudget, totalSpent } = useMemo(() => ({
    totalBudget: budgeted.reduce((s, b) => s + b.limit, 0),
    totalSpent: budgeted.reduce((s, b) => s + b.spent, 0),
  }), [budgeted]);

  const notBudgeted = useMemo(
    () => categories.filter(c => c.type === "EXPENSE" && !budgeted.some(b => b.id === c.id)),
    [categories, budgeted],
  );

  const prevMonth = () =>
    setPeriod(p => p.month === 1 ? { month: 12, year: p.year - 1 } : { ...p, month: p.month - 1 });

  const nextMonth = () =>
    setPeriod(p => p.month === 12 ? { month: 1, year: p.year + 1 } : { ...p, month: p.month + 1 });

  const periodLabel = `${MONTH_NAMES[period.month - 1]} ${period.year}`;

  if (token === undefined) return null;
  if (!token) return <Redirect href="/landing" />;

  const handleSaveBudget = () => {
    if (!modalCategory) return;
    const limit = parseInt(budgetInput, 10);
    if (isNaN(limit) || limit <= 0) return;
    if (editingId) {
      setBudgeted(prev => prev.map(b => b.id === editingId ? { ...b, limit, remaining: limit - b.spent } : b));
      setEditingId(null);
    } else {
      setBudgeted(prev => [...prev, { ...modalCategory, limit, spent: 0, remaining: limit }]);
    }
    setModalCategory(null);
    setBudgetInput("");
  };

  const handleCloseModal = () => {
    setModalCategory(null);
    setEditingId(null);
    setBudgetInput("");
  };

  const handleChangeLimit = (item: BudgetItem) => {
    setMenuItem(null);
    setEditingId(item.id);
    setModalCategory({ id: item.id, name: item.name, icon: item.icon, color: item.color, type: "EXPENSE", system: false });
    setBudgetInput(String(item.limit));
  };

  const handleDeleteBudget = (item: BudgetItem) => {
    setMenuItem(null);
    setBudgeted(prev => prev.filter(b => b.id !== item.id));
  };

  return (
    <View style={styles.root}>
      <NavMenu />
      <LinearGradient
        colors={["#2A4A2E", "#346739"]}
        style={[styles.header, { paddingTop: Platform.OS === "web" ? 56 : insets.top + 56 }]}
      >
        <View style={styles.headerInner}>
          <Text style={styles.headerTitle}>Budgets</Text>
          <View style={styles.monthSelector}>
            <Pressable style={styles.monthArrow} onPress={prevMonth}>
              <MaterialCommunityIcons name="chevron-left" size={22} color="#fff" />
            </Pressable>
            <Text style={styles.monthLabel}>{periodLabel}</Text>
            <Pressable style={styles.monthArrow} onPress={nextMonth}>
              <MaterialCommunityIcons name="chevron-right" size={22} color="#fff" />
            </Pressable>
          </View>
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, styles.summaryCardBudget]}>
              <Text style={styles.summaryCardLabel}>Total Budget</Text>
              <Text style={styles.summaryCardAmount}>${formatAmount(totalBudget)}</Text>
            </View>
            <View style={[styles.summaryCard, styles.summaryCardSpent]}>
              <Text style={styles.summaryCardLabel}>Total Spent</Text>
              <Text style={styles.summaryCardAmount}>${formatAmount(totalSpent)}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Budgeted categories */}
        <Text style={styles.sectionHeader}>Budget categories: {periodLabel}</Text>
        {budgeted.map((item, idx) => (
          <React.Fragment key={item.id}>
            <View style={styles.categoryRow}>
              <View style={[styles.categoryIcon, { backgroundColor: item.color + "18" }]}>
                <MaterialCommunityIcons name={item.icon as any} size={22} color={item.color} />
              </View>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{item.name}</Text>
                <View style={styles.categoryMeta}>
                  <Text style={styles.categoryMetaText}>Limit: ${formatAmount(item.limit)}</Text>
                  <Text style={styles.categoryMetaText}>·</Text>
                  <Text style={styles.categoryMetaText}>Spent: ${formatAmount(item.spent)}</Text>
                  <Text style={styles.categoryMetaText}>·</Text>
                  <Text style={styles.categoryMetaText}>Remaining: ${formatAmount(item.remaining)}</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: progressWidth(item.spent, item.limit),
                        backgroundColor: progressColor(item.spent, item.limit),
                      },
                    ]}
                  />
                </View>
              </View>
              <Pressable style={styles.menuBtn} onPress={() => setMenuItem(item)} hitSlop={8}>
                <MaterialCommunityIcons name="dots-vertical" size={20} color="#9FCB98" />
              </Pressable>
            </View>
            {idx < budgeted.length - 1 && <View style={styles.divider} />}
          </React.Fragment>
        ))}

        <View style={styles.sectionSpacer} />

        {/* Not budgeted */}
        <Text style={styles.sectionHeader}>Not budgeted this month</Text>
        {notBudgeted.map((cat, idx) => (
          <React.Fragment key={cat.id}>
            <View style={styles.categoryRow}>
              <View style={[styles.categoryIcon, { backgroundColor: cat.color + "18" }]}>
                <MaterialCommunityIcons name={cat.icon as any} size={22} color={cat.color} />
              </View>
              <Text style={styles.notBudgetedName}>{cat.name}</Text>
              <Pressable style={styles.setButton} onPress={() => setModalCategory(cat)}>
                <Text style={styles.setButtonText}>Set budget</Text>
              </Pressable>
            </View>
            {idx < notBudgeted.length - 1 && <View style={styles.divider} />}
          </React.Fragment>
        ))}
      </ScrollView>

      {/* Action menu modal */}
      <Modal
        visible={!!menuItem}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuItem(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setMenuItem(null)}>
          <View
            style={styles.actionCard}
            {...(Platform.OS === "web" ? { onClick: (e: any) => e.stopPropagation() } : {})}
          >
            <View style={styles.actionCategoryRow}>
              <View style={[styles.categoryIcon, { backgroundColor: (menuItem?.color ?? "#ccc") + "18" }]}>
                <MaterialCommunityIcons name={(menuItem?.icon ?? "tag") as any} size={20} color={menuItem?.color ?? "#ccc"} />
              </View>
              <Text style={styles.actionCategoryName}>{menuItem?.name}</Text>
            </View>
            <View style={styles.actionDivider} />
            <Pressable
              style={({ pressed }) => [styles.actionItem, pressed && styles.actionItemPressed]}
              onPress={() => menuItem && handleChangeLimit(menuItem)}
            >
              <MaterialCommunityIcons name="pencil-outline" size={18} color="#346739" />
              <Text style={styles.actionItemText}>Change limit</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.actionItem, pressed && styles.actionItemPressed]}
              onPress={() => menuItem && handleDeleteBudget(menuItem)}
            >
              <MaterialCommunityIcons name="trash-can-outline" size={18} color="#E74C3C" />
              <Text style={[styles.actionItemText, styles.actionItemTextDanger]}>Delete budget</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Set budget modal */}
      <Modal
        visible={!!modalCategory}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.backdrop}>
            <Pressable style={StyleSheet.absoluteFillObject} onPress={handleCloseModal} />
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
              <View
                style={[styles.modalCard, { maxWidth: 300, width: "90%" }]}
                {...(Platform.OS === "web" ? { onClick: (e: any) => e.stopPropagation() } : {})}
              >
                <Text style={styles.modalTitle}>Set budget</Text>
                <View style={styles.modalCategoryRow}>
                  <View style={[styles.modalCategoryIcon, { backgroundColor: (modalCategory?.color ?? "#ccc") + "18" }]}>
                    <MaterialCommunityIcons name={(modalCategory?.icon ?? "tag") as any} size={26} color={modalCategory?.color ?? "#ccc"} />
                  </View>
                  <Text style={styles.modalCategoryName}>{modalCategory?.name}</Text>
                  <View style={styles.modalCategoryIconSpacer} />
                </View>
                <Text style={styles.modalFieldLabel}>Limit</Text>
                <TextInput
                  style={[
                    styles.modalInput,
                    Platform.select({ web: { outlineStyle: "none", outlineWidth: 0 } as any }),
                  ]}
                  value={budgetInput}
                  onChangeText={v => {
                    const cleaned = v.replace(/[^0-9]/g, "");
                    setBudgetInput(cleaned);
                  }}
                  keyboardType="number-pad"
                  placeholder="0.00"
                  placeholderTextColor="#bbb"
                />
                <Text style={styles.modalFieldLabel}>Month</Text>
                <Text style={styles.modalMonthValue}>{periodLabel}</Text>
                <View style={styles.modalButtons}>
                  <Pressable style={styles.modalCancelBtn} onPress={handleCloseModal}>
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </Pressable>
                  <Pressable style={styles.modalSaveBtn} onPress={handleSaveBudget}>
                    <Text style={styles.modalSaveText}>Set</Text>
                  </Pressable>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
