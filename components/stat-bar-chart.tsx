import React, { useCallback, useMemo, useState } from "react";
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from "react-native";

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

const PADDING_H = 16;
const BAR_GAP = 4;
const GROUP_GAP = 12;
const MAX_HEIGHT = 140;
const INCOME_COLOR = "#79AE6F";
const EXPENSE_COLOR = "#FF6B6B";
const PROFIT_POS_COLOR = "#346739";
const PROFIT_NEG_COLOR = "#FFAA44";

function barHeight(value: number, maxValue: number) {
  return Math.max(4, (Math.abs(value) / maxValue) * MAX_HEIGHT);
}

export function StatBarChart({ data, onBarPress }: Props) {
  const [containerWidth, setContainerWidth] = useState(0);

  const barWidth = useMemo(() => {
    if (!containerWidth || !data.length) return 18;
    const n = data.length;
    const available = containerWidth - PADDING_H * 2 - (n - 1) * GROUP_GAP - n * 2 * BAR_GAP;
    return Math.max(4, available / (n * 3));
  }, [containerWidth, data.length]);

  const maxValue = useMemo(() => {
    let m = 0;
    for (const d of data) {
      const inc = d.income ?? 0;
      const exp = d.expenses ?? 0;
      m = Math.max(m, inc, exp, Math.abs(inc - exp));
    }
    return m || 1;
  }, [data]);

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setContainerWidth((prev) => (prev === w ? prev : w));
  }, []);

  const groups = useMemo(
    () =>
      data.map((item) => {
        const inc = item.income ?? 0;
        const exp = item.expenses ?? 0;
        const profit = inc - exp;

        const renderBar = (value: number, barType: BarType, color: string) => (
          <Pressable
            style={[styles.barWrapper, { width: barWidth }]}
            onPress={(e) => onBarPress(item, barType, { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY })}
            disabled={value === 0}
          >
            <View
              style={[
                styles.bar,
                { width: barWidth, height: barHeight(value, maxValue), backgroundColor: color },
                value === 0 && styles.barDisabled,
              ]}
            />
          </Pressable>
        );

        return (
          <View key={item.label} style={styles.group}>
            <View style={[styles.barsRow, { gap: BAR_GAP }]}>
              {renderBar(inc, "income", INCOME_COLOR)}
              {renderBar(exp, "expense", EXPENSE_COLOR)}
              {renderBar(profit, "profit", profit >= 0 ? PROFIT_POS_COLOR : PROFIT_NEG_COLOR)}
            </View>
            <Text style={[styles.label, { maxWidth: barWidth * 3 + BAR_GAP * 2 }]} numberOfLines={1}>
              {item.label}
            </Text>
          </View>
        );
      }),
    [data, maxValue, onBarPress, barWidth],
  );

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <View style={[styles.row, { gap: GROUP_GAP, paddingHorizontal: PADDING_H }]}>
        {groups}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  group: {
    flexDirection: "column",
    alignItems: "center",
  },
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  barWrapper: {
    height: MAX_HEIGHT,
    justifyContent: "flex-end",
  },
  bar: {
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
