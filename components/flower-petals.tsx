import React, { useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const { width: W, height: H } = Dimensions.get("window");

type PetalConfig = {
  id: number;
  startX: number;
  w: number;
  h: number;
  color: string;
  fallDuration: number;
  driftDuration: number;
  driftAmount: number;
  delay: number;
  startRotation: number;
};

// Determinist — fara Math.random ca sa fie consistent intre re-render-uri
const PETALS: PetalConfig[] = Array.from({ length: 22 }, (_, i) => {
  const t = (i * 13 + 7) % 100;
  const t2 = (i * 17 + 3) % 100;
  const t3 = (i * 11 + 19) % 100;
  return {
    id: i,
    startX: (t / 100) * W,
    w: 7 + (i % 4) * 2,
    h: 13 + (i % 5) * 3,
    color: i % 3 === 0 ? "#FFE566" : i % 3 === 1 ? "#ffffff" : "#fff9c4",
    fallDuration: 4200 + (t2 % 50) * 60,
    driftDuration: 2000 + (t3 % 30) * 50,
    driftAmount: 12 + (i % 6) * 8,
    delay: (i * 380) % 5500,
    startRotation: (i * 37) % 360,
  };
});

function Petal({ cfg }: { cfg: PetalConfig }) {
  const translateY = useSharedValue(-60);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(cfg.startRotation);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Cadere continua de sus in jos
    translateY.value = withDelay(
      cfg.delay,
      withRepeat(
        withTiming(H + 60, { duration: cfg.fallDuration, easing: Easing.linear }),
        -1,
        false,
      ),
    );

    // Deriva stanga-dreapta — efect de leganare
    translateX.value = withDelay(
      cfg.delay,
      withRepeat(
        withSequence(
          withTiming(cfg.driftAmount, { duration: cfg.driftDuration, easing: Easing.inOut(Easing.sin) }),
          withTiming(-cfg.driftAmount, { duration: cfg.driftDuration, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      ),
    );

    // Rotatie continua
    rotate.value = withDelay(
      cfg.delay,
      withRepeat(
        withTiming(cfg.startRotation + 360, {
          duration: cfg.fallDuration * 1.3,
          easing: Easing.linear,
        }),
        -1,
        false,
      ),
    );

    opacity.value = withDelay(cfg.delay, withTiming(0.82, { duration: 400 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.petal,
        {
          left: cfg.startX,
          width: cfg.w,
          height: cfg.h,
          backgroundColor: cfg.color,
          // Forma de petala: rotunjit pe diagonala principala
          borderTopLeftRadius: cfg.w * 0.9,
          borderTopRightRadius: cfg.w * 0.1,
          borderBottomRightRadius: cfg.w * 0.9,
          borderBottomLeftRadius: cfg.w * 0.1,
        },
        animStyle,
      ]}
    />
  );
}

export function FlowerPetals() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {PETALS.map((cfg) => (
        <Petal key={cfg.id} cfg={cfg} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  petal: {
    position: "absolute",
    top: 0,
  },
});
