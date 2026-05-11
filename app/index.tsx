import { FlowerPetals } from "@/components/flower-petals";
import { GrassWave } from "@/components/grass-wave";
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
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

const BG_IMAGE = require("@/assets/images/welcome-bg.webp");
const APP_ICON = require("@/assets/images/icon.jpg");
const PREVIEW_PHONE = require("@/assets/images/preview_phone.png");

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

function StoreBadge({ label, store }: { label: string; store: string }) {
  return (
    <View style={styles.storeBadge}>
      <Text style={styles.storeBadgeSmall}>{label}</Text>
      <Text style={styles.storeBadgeBig}>{store}</Text>
    </View>
  );
}

function HeroSection({ contentStyle, onGetStarted }: {
  contentStyle: any; onGetStarted: () => void;
}) {
  const time = useSharedValue(0);
  const { width } = useWindowDimensions();
  const compact = width < 860;

  return (
    <View style={styles.heroSection}>
      <View style={styles.heroBg}>
        <Image
          source={BG_IMAGE}
          style={{ width: "100%" as any, height: "100%" as any }}
          resizeMode="cover"
        />
        <GrassBoundary>
          <GrassWave time={time} />
        </GrassBoundary>
      </View>
      <View style={[StyleSheet.absoluteFill, styles.overlay]} />
      <View style={[StyleSheet.absoluteFill, styles.petalsLayer]} pointerEvents="none">
        <FlowerPetals />
      </View>
      <Animated.View
        style={[
          styles.heroContent,
          compact && { flexDirection: "column" as any, alignItems: "center" },
          contentStyle,
          Platform.select({ web: { userSelect: "none" } as any }),
        ]}
      >
        <View style={[styles.heroLeft, compact && { alignItems: "center", paddingHorizontal: 32 }]}>
          <Image source={APP_ICON} style={styles.heroAppIcon} />
          <Text style={[styles.heroTitle, compact && { textAlign: "center", fontSize: 38 }]}>
            BudgetGarden
          </Text>
          <Text style={[styles.heroTagline, compact && { textAlign: "center" }]}>
            Track your spending. Grow your garden.
          </Text>
          <Text style={[styles.heroBody, compact && { textAlign: "center" }]}>
            BudgetGarden is an app that helps you build healthy money habits and turn financial discipline into something you can see — a beautiful, growing garden.
          </Text>
          <View style={styles.storeBadgesRow}>
            <StoreBadge label="GET IT ON" store="Google Play" />
            <StoreBadge label="Download on the" store="App Store" />
          </View>
        </View>
        {!compact && (
          <View style={styles.heroRight}>
            <View style={styles.heroPhoneWrap}>
              <View style={styles.heroPhoneNotch} />
              <View style={styles.heroPhoneScreen}>
                <Image source={PREVIEW_PHONE} style={styles.heroPhoneImage} resizeMode="cover" />
              </View>
            </View>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

export default function MarketingPage() {
  const router = useRouter();

  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(40);

  useEffect(() => {
    fadeAnim.value = withDelay(350, withTiming(1, { duration: 900, easing: Easing.out(Easing.quad) }));
    slideAnim.value = withDelay(350, withTiming(0, { duration: 900, easing: Easing.out(Easing.quad) }));
  }, []);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideAnim.value }],
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
        <HeroSection contentStyle={contentStyle} onGetStarted={goToApp} />
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
