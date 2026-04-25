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
