import { GrassCube } from "@/components/grass-cube";
import { RoseFlower } from "@/components/rose-flower";
import { Redirect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MAX_CELL_SIZE = 100;

function getBestGrid(n: number) {
  let best: { rows: number; cols: number; score: number } | null = null;
  for (let cols = Math.ceil(Math.sqrt(n)); cols >= 1; cols--) {
    const rows = Math.ceil(n / cols);
    const empty = rows * cols - n;
    const diff = Math.abs(rows - cols);
    const score = diff * 2 + empty;
    if (!best || score < best.score) {
      best = { rows, cols, score };
    }
  }
  return best!;
}

const MONTH_NAMES = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export default function GardenScreen() {
  const [token, setToken] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    if (Platform.OS === "web") {
      setToken(localStorage.getItem("auth_token"));
    } else {
      SecureStore.getItemAsync("auth_token").then(setToken);
    }
  }, []);

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const today = now.getDate();
  const isCurrentMonth =
    viewYear === now.getFullYear() && viewMonth === now.getMonth();
  const isFutureMonth =
    viewYear > now.getFullYear() ||
    (viewYear === now.getFullYear() && viewMonth > now.getMonth());

  const { rows, cols: COLS } = getBestGrid(daysInMonth);

  const [gridContainerW, setGridContainerW] = useState(0);
  const CELL_SIZE = gridContainerW > 0
    ? Math.min(MAX_CELL_SIZE, Math.floor(gridContainerW * 2 / (COLS + rows)))
    : 0;

  // xOffset: deplaseaza totul la dreapta ca x minim sa fie 0
  const isoXOffset = (rows - 1) * (CELL_SIZE / 2);
  // dimensiuni container
  const isoW = (COLS + rows - 2) * (CELL_SIZE / 2) + CELL_SIZE;
  const isoH = (COLS + rows - 2) * (CELL_SIZE / 4) + CELL_SIZE;

  // Toate tilurile, sortate back-to-front dupa (row+col)
  const tiles = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => ({ r, c }))
  ).flat().sort((a, b) => (a.r + a.c) - (b.r + b.c));

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
    <View style={styles.container}>
      {/* Background verde aprins ca landing */}
      <View style={[StyleSheet.absoluteFill, styles.bgOverlay]} pointerEvents="none" />

      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            {/* Garden strip decorativ ca in AuthModal */}
            <View style={styles.gardenStrip}>
              <Text style={styles.gardenEmoji}>🌿</Text>
              <Text style={styles.gardenEmoji}>🌸</Text>
              <Text style={styles.gardenEmoji}>🌼</Text>
              <Text style={styles.gardenEmoji}>🍃</Text>
              <Text style={styles.gardenEmoji}>🌺</Text>
            </View>

            <View style={styles.cardInner}>
              <Text style={styles.title}>My Garden 🌱</Text>

              {/* Navigator luna */}
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

              {/* Grid izometric */}
              <View
                style={styles.gridWrapper}
                onLayout={(e) => setGridContainerW(e.nativeEvent.layout.width)}
              >
              <View style={{ paddingTop: CELL_SIZE * 0.65, paddingBottom: 8, alignItems: "center" }}>
                <View style={[styles.grid, { width: isoW, height: isoH }]}>
                  {CELL_SIZE > 0 && tiles.map(({ r: row, c: col }) => {
                    const day = row * COLS + col + 1;
                    const isValid = day >= 1 && day <= daysInMonth;

                    // coordonate izometrice
                    const x = isoXOffset + (col - row) * (CELL_SIZE / 2);
                    const y = (col + row) * (CELL_SIZE / 4);

                    if (!isValid) return null;

                    const hasFlower = flowers.has(day);
                    const flowerIndex = flowers.get(day) ?? 0;
                    const isHovered = hovered === day;
                    const isToday = isCurrentMonth && day === today;
                    const isFuture = isFutureMonth || (isCurrentMonth && day > today);

                    const cubeVariant = hasFlower
                      ? "flower"
                      : isHovered
                        ? "hovered"
                        : isToday
                          ? "today"
                          : isFuture
                            ? "future"
                            : "normal";

                    return (
                      // Container vizual — pozitionat izometric, contine cubul + floarea
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

                        {/* Floare — iese deasupra cubului */}
                        {hasFlower && (
                          <View
                            pointerEvents="none"
                            style={{
                              position: "absolute",
                              top: -CELL_SIZE * 0.6,
                              left: 0,
                              right: 0,
                              alignItems: "center",
                            }}
                          >
                            <RoseFlower size={CELL_SIZE + 16} delay={day * 80} flowerIndex={flowerIndex} />
                          </View>
                        )}

                        {/* Zona de touch — limitata la fata de sus a cubului (jumatate din inaltime) */}
                        <Pressable
                          onPress={() => !isFuture && toggleFlower(day)}
                          // @ts-ignore
                          onHoverIn={() => !isFuture && setHovered(day)}
                          // @ts-ignore
                          onHoverOut={() => setHovered(null)}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: CELL_SIZE,
                            height: CELL_SIZE / 2,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {/* Numar zi pe fata de sus */}
                          {!hasFlower && (
                            <Text
                              style={[
                                styles.dayNumber,
                                isToday && styles.dayNumberToday,
                                isFuture && styles.dayNumberFuture,
                              ]}
                            >
                              {day}
                            </Text>
                          )}

                          {/* Plus on hover */}
                          {!hasFlower && isHovered && (
                            <View style={styles.plusOverlay}>
                              <Text style={styles.plusIcon}>+</Text>
                            </View>
                          )}
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              </View>
              </View>

              <Text style={styles.counter}>
                🌸 {flowers.size} / {daysInMonth} flowers planted
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#5a9e2f",
    ...(Platform.OS === "web" ? { minHeight: "100vh" as any, overflow: "hidden" } : {}),
  },
  bgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.10)",
  },
  safe: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#f0f9ec",
    borderRadius: 28,
    overflow: "hidden",
    width: "100%",
    maxWidth: 700,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 16,
  },
  gardenStrip: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#d6f0c8",
    borderBottomWidth: 1,
    borderBottomColor: "#b8dfa8",
  },
  gardenEmoji: {
    fontSize: 22,
  },
  cardInner: {
    paddingTop: 16,
    paddingHorizontal: 12,
    paddingBottom: 28,
    alignItems: "center",
  },
  title: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 26,
    color: "#1b4d1b",
    marginBottom: 12,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
    backgroundColor: "#d4ebc8",
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  navBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  navArrow: {
    fontSize: 28,
    color: "#4a9e2f",
    lineHeight: 30,
    fontFamily: "Nunito_800ExtraBold",
  },
  monthLabel: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 15,
    color: "#1b4d1b",
    minWidth: 150,
    textAlign: "center",
  },
  gridWrapper: {
    alignSelf: "stretch",
    paddingHorizontal: 4,
    overflow: "visible",
  },
  grid: {
    position: "relative",
    overflow: "visible",
  },
  dayNumber: {
    fontFamily: "Nunito_700Bold",
    fontSize: 11,
    color: "#3a6a2a",
    marginBottom: 4,
    fontWeight: "600",
  },
  dayNumberToday: {
    fontFamily: "Nunito_800ExtraBold",
    color: "#1b5e20",
    fontWeight: "700",
  },
  dayNumberFuture: {
    color: "#8aab6e",
  },
  plusOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  plusIcon: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 22,
    color: "#4a9e2f",
    fontWeight: "300",
  },
  counter: {
    marginTop: 20,
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    color: "#5a8a3c",
    letterSpacing: 0.4,
  },
});
