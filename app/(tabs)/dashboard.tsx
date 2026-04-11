import { AddTransactionModal } from "@/components/add-transaction-modal";
import { DatePickerField } from "@/components/date-picker-field";
import { NavMenu } from "@/components/nav-menu";
import { PageTransition } from "@/components/page-transition";
import { api, getStoredToken } from "@/lib/api";
import { styles } from "@/styles/tabs/dashboard.styles";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, G } from "react-native-svg";

export interface AccountDto {
  email: string;
  displayName: string;
  goldCoins: number;
  totalScore: number;
  currency: string;
}

// Importat din orice ecran care face POST /transactions pentru a invalida cache-ul
export const ACCOUNT_QUERY_KEY = ["account"] as const;

interface FinancialSummaryItem {
  name: string;
  color: string;
  total: string | number;
}

type Tab = "expenses" | "income";
type Period = "Day" | "Week" | "Month" | "Year" | "Period";
const PERIODS: Period[] = ["Day", "Week", "Month", "Year", "Period"];

function buildSummaryPath(
  type: "EXPENSE" | "INCOME",
  period: Period,
  startDate: string,
  endDate: string,
): string | null {
  const t = `type=${type}`;
  if (period === "Period") {
    if (!startDate || !endDate) return null;
    return `/financial-entries/summary?${t}&start=${startDate}&end=${endDate}`;
  }
  return `/financial-entries/summary?${t}&period=${period.toUpperCase()}`;
}

function currencySymbolFor(currency?: string) {
  const upper = currency?.toUpperCase();
  if (upper === "EUR") return "€";
  if (upper === "GBP") return "£";
  return "$";
}

