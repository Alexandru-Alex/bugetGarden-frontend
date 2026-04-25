import React, { useMemo } from "react";
import { ScrollView } from "react-native";
import { Circle, Line, Polygon, Polyline, Svg, Text as SvgText } from "react-native-svg";

export interface GoalsPeriodItem {
  label: string;
  deposited: number;
  withdrawn: number;
}

interface Props {
  data: GoalsPeriodItem[];
}

const CHART_H = 120;
const CHART_W_PER_POINT = 52;
const PADDING_LEFT = 12;
const PADDING_RIGHT = 12;
const PADDING_TOP = 12;
const PADDING_BOTTOM = 24;
const PLOT_H = CHART_H - PADDING_TOP - PADDING_BOTTOM;

function toY(value: number, maxValue: number): number {
  return PADDING_TOP + PLOT_H - Math.max(2, (value / maxValue) * PLOT_H);
}

export function StatGoalsChart({ data }: Props) {
  const maxValue = useMemo(() => {
    let m = 0;
    for (const d of data) m = Math.max(m, d.deposited, d.withdrawn);
    return m || 1;
  }, [data]);

  const totalW = useMemo(
    () => PADDING_LEFT + data.length * CHART_W_PER_POINT + PADDING_RIGHT,
    [data.length],
  );

  const xs = useMemo(
    () => data.map((_, i) => PADDING_LEFT + i * CHART_W_PER_POINT + CHART_W_PER_POINT / 2),
    [data.length],
  );

  const baseY = PADDING_TOP + PLOT_H;

  const depositedPoints = useMemo(
    () => data.map((d, i) => `${xs[i]},${toY(d.deposited, maxValue)}`).join(" "),
    [data, xs, maxValue],
  );

  const withdrawnPoints = useMemo(
    () => data.map((d, i) => `${xs[i]},${toY(d.withdrawn, maxValue)}`).join(" "),
    [data, xs, maxValue],
  );

  const depositedArea = useMemo(
    () =>
      `${xs[0]},${baseY} ` +
      data.map((d, i) => `${xs[i]},${toY(d.deposited, maxValue)}`).join(" ") +
      ` ${xs[xs.length - 1]},${baseY}`,
    [data, xs, maxValue, baseY],
  );

  const withdrawnArea = useMemo(
    () =>
      `${xs[0]},${baseY} ` +
      data.map((d, i) => `${xs[i]},${toY(d.withdrawn, maxValue)}`).join(" ") +
      ` ${xs[xs.length - 1]},${baseY}`,
    [data, xs, maxValue, baseY],
  );

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <Svg width={totalW} height={CHART_H}>
        {/* baseline */}
        <Line
          x1={PADDING_LEFT}
          y1={baseY}
          x2={totalW - PADDING_RIGHT}
          y2={baseY}
          stroke="#E4EFE1"
          strokeWidth={1}
        />

        {/* deposited area */}
        <Polygon points={depositedArea} fill="#79AE6F" fillOpacity={0.22} />
        {/* withdrawn area */}
        <Polygon points={withdrawnArea} fill="#FFAA44" fillOpacity={0.32} />

        {/* deposited line */}
        <Polyline
          points={depositedPoints}
          fill="none"
          stroke="#346739"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {/* withdrawn line */}
        <Polyline
          points={withdrawnPoints}
          fill="none"
          stroke="#FFAA44"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* dots + labels */}
        {data.map((d, i) => (
          <React.Fragment key={d.label}>
            <Circle cx={xs[i]} cy={toY(d.deposited, maxValue)} r={3.5} fill="#346739" />
            <Circle cx={xs[i]} cy={toY(d.withdrawn, maxValue)} r={3.5} fill="#FFAA44" />
            <SvgText
              x={xs[i]}
              y={CHART_H - 4}
              textAnchor="middle"
              fontSize={9}
              fontFamily="Nunito_700Bold"
              fill="#346739"
            >
              {d.label}
            </SvgText>
          </React.Fragment>
        ))}
      </Svg>
    </ScrollView>
  );
}
