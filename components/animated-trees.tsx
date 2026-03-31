import React, { useEffect } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

const TREE_TYPES = ["🌳", "🌲", "🌴", "🎋", "🌵"];

interface AnimatedTreeProps {
  x: string;
  y: string;
  size: "small" | "medium" | "large";
  treeType: number;
}

function AnimatedTree({ x, y, size, treeType }: AnimatedTreeProps) {
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 3,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: -3,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [rotateAnim]);

  const rotation = rotateAnim.interpolate({
    inputRange: [-3, 3],
    outputRange: ["-3deg", "3deg"],
  });

  const sizeMap = {
    small: { width: 40, height: 50, fontSize: 30 },
    medium: { width: 60, height: 80, fontSize: 45 },
    large: { width: 80, height: 100, fontSize: 60 },
  };

  const { width, height, fontSize } = sizeMap[size];

  return (
    <Animated.View
      style={[
        styles.treeContainer,
        {
          left: x,
          top: y,
          width,
          height,
          transform: [{ rotate: rotation }],
        } as any,
      ]}
    >
      <Text style={[styles.foliage, { fontSize }]}>
        {TREE_TYPES[treeType % TREE_TYPES.length]}
      </Text>
    </Animated.View>
  );
}

interface AnimatedCoinProps {
  x: string;
  y: string;
}

function AnimatedCoin({ x, y }: AnimatedCoinProps) {
  const floatAnim = React.useRef(new Animated.Value(0)).current;
  const spinAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Float animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -20,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 20,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Spin animation
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [floatAnim, spinAnim]);

  const translateY = floatAnim.interpolate({
    inputRange: [-20, 20],
    outputRange: [0, 40],
  });

  const rotate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View
      style={[
        styles.coinContainer,
        {
          left: x,
          top: y,
          transform: [{ translateY }, { rotate }],
        } as any,
      ]}
    >
      <Text style={styles.coin}>🪙</Text>
    </Animated.View>
  );
}

export function AnimatedTreesBackground() {
  const trees = [
    // Top row
    { x: "5%", y: "5%", size: "small" as const, type: 0 },
    { x: "15%", y: "2%", size: "large" as const, type: 1 },
    { x: "30%", y: "8%", size: "medium" as const, type: 2 },
    { x: "50%", y: "3%", size: "small" as const, type: 3 },
    { x: "65%", y: "10%", size: "large" as const, type: 4 },
    { x: "80%", y: "5%", size: "medium" as const, type: 0 },
    { x: "92%", y: "8%", size: "small" as const, type: 1 },

    // Middle row
    { x: "10%", y: "35%", size: "medium" as const, type: 2 },
    { x: "88%", y: "40%", size: "large" as const, type: 3 },

    // Bottom row
    { x: "5%", y: "75%", size: "large" as const, type: 4 },
    { x: "20%", y: "82%", size: "medium" as const, type: 0 },
    { x: "40%", y: "78%", size: "small" as const, type: 1 },
    { x: "60%", y: "80%", size: "large" as const, type: 2 },
    { x: "75%", y: "75%", size: "medium" as const, type: 3 },
    { x: "90%", y: "82%", size: "small" as const, type: 4 },
  ];

  const coins = [
    { x: "20%", y: "20%" },
    { x: "45%", y: "45%" },
    { x: "70%", y: "30%" },
    { x: "25%", y: "60%" },
    { x: "80%", y: "50%" },
  ];

  return (
    <View style={styles.backgroundContainer}>
      {/* Trees */}
      {trees.map((tree, idx) => (
        <AnimatedTree
          key={`tree-${idx}`}
          x={tree.x}
          y={tree.y}
          size={tree.size}
          treeType={tree.type}
        />
      ))}

      {/* Coins */}
      {coins.map((coin, idx) => (
        <AnimatedCoin key={`coin-${idx}`} x={coin.x} y={coin.y} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
    opacity: 0.15,
    pointerEvents: "none",
  },
  treeContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  foliage: {
    textAlign: "center",
  },
  coinContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  coin: {
    fontSize: 24,
    textAlign: "center",
  },
});
