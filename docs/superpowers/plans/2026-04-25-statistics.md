# Statistics Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a statistics screen with a grouped bar chart (income / expense / profit), tab + period selectors, toast feedback on bar tap, and a transaction list drill-down.

**Architecture:** Three files — the screen (`statistics.tsx`), its styles (`statistics.styles.ts`), and a self-contained bar chart component (`stat-bar-chart.tsx`). All data fetching via React Query + `api.get`. Bar chart is built with plain RN Views (flexbox columns) — no Skia needed for a bar chart; Skia is reserved for the existing donut. Touch is handled by `Pressable` on each bar directly.

**Tech Stack:** React Native, Expo Router, React Query (`@tanstack/react-query`), `MaterialCommunityIcons`, `react-native-safe-area-context`.

---

## Files

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `components/stat-bar-chart.tsx` | Renders grouped bar chart; emits `onBarPress` callback |
| Create | `styles/tabs/statistics.styles.ts` | All styles for the statistics screen |
| Rewrite | `app/(tabs)/statistics.tsx` | Screen: auth guard, state, queries, layout |

---

### Task 1: Create the bar chart component

**Files:**
- Create: `components/stat-bar-chart.tsx`

- [ ] **Step 1: Create the component file**

```tsx
// components/stat-bar-chart.tsx
import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export interface SummaryItem {
  label: string;
  income: number;
  expenses: number;
}

export type BarType = "income" | "expense" | "profit";

interface Props {
  data: SummaryItem[];
  onBarPress: (item: SummaryItem, barType: BarType) => void;
}

const BAR_WIDTH = 18;
const BAR_GAP = 4;
const GROUP_GAP = 16;
const MAX_HEIGHT = 140;
const INCOME_COLOR = "#79AE6F";
const EXPENSE_COLOR = "#FF6B6B";
const PROFIT_POS_COLOR = "#346739";
const PROFIT_NEG_COLOR = "#FFAA44";

function profitColor(profit: number) {
  return profit >= 0 ? PROFIT_POS_COLOR : PROFIT_NEG_COLOR;
}

export function StatBarChart({ data, onBarPress }: Props) {
  const maxValue = useMemo(() => {
    let m = 0;
    for (const d of data) {
      m = Math.max(m, d.income, d.expenses, Math.abs(d.income - d.expenses));
    }
    return m || 1;
  }, [data]);

  function barHeight(value: number) {
    return Math.max(4, (Math.abs(value) / maxValue) * MAX_HEIGHT);
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      {data.map((item) => {
        const profit = item.income - item.expenses;
        return (
          <View key={item.label} style={styles.group}>
            {/* Income bar */}
            <Pressable
              style={styles.barWrapper}
              onPress={() => onBarPress(item, "income")}
            >
              <View
                style={[
                  styles.bar,
                  { height: barHeight(item.income), backgroundColor: INCOME_COLOR },
                ]}
              />
            </Pressable>

            {/* Expense bar */}
            <Pressable
              style={styles.barWrapper}
              onPress={() => onBarPress(item, "expense")}
            >
              <View
                style={[
                  styles.bar,
                  { height: barHeight(item.expenses), backgroundColor: EXPENSE_COLOR },
                ]}
              />
            </Pressable>

            {/* Profit/Loss bar */}
            <Pressable
              style={styles.barWrapper}
              onPress={() => onBarPress(item, "profit")}
            >
              <View
                style={[
                  styles.bar,
                  {
                    height: barHeight(profit),
                    backgroundColor: profitColor(profit),
                  },
                ]}
              />
            </Pressable>

            <Text style={styles.label} numberOfLines={1}>
              {item.label}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    alignItems: "flex-end",
  },
  group: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginRight: GROUP_GAP,
    flexWrap: "wrap",
    width: (BAR_WIDTH + BAR_GAP) * 3 - BAR_GAP,
  },
  barWrapper: {
    width: BAR_WIDTH,
    marginRight: BAR_GAP,
    justifyContent: "flex-end",
  },
  bar: {
    width: BAR_WIDTH,
    borderRadius: 4,
  },
  label: {
    width: "100%",
    marginTop: 6,
    fontSize: 9,
    fontFamily: "Nunito_700Bold",
    color: "#346739",
    textAlign: "center",
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add components/stat-bar-chart.tsx
git commit -m "feat: add StatBarChart component (grouped bar chart)"
```

