import { Image } from "expo-image";
import React from "react";
import { StyleSheet, View } from "react-native";
import { SharedValue } from "react-native-reanimated";

const DEFAULT_BG = require("@/assets/images/welcome-bg.webp");

interface Props {
  time: SharedValue<number>;
  source?: ReturnType<typeof require>;
}

// Web replacement for the Skia shader — fills the absoluteFill heroBg
// parent without measuring the viewport (which breaks on mobile web).
export function GrassWave({ source }: Props) {
  return (
    <View style={StyleSheet.absoluteFill}>
      <Image
        source={source ?? DEFAULT_BG}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        priority="high"
      />
    </View>
  );
}
