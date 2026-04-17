import { NavMenu } from "@/components/nav-menu";
import { ACCOUNT_QUERY_KEY, AccountDto } from "@/app/(tabs)/dashboard";
import { api, getStoredToken } from "@/lib/api";
import { styles } from "@/styles/goals.styles";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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

// ─── Types ─────────────────────────────────────────────────────────────────────

interface GoalDto {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  color: string;
  deadline?: string;
}

// ─── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_GOALS: GoalDto[] = [
  { id: "1", name: "Emergency Fund",  targetAmount: 5000, savedAmount: 3200, color: "#4A90D9" },
  { id: "2", name: "Vacation",        targetAmount: 2000, savedAmount: 2000, color: "#E67E22", deadline: "2026-07-01" },
  { id: "3", name: "New Laptop",      targetAmount: 1500, savedAmount: 400,  color: "#9B59B6", deadline: "2026-12-01" },
  { id: "4", name: "Car Repair Fund", targetAmount: 800,  savedAmount: 120,  color: "#E74C3C" },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function currencySymbolFor(currency?: string): string {
  const upper = currency?.toUpperCase();
  if (upper === "EUR") return "€";
  if (upper === "GBP") return "£";
  return "$";
}

function formatAmount(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDeadline(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  return `by ${d.toLocaleString("en-US", { month: "short", year: "numeric" })}`;
}

function newId(): string {
  return Math.random().toString(36).slice(2);
}

// ─── GoalCard ──────────────────────────────────────────────────────────────────

interface GoalCardProps {
  goal: GoalDto;
  symbol: string;
  onMenu: (goal: GoalDto) => void;
}

function GoalCard({ goal, symbol, onMenu }: GoalCardProps) {
  const pct = goal.targetAmount > 0 ? Math.min(goal.savedAmount / goal.targetAmount, 1) : 0;
  const isCompleted = goal.savedAmount >= goal.targetAmount;

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
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.colorDot, { backgroundColor: goal.color }]} />
        <Text style={styles.cardName} numberOfLines={1}>{goal.name}</Text>
        {isCompleted && (
          <Text style={[styles.completedBadge, { backgroundColor: goal.color }]}>
            Completed
          </Text>
        )}
        <Pressable style={styles.menuBtn} onPress={() => onMenu(goal)} hitSlop={8}>
          <MaterialCommunityIcons name="dots-vertical" size={20} color="#bbb" />
        </Pressable>
      </View>

      {deadlineLabel && (
        <Text style={styles.deadline}>{deadlineLabel}</Text>
      )}

      <View style={styles.amountsRow}>
        <Text style={styles.amountSaved}>{symbol}{formatAmount(goal.savedAmount)}</Text>
        <Text style={styles.amountTarget}>of {symbol}{formatAmount(goal.targetAmount)}</Text>
      </View>

      <View style={styles.progressTrack}>
        <Animated.View
          style={[styles.progressFill, { backgroundColor: goal.color }, fillStyle, pulseStyle]}
        />
      </View>
    </View>
  );
}

// ─── CreateGoalModal ───────────────────────────────────────────────────────────

interface CreateGoalModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (goal: GoalDto) => void;
}

function CreateGoalModal({ visible, onClose, onCreate }: CreateGoalModalProps) {
  const [name, setName] = useState("");
  const [targetInput, setTargetInput] = useState("");
  const [deadlineInput, setDeadlineInput] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[8]);

  const handleCreate = () => {
    const target = parseFloat(targetInput);
    if (!name.trim() || isNaN(target) || target <= 0) return;

    let deadline: string | undefined;
    if (deadlineInput.trim()) {
      const [month, year] = deadlineInput.split("/");
      const m = parseInt(month, 10);
      const y = parseInt(year, 10);
      if (!isNaN(m) && !isNaN(y) && m >= 1 && m <= 12) {
        deadline = `${y}-${String(m).padStart(2, "0")}-01`;
      }
    }

    onCreate({
      id: newId(),
      name: name.trim(),
      targetAmount: target,
      savedAmount: 0,
      color: selectedColor,
      deadline,
    });

    setName("");
    setTargetInput("");
    setDeadlineInput("");
    setSelectedColor(COLORS[8]);
    onClose();
  };

  const handleClose = () => {
    setName("");
    setTargetInput("");
    setDeadlineInput("");
    setSelectedColor(COLORS[8]);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.backdrop}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={handleClose} />
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <View
              style={styles.modalCard}
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

              <Text style={styles.fieldLabel}>Deadline (optional, MM/YYYY)</Text>
              <TextInput
                style={[
                  styles.textInput,
                  Platform.select({ web: { outlineStyle: "none", outlineWidth: 0 } as any }),
                ]}
                value={deadlineInput}
                onChangeText={setDeadlineInput}
                placeholder="e.g. 12/2026"
                placeholderTextColor="#bbb"
                keyboardType="default"
              />

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
                <Pressable style={styles.saveBtn} onPress={handleCreate}>
                  <Text style={styles.saveText}>Create</Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

// ─── AddFundsModal ─────────────────────────────────────────────────────────────

