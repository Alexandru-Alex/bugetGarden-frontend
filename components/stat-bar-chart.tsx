import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export interface SummaryItem {
  label: string;
  income: number | null;
  expenses: number | null;
}

export type BarType = "income" | "expense" | "profit";

interface Props {
  data: SummaryItem[];
  onBarPress: (item: SummaryItem, barType: BarType, position: { x: number; y: number }) => void;
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
      const inc = d.income ?? 0;
      const exp = d.expenses ?? 0;
      m = Math.max(m, inc, exp, Math.abs(inc - exp));
    }
    return m || 1;
  }, [data]);

  const groups = useMemo(
    () =>
      data.map((item) => {
        const inc = item.income ?? 0;
        const exp = item.expenses ?? 0;
        const profit = inc - exp;
        return (
          <View key={item.label} style={styles.group}>
            <View style={styles.barsRow}>
              <Pressable
                style={styles.barWrapper}
                onPress={(e) => onBarPress(item, "income", { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY })}
                disabled={inc === 0}
              >
                <View
                  style={[
                    styles.bar,
                    { height: barHeight(inc, maxValue), backgroundColor: INCOME_COLOR },
                    inc === 0 && styles.barDisabled,
                  ]}
                />
              </Pressable>

              <Pressable
                style={styles.barWrapper}
                onPress={(e) => onBarPress(item, "expense", { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY })}
                disabled={exp === 0}
              >
                <View
                  style={[
                    styles.bar,
                    { height: barHeight(exp, maxValue), backgroundColor: EXPENSE_COLOR },
                    exp === 0 && styles.barDisabled,
                  ]}
                />
              </Pressable>

              <Pressable
                style={styles.barWrapper}
                onPress={(e) => onBarPress(item, "profit", { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY })}
                disabled={profit === 0}
              >
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight(profit, maxValue),
                      backgroundColor: profit >= 0 ? PROFIT_POS_COLOR : PROFIT_NEG_COLOR,
                    },
                    profit === 0 && styles.barDisabled,
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
  barDisabled: {
    opacity: 0.25,
  },
  label: {
    marginTop: 6,
    fontSize: 9,
    fontFamily: "Nunito_700Bold",
    color: "#346739",
    textAlign: "center",
  },
});
