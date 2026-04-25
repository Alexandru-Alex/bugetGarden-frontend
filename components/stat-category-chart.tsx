import { SummaryItem } from "@/components/stat-bar-chart";
import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const BAR_WIDTH = 22;
const GROUP_GAP = 14;
const MAX_HEIGHT = 140;

interface Props {
  data: SummaryItem[];
  type: "INCOME" | "EXPENSES";
  onBarPress: (item: SummaryItem, position: { x: number; y: number }) => void;
}

function barHeight(value: number, maxValue: number) {
  return Math.max(4, (value / maxValue) * MAX_HEIGHT);
}

function getValue(item: SummaryItem, type: Props["type"]) {
  return type === "INCOME" ? (item.income ?? 0) : (item.expenses ?? 0);
}

export function StatCategoryChart({ data, type, onBarPress }: Props) {
  const color = type === "INCOME" ? "#79AE6F" : "#FF6B6B";

  const maxValue = useMemo(() => {
    let m = 0;
    for (const d of data) m = Math.max(m, getValue(d, type));
    return m || 1;
  }, [data, type]);

  const bars = useMemo(
    () =>
      data.map((item) => {
        const value = getValue(item, type);
        return (
          <View key={item.label} style={styles.group}>
            <View style={styles.barWrapper}>
              <Pressable
                style={styles.barArea}
                onPress={(e) => onBarPress(item, { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY })}
                disabled={value === 0}
              >
                <View
                  style={[
                    styles.bar,
                    { height: barHeight(value, maxValue), backgroundColor: color },
                    value === 0 && styles.barDisabled,
                  ]}
                />
              </Pressable>
            </View>
            <Text style={styles.label} numberOfLines={2}>
              {item.label}
            </Text>
          </View>
        );
      }),
    [data, type, maxValue, color, onBarPress],
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      {bars}
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
    alignItems: "center",
    marginRight: GROUP_GAP,
    width: BAR_WIDTH + 12,
  },
  barWrapper: {
    height: MAX_HEIGHT,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  barArea: {
    width: BAR_WIDTH,
    justifyContent: "flex-end",
  },
  bar: {
    width: BAR_WIDTH,
    borderRadius: 5,
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
    width: BAR_WIDTH + 12,
  },
});
