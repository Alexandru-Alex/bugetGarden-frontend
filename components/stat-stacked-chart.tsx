import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export interface CategoryEntryDto {
  name: string;
  color: string;
  icon: string;
  amount: number;
}

export interface CategoryPeriodDto {
  label: string;
  categories: CategoryEntryDto[];
}

interface Props {
  data: CategoryPeriodDto[];
  onSegmentPress: (entry: CategoryEntryDto, position: { x: number; y: number }) => void;
}

const BAR_WIDTH = 22;
const GROUP_GAP = 14;
const MAX_HEIGHT = 140;

export function StatStackedChart({ data, onSegmentPress }: Props) {
  const maxTotal = useMemo(() => {
    let m = 0;
    for (const period of data) {
      const total = period.categories.reduce((sum, c) => sum + c.amount, 0);
      if (total > m) m = total;
    }
    return m || 1;
  }, [data]);

  const groups = useMemo(
    () =>
      data.map((period) => {
        const total = period.categories.reduce((sum, c) => sum + c.amount, 0);
        return (
          <View key={period.label} style={styles.group}>
            <View style={styles.barWrapper}>
              {total === 0 ? (
                <View style={styles.emptyBar} />
              ) : (
                period.categories.map((cat) => {
                  const h = Math.max(4, (cat.amount / maxTotal) * MAX_HEIGHT);
                  return (
                    <Pressable
                      key={cat.name}
                      style={[styles.segment, { height: h, backgroundColor: cat.color }]}
                      onPress={(e) =>
                        onSegmentPress(cat, { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY })
                      }
                    />
                  );
                })
              )}
            </View>
            <Text style={styles.label} numberOfLines={2}>
              {period.label}
            </Text>
          </View>
        );
      }),
    [data, maxTotal, onSegmentPress],
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
    alignItems: "center",
    marginRight: GROUP_GAP,
    width: BAR_WIDTH + 12,
  },
  barWrapper: {
    height: MAX_HEIGHT,
    width: BAR_WIDTH,
    justifyContent: "flex-end",
    overflow: "hidden",
    borderRadius: 5,
  },
  segment: {
    width: BAR_WIDTH,
  },
  emptyBar: {
    width: BAR_WIDTH,
    height: 4,
    backgroundColor: "#E4EFE1",
    borderRadius: 5,
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
