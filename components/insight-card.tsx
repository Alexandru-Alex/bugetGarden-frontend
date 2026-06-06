import { MaterialCommunityIcons } from "@expo/vector-icons";
import { computeInsights, InsightKey, InsightPeriod } from "@/lib/insights";
import { FinancialSummaryItem } from "@/lib/types";
import { styles } from "@/styles/tabs/insight-card.styles";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

interface InsightTheme {
  icon: IconName;
  bg: string;
  border: string;
  iconColor: string;
}

const INSIGHT_CONFIG: Record<InsightKey, InsightTheme> = {
  biggest_drop:  { icon: "trending-down",        bg: "#E8F5E9", border: "#A5D6A7", iconColor: "#4CAF50" },
  biggest_spike: { icon: "trending-up",           bg: "#FFF8E1", border: "#E8C050", iconColor: "#E8960A" },
  top_category:  { icon: "trophy-outline",        bg: "#EDF6ED", border: "#79AE6F", iconColor: "#346739" },
  savings_rate:  { icon: "leaf",                  bg: "#F0F7EF", border: "#9FCB98", iconColor: "#346739" },
  income_cover:  { icon: "alert-circle-outline",  bg: "#FFF0EF", border: "#E8A09A", iconColor: "#C0392B" },
  new_category:  { icon: "sprout",                bg: "#F5F2E8", border: "#C4B98A", iconColor: "#7A6640" },
};

const DEFAULT_THEME = INSIGHT_CONFIG.savings_rate;

interface InsightCardProps {
  expenseItems: FinancialSummaryItem[];
  incomeItems: FinancialSummaryItem[];
  prevExpenseItems: FinancialSummaryItem[];
  prevIncomeItems: FinancialSummaryItem[];
  symbol: string;
  decimals: number;
  period: InsightPeriod;
  isLoading?: boolean;
}

export function InsightCard({
  expenseItems,
  incomeItems,
  prevExpenseItems,
  prevIncomeItems,
  symbol,
  decimals,
  period,
  isLoading,
}: InsightCardProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const opacity = useSharedValue(1);
  const skeletonOpacity = useSharedValue(0.4);

  const insights = useMemo(
    () =>
      computeInsights(
        expenseItems,
        prevExpenseItems,
        incomeItems,
        prevIncomeItems,
        symbol,
        decimals,
        period,
      ),
    [expenseItems, prevExpenseItems, incomeItems, prevIncomeItems, symbol, decimals, period],
  );

  // Reset to first insight when period or data changes
  useEffect(() => {
    setActiveIndex(0);
  }, [period, expenseItems, incomeItems]);

  useEffect(() => {
    if (!isLoading) {
      cancelAnimation(skeletonOpacity);
      skeletonOpacity.value = 0.4;
      return;
    }
    skeletonOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700 }),
        withTiming(0.4, { duration: 700 }),
      ),
      -1,
      false,
    );
  }, [isLoading, skeletonOpacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const skeletonStyle = useAnimatedStyle(() => ({ opacity: skeletonOpacity.value }));

  const handleTap = useCallback(() => {
    if (insights.length <= 1) return;
    const nextIndex = (activeIndex + 1) % insights.length;
    opacity.value = withTiming(0, { duration: 150 }, (finished) => {
      if (finished) {
        runOnJS(setActiveIndex)(nextIndex);
        opacity.value = withTiming(1, { duration: 200 });
      }
    });
  }, [insights.length, activeIndex, opacity]);

  if (!isLoading && insights.length === 0) return null;

  const activeInsight = insights[activeIndex];
  const theme = activeInsight ? INSIGHT_CONFIG[activeInsight.key] : DEFAULT_THEME;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={activeInsight?.text ?? "Financial insight"}
      accessibilityHint={insights.length > 1 ? "Tap to see next insight" : undefined}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.bg, borderColor: theme.border },
        pressed && styles.cardPressed,
      ]}
      onPress={handleTap}
    >
      {isLoading ? (
        <Animated.View style={[styles.skeleton, skeletonStyle]} />
      ) : (
        <Animated.View style={[styles.content, animatedStyle]}>
          <MaterialCommunityIcons name={theme.icon} size={28} color={theme.iconColor} />
          <Text style={styles.insightText}>{activeInsight?.text ?? ""}</Text>
        </Animated.View>
      )}

      {!isLoading && insights.length > 1 && (
        <View style={styles.dots}>
          {insights.map((insight, i) => (
            <View
              key={insight.key}
              style={[styles.dot, i === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      )}
    </Pressable>
  );
}
