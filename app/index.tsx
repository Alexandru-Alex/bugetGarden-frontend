import { ArcTitle } from "@/components/arc-title";
import { FlowerPetals } from "@/components/flower-petals";
import { GrassWave } from "@/components/grass-wave";
import { ThemedText } from "@/components/themed-text";
import { marketing as styles } from "@/styles/index.styles";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const BG_IMAGE = require("@/assets/images/welcome-bg.webp");
const APP_ICON = require("@/assets/images/icon.jpg");

const isWeb = Platform.OS === "web";

class GrassBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

function PhoneMockup({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.phoneFrame}>
      <View style={styles.phoneNotch} />
      <View style={styles.phoneScreen}>{children}</View>
    </View>
  );
}

function ScoreMockup() {
  return (
    <PhoneMockup>
      <Text style={styles.mockHeader}>Budget Score</Text>
      <Text style={styles.mockScoreValue}>87</Text>
      <View style={styles.mockBarBg}>
        <View style={[styles.mockBarFill, { width: "87%" as any }]} />
      </View>
      <Text style={styles.mockScoreTag}>Great job! Keep it up</Text>
    </PhoneMockup>
  );
}

function CoinsMockup() {
  return (
    <PhoneMockup>
      <Text style={styles.mockHeader}>Coins Earned</Text>
      {[
        { emoji: "🪙", amount: "+50 coins", label: "Groceries saving" },
        { emoji: "🪙", amount: "+30 coins", label: "Budget goal hit" },
        { emoji: "🪙", amount: "+20 coins", label: "No dining out" },
      ].map((item) => (
        <View key={item.label} style={styles.mockCoinRow}>
          <Text style={styles.mockCoinEmoji}>{item.emoji}</Text>
          <View style={styles.mockCoinRight}>
            <Text style={styles.mockCoinAmount}>{item.amount}</Text>
            <Text style={styles.mockCoinSub}>{item.label}</Text>
          </View>
        </View>
      ))}
    </PhoneMockup>
  );
}

function GardenMockup() {
  return (
    <PhoneMockup>
      <Text style={styles.mockHeader}>My Garden</Text>
      <View style={styles.mockGardenGrid}>
        {["🌲","🌸","🌳","🌿","🌺","🍃","🌲","🌷","🌻"].map((emoji, i) => (
          <Text key={`${emoji}-${i}`} style={styles.mockGardenEmoji}>{emoji}</Text>
        ))}
      </View>
    </PhoneMockup>
  );
}

function FeatureSection({
  icon, title, body, mockup, reversed = false, tinted = false,
}: {
  icon: string; title: string; body: string; mockup: React.ReactNode;
  reversed?: boolean; tinted?: boolean;
}) {
  const textCol = (
    <View style={styles.featureTextCol}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureBody}>{body}</Text>
    </View>
  );
  const mockCol = <View style={styles.featureMockCol}>{mockup}</View>;
  return (
    <View style={[styles.featureSection, tinted && styles.featureSectionTinted]}>
      <View style={styles.featureRow}>
        {reversed ? <>{mockCol}{textCol}</> : <>{textCol}{mockCol}</>}
      </View>
    </View>
  );
}

function StickyNav({ onPress }: { onPress: () => void }) {
  return (
    <View style={styles.stickyNav}>
      <View style={styles.navBrand}>
        <Image source={APP_ICON} style={styles.navIcon} />
        <Text style={styles.navName}>BudgetGarden</Text>
      </View>
      <Pressable style={styles.navBtn} onPress={onPress}>
        <Text style={styles.navBtnText}>Open App →</Text>
      </Pressable>
    </View>
  );
}

