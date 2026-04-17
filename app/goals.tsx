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
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
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

// ─── Types ─────────────────────────────────────────────────────────────────────

interface GoalDto {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  color: string;
  deadline?: string; // "YYYY-MM-DD"
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

// ─── GoalCard ──────────────────────────────────────────────────────────────────

interface GoalCardProps {
  goal: GoalDto;
  symbol: string;
  onMenu: (goal: GoalDto) => void;
}

function GoalCard({ goal, symbol, onMenu }: GoalCardProps) {
  const pct = Math.min(goal.savedAmount / goal.targetAmount, 1);
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

// ─── Screen ────────────────────────────────────────────────────────────────────

export default function GoalsScreen() {
  const insets = useSafeAreaInsets();
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [goals, setGoals] = useState<GoalDto[]>(MOCK_GOALS);
  const [menuGoal, setMenuGoal] = useState<GoalDto | null>(null);

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

      {/* FAB — wired in Task 4 */}
      <Pressable style={styles.fab} onPress={() => {}}>
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>

      {/* Action menu modal */}
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
            {/* Add Funds — wired in Task 4 */}
            <Pressable
              style={({ pressed }) => [styles.actionItem, pressed && styles.actionItemPressed]}
              onPress={() => setMenuGoal(null)}
            >
              <MaterialCommunityIcons name="plus-circle-outline" size={18} color="#346739" />
              <Text style={styles.actionItemText}>Add funds</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.actionItem, pressed && styles.actionItemPressed]}
              onPress={() => {
                if (!menuGoal) return;
                setGoals(prev => prev.filter(g => g.id !== menuGoal.id));
                setMenuGoal(null);
              }}
            >
              <MaterialCommunityIcons name="trash-can-outline" size={18} color="#E74C3C" />
              <Text style={[styles.actionItemText, styles.actionItemTextDanger]}>Delete goal</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