function formatAmount(amount: number) {
  return amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function netTotalColor(net: number, income: number): string {
  if (income <= 0 && net >= 0) return "#FFFFFF";
  if (income <= 0) return "#FF6B6B";
  const pct = net / income;
  if (pct > 0.5) return "#FFFFFF";
  if (pct >= 0.25) return "#FFE566";
  if (pct > 0) return "#FFAA44";
  return "#FF6B6B";
}

// ─── Donut Chart ─────────────────────────────────────────────────────────────

interface Segment {
  label: string;
  value: number;
  color: string;
}

function DonutChart({ segments, symbol, isLoading, size = 200, strokeWidth = 30, onAdd }: {
  segments: Segment[];
  symbol: string;
  isLoading?: boolean;
  size?: number;
  strokeWidth?: number;
  onAdd?: () => void;
}) {
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  const displayTotal = segments.reduce((s, seg) => s + seg.value, 0);
  const total = displayTotal || 1; // evită împărțirea la zero în procentaje
  const isEmpty = !isLoading && segments.length === 0;

  let cumulative = 0;
  const innerDiameter = (radius - strokeWidth / 2) * 2;

  return (
    <View style={styles.chartWrapper}>
      {/* Cerc centrat, buton + în dreapta */}
      <View style={styles.chartRow}>
        <View style={{ flex: 1 }} />
        <View style={{ width: size, height: size }}>
          <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
            <Circle
              cx={cx} cy={cy} r={radius}
              fill="none" stroke="#E5E5E5" strokeWidth={strokeWidth}
            />
            {!isLoading && !isEmpty && (
              <G rotation="-90" origin={`${cx}, ${cy}`}>
                {segments.map((seg, i) => {
                  const length = (seg.value / total) * circumference;
                  const dashOffset = -cumulative;
                  cumulative += length;
                  return (
                    <Circle
                      key={i}
                      cx={cx} cy={cy} r={radius}
                      fill="none"
                      stroke={seg.color}
                      strokeWidth={strokeWidth}
                      strokeDasharray={`${length} ${circumference - length}`}
                      strokeDashoffset={dashOffset}
                      strokeLinecap="butt"
                    />
                  );
                })}
              </G>
            )}
          </Svg>
          <View style={[StyleSheet.absoluteFill, styles.chartCenter]}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#346739" />
            ) : isEmpty ? (
              <Text style={styles.chartCenterLabel}>No data</Text>
            ) : (
              <>
                <Text style={styles.chartCenterLabel}>Total</Text>
                <Text
                  style={[styles.chartCenterAmount, { maxWidth: innerDiameter }]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {symbol}{formatAmount(displayTotal)}
                </Text>
              </>
            )}
          </View>
        </View>
        <View style={{ flex: 1, alignSelf: "stretch", alignItems: "flex-start", justifyContent: "flex-end", paddingLeft: 16 }}>
          <Pressable
            style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
            onPress={onAdd}
          >
            <Text style={styles.addButtonText}>+</Text>
          </Pressable>
        </View>
      </View>

      {/* Categorii sub cerc */}
      {!isLoading && segments.length > 0 && (
        <View style={styles.legend}>
          {segments.map((seg) => {
            const pct = Math.round((seg.value / total) * 100);
            return (
              <View key={seg.label} style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: seg.color }]} />
                <Text style={styles.legendLabel}>{seg.label}</Text>
                <Text style={styles.legendValue}>
                  {symbol}{formatAmount(seg.value)}
                  {"  "}<Text style={styles.legendPct}>{pct}%</Text>
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<Tab>("expenses");
  const [activePeriod, setActivePeriod] = useState<Period>("Month");
  const [startDateObj, setStartDateObj] = useState<Date | null>(null);
  const [endDateObj, setEndDateObj] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    getStoredToken().then(setToken);
  }, []);

  const { data: account, refetch: refetchAccount } = useQuery({
    queryKey: ACCOUNT_QUERY_KEY,
    queryFn: () => api.get<AccountDto>("/accounts"),
    enabled: !!token,
  });

  const formatDateISO = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const startDate = useMemo(() => startDateObj ? formatDateISO(startDateObj) : "", [startDateObj]);
  const endDate = useMemo(() => endDateObj ? formatDateISO(endDateObj) : "", [endDateObj]);

  const expenseSummaryPath = buildSummaryPath("EXPENSE", activePeriod, startDate, endDate);
  const incomeSummaryPath = buildSummaryPath("INCOME", activePeriod, startDate, endDate);

  const { data: expenseSummaryItems, isLoading: expenseSummaryLoading, refetch: refetchExpenseSummary } = useQuery({
    queryKey: ["summary", "EXPENSE", activePeriod, startDate, endDate],
    queryFn: () => api.get<FinancialSummaryItem[]>(expenseSummaryPath!),
    enabled: !!token && expenseSummaryPath !== null,
    staleTime: 30_000,
  });

  const { data: incomeSummaryItems, isLoading: incomeSummaryLoading, refetch: refetchIncomeSummary } = useQuery({
    queryKey: ["summary", "INCOME", activePeriod, startDate, endDate],
    queryFn: () => api.get<FinancialSummaryItem[]>(incomeSummaryPath!),
    enabled: !!token && incomeSummaryPath !== null,
    staleTime: 30_000,
  });

  const summaryItems = activeTab === "expenses" ? expenseSummaryItems : incomeSummaryItems;
  const summaryLoading = activeTab === "expenses" ? expenseSummaryLoading : incomeSummaryLoading;

  const segments: Segment[] = (summaryItems ?? []).map((item) => ({
    label: item.name,
    value: Number(item.total),
    color: item.color,
  }));

  const incomeTotal = (incomeSummaryItems ?? []).reduce((s, item) => s + Number(item.total), 0);
  const expenseTotal = (expenseSummaryItems ?? []).reduce((s, item) => s + Number(item.total), 0);
  const netTotal = incomeTotal - expenseTotal;
  const totalColor = netTotalColor(netTotal, incomeTotal);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchAccount(), refetchExpenseSummary(), refetchIncomeSummary()]);
    setRefreshing(false);
  }, [refetchAccount, refetchExpenseSummary, refetchIncomeSummary]);

  if (token === undefined) return null;
  if (!token) return <Redirect href="/landing" />;

  const symbol = currencySymbolFor(account?.currency);

  return (
    <PageTransition style={styles.root}>
      <NavMenu />
      {/* ── Green header ── */}
      <LinearGradient
        colors={["#2A4A2E", "#346739"]}
        style={[styles.header, Platform.OS === "web" && { paddingTop: 56 }]}
      >
        <SafeAreaView edges={["top"]}>
          <View style={styles.totalSection}>
            <View style={styles.totalLabelRow}>
              <View style={{ flex: 1 }} />
              <Text style={styles.totalLabel}>Total</Text>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <View style={styles.coinWidget}>
                  <Image source={require("@/assets/images/coin.png")} style={styles.coinImage} />
                  <View style={styles.coinRow}>
                    <Text style={styles.coinAmount}>{account?.goldCoins ?? 0}</Text>
                    <Pressable style={({ pressed }) => [styles.coinAddBtn, pressed && styles.coinAddBtnPressed]}>
                      <Text style={styles.coinAddText}>+</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
            <Text style={[styles.totalAmount, { color: totalColor }]}>{symbol}{formatAmount(netTotal)}</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* ── White card ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#346739"
            colors={["#346739"]}
          />
        }
      >
        <View style={styles.card}>
          {/* ── Tabs ── */}
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

          {/* ── Period selector ── */}
          <View style={styles.periodRow}>
            {PERIODS.map((p) => (
              <Pressable
                key={p}
                style={[styles.periodBtn, activePeriod === p && styles.periodBtnActive]}
                onPress={() => setActivePeriod(p)}
              >
                <Text style={[styles.periodText, activePeriod === p && styles.periodTextActive]}>
                  {p}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* ── Date range — only for Period ── */}
          {activePeriod === "Period" && (
            <View style={styles.dateRangeRow}>
              <View style={styles.dateField}>
                <Text style={styles.dateFieldLabel}>From</Text>
                <DatePickerField value={startDateObj} onChange={setStartDateObj} quickPicks={false} />
              </View>
              <View style={styles.dateField}>
                <Text style={styles.dateFieldLabel}>To</Text>
                <DatePickerField value={endDateObj} onChange={setEndDateObj} quickPicks={false} />
              </View>
            </View>
          )}

          {/* ── Donut chart + add button ── */}
          <DonutChart
            segments={segments}
            symbol={symbol}
            isLoading={summaryLoading}
            onAdd={() => setShowAddModal(true)}
          />
        </View>
      </ScrollView>
      <AddTransactionModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        symbol={symbol}
      />
    </PageTransition>
  );
}
