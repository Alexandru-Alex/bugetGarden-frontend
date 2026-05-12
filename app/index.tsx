import { GrassWave } from "@/components/grass-wave";
import { marketing as styles } from "@/styles/index.styles";
import Head from "expo-router/head";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Image } from "expo-image";
import {
  Linking,
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

const BG_IMAGE = require("@/assets/images/welcome-index.webp");
const APP_ICON = require("@/assets/images/icon.webp");
const PREVIEW_1 = require("@/assets/images/preview_1.webp");
const ILLUS_TRACK  = require("@/assets/images/illustrations/illus_track.webp");
const ILLUS_EARN   = require("@/assets/images/illustrations/illus_earn.webp");
const ILLUS_GROW   = require("@/assets/images/illustrations/illus_grow.webp");
const ILLUS_SCORE  = require("@/assets/images/illustrations/illus_score.webp");
const ILLUS_CELEB  = require("@/assets/images/illustrations/illus_celebrate.webp");
const ILLUS_GROWTH = require("@/assets/images/illustrations/illus_growth.webp");
const PREVIEW_GARDEN = require("@/assets/images/preview_garden.webp");

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

function FeaturesSection() {
  const features = [
    {
      img: ILLUS_SCORE,
      icon: "💰",
      title: "Dynamic Budget Score",
      alt: "Budget score indicator showing financial health",
      body: "See your financial health in real-time. Every transaction updates your score instantly — so you always know where you stand.",
    },
    {
      img: ILLUS_CELEB,
      icon: "🪙",
      title: "Earn Coins",
      alt: "Coins earned from saving money",
      body: "Save money, earn virtual coins. Spend them in the Garden Shop or unlock milestones on your financial roadmap.",
    },
    {
      img: ILLUS_GROWTH,
      icon: "🌿",
      title: "Grow Your Garden",
      alt: "Virtual garden growing as finances improve",
      body: "Every saving plants a new tree. Watch your garden bloom as your finances grow — a living reflection of your progress.",
    },
  ];
  return (
    <View style={styles.featuresSection}>
      <View style={styles.featuresRow}>
        {features.map((f) => (
          <View key={f.title} style={styles.featuresCard}>
            <Image source={f.img} style={styles.featuresCardImage} contentFit="contain" alt={f.alt} priority="low" />
            <Text style={styles.featuresCardIcon}>{f.icon}</Text>
            <Text style={styles.featuresCardTitle}>{f.title}</Text>
            <Text style={styles.featuresCardBody}>{f.body}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function StickyNav({ onOpenApp }: { onOpenApp: () => void }) {
  return (
    <View style={styles.stickyNav}>
      <Pressable
        style={({ pressed }) => [styles.contactBtn, pressed && { opacity: 0.72 }]}
        onPress={() => Linking.openURL("mailto:help@getmoneygarden.com")}
      >
        <Text style={styles.contactBtnText}>Contact Us</Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.floatingOpenApp, pressed && { opacity: 0.82 }]}
        onPress={onOpenApp}
      >
        <Text style={styles.floatingOpenAppText}>Open App →</Text>
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
    { img: ILLUS_TRACK, label: "Track", sub: "Log income & expenses", alt: "Track your expenses illustration" },
    { img: ILLUS_EARN,  label: "Earn",  sub: "Get coins for saving",  alt: "Earn gold coins for saving illustration" },
    { img: ILLUS_GROW,  label: "Grow",  sub: "Build your garden",     alt: "Grow your virtual garden illustration" },
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
            <Image source={p.img} style={styles.introPillImage} contentFit="contain" alt={p.alt} priority="low" />
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
          <Image source={PREVIEW_GARDEN} style={styles.gardenImage} contentFit="contain" alt="Money Garden virtual garden growing with saved coins" priority="low" />
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
        <GrassBoundary>
          <GrassWave time={time} source={BG_IMAGE} />
        </GrassBoundary>
      </View>
      <View style={[StyleSheet.absoluteFill, styles.overlay]} />
      <Animated.View
        style={[
          styles.heroContent,
          compact && { flexDirection: "column" as any, alignItems: "center" },
          contentStyle,
          Platform.select({ web: { userSelect: "none" } as any }),
        ]}
      >
        <View style={[styles.heroLeft, compact && { paddingHorizontal: 32 }]}>
          <Image source={APP_ICON} style={styles.heroAppIcon} alt="Money Garden app icon" />
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
            <Image source={PREVIEW_1} style={styles.heroPreviewImage} contentFit="contain" alt="Money Garden app preview showing budget dashboard" />
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
      <Head>
        <title>Money Garden - Track, Earn, Grow</title>
        <meta property="og:url" content="https://getmoneygarden.com/" />
      </Head>
      <StickyNav onOpenApp={goToApp} />
      <ScrollView style={styles.webScroll} contentContainerStyle={styles.webScrollContent}>
        <HeroSection contentStyle={contentStyle} />
        <IntroSection />
        <GardenSection onPress={goToApp} />
        <FeaturesSection />
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
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>© 2026 Money Garden</Text>
            <Text style={styles.footerDot}> · </Text>
            <Pressable onPress={() => router.push("/privacy-policy")}>
              <Text style={styles.footerLink}>Privacy Policy</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