---

### Task 2: Create statistics styles

**Files:**
- Create: `styles/tabs/statistics.styles.ts`

- [ ] **Step 1: Create the styles file**

```ts
// styles/tabs/statistics.styles.ts
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F8F5",
  },
  content: {
    paddingTop: 16,
    paddingBottom: 32,
  },

  // ── Tab selector ──────────────────────────────────────────────────────────
  tabRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#E4EFE1",
    borderRadius: 12,
    padding: 4,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 10,
  },
  tabItemActive: {
    backgroundColor: "#346739",
  },
  tabText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 12,
    color: "#346739",
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: "#FFFFFF",
  },

  // ── Period selector ───────────────────────────────────────────────────────
  periodRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 20,
    gap: 8,
  },
  periodChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#E4EFE1",
  },
  periodChipActive: {
    backgroundColor: "#79AE6F",
  },
  periodText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 12,
    color: "#346739",
  },
  periodTextActive: {
    color: "#FFFFFF",
  },

  // ── Chart area ────────────────────────────────────────────────────────────
  chartCard: {
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingTop: 16,
    paddingBottom: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
    color: "#346739",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  legend: {
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontFamily: "Nunito_400Regular",
    fontSize: 11,
    color: "#346739",
  },
  chartLoader: {
    height: 160,
    justifyContent: "center",
    alignItems: "center",
  },
  chartEmpty: {
    height: 160,
    justifyContent: "center",
    alignItems: "center",
  },
  chartEmptyText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
    color: "#79AE6F",
  },

  // ── Toast ─────────────────────────────────────────────────────────────────
  toast: {
    position: "absolute",
    top: 120,
    alignSelf: "center",
    backgroundColor: "#346739",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 8,
  },
  toastText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
    color: "#FFFFFF",
  },

  // ── Transaction list ──────────────────────────────────────────────────────
  txSection: {
    marginHorizontal: 16,
  },
  txTitle: {
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    color: "#346739",
    marginBottom: 10,
  },
  txCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  txIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  txInfo: {
    flex: 1,
  },
  txCategory: {
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
    color: "#1A1A1A",
  },
  txDescription: {
    fontFamily: "Nunito_400Regular",
    fontSize: 11,
    color: "#79AE6F",
    marginTop: 1,
  },
  txRight: {
    alignItems: "flex-end",
  },
  txAmount: {
    fontFamily: "Nunito_900Black",
    fontSize: 14,
    color: "#346739",
  },
  txDate: {
    fontFamily: "Nunito_400Regular",
    fontSize: 11,
    color: "#9FCB98",
    marginTop: 2,
  },
  txLoader: {
    paddingVertical: 24,
    alignItems: "center",
  },
  txEmpty: {
    paddingVertical: 24,
    alignItems: "center",
  },
  txEmptyText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
    color: "#9FCB98",
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add styles/tabs/statistics.styles.ts
git commit -m "feat: add statistics page styles"
```

---

### Task 3: Implement the statistics screen

**Files:**
- Rewrite: `app/(tabs)/statistics.tsx`

- [ ] **Step 1: Write the full screen**

