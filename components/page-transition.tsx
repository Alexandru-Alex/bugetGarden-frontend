import React, { useEffect } from "react";
import { Platform, StyleProp, useWindowDimensions, ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function PageTransition({ children, style }: Props) {
  const { width } = useWindowDimensions();
  const translateX = useSharedValue(Platform.OS === "web" ? 0 : -width);

  useEffect(() => {
    if (Platform.OS === "web") return;
    translateX.value = withTiming(0, { duration: 280, easing: Easing.out(Easing.cubic) });
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={[style, animStyle]}>
      {children}
    </Animated.View>
  );
}
