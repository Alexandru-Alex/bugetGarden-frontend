import { NavMenu } from "@/components/nav-menu";
import { ACCOUNT_QUERY_KEY, AccountDto } from "@/lib/query-keys";
import { api, getStoredToken } from "@/lib/api";
import { currencySymbolFor, formatAmount } from "@/lib/currency";
import { formatDateISO, formatMonthISO } from "@/lib/date";
import { DatePickerField } from "@/components/date-picker-field";
import { MonthPickerField } from "@/components/month-picker-field";
import { styles } from "@/styles/goals.styles";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, Stack, router } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useQuestProgress } from "@/hooks/use-quest-progress";
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
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Constants ─────────────────────────────────────────────────────────────────

const COLORS = [
  "#E05555", "#FF7043", "#E07B35", "#F4A623", "#F9C74F",
  "#5BAD6F", "#43AA8B", "#346739", "#2D9CDB", "#3A8FBF",
  "#5B6EAE", "#9B59B6", "#E91E8C", "#6C63FF", "#546E7A",
  "#795548", "#8D6E63", "#607D8B", "#37474F", "#455A64",
];

const ACTIVE_GOALS_KEY = ["goals", "active"];
const ARCHIVED_GOALS_KEY = ["goals", "archived"];

// ─── Types ─────────────────────────────────────────────────────────────────────

interface GoalDto {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  icon?: string;
  color: string;
  deadline?: string;
  status: "active" | "completed" | "cancelled";
  completedAt?: string;
  deletedAt?: string;
}

interface PageDto<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
}

