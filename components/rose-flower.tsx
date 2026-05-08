import { Image } from "expo-image";
import React from "react";
import { StyleSheet, View } from "react-native";

const FLOWER_IMAGES = [
  require("../flowers/rose_v3.png"),
  require("../flowers/bluebell_v3.png"),
  require("../flowers/Poppy_v2.png"),
  require("../flowers/Lavender.png"),
  require("../flowers/Cosmos.png"),
];

interface RoseFlowerProps {
  size?: number;
  delay?: number;
  flowerIndex?: number;
}

export function RoseFlower({ size = 48, flowerIndex = 0 }: RoseFlowerProps) {
  const source = FLOWER_IMAGES[flowerIndex % FLOWER_IMAGES.length];

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image source={source} style={{ width: size, height: size, userSelect: "none" } as any} contentFit="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
