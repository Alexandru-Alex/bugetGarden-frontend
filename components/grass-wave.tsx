/**
 * Native implementation (iOS/Android): Skia RuntimeEffect shader
 * care distorsioneaza pixelii ierbii din poza.
 */
import {
  Canvas,
  ImageShader,
  RuntimeEffect,
  Shader,
  useImage,
} from "@shopify/react-native-skia";
import React, { useMemo } from "react";
import { Dimensions, Image } from "react-native";
import { SharedValue, useDerivedValue } from "react-native-reanimated";

const { width: W, height: H } = Dimensions.get("window");

const BG = require("@/assets/images/welcome-bg.webp");

const SKSL = `
uniform shader image;
uniform float2 resolution;
uniform float time;

half4 main(float2 pos) {
  float normalizedY = pos.y / resolution.y;

  float grassMask = smoothstep(0.52, 0.70, normalizedY);
  float depthAmp   = smoothstep(0.62, 1.0,  normalizedY);

  float wave =
    sin(pos.x * 0.022 + time * 1.3) * 5.0 +
    sin(pos.x * 0.011 - time * 0.85) * 4.0 +
    sin(pos.x * 0.005 + time * 0.5)  * 7.0;

  float dx = wave * grassMask * depthAmp;

  float2 displaced = float2(pos.x + dx, pos.y);
  return image.eval(displaced);
}
`;

interface Props {
  time: SharedValue<number>;
}

export function GrassWave({ time }: Props) {
  const image = useImage(BG);
  const effect = useMemo(() => RuntimeEffect?.Make?.(SKSL) ?? null, []);

  const uniforms = useDerivedValue(() => ({
    resolution: [W, H],
    time: time.value,
  }));

  if (!effect) {
    return (
      <Image
        source={BG}
        style={{ width: W, height: H }}
        resizeMode="cover"
      />
    );
  }

  if (!image) return null;

  return (
    <Canvas style={{ width: W, height: H }}>
      <Shader
        source={effect}
        uniforms={uniforms}
      >
        <ImageShader
          image={image}
          fit="cover"
          rect={{ x: 0, y: 0, width: W, height: H }}
        />
      </Shader>
    </Canvas>
  );
}
