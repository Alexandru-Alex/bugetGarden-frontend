import { flowerImage } from "@/lib/flower-images";
import { GardenCellDto } from "@/lib/types";
import { Image as ExpoImage } from "expo-image";
import React, { forwardRef } from "react";
import { Image, Text, View } from "react-native";
import { GrassCube } from "./grass-cube";

const COLS = 7;
const ROWS = 7;
const INNER_COLS = 6;
export const SHARE_CARD_WIDTH = 360;
const CELL_SIZE = 46;

const isoXOffset = (ROWS - 1) * (CELL_SIZE / 2);
const isoW = (COLS + ROWS - 2) * (CELL_SIZE / 2) + CELL_SIZE;
const isoH = (COLS + ROWS - 2) * (CELL_SIZE / 4) + CELL_SIZE;

const tiles = Array.from({ length: ROWS }, (_, r) =>
  Array.from({ length: COLS }, (_, c) => ({ r, c }))
).flat().sort((a, b) => (a.r + a.c) - (b.r + b.c));

interface Props {
  plantedCells: Map<number, GardenCellDto>;
  captureDate: string;
}

export const GardenShareCard = forwardRef<View, Props>(
  ({ plantedCells, captureDate }, ref) => (
    <View
      ref={ref}
      collapsable={false}
      style={{ width: SHARE_CARD_WIDTH, backgroundColor: "#fff", borderRadius: 16, overflow: "hidden" }}
    >
      {/* Garden grid area */}
      <View style={{ backgroundColor: "#346739", alignItems: "center" }}>
        <View style={{ paddingTop: CELL_SIZE * 0.65, paddingBottom: 8 }}>
          <View style={{ width: isoW, height: isoH, position: "relative", overflow: "visible" }}>
            {tiles.map(({ r: row, c: col }) => {
              const x = isoXOffset + (col - row) * (CELL_SIZE / 2);
              const y = (col + row) * (CELL_SIZE / 4);

              const isCorner = row === 0 && col === 0;
              const isFenceRight = row === 0 && col > 0;
              const isFenceLeft = col === 0 && row > 0;

              if (isCorner || isFenceRight || isFenceLeft) {
                const src = isCorner
                  ? require("../gradina/colt.png")
                  : isFenceRight
                    ? require("../gradina/gard_dreapta.png")
                    : require("../gradina/gard_stanga.png");
                const scale = 1.30;
                const imgSize = CELL_SIZE * scale;
                const offsetX = -(CELL_SIZE * (scale - 1)) / 2;
                const offsetY = -(CELL_SIZE * (scale - 1)) * 0.65 - CELL_SIZE * 0.07;

                return (
                  <View
                    key={`${row}-${col}`}
                    pointerEvents="none"
                    style={{ position: "absolute", left: x, top: y, width: CELL_SIZE, height: CELL_SIZE, overflow: "visible" }}
                  >
                    <Image
                      source={src}
                      style={{ position: "absolute", left: offsetX, top: offsetY, width: imgSize, height: imgSize }}
                      resizeMode="stretch"
                    />
                  </View>
                );
              }

              const day = (row - 1) * INNER_COLS + (col - 1) + 1;
              const cell = plantedCells.get(day);
              const hasFlower = !!cell;

              return (
                <View
                  key={`${row}-${col}`}
                  pointerEvents="none"
                  style={{ position: "absolute", left: x, top: y, width: CELL_SIZE, height: CELL_SIZE, overflow: "visible" }}
                >
                  <GrassCube size={CELL_SIZE} variant={hasFlower ? "flower" : "normal"} />
                  {hasFlower && cell.flower && (
                    <View
                      pointerEvents="none"
                      style={{ position: "absolute", top: -CELL_SIZE * 0.6, left: 8, width: CELL_SIZE + 16 }}
                    >
                      <ExpoImage
                        source={flowerImage(cell.flower.imageUrl)}
                        style={{ width: CELL_SIZE - 4, height: CELL_SIZE - 4 }}
                        contentFit="contain"
                      />
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* Flower count badge — top-right corner of the card */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          backgroundColor: "#346739",
          borderRadius: 20,
          paddingHorizontal: 10,
          paddingVertical: 4,
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
        }}
      >
        <Image
          source={require("../assets/images/leaf_w.png")}
          style={{ width: 16, height: 16, resizeMode: "contain" }}
        />
        <Text style={{ color: "#fff", fontSize: 13, fontFamily: "Nunito_800ExtraBold" }}>
          {plantedCells.size}
        </Text>
      </View>

      {/* Footer — logo left, date right */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 14,
          paddingVertical: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
          <Image
            source={require("../assets/images/icon.webp")}
            style={{ width: 26, height: 26, borderRadius: 6 }}
          />
          <Text style={{ color: "#346739", fontSize: 11, fontFamily: "Nunito_800ExtraBold" }}>
            BudgetGarden
          </Text>
        </View>
        <Text style={{ color: "#aaa", fontSize: 10, fontFamily: "Nunito_700Bold" }}>
          {captureDate}
        </Text>
      </View>
    </View>
  )
);