interface CreateGoalRequest {
  name: string;
  targetAmount: number;
  deadline?: string;
  color: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────



function formatDeadline(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  return `by ${d.toLocaleString("en-US", { month: "short", year: "numeric" })}`;
}

function goalProgress(goal: GoalDto): number {
  return goal.targetAmount > 0 ? Math.min(goal.currentAmount / goal.targetAmount, 1) : 0;
}

// ─── GoalCard ──────────────────────────────────────────────────────────────────

interface GoalCardProps {
  goal: GoalDto;
  symbol: string;
  decimals: number;
  onPress: (goal: GoalDto) => void;
  onMenu: (goal: GoalDto) => void;
}

function GoalCard({ goal, symbol, decimals, onPress, onMenu }: GoalCardProps) {
  const pct = goalProgress(goal);
  const isCompleted = goal.status === "completed";
  const isCancelled = goal.status === "cancelled";

  const progress = useSharedValue(0);
  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    progress.value = withTiming(pct, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [pct]);

  useEffect(() => {
    if (isCompleted) {
      pulseOpacity.value = withSequence(
        withTiming(0.5, { duration: 400 }),
        withTiming(1,   { duration: 400 }),
        withTiming(0.5, { duration: 400 }),
        withTiming(1,   { duration: 400 }),
      );
    }
  }, [isCompleted]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%` as any,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const deadlineLabel = formatDeadline(goal.deadline);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
      onPress={() => onPress(goal)}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.colorDot, { backgroundColor: goal.color }]} />
        <Text style={[styles.cardName, (isCompleted || isCancelled) && { color: "#aaa" }]} numberOfLines={1}>{goal.name}</Text>
        {isCompleted && (
          <Text style={[styles.completedBadge, { backgroundColor: goal.color }]}>
            Completed
          </Text>
        )}
        {isCancelled && (
          <Text style={[styles.completedBadge, { backgroundColor: "#9E9E9E" }]}>
            Cancelled
          </Text>
        )}
        {goal.status === "active" && (
          <Pressable style={styles.menuBtn} onPress={() => onMenu(goal)} hitSlop={8}>
            <MaterialCommunityIcons name="dots-vertical" size={20} color="#bbb" />
          </Pressable>
        )}
      </View>

      {deadlineLabel && (
        <Text style={styles.deadline}>{deadlineLabel}</Text>
      )}

      <View style={styles.amountsRow}>
        <Text style={[styles.amountSaved, (isCompleted || isCancelled) && { color: "#aaa" }]}>{symbol}{formatAmount(goal.currentAmount, decimals)}</Text>
        <Text style={styles.amountTarget}>of {symbol}{formatAmount(goal.targetAmount, decimals)}</Text>
      </View>

      <View style={styles.progressTrack}>
        <Animated.View
          style={[styles.progressFill, { backgroundColor: goal.color }, fillStyle, pulseStyle]}
        />
      </View>
    </Pressable>
  );
}

// ─── CreateGoalModal ───────────────────────────────────────────────────────────

interface CreateGoalModalProps {
  visible: boolean;
  isPending: boolean;
  onClose: () => void;
  onCreate: (req: CreateGoalRequest) => void;
}

function CreateGoalModal({ visible, isPending, onClose, onCreate }: CreateGoalModalProps) {
  const [name, setName] = useState("");
  const [targetInput, setTargetInput] = useState("");
  const [deadlineMonth, setDeadlineMonth] = useState<Date | null>(null);
  const [toast, setToast] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[8]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const resetForm = () => {
    setName("");
    setTargetInput("");
    setDeadlineMonth(null);
    setSelectedColor(COLORS[8]);
  };

  const handleCreate = () => {
    const target = parseFloat(targetInput);
    if (!name.trim() || isNaN(target) || target <= 0) return;

    const deadline = deadlineMonth ? formatMonthISO(deadlineMonth) : undefined;

    onCreate({ name: name.trim(), targetAmount: target, color: selectedColor, deadline });

    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.backdrop}>
            <Pressable style={StyleSheet.absoluteFillObject} onPress={handleClose} />
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={{ width: "100%", paddingHorizontal: 20 }}
            >
              <View
                style={[styles.modalCard, { width: "100%", maxWidth: 400, alignSelf: "center" }]}
                {...(Platform.OS === "web" ? { onClick: (e: any) => e.stopPropagation() } : {})}
              >
                <Text style={styles.modalTitle}>New Goal</Text>

                <Text style={styles.fieldLabel}>Name</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    Platform.select({ web: { outlineStyle: "none", outlineWidth: 0 } as any }),
                  ]}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Emergency Fund"
                  placeholderTextColor="#bbb"
                />

                <Text style={styles.fieldLabel}>Target amount</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    Platform.select({ web: { outlineStyle: "none", outlineWidth: 0 } as any }),
                  ]}
                  value={targetInput}
                  onChangeText={v => setTargetInput(v.replace(/[^0-9.]/g, ""))}
                  keyboardType="number-pad"
                  placeholder="0.00"
                  placeholderTextColor="#bbb"
                />

                <Text style={styles.fieldLabel}>Deadline (optional)</Text>
                <MonthPickerField value={deadlineMonth} onChange={setDeadlineMonth} />

                <Text style={styles.fieldLabel}>Color</Text>
                <View style={styles.colorGrid}>
                  {COLORS.map(color => (
                    <Pressable
                      key={color}
                      style={[styles.colorSwatch, { backgroundColor: color }]}
                      onPress={() => setSelectedColor(color)}
                    >
                      {selectedColor === color && (
                        <MaterialCommunityIcons name="check" size={16} color="#fff" />
                      )}
                    </Pressable>
                  ))}
                </View>

                <View style={styles.modalButtons}>
                  <Pressable style={styles.cancelBtn} onPress={handleClose}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.saveBtn, isPending && { opacity: 0.6 }]}
                    onPress={handleCreate}
                    disabled={isPending}
                  >
                    <Text style={styles.saveText}>{isPending ? "Saving…" : "Create"}</Text>
                  </Pressable>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
        {!!toast && (
          <View style={styles.toast} pointerEvents="none">
            <Text style={styles.toastText}>{toast}</Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

// ─── AddTransactionModal ───────────────────────────────────────────────────────

type GoalTransactionType = "DEPOSIT" | "WITHDRAW";

interface AddTransactionModalProps {
  goal: GoalDto | null;
  symbol: string;
  decimals: number;
  isPending: boolean;
  onClose: () => void;
  onAdd: (goalId: string, amount: number, type: GoalTransactionType, date: string, note?: string) => void;
}

function AddTransactionModal({ goal, symbol, decimals, isPending, onClose, onAdd }: AddTransactionModalProps) {
  const [amountInput, setAmountInput] = useState("");
  const [txType, setTxType] = useState<GoalTransactionType>("DEPOSIT");
  const [txDate, setTxDate] = useState(new Date());
  const [note, setNote] = useState("");

  if (!goal) return null;

  const resetForm = () => {
    setAmountInput("");
    setTxType("DEPOSIT");
    setTxDate(new Date());
    setNote("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const pct = goalProgress(goal);

  const handleConfirm = () => {
    const amount = parseFloat(amountInput);
    if (isNaN(amount) || amount <= 0) return;
    const dateStr = formatDateISO(txDate);
    onAdd(goal.id, amount, txType, dateStr, note.trim() || undefined);
    resetForm();
    onClose();
  };

  return (
    <Modal visible={!!goal} transparent animationType="fade" onRequestClose={handleClose}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.backdrop}>
            <Pressable style={StyleSheet.absoluteFillObject} onPress={handleClose} />
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={{ width: "100%", paddingHorizontal: 20 }}
            >
              <View
                style={[styles.modalCard, { width: "100%", maxWidth: 400, alignSelf: "center" }]}
                {...(Platform.OS === "web" ? { onClick: (e: any) => e.stopPropagation() } : {})}
              >
                <Text style={styles.modalTitle}>{goal.name}</Text>

                <View style={styles.amountsRow}>
                  <Text style={styles.amountSaved}>{symbol}{formatAmount(goal.currentAmount, decimals)}</Text>
                  <Text style={styles.amountTarget}>of {symbol}{formatAmount(goal.targetAmount, decimals)}</Text>
                </View>
                <View style={[styles.progressTrack, { marginBottom: 20 }]}>
                  <View
                    style={[
                      styles.progressFill,
                      { backgroundColor: goal.color, width: `${pct * 100}%` as any },
                    ]}
                  />
                </View>

                <View style={styles.typeRow}>
                  <Pressable
                    style={[styles.tabPill, txType === "DEPOSIT" && styles.tabPillActive]}
                    onPress={() => setTxType("DEPOSIT")}
                  >
                    <Text style={[styles.tabPillText, txType === "DEPOSIT" && styles.tabPillTextActive]}>
                      Deposit
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.tabPill, txType === "WITHDRAW" && styles.tabPillActive]}
                    onPress={() => setTxType("WITHDRAW")}
                  >
                    <Text style={[styles.tabPillText, txType === "WITHDRAW" && styles.tabPillTextActive]}>
                      Withdraw
                    </Text>
                  </Pressable>
                </View>

                <Text style={styles.fieldLabel}>Amount</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    { color: "#346739" },
                    Platform.select({ web: { outlineStyle: "none", outlineWidth: 0 } as any }),
                  ]}
                  value={amountInput}
                  onChangeText={v => setAmountInput(v.replace(/[^0-9.]/g, ""))}
                  keyboardType="number-pad"
                  placeholder="0.00"
                  placeholderTextColor="#bbb"
                  autoFocus
                />

                <Text style={styles.fieldLabel}>Date</Text>
                <View style={styles.datePickerWrapper}>
                  <DatePickerField value={txDate} onChange={setTxDate} />
                </View>

                <Text style={styles.fieldLabel}>Note (optional)</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    { color: "#346739" },
                    Platform.select({ web: { outlineStyle: "none", outlineWidth: 0 } as any }),
                  ]}
                  value={note}
                  onChangeText={setNote}
                  placeholder="e.g. Monthly savings"
                  placeholderTextColor="#bbb"
                />

                <View style={styles.modalButtons}>
                  <Pressable style={styles.cancelBtn} onPress={handleClose}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.saveBtn, isPending && { opacity: 0.6 }]}
                    onPress={handleConfirm}
                    disabled={isPending}
                  >
                    <Text style={styles.saveText}>
                      {isPending ? "Saving…" : txType === "DEPOSIT" ? "Deposit" : "Withdraw"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
    </Modal>
  );
}

// ─── Screen ────────────────────────────────────────────────────────────────────

export default function GoalsScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { checkProgress } = useQuestProgress();
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");
  const [archivedEverOpened, setArchivedEverOpened] = useState(false);
  const [menuGoal, setMenuGoal] = useState<GoalDto | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [addFundsGoal, setAddFundsGoal] = useState<GoalDto | null>(null);
  const [sortBy, setSortBy] = useState<"deadline" | "target" | null>(null);

  useEffect(() => {
    getStoredToken().then(setToken);
  }, []);

  const { data: account } = useQuery<AccountDto>({
    queryKey: ACCOUNT_QUERY_KEY,
    queryFn: () => api.get<AccountDto>("/accounts"),
    enabled: !!token,
    staleTime: Infinity,
  });

  const { data: activeGoals = [], isLoading: activeLoading } = useQuery<GoalDto[]>({
    queryKey: ACTIVE_GOALS_KEY,
    queryFn: async () => {
      const page = await api.get<PageDto<GoalDto>>("/goals?page=0&size=20&status=active");
      return page.content;
    },
    enabled: !!token,
    staleTime: Infinity,
  });

  const { data: archivedGoals = [], isLoading: archivedLoading } = useQuery<GoalDto[]>({
    queryKey: ARCHIVED_GOALS_KEY,
    queryFn: async () => {
      const [completed, cancelled] = await Promise.all([
        api.get<PageDto<GoalDto>>("/goals?page=0&size=20&status=completed"),
        api.get<PageDto<GoalDto>>("/goals?page=0&size=20&status=cancelled"),
      ]);
      return [...completed.content, ...cancelled.content];
    },
    enabled: !!token && archivedEverOpened,
    staleTime: Infinity,
  });

  const symbol = currencySymbolFor(account?.currency);
  const decimals = account?.numberOfDecimals ?? 2;

  const { totalSaved, totalTarget } = useMemo(() => ({
    totalSaved: activeGoals.reduce((s, g) => s + g.currentAmount, 0),
    totalTarget: activeGoals.reduce((s, g) => s + g.targetAmount, 0),
  }), [activeGoals]);

  const isLoading = activeTab === "active" ? activeLoading : archivedLoading;

  const sortedGoals = useMemo(() => {
    const base = activeTab === "active" ? activeGoals : archivedGoals;
    if (sortBy === "deadline") {
      return [...base].sort((a, b) => {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return a.deadline.localeCompare(b.deadline);
      });
    }
    if (sortBy === "target") {
      return [...base].sort((a, b) => b.targetAmount - a.targetAmount);
    }
    return base;
  }, [activeTab, activeGoals, archivedGoals, sortBy]);

  const handleTabChange = (tab: "active" | "archived") => {
    setActiveTab(tab);
    if (tab === "archived" && !archivedEverOpened) {
      setArchivedEverOpened(true);
    }
  };

  const createMutation = useMutation({
    mutationFn: (req: CreateGoalRequest) => api.post<GoalDto>("/goals", req),
    onSuccess: (newGoal) => {
      if (newGoal) {
        queryClient.setQueryData<GoalDto[]>(ACTIVE_GOALS_KEY, prev => [...(prev ?? []), newGoal]);
      } else {
        queryClient.invalidateQueries({ queryKey: ACTIVE_GOALS_KEY });
      }
      void checkProgress();
    },
  });

  const updateFundsMutation = useMutation({
    mutationFn: (req: { goalId: string; amount: number; type: GoalTransactionType; date: string; note?: string }) =>
      api.post<GoalDto>("/goals/transaction", req),
    onSuccess: (updatedGoal, { goalId, amount, type }) => {
      queryClient.setQueryData<GoalDto[]>(ACTIVE_GOALS_KEY, (prev): GoalDto[] =>
        (prev ?? []).map(g => {
          if (g.id !== goalId) return g;
          if (updatedGoal) return updatedGoal;
          const delta = type === "DEPOSIT" ? amount : -amount;
          return { ...g, currentAmount: g.currentAmount + delta };
        })
      );
      queryClient.invalidateQueries({ queryKey: ["goal-transactions", goalId] });
      void checkProgress();
    },
  });

  const handleAddFunds = (goalId: string, amount: number, type: GoalTransactionType, date: string, note?: string) => {
    updateFundsMutation.mutate({ goalId, amount, type, date, note });
  };

  const deleteMutation = useMutation({
    mutationFn: (goal: GoalDto) => api.delete(`/goals?goalId=${goal.id}`),
    onSuccess: (_, goal) => {
      const key = goal.status === "active" ? ACTIVE_GOALS_KEY : ARCHIVED_GOALS_KEY;
      queryClient.setQueryData<GoalDto[]>(key, (prev): GoalDto[] =>
        (prev ?? []).filter(g => g.id !== goal.id)
      );
      void checkProgress();
    },
  });

  const handleDelete = (goal: GoalDto) => {
    setMenuGoal(null);
    deleteMutation.mutate(goal);
  };

  const handleOpenAddFunds = (goal: GoalDto) => {
    setMenuGoal(null);
    setAddFundsGoal(goal);
  };

  if (token === undefined) return null;
  if (!token) return <Redirect href="/landing" />;

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <NavMenu />

      <LinearGradient
        colors={["#2A4A2E", "#346739"]}
        style={[styles.header, { paddingTop: Platform.OS === "web" ? 56 : insets.top + 56 }]}
      >
        <View style={styles.headerInner}>
          <Text style={styles.headerTitle}>Goals</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardLabel}>Total Saved</Text>
              <Text style={styles.summaryCardAmount}>{symbol}{formatAmount(totalSaved, decimals)}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardLabel}>Total Target</Text>
              <Text style={styles.summaryCardAmount}>{symbol}{formatAmount(totalTarget, decimals)}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.tabRow}>
        <Pressable
          style={[styles.tabPill, activeTab === "active" && styles.tabPillActive]}
          onPress={() => handleTabChange("active")}
        >
          <Text style={[styles.tabPillText, activeTab === "active" && styles.tabPillTextActive]}>
            Active
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabPill, activeTab === "archived" && styles.tabPillActive]}
          onPress={() => handleTabChange("archived")}
        >
          <Text style={[styles.tabPillText, activeTab === "archived" && styles.tabPillTextActive]}>
            Archived
          </Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sortRow}>
          <Pressable
            style={({ pressed }) => [styles.sortBtn, pressed && styles.sortBtnPressed]}
            onPress={() => setSortBy(s => s === null ? "deadline" : s === "deadline" ? "target" : null)}
          >
            <MaterialCommunityIcons
              name={sortBy === "deadline" ? "sort-calendar-ascending" : sortBy === "target" ? "sort-numeric-descending" : "sort-variant"}
              size={14}
              color="#79AE6F"
            />
            <Text style={styles.sortBtnText}>
              {sortBy === "deadline" ? "Deadline" : sortBy === "target" ? "Target" : "Sort"}
            </Text>
          </Pressable>
        </View>

        {isLoading && (
          <Text style={styles.emptyText}>Loading...</Text>
        )}
        {!isLoading && sortedGoals.length === 0 && (
          <Text style={styles.emptyText}>
            {activeTab === "active" ? "No goals yet. Tap + to create one." : "No archived goals."}
          </Text>
        )}
        {!isLoading && sortedGoals.map(goal => (
          <GoalCard
            key={goal.id}
            goal={goal}
            symbol={symbol}
            decimals={decimals}
            onPress={(g) =>
              router.push({
                pathname: "/goals/transaction",
                params: { goalId: g.id, goalName: g.name, goalColor: g.color, symbol, goalStatus: g.status },
              })
            }
            onMenu={setMenuGoal}
          />
        ))}
      </ScrollView>

      {activeTab === "active" && (
        <Pressable style={styles.fab} onPress={() => setCreateOpen(true)}>
          <Ionicons name="add" size={28} color="#fff" />
        </Pressable>
      )}

      <Modal
        visible={!!menuGoal}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuGoal(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setMenuGoal(null)}>
          <View
            style={styles.actionCard}
            {...(Platform.OS === "web" ? { onClick: (e: any) => e.stopPropagation() } : {})}
          >
            <Text style={styles.actionCardTitle} numberOfLines={1}>{menuGoal?.name}</Text>
            <View style={styles.actionDivider} />
            {activeTab === "active" && (
              <Pressable
                style={({ pressed }) => [styles.actionItem, pressed && styles.actionItemPressed]}
                onPress={() => menuGoal && handleOpenAddFunds(menuGoal)}
              >
                <MaterialCommunityIcons name="plus-circle-outline" size={18} color="#346739" />
                <Text style={styles.actionItemText}>Add transaction</Text>
              </Pressable>
            )}
            <Pressable
              style={({ pressed }) => [styles.actionItem, pressed && styles.actionItemPressed]}
              onPress={() => menuGoal && handleDelete(menuGoal)}
            >
              <MaterialCommunityIcons name="trash-can-outline" size={18} color="#E74C3C" />
              <Text style={[styles.actionItemText, styles.actionItemTextDanger]}>Delete goal</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <CreateGoalModal
        visible={createOpen}
        isPending={createMutation.isPending}
        onClose={() => setCreateOpen(false)}
        onCreate={createMutation.mutate}
      />

      <AddTransactionModal
        goal={addFundsGoal}
        symbol={symbol}
        decimals={decimals}
        isPending={updateFundsMutation.isPending}
        onClose={() => setAddFundsGoal(null)}
        onAdd={handleAddFunds}
      />
    </View>
  );
}
