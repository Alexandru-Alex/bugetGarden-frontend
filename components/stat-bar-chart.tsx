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

function barHeight(value: number, maxValue: number) {
  return Math.max(4, (Math.abs(value) / maxValue) * MAX_HEIGHT);
}

export function StatBarChart({ data, onBarPress }: Props) {
  const maxValue = useMemo(() => {
    let m = 0;
    for (const d of data) {
      m = Math.max(m, d.income, d.expenses, Math.abs(d.income - d.expenses));
    }
    return m || 1;
  }, [data]);

  const groups = useMemo(
    () =>
      data.map((item) => {
        const profit = item.income - item.expenses;
        return (
          <View key={item.label} style={styles.group}>
            <View style={styles.barsRow}>
              <Pressable
                style={styles.barWrapper}
                onPress={() => onBarPress(item, "income")}
              >
                <View
                  style={[
                    styles.bar,
                    { height: barHeight(item.income, maxValue), backgroundColor: INCOME_COLOR },
                  ]}
                />
              </Pressable>

              <Pressable
                style={styles.barWrapper}
                onPress={() => onBarPress(item, "expense")}
              >
                <View
                  style={[
                    styles.bar,
                    { height: barHeight(item.expenses, maxValue), backgroundColor: EXPENSE_COLOR },
                  ]}
                />
              </Pressable>

              <Pressable
                style={styles.barWrapper}
                onPress={() => onBarPress(item, "profit")}
              >
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight(profit, maxValue),
                      backgroundColor: profit >= 0 ? PROFIT_POS_COLOR : PROFIT_NEG_COLOR,
                    },
                  ]}
                />
              </Pressable>
            </View>

            <Text style={styles.label} numberOfLines={1}>
              {item.label}
            </Text>
          </View>
        );
      }),
    [data, maxValue, onBarPress],
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      {groups}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  group: {
    flexDirection: "column",
    marginRight: GROUP_GAP,
  },
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: BAR_GAP,
  },
  barWrapper: {
    width: BAR_WIDTH,
    height: MAX_HEIGHT,
    justifyContent: "flex-end",
  },
  bar: {
    width: BAR_WIDTH,
    borderRadius: 4,
  },
  label: {
    marginTop: 6,
    fontSize: 9,
    fontFamily: "Nunito_700Bold",
    color: "#346739",
    textAlign: "center",
  },
});
