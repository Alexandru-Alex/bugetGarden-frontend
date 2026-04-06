import React from "react";
import { Image, View } from "react-native";

type GrassCubeVariant = "normal" | "hovered" | "today" | "future" | "flower";

// Overlay color + opacity per variant (null = no overlay)
const OVERLAYS: Record<GrassCubeVariant, { color: string; opacity: number } | null> = {
  normal: null,
  hovered: null,
  today:   { color: "#f5ef60", opacity: 0.35 },
  future:  { color: "#c8e8ff", opacity: 0.40 },
  flower:  null,
};

interface GrassCubeProps {
  size: number;
  variant?: GrassCubeVariant;
}

export function GrassCube({ size, variant = "normal" }: GrassCubeProps) {
  const overlay = OVERLAYS[variant];

  // Scalăm imaginea pentru a elimina marginea transparentă din PNG.
  // Offset orizontal centrat; offset vertical mai sus (umbra cubului e jos).
  const scale = 1.30;
  const imgSize = size * scale;
  const offsetX = -(size * (scale - 1)) / 2;
  const offsetY = -(size * (scale - 1)) * 0.65; // mută mai sus, umbra rămâne jos

  return (
    <View pointerEvents="none" style={{ width: size, height: size, overflow: "visible" }}>
      <Image
        source={require("../gradina/iarba_4.png")}
        style={{
          position: "absolute",
          left: offsetX,
          top: offsetY,
          width: imgSize,
          height: imgSize,
        }}
        resizeMode="stretch"
      />
      {overlay && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: size,
            height: size,
            backgroundColor: overlay.color,
            opacity: overlay.opacity,
          }}
        />
      )}
    </View>
  );
}
