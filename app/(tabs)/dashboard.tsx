import { AddTransactionModal } from "@/components/add-transaction-modal";
import { NavMenu } from "@/components/nav-menu";
import { PageTransition } from "@/components/page-transition";
import { api, getStoredToken } from "@/lib/api";
import { styles } from "@/styles/tabs/dashboard.styles";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Image, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
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

type Tab = "expenses" | "income";
type Period = "Day" | "Week" | "Month" | "Year" | "Period";
const PERIODS: Period[] = ["Day", "Week", "Month", "Year", "Period"];

const EXPENSE_SEGMENTS = [
  { label: "Rent",      value: 900,  color: "#4E9AF1" },
  { label: "Food",      value: 450,  color: "#E8960A" },
  { label: "Utilities", value: 220,  color: "#F43F5E" },
  { label: "Other",     value: 180,  color: "#8B5CF6" },
];

const INCOME_SEGMENTS = [
  { label: "Salary",    value: 3200, color: "#346739" },
  { label: "Freelance", value: 600,  color: "#4E9AF1" },
];

function currencySymbolFor(currency?: string) {
  const upper = currency?.toUpperCase();
  if (upper === "EUR") return "€";
  if (upper === "GBP") return "£";
  return "$";
}

function formatAmount(amount: number) {
  return amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Donut Chart ─────────────────────────────────────────────────────────────

interface Segment {
  label: string;
  value: number;
  color: string;
}

function DonutChart({ segments, symbol, size = 200, strokeWidth = 30, onAdd }: {
  segments: Segment[];
  symbol: string;
  size?: number;
  strokeWidth?: number;
  onAdd?: () => void;
}) {
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;

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
          </Svg>
          <View style={[StyleSheet.absoluteFill, styles.chartCenter]}>
            <Text style={styles.chartCenterLabel}>Total</Text>
            <Text
              style={[styles.chartCenterAmount, { maxWidth: innerDiameter }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {symbol}{formatAmount(total)}
            </Text>
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
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<Tab>("expenses");
  const [activePeriod, setActivePeriod] = useState<Period>("Month");
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    getStoredToken().then(setToken);
  }, []);

  const { data: account, refetch } = useQuery({
    queryKey: ACCOUNT_QUERY_KEY,
    queryFn: () => api.get<AccountDto>("/accounts"),
    enabled: !!token,
    // staleTime: 30s și gcTime: 5min moștenite din QueryClient global
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (token === undefined) return null;
  if (!token) return <Redirect href="/landing" />;

  const symbol = currencySymbolFor(account?.currency);
  const segments = activeTab === "expenses" ? EXPENSE_SEGMENTS : INCOME_SEGMENTS;
  const total = segments.reduce((s, seg) => s + seg.value, 0);

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
            <Text style={styles.totalAmount}>{symbol}{formatAmount(total)}</Text>
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

          {/* ── Donut chart + add button ── */}
          <DonutChart segments={segments} symbol={symbol} onAdd={() => setShowAddModal(true)} />
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
