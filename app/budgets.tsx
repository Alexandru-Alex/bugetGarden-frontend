import { NavMenu } from "@/components/nav-menu";
import { ACCOUNT_QUERY_KEY, AccountDto } from "@/app/(tabs)/dashboard";
import { api, getStoredToken } from "@/lib/api";
import { CategoryDto } from "@/lib/types";
import { styles } from "@/styles/budgets.styles";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

interface BudgetDto {
  categoryId: string;
  name: string;
  icon: string;
  color: string;
  budgetId: string;
  limit: number;
  spent: number;
  remaining: number;
}

type BudgetItem = BudgetDto;

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

function currencySymbolFor(currency?: string): string {
  const upper = currency?.toUpperCase();
  if (upper === "EUR") return "€";
  if (upper === "GBP") return "£";
  return "$";
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function BudgetsScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    getStoredToken().then(setToken);
  }, []);

  const [period, setPeriod] = useState(() => {
    const d = new Date();
    return { month: d.getMonth() + 1, year: d.getFullYear() };
  });

  const now = new Date();
  const isCurrentMonth = period.month === now.getMonth() + 1 && period.year === now.getFullYear();

  const [restrictedToast, setRestrictedToast] = useState(false);
  const showRestrictedToast = () => {
    setRestrictedToast(true);
    setTimeout(() => setRestrictedToast(false), 3000);
  };

  const [modalCategory, setModalCategory] = useState<CategoryDto | null>(null);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [budgetInput, setBudgetInput] = useState("");
  const [menuItem, setMenuItem] = useState<BudgetItem | null>(null);

  const budgetsKey = ["budgets", period.month, period.year];

  const createBudget = useMutation({
    mutationFn: (vars: { categoryId: string; limit: number }) =>
      api.post<BudgetDto>("/budgets", {
        year: period.year,
        month: period.month,
        limit: vars.limit,
        categoryId: vars.categoryId,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: budgetsKey }),
  });

  const updateBudget = useMutation({
    mutationFn: (vars: { budgetId: string; amount: number }) =>
      api.put<BudgetDto>("/budgets", { budgetId: vars.budgetId, amount: vars.amount }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: budgetsKey }),
  });

  const deleteBudget = useMutation({
    mutationFn: (budgetId: string) => api.delete(`/budgets?budgetId=${budgetId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: budgetsKey }),
  });

  const { data: budgeted = [] } = useQuery({
    queryKey: budgetsKey,
    queryFn: () => api.get<BudgetDto[]>(`/budgets?month=${period.month}&year=${period.year}`),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get<CategoryDto[]>("/categories"),
    enabled: !!token && isCurrentMonth,
    staleTime: 5 * 60 * 1000,
  });

  const { data: account } = useQuery<AccountDto>({
    queryKey: ACCOUNT_QUERY_KEY,
    queryFn: () => api.get<AccountDto>("/accounts"),
    enabled: !!token,
    staleTime: Infinity,
  });

  const symbol = currencySymbolFor(account?.currency);

  const { totalBudget, totalSpent } = useMemo(() => ({
    totalBudget: budgeted.reduce((s, b) => s + b.limit, 0),
    totalSpent: budgeted.reduce((s, b) => s + b.spent, 0),
  }), [budgeted]);

  const notBudgeted = useMemo(
    () => categories.filter(c => c.type === "EXPENSE" && !budgeted.some(b => b.categoryId === c.id)),
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
    if (editingBudgetId) {
      updateBudget.mutate({ budgetId: editingBudgetId, amount: limit });
      setEditingBudgetId(null);
    } else {
      createBudget.mutate({ categoryId: modalCategory.id, limit });
    }
    setModalCategory(null);
    setBudgetInput("");
  };

  const handleCloseModal = () => {
    setModalCategory(null);
    setEditingBudgetId(null);
    setBudgetInput("");
  };

  const handleChangeLimit = (item: BudgetItem) => {
    setMenuItem(null);
    setEditingBudgetId(item.budgetId);
    setModalCategory({ id: item.categoryId, name: item.name, icon: item.icon, color: item.color, type: "EXPENSE", system: false });
    setBudgetInput(String(item.limit));
  };

  const handleDeleteBudget = (item: BudgetItem) => {
    setMenuItem(null);
    deleteBudget.mutate(item.budgetId);
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
              <Text style={styles.summaryCardAmount}>{symbol}{formatAmount(totalBudget)}</Text>
            </View>
            <View style={[styles.summaryCard, styles.summaryCardSpent]}>
              <Text style={styles.summaryCardLabel}>Total Spent</Text>
              <Text style={styles.summaryCardAmount}>{symbol}{formatAmount(totalSpent)}</Text>
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
        {budgeted.length === 0 && (
          <Text style={styles.emptyText}>You haven't set any budgets for this month</Text>
        )}
        {budgeted.map((item, idx) => (
          <React.Fragment key={item.budgetId}>
            <View style={styles.categoryRow}>
              <View style={[styles.categoryIcon, { backgroundColor: item.color + "18" }]}>
                <MaterialCommunityIcons name={item.icon as any} size={22} color={item.color} />
              </View>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{item.name}</Text>
                <View style={styles.categoryMeta}>
                  <Text style={styles.categoryMetaText}>Limit: {symbol}{formatAmount(item.limit)}</Text>
                  <Text style={styles.categoryMetaText}>·</Text>
                  <Text style={[styles.categoryMetaText, item.spent > item.limit && { color: "#E74C3C" }]}>Spent: {symbol}{formatAmount(item.spent)}</Text>
                  <Text style={styles.categoryMetaText}>·</Text>
                  <Text style={[styles.categoryMetaText, item.spent > item.limit && { color: "#E74C3C" }]}>
                    Remaining: {symbol}{formatAmount(item.spent > item.limit ? 0 : item.remaining)}
                  </Text>
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
                {item.spent > item.limit && (
                  <Text style={styles.limitExceededText}>*Limit exceeded</Text>
                )}
              </View>
              <Pressable style={styles.menuBtn} onPress={() => setMenuItem(item)} hitSlop={8}>
                <MaterialCommunityIcons name="dots-vertical" size={20} color="#9FCB98" />
              </Pressable>
            </View>
            {idx < budgeted.length - 1 && <View style={styles.divider} />}
          </React.Fragment>
        ))}

        {isCurrentMonth && (
          <>
            <View style={styles.sectionSpacer} />
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
          </>
        )}
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
              style={({ pressed }) => [
                styles.actionItem,
                pressed && isCurrentMonth && styles.actionItemPressed,
                !isCurrentMonth && styles.actionItemDisabled,
              ]}
              onPress={() => {
                if (!isCurrentMonth) { showRestrictedToast(); return; }
                menuItem && handleChangeLimit(menuItem);
              }}
            >
              <MaterialCommunityIcons name="pencil-outline" size={18} color={isCurrentMonth ? "#346739" : "#bbb"} />
              <Text style={[styles.actionItemText, !isCurrentMonth && styles.actionItemTextDisabled]}>
                Change limit
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.actionItem,
                pressed && isCurrentMonth && styles.actionItemPressed,
                !isCurrentMonth && styles.actionItemDisabled,
              ]}
              onPress={() => {
                if (!isCurrentMonth) { showRestrictedToast(); return; }
                menuItem && handleDeleteBudget(menuItem);
              }}
            >
              <MaterialCommunityIcons name="trash-can-outline" size={18} color={isCurrentMonth ? "#E74C3C" : "#bbb"} />
              <Text style={[styles.actionItemText, isCurrentMonth ? styles.actionItemTextDanger : styles.actionItemTextDisabled]}>
                Delete budget
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {restrictedToast && (
        <View style={styles.restrictedToast} pointerEvents="none">
          <Text style={styles.restrictedToastText}>
            You can only set budgets for the current month
          </Text>
        </View>
      )}

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
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={{ width: "100%", paddingHorizontal: 20 }}
            >
              <View
                style={[styles.modalCard, { width: "100%", maxWidth: 400, alignSelf: "center" }]}
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