function HeroSection({ contentStyle, btnStyle, pulseRingStyle, onGetStarted }: {
  contentStyle: any; btnStyle: any; pulseRingStyle: any; onGetStarted: () => void;
}) {
  const time = useSharedValue(0);
  return (
    <View style={styles.heroSection}>
      <View style={styles.heroBg}>
        <Image source={BG_IMAGE} style={{ width: "100%" as any, height: "100%" as any }} resizeMode="cover" />
        <GrassBoundary>
          <GrassWave time={time} />
        </GrassBoundary>
      </View>
      <View style={[StyleSheet.absoluteFill, styles.overlay]} />
      <View style={[StyleSheet.absoluteFill, styles.petalsLayer]} pointerEvents="none">
        <FlowerPetals />
      </View>
      <Animated.View style={[styles.content, contentStyle, Platform.select({ web: { userSelect: "none" } as any })]}>
        <ArcTitle />
        <View style={styles.taglineWrap}>
          <ThemedText style={styles.tagline}>Track your money, grow your garden</ThemedText>
        </View>
        <Animated.View style={[styles.btnWrapper, btnStyle]}>
          <Pressable
            style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaButtonPressed]}
            onPress={onGetStarted}
          >
            <Animated.View style={[styles.pulseRing, pulseRingStyle]} />
            <Text style={styles.ctaText}>Get Started</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

export default function MarketingPage() {
  const router = useRouter();

  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(40);
  const btnScale = useSharedValue(1);
  const pulseRing = useSharedValue(0);

  useEffect(() => {
    fadeAnim.value = withDelay(350, withTiming(1, { duration: 900, easing: Easing.out(Easing.quad) }));
    slideAnim.value = withDelay(350, withTiming(0, { duration: 900, easing: Easing.out(Easing.quad) }));
    btnScale.value = withDelay(1200, withRepeat(withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }), -1, true));
    pulseRing.value = withDelay(1400, withRepeat(withTiming(1, { duration: 1600, easing: Easing.out(Easing.quad) }), -1, false));
  }, []);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideAnim.value }],
  }));
  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));
  const pulseRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulseRing.value * 0.55 }],
    opacity: 0.7 * (1 - pulseRing.value),
  }));

  const goToApp = () => router.push("/landing");

  useEffect(() => {
    if (!isWeb) {
      router.replace("/landing");
    }
  }, []);

  return (
    <View style={[styles.container, isWeb && styles.containerWeb]}>
      <StickyNav onPress={goToApp} />
      <ScrollView style={styles.webScroll} contentContainerStyle={styles.webScrollContent}>
        <HeroSection
          contentStyle={contentStyle}
          btnStyle={btnStyle}
          pulseRingStyle={pulseRingStyle}
          onGetStarted={goToApp}
        />
        <FeatureSection
          icon="💰"
          title="Dynamic Budget Score"
          body="See your financial health in real-time. Every transaction updates your score instantly — so you always know where you stand."
          mockup={<ScoreMockup />}
          tinted
        />
        <FeatureSection
          icon="🪙"
          title="Earn Coins"
          body="Save money, earn virtual coins. Spend them in the Garden Shop or unlock milestones on your financial roadmap."
          mockup={<CoinsMockup />}
          reversed
        />
        <FeatureSection
          icon="🌿"
          title="Grow Your Garden"
          body="Every saving plants a new tree. Watch your garden bloom as your finances grow — a living reflection of your progress."
          mockup={<GardenMockup />}
          tinted
        />
        <View style={styles.ctaSection}>
          <Text style={styles.ctaSectionTitle}>Start your garden today</Text>
          <Text style={styles.ctaSectionSub}>Track spending. Earn coins. Grow your garden.</Text>
          <Pressable
            style={({ pressed }) => [styles.ctaSectionBtn, pressed && styles.ctaSectionBtnPressed]}
            onPress={goToApp}
          >
            <Text style={styles.ctaSectionBtnText}>Get Started</Text>
          </Pressable>
        </View>
        <View style={styles.footerSection}>
          <Text style={styles.footerText}>2026 Money Garden</Text>
        </View>
      </ScrollView>
    </View>
  );
}
