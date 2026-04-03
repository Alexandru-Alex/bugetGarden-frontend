import { FlowerPetals } from "@/components/flower-petals";
import { GrassWave } from "@/components/grass-wave";
import { ThemedText } from "@/components/themed-text";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Dimensions, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Defs, Path as SvgPath, Text as SvgText, TextPath } from "react-native-svg";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: W } = Dimensions.get("window");

// Două arcuri concentrice — "Buget" exterior, "Garden" interior (badge style)
const SVG_W = W - 16;
const R_OUT = 162;
const R_IN  = 108;
const CX = SVG_W / 2;
const CY = R_OUT + 70;
const SVG_H = CY + 12;
const ARC_OUT = `M ${CX - R_OUT},${CY} A ${R_OUT},${R_OUT} 0 0,1 ${CX + R_OUT},${CY}`;
const ARC_IN  = `M ${CX - R_IN},${CY} A ${R_IN},${R_IN} 0 0,1 ${CX + R_IN},${CY}`;

const SHADOW_LAYERS = [
  { dy: 7, fill: "rgba(90,40,0,0.9)" },
  { dy: 5, fill: "rgba(150,70,0,0.65)" },
  { dy: 3, fill: "rgba(200,120,5,0.45)" },
  { dy: 1, fill: "rgba(240,175,40,0.25)" },
];

function ArcWord({ pathId, word, fontSize }: { pathId: string; word: string; fontSize: number }) {
  return (
    <>
      {SHADOW_LAYERS.map(({ dy, fill }, i) => (
        <SvgText key={i} fontFamily="Pacifico_400Regular" fontSize={fontSize} fill={fill} dy={dy}>
          <TextPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">{word}</TextPath>
        </SvgText>
      ))}
      <SvgText fontFamily="Pacifico_400Regular" fontSize={fontSize} fill="#FFE566" stroke="#FFE566" strokeWidth={2.5} dy={0}>
        <TextPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">{word}</TextPath>
      </SvgText>
    </>
  );
}

function ArcTitle() {
  return (
    <Svg width={SVG_W} height={SVG_H} style={{ overflow: "visible" }}>
      <Defs>
        <SvgPath id="arc-out" d={ARC_OUT} fill="none" />
        <SvgPath id="arc-in"  d={ARC_IN}  fill="none" />
      </Defs>
      <ArcWord pathId="arc-out" word="Buget"  fontSize={58} />
      <ArcWord pathId="arc-in"  word="Garden" fontSize={50} />
    </Svg>
  );
}

export default function LandingScreen() {
  const router = useRouter();

  const time = useSharedValue(0);
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(40);
  const btnScale = useSharedValue(1);
  const pulseRing = useSharedValue(0);

  useEffect(() => {
    if (Platform.OS !== "web") {
      time.value = withRepeat(
        withTiming(1000, { duration: 1_000_000, easing: Easing.linear }),
        -1,
        false,
      );
    }

    fadeAnim.value = withDelay(
      350,
      withTiming(1, { duration: 900, easing: Easing.out(Easing.quad) }),
    );
    slideAnim.value = withDelay(
      350,
      withTiming(0, { duration: 900, easing: Easing.out(Easing.quad) }),
    );
    btnScale.value = withDelay(
      1200,
      withRepeat(
        withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      ),
    );
    pulseRing.value = withDelay(
      1400,
      withRepeat(
        withTiming(1, { duration: 1600, easing: Easing.out(Easing.quad) }),
        -1,
        false,
      ),
    );
  }, []);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideAnim.value }],
  }));

  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  const pulseRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulseRing.value * 0.55 }],
    opacity: 0.7 * (1 - pulseRing.value),
  }));

  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFill}>
        <GrassWave time={time} />
      </View>

      <View style={styles.overlay} />
      <FlowerPetals />

      <SafeAreaView style={styles.safe}>
        <Animated.View style={[styles.content, contentStyle]}>
          <Text style={styles.emoji}>🌱</Text>

          <ArcTitle />

          <ThemedText style={styles.tagline}>
            Save smartly, grow your garden
          </ThemedText>

          <Animated.View style={[styles.btnWrapper, btnStyle]}>
            <Pressable
              style={({ pressed }) => [
                styles.ctaButton,
                pressed && styles.ctaButtonPressed,
              ]}
              onPress={() => router.replace("/(tabs)")}
            >
              <Animated.View style={[styles.pulseRing, pulseRingStyle]} />
              <Text style={styles.ctaText}>Get Started 🌿</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#5a9e2f",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.12)",
  },
  safe: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 80,
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 4,
  },
  emoji: {
    fontSize: 60,
    marginBottom: 2,
  },
  tagline: {
    fontSize: 15,
    fontFamily: "Nunito_800ExtraBold",
    color: "#ffffff",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    textShadowColor: "rgba(0,0,0,0.55)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.22)",
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 2,
    marginBottom: 22,
  },
  pulseRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.8)",
  },
  btnWrapper: {
    alignItems: "center",
  },
  ctaButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 11,
    paddingHorizontal: 30,
    borderRadius: 50,
    alignItems: "center",
    shadowColor: "#ffffff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.6)",
  },
  ctaButtonPressed: {
    backgroundColor: "#e8f5e9",
    transform: [{ scale: 0.97 }],
  },
  ctaText: {
    color: "#1b5e20",
    fontSize: 16,
    fontFamily: "Nunito_800ExtraBold",
    letterSpacing: 0.6,
  },
});