interface AddFundsModalProps {
  goal: GoalDto | null;
  symbol: string;
  onClose: () => void;
  onAdd: (goalId: string, amount: number) => void;
}

function AddFundsModal({ goal, symbol, onClose, onAdd }: AddFundsModalProps) {
  const [amountInput, setAmountInput] = useState("");

  if (!goal) return null;

  const handleClose = () => {
    setAmountInput("");
    onClose();
  };

  const pct = goal.targetAmount > 0 ? Math.min(goal.savedAmount / goal.targetAmount, 1) : 0;

  const handleAdd = () => {
    const amount = parseFloat(amountInput);
    if (isNaN(amount) || amount <= 0) return;
    onAdd(goal.id, amount);
    setAmountInput("");
    onClose();
  };

  return (
    <Modal visible={!!goal} transparent animationType="fade" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.backdrop}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={handleClose} />
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <View
              style={styles.modalCard}
              {...(Platform.OS === "web" ? { onClick: (e: any) => e.stopPropagation() } : {})}
            >
              <Text style={styles.modalTitle}>{goal.name}</Text>

              <View style={styles.amountsRow}>
                <Text style={styles.amountSaved}>{symbol}{formatAmount(goal.savedAmount)}</Text>
                <Text style={styles.amountTarget}>of {symbol}{formatAmount(goal.targetAmount)}</Text>
              </View>
              <View style={[styles.progressTrack, { marginBottom: 20 }]}>
                <View
                  style={[
                    styles.progressFill,
                    { backgroundColor: goal.color, width: `${pct * 100}%` as any },
                  ]}
                />
              </View>

              <Text style={styles.fieldLabel}>Amount to add</Text>
              <TextInput
                style={[
                  styles.textInput,
                  Platform.select({ web: { outlineStyle: "none", outlineWidth: 0 } as any }),
                ]}
                value={amountInput}
                onChangeText={v => setAmountInput(v.replace(/[^0-9.]/g, ""))}
                keyboardType="number-pad"
                placeholder="0.00"
                placeholderTextColor="#bbb"
                autoFocus
              />

              <View style={styles.modalButtons}>
                <Pressable style={styles.cancelBtn} onPress={handleClose}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.saveBtn} onPress={handleAdd}>
                  <Text style={styles.saveText}>Add</Text>
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
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [goals, setGoals] = useState<GoalDto[]>(MOCK_GOALS);
  const [menuGoal, setMenuGoal] = useState<GoalDto | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [addFundsGoal, setAddFundsGoal] = useState<GoalDto | null>(null);

  useEffect(() => {
    getStoredToken().then(setToken);
  }, []);

  const { data: account } = useQuery<AccountDto>({
    queryKey: ACCOUNT_QUERY_KEY,
    queryFn: () => api.get<AccountDto>("/accounts"),
    enabled: !!token,
    staleTime: Infinity,
  });

  const symbol = currencySymbolFor(account?.currency);

  const { totalSaved, totalTarget } = useMemo(() => ({
    totalSaved: goals.reduce((s, g) => s + g.savedAmount, 0),
    totalTarget: goals.reduce((s, g) => s + g.targetAmount, 0),
  }), [goals]);

  const handleCreate = (goal: GoalDto) => {
    setGoals(prev => [...prev, goal]);
  };

  const handleAddFunds = (goalId: string, amount: number) => {
    setGoals(prev =>
      prev.map(g => g.id === goalId ? { ...g, savedAmount: g.savedAmount + amount } : g)
    );
  };

  const handleDelete = (goal: GoalDto) => {
    setGoals(prev => prev.filter(g => g.id !== goal.id));
    setMenuGoal(null);
  };

  const handleOpenAddFunds = (goal: GoalDto) => {
    setMenuGoal(null);
    setAddFundsGoal(goal);
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
        <View style={styles.headerInner}>
          <Text style={styles.headerTitle}>Goals</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardLabel}>Total Saved</Text>
              <Text style={styles.summaryCardAmount}>{symbol}{formatAmount(totalSaved)}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardLabel}>Total Target</Text>
              <Text style={styles.summaryCardAmount}>{symbol}{formatAmount(totalTarget)}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {goals.length === 0 && (
          <Text style={styles.emptyText}>No goals yet. Tap + to create one.</Text>
        )}
        {goals.map(goal => (
          <GoalCard key={goal.id} goal={goal} symbol={symbol} onMenu={setMenuGoal} />
        ))}
      </ScrollView>

      <Pressable style={styles.fab} onPress={() => setCreateOpen(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>

      {/* Action menu */}
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
            <Pressable
              style={({ pressed }) => [styles.actionItem, pressed && styles.actionItemPressed]}
              onPress={() => menuGoal && handleOpenAddFunds(menuGoal)}
            >
              <MaterialCommunityIcons name="plus-circle-outline" size={18} color="#346739" />
              <Text style={styles.actionItemText}>Add funds</Text>
            </Pressable>
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
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />

      <AddFundsModal
        goal={addFundsGoal}
        symbol={symbol}
        onClose={() => setAddFundsGoal(null)}
        onAdd={handleAddFunds}
      />
    </View>
  );
}
