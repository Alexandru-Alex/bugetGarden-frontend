// app/(tabs)/garden.tsx
import { InventorySheet } from "@/components/inventory-sheet";
import { GardenFlowersChart } from "@/components/garden-flowers-chart";
import { GrassCube } from "@/components/grass-cube";
import { NavMenu } from "@/components/nav-menu";
import { PageTransition } from "@/components/page-transition";
import { api, getStoredToken } from "@/lib/api";
import { flowerImage } from "@/lib/flower-images";
import { styles } from "@/styles/tabs/garden.styles";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Redirect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Image as RNImage,
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
const INNER_COLS = 6;

const MONTH_NAMES = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

interface PlantedFlowerDto {
  name: string;
  imageUrl: string;
  rarity: string;
}

interface GardenCellDto {
  day: number;
  planted: boolean;
  plantedAt: string | null;
  flower: PlantedFlowerDto | null;
}

interface GardenDto {
  id: string;
  month: number;
  year: number;
  cells: GardenCellDto[];
}

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

  const [hovered, setHovered] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const { data: gardenData } = useQuery<GardenDto>({
    queryKey: ["garden", viewMonth + 1, viewYear],
    queryFn: () => api.get(`/garden?month=${viewMonth + 1}&year=${viewYear}`),
    staleTime: Infinity,
    enabled: !!token,
  });

  const plantedCells = useMemo(() => {
    const map = new Map<number, GardenCellDto>();
    gardenData?.cells.forEach((c) => { if (c.planted) map.set(c.day, c); });
    return map;
  }, [gardenData]);

  const chartData = useMemo(() => {
    const result: Record<number, number> = {};
    plantedCells.forEach((_, day) => { result[day] = 1; });
    return result;
  }, [plantedCells]);

  const showToast = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMsg(msg);
    toastTimer.current = setTimeout(() => setToastMsg(null), 3000);
  }, []);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  };

  const handleCellPress = useCallback((day: number) => {
    if (!isCurrentMonth) return;
    if (day > daysInMonth) return;
    if (!gardenData) return;
    const cell = gardenData.cells.find((c) => c.day === day);
    if (cell?.planted) {
      showToast("This flower cannot be moved");
      return;
    }
    setSelectedDay(day);
    setSheetVisible(true);
  }, [isCurrentMonth, gardenData, showToast, daysInMonth]);

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
              {!isCurrentMonth && (
                <Pressable onPress={nextMonth} style={styles.navBtn}>
                  <Text style={styles.navArrow}>›</Text>
                </Pressable>
              )}
              {isCurrentMonth && <View style={styles.navBtn} />}
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
                            <RNImage
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
                      const cell = plantedCells.get(day);
                      const hasFlower = !!cell;
                      const isHovered = hovered === day;

                      const cubeVariant = hasFlower
                        ? "flower"
                        : isHovered
                          ? "hovered"
                          : !isCurrentMonth
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
                            opacity: !isCurrentMonth ? 0.55 : 1,
                            transform: isHovered ? [{ translateY: -3 }] : [],
                          }}
                        >
                          <GrassCube size={CELL_SIZE} variant={cubeVariant} />

                          {hasFlower && cell.flower && (
                            <View
                              pointerEvents="none"
                              style={{
                                position: "absolute",
                                top: -CELL_SIZE * 0.6,
                                left: 8,
                                width: CELL_SIZE + 16,
                              }}
                            >
                              <Image
                                source={flowerImage(cell.flower.imageUrl)}
                                style={{ width: CELL_SIZE - 4, height: CELL_SIZE - 4 }}
                                contentFit="contain"
                              />
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
                            onPress={() => handleCellPress(day)}
                            // @ts-ignore
                            onHoverIn={() => isCurrentMonth && setHovered(day)}
                            // @ts-ignore
                            onHoverOut={() => setHovered(null)}
                            android_ripple={null}
                            style={{
                              position: "absolute",
                              top: CELL_SIZE * 0.05,
                              left: CELL_SIZE * 0.22,
                              width: CELL_SIZE * 0.56,
                              height: CELL_SIZE * 0.35,
                            }}
                          />
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>

              {/* Leaf counter */}
              <View style={styles.leafCounter} pointerEvents="none">
                <RNImage
                  source={require("../../assets/images/leaf_w.png")}
                  style={styles.leafIcon}
                />
                <Text style={styles.leafCount}>{plantedCells.size}</Text>
              </View>
            </View>
          </View>

          {/* Chart card — full width, outside innerWrapper */}
          <View style={styles.chartCard}>
            <GardenFlowersChart
              data={chartData}
              daysInMonth={daysInMonth}
              todayDay={isCurrentMonth ? now.getDate() : null}
            />
          </View>
        </ScrollView>
      </SafeAreaView>

      {toastMsg !== null && (
        <View style={styles.toast} pointerEvents="none">
          <Text style={styles.toastText}>{toastMsg}</Text>
        </View>
      )}

      {gardenData && selectedDay !== null && (
        <InventorySheet
          visible={sheetVisible}
          day={selectedDay}
          gardenId={gardenData.id}
          month={viewMonth + 1}
          year={viewYear}
          onClose={() => setSheetVisible(false)}
          onPlantError={() => showToast("Something went wrong")}
        />
      )}
    </PageTransition>
  );
}
