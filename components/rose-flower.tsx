import React, { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const FLOWER_IMAGES = [
  require("../flowers/lily.png"),
  require("../flowers/rose.png"),
  require("../flowers/daisy.png"),
  require("../flowers/sunflower.png"),
  require("../flowers/tulpin.png"),
];

interface RoseFlowerProps {
  size?: number;
  delay?: number;
  flowerIndex?: number;
}

export function RoseFlower({ size = 48, delay = 0, flowerIndex = 0 }: RoseFlowerProps) {
  const source = FLOWER_IMAGES[flowerIndex % FLOWER_IMAGES.length];
  const sway = useSharedValue(0);
  const pulse = useSharedValue(1);
  const sizeSV = useSharedValue(size);

  useEffect(() => {
    sizeSV.value = size;
  }, [size]);

  useEffect(() => {
    // Sway: leganare stanga-dreapta, natural si lent
    sway.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      ),
    );

    // Pulse: pulsatie subtila de scala
    pulse.value = withDelay(
      delay + 200,
      withRepeat(
        withTiming(1.06, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      ),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      // Rotatie din baza florii (transform-origin simulat cu translateY)
      { translateY: sizeSV.value * 0.4 },
      { rotate: `${(sway.value - 0.5) * 10}deg` },
      { translateY: -sizeSV.value * 0.4 },
      { scale: pulse.value },
    ],
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View style={[{ width: size, height: size }, animatedStyle]}>
        <Image
          source={source}
          style={{ width: size, height: size }}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
