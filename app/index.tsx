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
const PREVIEW_1 = require("@/assets/images/preview_1.png");
const ILLUS_TRACK = require("@/assets/images/illustrations/illus_track.png");
const ILLUS_EARN  = require("@/assets/images/illustrations/illus_earn.png");
const ILLUS_GROW  = require("@/assets/images/illustrations/illus_grow.png");
const PREVIEW_GARDEN = require("@/assets/images/preview_garden.jpg");

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
        <Text style={styles.navName}>Money Garden</Text>
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

function IntroSection() {
  const pills = [
    { img: ILLUS_TRACK, label: "Track", sub: "Log income & expenses" },
    { img: ILLUS_EARN,  label: "Earn",  sub: "Get coins for saving" },
    { img: ILLUS_GROW,  label: "Grow",  sub: "Build your garden" },
  ];
  return (
    <View style={styles.introSection}>
      <Text style={styles.introTitle}>The app that makes budgeting feel rewarding</Text>
      <Text style={styles.introSub}>
        Stop dreading your finances. Money Garden turns every saving into a coin, every coin into a flower, and every flower into a garden that reflects who you are.
      </Text>
      <View style={styles.introPillsRow}>
        {pills.map((p) => (
          <View key={p.label} style={styles.introPill}>
            <Image source={p.img} style={styles.introPillImage} resizeMode="contain" />
            <Text style={styles.introPillLabel}>{p.label}</Text>
            <Text style={styles.introPillSub}>{p.sub}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function GardenSection({ onPress }: { onPress: () => void }) {
  const { width } = useWindowDimensions();
  const compact = width < 860;
  return (
    <View style={styles.gardenSection}>
      <View style={[styles.gardenRow, compact && { flexDirection: "column" as any }]}>
        <View style={styles.gardenTextCol}>
          <Text style={styles.gardenTitle}>Grow your own garden</Text>
          <Text style={styles.gardenBody}>
            Every saving plants a new flower. Watch your garden grow as your finances improve.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.gardenBtn, pressed && { opacity: 0.88 }]}
            onPress={onPress}
          >
            <Text style={styles.gardenBtnText}>Start Growing →</Text>
          </Pressable>
        </View>
        <View style={styles.gardenImageCol}>
          <Image source={PREVIEW_GARDEN} style={styles.gardenImage} resizeMode="contain" />
        </View>
      </View>
    </View>
  );
}

function HeroSection({ contentStyle }: {
  contentStyle: any;
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
        <View style={[styles.heroLeft, compact && { paddingHorizontal: 32 }]}>
          <Image source={APP_ICON} style={styles.heroAppIcon} />
          <Text style={[styles.heroTitle, compact && { fontSize: 38 }]}>
            Money Garden
          </Text>
          <Text style={styles.heroTagline}>
            Track your spending. Grow your garden.
          </Text>
          <Text style={styles.heroBody}>
            Money Garden is an app that helps you build healthy money habits and turn financial discipline into something you can see — a beautiful, growing garden.
          </Text>
          <View style={styles.storeBadgesRow}>
            <StoreBadge label="GET IT ON" store="Google Play" />
            <StoreBadge label="Download on the" store="App Store" />
          </View>
        </View>
        {!compact && (
          <View style={styles.heroRight}>
            <Image source={PREVIEW_1} style={styles.heroPreviewImage} resizeMode="contain" />
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
        <HeroSection contentStyle={contentStyle} />
        <IntroSection />
        <GardenSection onPress={goToApp} />
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
          <Text style={styles.footerText}>© 2026 Money Garden</Text>
        </View>
      </ScrollView>
    </View>
  );
}
