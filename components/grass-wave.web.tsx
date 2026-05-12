import { Image } from "expo-image";
import React from "react";
import { useWindowDimensions, View } from "react-native";
import { SharedValue } from "react-native-reanimated";

const DEFAULT_BG = require("@/assets/images/welcome-index.webp");

interface Props {
  time: SharedValue<number>;
  source?: ReturnType<typeof require>;
}

// Web replacement: static image, zero canvas/shader overhead.
// The Skia grass-wave shader runs on the main thread via WebGL on web
// and causes ~28 s of "Other" work in Lighthouse. A plain cover image
// eliminates that entirely and keeps Skia out of the web bundle.
export function GrassWave({ source }: Props) {
  const { width, height } = useWindowDimensions();
  return (
    <View style={{ width, height, overflow: "hidden" }}>
      <Image
        source={source ?? DEFAULT_BG}
        style={{ width, height }}
        contentFit="cover"
        priority="high"
      />
    </View>
  );
}