```tsx
// app/(tabs)/statistics.tsx
import { StatBarChart, BarType, SummaryItem } from "@/components/stat-bar-chart";
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

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
    // label: "2024"
    return `${label.trim()}-01-01`;
  }
  if (period === "MONTH") {
    // label: "Apr 2026"
    const parts = label.trim().split(" ");
    const monthIdx = MONTHS_SHORT.indexOf(parts[0]);
    const month = String(monthIdx + 1).padStart(2, "0");
    return `${parts[1]}-${month}-01`;
  }
  // DAY or WEEK: try to use label as ISO date, or fall back to today
  const iso = label.trim().match(/\d{4}-\d{2}-\d{2}/);
  if (iso) return iso[0];
  return new Date().toISOString().slice(0, 10);
}

function barLabel(barType: BarType, item: SummaryItem): string {
  const profit = item.income - item.expenses;
  if (barType === "income") return `Income: $${formatAmount(item.income)}`;
  if (barType === "expense") return `Expense: $${formatAmount(item.expenses)}`;
  return `${profit >= 0 ? "Profit" : "Loss"}: $${formatAmount(Math.abs(profit))}`;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function StatisticsScreen() {
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<StatTab>("GENERAL");
  const [activePeriod, setActivePeriod] = useState<StatPeriod>("MONTH");
  const [selectedBar, setSelectedBar] = useState<SelectedBar | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getStoredToken().then(setToken);
  }, []);

  if (token === undefined) return null;
  if (!token) return <Redirect href="/landing" />;

  return (
    <StatisticsContent
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      activePeriod={activePeriod}
      setActivePeriod={setActivePeriod}
      selectedBar={selectedBar}
      setSelectedBar={setSelectedBar}
      toastMsg={toastMsg}
      setToastMsg={setToastMsg}
      toastTimer={toastTimer}
    />
  );
}

interface ContentProps {
  activeTab: StatTab;
  setActiveTab: (t: StatTab) => void;
  activePeriod: StatPeriod;
  setActivePeriod: (p: StatPeriod) => void;
  selectedBar: SelectedBar | null;
  setSelectedBar: (s: SelectedBar | null) => void;
  toastMsg: string | null;
  setToastMsg: (m: string | null) => void;
  toastTimer: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;
}

function StatisticsContent({
  activeTab, setActiveTab,
  activePeriod, setActivePeriod,
  selectedBar, setSelectedBar,
  toastMsg, setToastMsg,
  toastTimer,
}: ContentProps) {

  const showToast = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMsg(msg);
    toastTimer.current = setTimeout(() => setToastMsg(null), 3000);
  }, [setToastMsg, toastTimer]);

  const { data: summaryData = [], isLoading: summaryLoading } = useQuery({
    queryKey: ["statistics-summary", activeTab, activePeriod],
    queryFn: () =>
      api.get<SummaryItem[]>(
        `/statistics/summary?type=${activeTab}&period=${activePeriod}`
      ),
    staleTime: 5 * 60 * 1000,
  });

  const txEnabled =
    selectedBar !== null && selectedBar.barType !== "profit";

  const txReferenceDate = useMemo(() => {
    if (!selectedBar) return "";
    return toReferenceDate(selectedBar.item.label, activePeriod);
  }, [selectedBar, activePeriod]);

  const txType = useMemo(() => {
    if (!selectedBar) return activeTab;
    if (selectedBar.barType === "income") return "INCOME";
    if (selectedBar.barType === "expense") return "EXPENSES";
    return activeTab;
  }, [selectedBar, activeTab]);

  const { data: transactions = [], isLoading: txLoading } = useQuery({
    queryKey: ["statistics-transactions", txType, activePeriod, txReferenceDate],
    queryFn: () =>
      api.get<TransactionItem[]>(
        `/statistics/transactions?type=${txType}&period=${activePeriod}&referenceDate=${txReferenceDate}`
      ),
    enabled: txEnabled && txReferenceDate !== "",
    staleTime: 0,
  });

  const handleBarPress = useCallback(
    (item: SummaryItem, barType: BarType) => {
      showToast(barLabel(barType, item));
      if (barType !== "profit") {
        setSelectedBar({ barType, item });
      }
    },
    [showToast, setSelectedBar]
  );

  function handleTabChange(tab: StatTab) {
    setActiveTab(tab);
    setSelectedBar(null);
  }

  function handlePeriodChange(period: StatPeriod) {
    setActivePeriod(period);
    setSelectedBar(null);
  }

  return (
    <PageTransition style={styles.root}>
      <NavMenu />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Tab selector */}
          <View style={styles.tabRow}>
            {STAT_TABS.map((tab) => (
              <Pressable
                key={tab}
                style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
                onPress={() => handleTabChange(tab)}
              >
                <Text
                  style={[styles.tabText, activeTab === tab && styles.tabTextActive]}
                >
                  {tab}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Period selector */}
          <View style={styles.periodRow}>
            {STAT_PERIODS.map((period) => (
              <Pressable
                key={period}
                style={[styles.periodChip, activePeriod === period && styles.periodChipActive]}
                onPress={() => handlePeriodChange(period)}
              >
                <Text
                  style={[
                    styles.periodText,
                    activePeriod === period && styles.periodTextActive,
                  ]}
                >
                  {period}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Chart card */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>
              {activeTab === "GENERAL"
                ? "Income, Expenses & Profit"
                : activeTab === "EXPENSES"
                ? "Expenses Overview"
                : "Income Overview"}
            </Text>

            {/* Legend */}
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

          {/* Transaction list */}
          {selectedBar && selectedBar.barType !== "profit" && (
            <View style={styles.txSection}>
              <Text style={styles.txTitle}>
                Transactions — {selectedBar.item.label}
              </Text>
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
                    <View
                      style={[
                        styles.txIconCircle,
                        { backgroundColor: tx.color + "22" },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={tx.icon as any}
                        size={20}
                        color={tx.color}
                      />
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
                      <Text style={styles.txAmount}>
                        ${formatAmount(tx.amount)}
                      </Text>
                      <Text style={styles.txDate}>
                        {formatEntryDate(tx.entryDate)}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}
        </ScrollView>

        {/* Toast */}
        {toastMsg && (
          <View style={styles.toast} pointerEvents="none">
            <Text style={styles.toastText}>{toastMsg}</Text>
          </View>
        )}
      </SafeAreaView>
    </PageTransition>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/(tabs)/statistics.tsx
git commit -m "feat: implement statistics screen with bar chart and transaction drill-down"
```

