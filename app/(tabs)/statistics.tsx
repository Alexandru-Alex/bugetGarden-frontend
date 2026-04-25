import { BarType, StatBarChart, SummaryItem } from "@/components/stat-bar-chart";
import { StatCategoryChart } from "@/components/stat-category-chart";
import { GoalsPeriodItem, StatGoalsChart } from "@/components/stat-goals-chart";
import { BAR_HEIGHT, NavMenu } from "@/components/nav-menu";
import { PageTransition } from "@/components/page-transition";
import { ACCOUNT_QUERY_KEY, AccountDto } from "@/app/(tabs)/dashboard";
import { api, getStoredToken } from "@/lib/api";
import { PAGE_SIZE, PagedResponse } from "@/lib/types";
import { styles } from "@/styles/tabs/statistics.styles";
import { sharedStyles } from "@/styles/shared.styles";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type StatTab = "GENERAL" | "EXPENSES" | "INCOME";
type StatPeriod = "YEAR" | "MONTH" | "WEEK" | "DAY";

interface TransactionItem {
  id: string;
  amount: number;
  description: string;
  entryDate: string;
  categoryName: string;
  icon: string;
  color: string;
}

interface SelectedBar {
  barType: BarType;
  item: SummaryItem;
}

const STAT_TABS: StatTab[] = ["GENERAL", "EXPENSES", "INCOME"];
const STAT_PERIODS: StatPeriod[] = ["YEAR", "MONTH", "WEEK", "DAY"];
const TAB_LABELS: Record<StatTab, string> = { GENERAL: "General", EXPENSES: "Expenses", INCOME: "Income" };
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatAmount(amount: number) {
  return amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatEntryDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${parseInt(day, 10)} ${MONTHS_SHORT[parseInt(month, 10) - 1]} ${year}`;
}

function toReferenceDate(label: string, period: StatPeriod): string {
  if (period === "YEAR") {
    return `${label.trim()}-01-01`;
  }
  if (period === "MONTH") {
    const parts = label.trim().split(" ");
    const monthIdx = MONTHS_SHORT.indexOf(parts[0]);
    const month = String(monthIdx + 1).padStart(2, "0");
    return `${parts[1]}-${month}-01`;
  }
  const iso = label.trim().match(/\d{4}-\d{2}-\d{2}/);
  if (iso) return iso[0];
  // WEEK labels: "4/13" or "4/13 - 4/19" — take the first M/D
  const md = label.trim().match(/^(\d{1,2})\/(\d{1,2})/);
  if (md) {
    const year = new Date().getFullYear();
    const month = String(parseInt(md[1], 10)).padStart(2, "0");
    const day = String(parseInt(md[2], 10)).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  return new Date().toISOString().slice(0, 10);
}

function barLabel(barType: BarType, item: SummaryItem, symbol: string): string {
  const inc = item.income ?? 0;
  const exp = item.expenses ?? 0;
  const profit = inc - exp;
  if (barType === "income") return `Income: ${symbol}${formatAmount(inc)}`;
  if (barType === "expense") return `Expense: ${symbol}${formatAmount(exp)}`;
  return `${profit >= 0 ? "Profit" : "Loss"}: ${symbol}${formatAmount(Math.abs(profit))}`;
}

function currencySymbolFor(currency?: string) {
  const upper = currency?.toUpperCase();
  if (upper === "EUR") return "€";
  if (upper === "GBP") return "£";
  return "$";
}

export default function StatisticsScreen() {
  const [token, setToken] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    getStoredToken().then(setToken);
  }, []);

  if (token === undefined) return null;
  if (!token) return <Redirect href="/landing" />;

  return <StatisticsContent />;
}

function StatisticsContent() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<StatTab>("GENERAL");
  const [activePeriod, setActivePeriod] = useState<StatPeriod>("MONTH");
  const [selectedBar, setSelectedBar] = useState<SelectedBar | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: account } = useQuery<AccountDto>({
    queryKey: ACCOUNT_QUERY_KEY,
    queryFn: () => api.get<AccountDto>("/accounts"),
    staleTime: 5 * 60 * 1000,
  });

  const symbol = currencySymbolFor(account?.currency);

  const showToast = useCallback(
    (msg: string) => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      setToastMsg(msg);
      toastTimer.current = setTimeout(() => setToastMsg(null), 3000);
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const { data: summaryData = [], isLoading: summaryLoading } = useQuery({
    queryKey: ["statistics-summary", activeTab, activePeriod],
    queryFn: () =>
      api.get<SummaryItem[]>(`/statistics/summary?type=${activeTab}&period=${activePeriod}`),
    staleTime: 5 * 60 * 1000,
  });

  const { data: goalsData = [], isLoading: goalsLoading } = useQuery({
    queryKey: ["statistics-goals", activePeriod],
    queryFn: () => api.get<GoalsPeriodItem[]>(`/statistics/goals?period=${activePeriod}`),
    staleTime: 5 * 60 * 1000,
  });

  const txEnabled = selectedBar !== null && selectedBar.barType !== "profit";

  const txReferenceDate = useMemo(() => {
    if (!selectedBar) return "";
    return toReferenceDate(selectedBar.item.label, activePeriod);
  }, [selectedBar, activePeriod]);

  const txType = useMemo<StatTab>(
    () =>
      selectedBar?.barType === "income" ? "INCOME" :
      selectedBar?.barType === "expense" ? "EXPENSES" :
      activeTab,
    [selectedBar?.barType, activeTab],
  );

  const {
    data: txPages,
    isLoading: txLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["statistics-transactions", txType, activePeriod, txReferenceDate],
    queryFn: ({ pageParam = 0 }) =>
      api.get<PagedResponse<TransactionItem>>(
        `/statistics/transactions?type=${txType}&period=${activePeriod}&referenceDate=${txReferenceDate}&page=${pageParam}&size=${PAGE_SIZE}`,
      ),
    getNextPageParam: (lastPage) =>
      lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 0,
    enabled: txEnabled && txReferenceDate !== "",
    staleTime: 0,
  });

  const transactions = useMemo(
    () => txPages?.pages.flatMap((p) => p.content ?? []) ?? [],
    [txPages],
  );

  const handleTxScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!txEnabled || !hasNextPage || isFetchingNextPage) return;
      const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
      if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 120) fetchNextPage();
    },
    [txEnabled, hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  const handleBarPress = useCallback(
    (item: SummaryItem, barType: BarType) => {
      showToast(barLabel(barType, item, symbol));
      if (barType !== "profit") {
        setSelectedBar({ barType, item });
      }
    },
    [showToast, symbol],
  );

  const handleCategoryBarPress = useCallback(
    (item: SummaryItem) => {
      const value = activeTab === "INCOME" ? (item.income ?? 0) : (item.expenses ?? 0);
      showToast(`${item.label}: ${symbol}${formatAmount(value)}`);
    },
    [showToast, symbol, activeTab],
  );

  function handleTabChange(tab: StatTab) {
    setActiveTab(tab);
    setSelectedBar(null);
  }

  function handlePeriodChange(period: StatPeriod) {
    setActivePeriod(period);
    setSelectedBar(null);
  }

  const CHART_TITLES: Record<StatTab, string> = {
    GENERAL: "Income, Expenses & Profit",
    EXPENSES: "Expenses Overview",
    INCOME: "Income Overview",
  };

  function renderChart() {
    if (summaryLoading) {
      return <View style={styles.chartLoader}><ActivityIndicator color="#346739" /></View>;
    }
    if (summaryData.length === 0) {
      return <View style={styles.chartEmpty}><Text style={styles.chartEmptyText}>No data for this period</Text></View>;
    }
    if (activeTab === "GENERAL") {
      return <StatBarChart data={summaryData} onBarPress={handleBarPress} />;
    }
    return <StatCategoryChart data={summaryData} type={activeTab} onBarPress={handleCategoryBarPress} />;
  }

  return (
    <PageTransition style={styles.root}>
      <NavMenu />
      <LinearGradient
        colors={["#2A4A2E", "#346739"]}
        style={[styles.header, { paddingTop: Platform.OS === "web" ? BAR_HEIGHT : insets.top }]}
      >
        <Text style={styles.headerTitle}>Statistics</Text>
      </LinearGradient>

      <View style={sharedStyles.tabsExtension}>
        <View style={sharedStyles.typeRow}>
          {STAT_TABS.map((tab) => (
            <Pressable
              key={tab}
              style={[sharedStyles.typeBtn, activeTab === tab && sharedStyles.typeBtnActive]}
              onPress={() => handleTabChange(tab)}
            >
              <Text style={[sharedStyles.typeBtnText, activeTab === tab && sharedStyles.typeBtnTextActive]}>
                {TAB_LABELS[tab]}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} onScroll={handleTxScroll} scrollEventThrottle={16}>
        <View style={styles.periodRow}>
            {STAT_PERIODS.map((period) => (
              <Pressable
                key={period}
                style={[styles.periodChip, activePeriod === period && styles.periodChipActive]}
                onPress={() => handlePeriodChange(period)}
              >
                <Text
                  style={[styles.periodText, activePeriod === period && styles.periodTextActive]}
                >
                  {period}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>{CHART_TITLES[activeTab]}</Text>

            {renderChart()}

            {activeTab === "GENERAL" && (
              <View style={styles.legend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: "#79AE6F" }]} />
                  <Text style={styles.legendText}>Income</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: "#FF6B6B" }]} />
                  <Text style={styles.legendText}>Expense</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: "#346739" }]} />
                  <Text style={styles.legendText}>Profit</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: "#FFAA44" }]} />
                  <Text style={styles.legendText}>Loss</Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Goals Activity</Text>
            {goalsLoading ? (
              <View style={styles.chartLoader}>
                <ActivityIndicator color="#346739" />
              </View>
            ) : goalsData.length === 0 ? (
              <View style={styles.chartEmpty}>
                <Text style={styles.chartEmptyText}>No data for this period</Text>
              </View>
            ) : (
              <StatGoalsChart data={goalsData} />
            )}
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#346739" }]} />
                <Text style={styles.legendText}>Deposited</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#FFAA44" }]} />
                <Text style={styles.legendText}>Withdrawn</Text>
              </View>
            </View>
          </View>

          {selectedBar && selectedBar.barType !== "profit" && (
            <View style={styles.txSection}>
              <Text style={styles.txTitle}>Transactions — {selectedBar.item.label}</Text>
              {txLoading ? (
                <View style={styles.txLoader}>
                  <ActivityIndicator color="#346739" />
                </View>
              ) : transactions.length === 0 ? (
                <View style={styles.txEmpty}>
                  <Text style={styles.txEmptyText}>No transactions found</Text>
                </View>
              ) : (
                <>
                  {transactions.map((tx) => (
                    <View key={tx.id} style={styles.txCard}>
                      <View style={[styles.txIconCircle, { backgroundColor: tx.color + "22" }]}>
                        <MaterialCommunityIcons name={tx.icon as any} size={20} color={tx.color} />
                      </View>
                      <View style={styles.txInfo}>
                        <Text style={styles.txCategory}>{tx.categoryName}</Text>
                        {!!tx.description && (
                          <Text style={styles.txDescription} numberOfLines={1}>
                            {tx.description}
                          </Text>
                        )}
                      </View>
                      <View style={styles.txRight}>
                        <Text style={styles.txAmount}>{symbol}{formatAmount(tx.amount)}</Text>
                        <Text style={styles.txDate}>{formatEntryDate(tx.entryDate)}</Text>
                      </View>
                    </View>
                  ))}
                  {isFetchingNextPage && (
                    <ActivityIndicator style={styles.txFooterSpinner} size="small" color="#346739" />
                  )}
                </>
              )}
            </View>
          )}
      </ScrollView>

      {toastMsg && (
        <View style={styles.toast} pointerEvents="none">
          <Text style={styles.toastText}>{toastMsg}</Text>
        </View>
      )}
    </PageTransition>
  );
}
