import { computeInsights, InsightPeriod } from "@/lib/insights";
import { FinancialSummaryItem } from "@/lib/types";
import { styles } from "@/styles/tabs/insight-card.styles";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

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

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={insights[activeIndex]?.text ?? "Financial insight"}
      accessibilityHint={insights.length > 1 ? "Tap to see next insight" : undefined}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={handleTap}
    >
      {isLoading ? (
        <Animated.View style={[styles.skeleton, skeletonStyle]} />
      ) : (
        <Animated.Text style={[styles.insightText, animatedStyle]}>
          {insights[activeIndex]?.text ?? ""}
        </Animated.Text>
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