---

### Task 4: Wire currency symbol (no hardcoded `$`)

The screen above hardcodes `$`. Per project rule, use `currencySymbolFor(account?.currency)`.

**Files:**
- Modify: `app/(tabs)/statistics.tsx`

- [ ] **Step 1: Import account query and fix currency symbol**

Add these imports at the top (after existing imports):
```tsx
import { ACCOUNT_QUERY_KEY, AccountDto } from "@/app/(tabs)/dashboard";
```

Add this query inside `StatisticsContent` (before the summary query):
```tsx
const { data: account } = useQuery<AccountDto>({
  queryKey: ACCOUNT_QUERY_KEY,
  staleTime: 5 * 60 * 1000,
});

function currencySymbolFor(currency?: string) {
  const upper = currency?.toUpperCase();
  if (upper === "EUR") return "€";
  if (upper === "GBP") return "£";
  return "$";
}

const symbol = currencySymbolFor(account?.currency);
```

Replace all `$${formatAmount(...)}`  occurrences in JSX with `${symbol}${formatAmount(...)}`:
```tsx
// In barLabel helper — add symbol parameter:
function barLabel(barType: BarType, item: SummaryItem, symbol: string): string {
  const profit = item.income - item.expenses;
  if (barType === "income") return `Income: ${symbol}${formatAmount(item.income)}`;
  if (barType === "expense") return `Expense: ${symbol}${formatAmount(item.expenses)}`;
  return `${profit >= 0 ? "Profit" : "Loss"}: ${symbol}${formatAmount(Math.abs(profit))}`;
}
```

Update `handleBarPress` to pass `symbol`:
```tsx
showToast(barLabel(barType, item, symbol));
```

Update the transaction amount cell:
```tsx
<Text style={styles.txAmount}>
  {symbol}{formatAmount(tx.amount)}
</Text>
```

- [ ] **Step 2: Commit**

```bash
git add app/(tabs)/statistics.tsx
git commit -m "fix: use dynamic currency symbol in statistics screen"
```
