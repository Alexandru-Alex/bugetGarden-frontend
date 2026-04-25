import { BarType, StatBarChart, SummaryItem } from "@/components/stat-bar-chart";
import { NavMenu } from "@/components/nav-menu";
import { PageTransition } from "@/components/page-transition";
import { api, getStoredToken } from "@/lib/api";
import { styles } from "@/styles/tabs/statistics.styles";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Redirect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
  return new Date().toISOString().slice(0, 10);
}

function barLabel(barType: BarType, item: SummaryItem, symbol: string): string {
  const profit = item.income - item.expenses;
  if (barType === "income") return `Income: ${symbol}${formatAmount(item.income)}`;
  if (barType === "expense") return `Expense: ${symbol}${formatAmount(item.expenses)}`;
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
  const [activeTab, setActiveTab] = useState<StatTab>("GENERAL");
  const [activePeriod, setActivePeriod] = useState<StatPeriod>("MONTH");
  const [selectedBar, setSelectedBar] = useState<SelectedBar | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: account } = useQuery<{ currency: string }>({
    queryKey: ["account"],
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

  const { data: summaryData = [], isLoading: summaryLoading } = useQuery({
    queryKey: ["statistics-summary", activeTab, activePeriod],
    queryFn: () =>
      api.get<SummaryItem[]>(`/statistics/summary?type=${activeTab}&period=${activePeriod}`),
    staleTime: 5 * 60 * 1000,
  });

  const txEnabled = selectedBar !== null && selectedBar.barType !== "profit";

  const txReferenceDate = useMemo(() => {
    if (!selectedBar) return "";
    return toReferenceDate(selectedBar.item.label, activePeriod);
  }, [selectedBar, activePeriod]);

  const txType = useMemo<StatTab>(() => {
    if (!selectedBar) return activeTab;
    if (selectedBar.barType === "income") return "INCOME";
    if (selectedBar.barType === "expense") return "EXPENSES" as StatTab;
    return activeTab;
  }, [selectedBar, activeTab]);

  const { data: transactions = [], isLoading: txLoading } = useQuery({
    queryKey: ["statistics-transactions", txType, activePeriod, txReferenceDate],
    queryFn: () =>
      api.get<TransactionItem[]>(
        `/statistics/transactions?type=${txType}&period=${activePeriod}&referenceDate=${txReferenceDate}`,
      ),
    enabled: txEnabled && txReferenceDate !== "",
    staleTime: 0,
  });

  const handleBarPress = useCallback(
    (item: SummaryItem, barType: BarType) => {
      showToast(barLabel(barType, item, symbol));
      if (barType !== "profit") {
        setSelectedBar({ barType, item });
      }
    },
    [showToast, symbol],
  );

  function handleTabChange(tab: StatTab) {
    setActiveTab(tab);
    setSelectedBar(null);
  }

  function handlePeriodChange(period: StatPeriod) {
    setActivePeriod(period);
    setSelectedBar(null);
  }

  const chartTitle =
    activeTab === "GENERAL"
      ? "Income, Expenses & Profit"
      : activeTab === "EXPENSES"
      ? "Expenses Overview"
      : "Income Overview";

  return (
    <PageTransition style={styles.root}>
      <NavMenu />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.tabRow}>
            {STAT_TABS.map((tab) => (
              <Pressable
                key={tab}
                style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
                onPress={() => handleTabChange(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab}
                </Text>
              </Pressable>
            ))}
          </View>

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
            <Text style={styles.chartTitle}>{chartTitle}</Text>

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
                <Text style={styles.legendText}>Profit/Loss</Text>
              </View>
            </View>

            {summaryLoading ? (
              <View style={styles.chartLoader}>
                <ActivityIndicator color="#346739" />
              </View>
            ) : summaryData.length === 0 ? (
              <View style={styles.chartEmpty}>
                <Text style={styles.chartEmptyText}>No data for this period</Text>
              </View>
            ) : (
              <StatBarChart data={summaryData} onBarPress={handleBarPress} />
            )}
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
                transactions.map((tx) => (
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
                ))
              )}
            </View>
          )}
        </ScrollView>

        {toastMsg && (
          <View style={styles.toast} pointerEvents="none">
            <Text style={styles.toastText}>{toastMsg}</Text>
          </View>
        )}
      </SafeAreaView>
    </PageTransition>
  );
}
