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

const TREE_IMAGES = [
  require("../trees/pine.png"),
  require("../trees/oak.png"),
  require("../trees/candy.png"),
];

interface TreeImageProps {
  size?: number;
  delay?: number;
  treeIndex?: number;
}

export function TreeImage({ size = 96, delay = 0, treeIndex = 0 }: TreeImageProps) {
  const sway = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    sway.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 3800, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      ),
    );

    pulse.value = withDelay(
      delay + 300,
      withRepeat(
        withTiming(1.04, { duration: 2800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      ),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: size * 0.4 },
      { rotate: `${(sway.value - 0.5) * 8}deg` },
      { translateY: -size * 0.4 },
      { scale: pulse.value },
    ],
  }));

  const source = TREE_IMAGES[treeIndex % TREE_IMAGES.length];

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
    overflow: "hidden",
  },
});
