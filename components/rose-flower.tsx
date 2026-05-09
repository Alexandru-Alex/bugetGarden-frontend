import { Image } from "expo-image";
import React from "react";
import { StyleSheet, View } from "react-native";

interface RoseFlowerProps {
  imageUrl: string;
  size?: number;
}

export function RoseFlower({ imageUrl, size = 48 }: RoseFlowerProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={{ uri: imageUrl }}
        style={{ width: size, height: size, userSelect: "none" } as any}
        contentFit="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
