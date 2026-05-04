// app/(tabs)/garden.tsx
import { GardenFlowersChart } from "@/components/garden-flowers-chart";
import { GrassCube } from "@/components/grass-cube";
import { NavMenu } from "@/components/nav-menu";
import { PageTransition } from "@/components/page-transition";
import { RoseFlower } from "@/components/rose-flower";
import { getStoredToken } from "@/lib/api";
import { styles } from "@/styles/tabs/garden.styles";
import { Redirect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Polygon } from "react-native-svg";

const MAX_CELL_SIZE = 100;
const ROWS = 7;
const COLS = 7;
const INNER_ROWS = 6;
const INNER_COLS = 6;

const MONTH_NAMES = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

const MOCK_FLOWERS: Record<number, number> = {
  2: 1, 4: 2, 8: 1, 9: 3, 12: 2, 13: 1,
  16: 3, 18: 1, 23: 2, 24: 1, 27: 3, 29: 1,
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export default function GardenScreen() {
  const [token, setToken] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    getStoredToken().then(setToken);
  }, []);

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const isCurrentMonth =
    viewYear === now.getFullYear() && viewMonth === now.getMonth();
  const isFutureMonth =
    viewYear > now.getFullYear() ||
    (viewYear === now.getFullYear() && viewMonth > now.getMonth());

  const [gridContainerW, setGridContainerW] = useState(0);
  const CELL_SIZE = gridContainerW > 0
    ? Math.min(MAX_CELL_SIZE, Math.floor(gridContainerW * 2 / (COLS + ROWS)))
    : 0;

  const isoXOffset = (ROWS - 1) * (CELL_SIZE / 2);
  const isoW = (COLS + ROWS - 2) * (CELL_SIZE / 2) + CELL_SIZE;
  const isoH = (COLS + ROWS - 2) * (CELL_SIZE / 4) + CELL_SIZE;

  const tiles = useMemo(() =>
    Array.from({ length: ROWS }, (_, r) =>
      Array.from({ length: COLS }, (_, c) => ({ r, c }))
    ).flat().sort((a, b) => (a.r + a.c) - (b.r + b.c)),
    [],
  );

  const FLOWER_COUNT = 5;
  const [flowers, setFlowers] = useState<Map<number, number>>(new Map());
  const [hovered, setHovered] = useState<number | null>(null);

  const toggleFlower = useCallback((day: number) => {
    setFlowers((prev) => {
      const next = new Map(prev);
      const current = next.get(day);
      if (current === undefined) {
        next.set(day, 0);
      } else if (current < FLOWER_COUNT - 1) {
        next.set(day, current + 1);
      } else {
        next.delete(day);
      }
      return next;
    });
  }, []);

  const prevMonth = () => {
    setFlowers(new Map());
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    setFlowers(new Map());
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  if (token === undefined) return null;
  if (!token) return <Redirect href="/landing" />;

  return (
    <PageTransition style={styles.container}>
      <View style={[StyleSheet.absoluteFill, styles.bgOverlay]} pointerEvents="none" />
      <NavMenu />

      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.innerWrapper}>
            {/* Month navigator */}
            <View style={styles.monthNav}>
              <Pressable onPress={prevMonth} style={styles.navBtn}>
                <Text style={styles.navArrow}>‹</Text>
              </Pressable>
              <Text style={styles.monthLabel}>
                {MONTH_NAMES[viewMonth]} {viewYear}
              </Text>
              <Pressable onPress={nextMonth} style={styles.navBtn}>
                <Text style={styles.navArrow}>›</Text>
              </Pressable>
            </View>

            {/* Grid + leaf counter */}
            <View style={styles.gridSection}>
              <View
                style={styles.gridWrapper}
                onLayout={(e) => setGridContainerW(e.nativeEvent.layout.width)}
              >
                <View style={{ paddingTop: CELL_SIZE * 0.65, paddingBottom: 8, alignItems: "center" }}>
                  <View style={[styles.grid, { width: isoW, height: isoH }]}>
                    {CELL_SIZE > 0 && tiles.map(({ r: row, c: col }) => {
                      const x = isoXOffset + (col - row) * (CELL_SIZE / 2);
                      const y = (col + row) * (CELL_SIZE / 4);

                      const isCorner = row === 0 && col === 0;
                      const isFenceRight = row === 0 && col > 0;
                      const isFenceLeft = col === 0 && row > 0;
                      const isBorder = isCorner || isFenceRight || isFenceLeft;

                      if (isBorder) {
                        const src = isCorner
                          ? require("../../gradina/colt.png")
                          : isFenceRight
                            ? require("../../gradina/gard_dreapta.png")
                            : require("../../gradina/gard_stanga.png");

                        const scale = 1.30;
                        const imgSize = CELL_SIZE * scale;
                        const offsetX = -(CELL_SIZE * (scale - 1)) / 2;
                        const offsetY = -(CELL_SIZE * (scale - 1)) * 0.65 - CELL_SIZE * 0.07;

                        return (
                          <View
                            key={`${row}-${col}`}
                            pointerEvents="none"
                            style={{
                              position: "absolute",
                              left: x,
                              top: y,
                              width: CELL_SIZE,
                              height: CELL_SIZE,
                              overflow: "visible",
                            }}
                          >
                            <Image
                              source={src}
                              style={{
                                position: "absolute",
                                left: offsetX,
                                top: offsetY,
                                width: imgSize,
                                height: imgSize,
                              }}
                              resizeMode="stretch"
                            />
                          </View>
                        );
                      }

                      const day = (row - 1) * INNER_COLS + (col - 1) + 1;
                      const isOutOfMonth = day > daysInMonth;
                      const hasFlower = flowers.has(day);
                      const flowerIndex = flowers.get(day) ?? 0;
                      const isHovered = hovered === day;
                      const isFuture = isFutureMonth;

                      const cubeVariant = hasFlower
                        ? "flower"
                        : isHovered
                          ? "hovered"
                          : isFuture
                            ? "future"
                            : "normal";

                      return (
                        <View
                          key={`${row}-${col}`}
                          pointerEvents="box-none"
                          style={{
                            position: "absolute",
                            left: x,
                            top: y,
                            width: CELL_SIZE,
                            height: CELL_SIZE,
                            overflow: "visible",
                            opacity: isFuture ? 0.55 : 1,
                            transform: isHovered ? [{ translateY: -3 }] : [],
                          }}
                        >
                          <GrassCube size={CELL_SIZE} variant={cubeVariant} />

                          {hasFlower && (
                            <View
                              pointerEvents="none"
                              style={{
                                position: "absolute",
                                top: -CELL_SIZE * 0.6,
                                left: 8,
                                width: CELL_SIZE + 16,
                              }}
                            >
                              <RoseFlower size={CELL_SIZE - 4} flowerIndex={flowerIndex} />
                            </View>
                          )}

                          {!hasFlower && isHovered && (
                            <Svg
                              viewBox="0 0 100 50"
                              width={CELL_SIZE}
                              height={CELL_SIZE / 2}
                              // @ts-ignore
                              pointerEvents="none"
                              style={{ position: "absolute", top: 0, left: 0 }}
                            >
                              <Polygon
                                points="50,2 97,26 50,48 3,26"
                                fill="rgba(255,255,255,0.22)"
                                stroke="rgba(255,255,255,0.6)"
                                strokeWidth="2.5"
                              />
                            </Svg>
                          )}

                          {!hasFlower && isHovered && (
                            <View
                              pointerEvents="none"
                              style={{
                                position: "absolute",
                                top: CELL_SIZE * 0.08,
                                left: 0,
                                right: 0,
                                alignItems: "center",
                              }}
                            >
                              <Text style={styles.dayNumber}>+</Text>
                            </View>
                          )}

                          <Pressable
                            onPress={() => !isFuture && toggleFlower(day)}
                            // @ts-ignore
                            onHoverIn={() => !isFuture && setHovered(day)}
                            // @ts-ignore
                            onHoverOut={() => setHovered(null)}
                            android_ripple={null}
                            style={{ position: "absolute", top: CELL_SIZE * 0.05, left: CELL_SIZE * 0.22, width: CELL_SIZE * 0.56, height: CELL_SIZE * 0.35 }}
                          />
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>

              {/* Leaf counter */}
              <View style={styles.leafCounter} pointerEvents="none">
                <Image
                  source={require("../../assets/images/leaf_w.png")}
                  style={styles.leafIcon}
                />
                <Text style={styles.leafCount}>{flowers.size}</Text>
              </View>
            </View>

            {/* Chart card */}
            <View style={styles.chartCard}>
              <GardenFlowersChart
                data={MOCK_FLOWERS}
                daysInMonth={daysInMonth}
                todayDay={isCurrentMonth ? now.getDate() : null}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </PageTransition>
  );
}
