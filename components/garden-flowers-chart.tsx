import React, { useMemo, useState } from "react";
import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Polyline,
  Stop,
  Svg,
} from "react-native-svg";

const CHART_H = 110;
const PADDING_TOP = 10;
const PADDING_H = 6;
const PLOT_H = CHART_H - PADDING_TOP;
const BASE_Y = PADDING_TOP + PLOT_H;

interface Props {
  data: Record<number, number>;
  daysInMonth: number;
  todayDay: number | null;
}

export function GardenFlowersChart({ data, daysInMonth, todayDay }: Props) {
  const [chartWidth, setChartWidth] = useState(0);

  const maxCount = useMemo(() => {
    const vals = Object.values(data);
    return vals.length ? Math.max(...vals) : 1;
  }, [data]);

  const points = useMemo(() => {
    if (!chartWidth) return [];
    const plotW = chartWidth - PADDING_H * 2;
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const count = data[day] ?? 0;
      const x = PADDING_H + (daysInMonth > 1 ? (i / (daysInMonth - 1)) * plotW : plotW / 2);
      const y = PADDING_TOP + PLOT_H - (count / maxCount) * PLOT_H;
      return { x, y, count, day };
    });
  }, [chartWidth, daysInMonth, data, maxCount]);

  const lineStr = useMemo(
    () => points.map((p) => `${p.x},${p.y}`).join(" "),
    [points],
  );

  const areaPath = useMemo(() => {
    if (!points.length) return "";
    const first = points[0];
    const last = points[points.length - 1];
    return (
      `M${first.x},${BASE_Y} ` +
      points.map((p) => `L${p.x},${p.y}`).join(" ") +
      ` L${last.x},${BASE_Y} Z`
    );
  }, [points]);

  const totalFlowers = useMemo(
    () => Object.values(data).reduce((s, v) => s + v, 0),
    [data],
  );

  const todayPoint = todayDay != null ? (points[todayDay - 1] ?? null) : null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Flowers This Month</Text>
      <Text style={styles.total}>
        Total:{" "}
        <Text style={styles.totalHighlight}>{totalFlowers} flowers planted</Text>
      </Text>

      <View
        style={styles.chartArea}
        onLayout={(e: LayoutChangeEvent) =>
          setChartWidth(e.nativeEvent.layout.width)
        }
      >
        {chartWidth > 0 && (
          <Svg width={chartWidth} height={CHART_H}>
            <Defs>
              <LinearGradient id="gardenAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#79AE6F" stopOpacity="0.28" />
                <Stop offset="1" stopColor="#79AE6F" stopOpacity="0.02" />
              </LinearGradient>
            </Defs>

            {[0, 0.33, 0.66, 1].map((t) => (
              <Path
                key={t}
                d={`M${PADDING_H},${PADDING_TOP + t * PLOT_H} L${chartWidth - PADDING_H},${PADDING_TOP + t * PLOT_H}`}
                stroke="#e0efda"
                strokeWidth={1}
              />
            ))}

            <Path d={areaPath} fill="url(#gardenAreaGrad)" />

            <Polyline
              points={lineStr}
              fill="none"
              stroke="#79AE6F"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {points
              .filter((p) => p.count > 0 && p.day !== todayDay)
              .map((p) => (
                <Circle
                  key={p.day}
                  cx={p.x}
                  cy={p.y}
                  r={3}
                  fill="#79AE6F"
                  stroke="#f4f9f1"
                  strokeWidth={1.5}
                />
              ))}

            {todayPoint && (
              <Circle
                cx={todayPoint.x}
                cy={todayPoint.y}
                r={5}
                fill="#346739"
                stroke="#f4f9f1"
                strokeWidth={2}
              />
            )}
          </Svg>
        )}
      </View>

      <View style={styles.xLabels}>
        <Text style={styles.xLabel}>1</Text>
        <Text style={styles.xLabel}>8</Text>
        <Text style={styles.xLabel}>15</Text>
        <Text style={styles.xLabel}>22</Text>
        <Text style={styles.xLabel}>{daysInMonth}</Text>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#79AE6F" }]} />
          <Text style={styles.legendText}>flowers planted</Text>
        </View>
        {todayDay != null && (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#346739" }]} />
            <Text style={styles.legendText}>today</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%" },
  title: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 14,
    color: "#1b4d1b",
    marginBottom: 2,
  },
  total: {
    fontFamily: "Nunito_700Bold",
    fontSize: 11,
    color: "#5a8a3c",
    marginBottom: 12,
  },
  totalHighlight: {
    fontFamily: "Nunito_700Bold",
    color: "#346739",
  },
  chartArea: { width: "100%" },
  xLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    paddingHorizontal: 4,
  },
  xLabel: {
    fontFamily: "Nunito_700Bold",
    fontSize: 9,
    color: "#a0c090",
  },
  legend: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 9,
    color: "#7aa870",
  },
});
