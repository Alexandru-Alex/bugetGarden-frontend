import { AnimatedTreesBackground } from "@/components/animated-trees";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type PhaseStatus = "active" | "upcoming";

interface Phase {
  id: number;
  emoji: string;
  title: string;
  subtitle: string;
  status: PhaseStatus;
  tagline: string;
  items: string[];
}

const PHASES: Phase[] = [
  {
    id: 1,
    emoji: "🌿",
    title: "Start Your Garden",
    subtitle: "4–6 weeks · Coming Soon",
    status: "active",
    tagline: "Start simple. See your progress instantly.",
    items: [
      "💰 Add your income and daily expenses",
      "📊 Get your daily Budget Score",
      "🪙 Earn coins when you stay within your budget",
      "🌱 Plant your first tree in your garden",
    ],
  },
  {
    id: 2,
    emoji: "🌳",
    title: "Grow & Stay Consistent",
    subtitle: "3–4 weeks · In Development",
    status: "upcoming",
    tagline: "The more consistent you are, the more your garden grows.",
    items: [
      "🔥 Daily streaks to stay consistent",
      "🌿 More plants and tree types",
      "🎁 Bonus rewards for consistency",
      "📅 Full monthly garden view",
    ],
  },
  {
    id: 3,
    emoji: "🌸",
    title: "Understand Your Money",
    subtitle: "3–5 weeks · Planned",
    status: "upcoming",
    tagline: "Don't just save — understand your money.",
    items: [
      "📊 Simple and clear statistics",
      "🧠 Smart insights about your spending",
      "📉 Track your score over time",
    ],
  },
  {
    id: 4,
    emoji: "🌍",
    title: "Your Garden, Your World",
    subtitle: "4–6 weeks · Future Vision",
    status: "upcoming",
    tagline: "Your garden becomes a reflection of your discipline.",
    items: [
      "🎨 Customize your garden",
      "🌦️ Themes and seasonal visuals",
      "🏆 Achievements and long-term progress",
    ],
  },
  {
    id: 5,
    emoji: "🤝",
    title: "Grow Together",
    subtitle: "5–7 weeks · Future",
    status: "upcoming",
    tagline: "Stay motivated with others on the same journey.",
    items: [
      "👥 Share your progress with friends",
      "🏆 Challenges and competitions",
      "🌱 Compare gardens",
    ],
  },
];

const SEPARATORS = [
  ["🌸", "🐝", "🌿", "🌼", "🦋"],
  ["🍀", "🐞", "🌻", "🌱", "🌸"],
  ["🦋", "🌿", "🌺", "🐛", "🍃"],
  ["🌼", "🌱", "🐝", "🌾", "🌸"],
];

// Growth stage for each phase id
const GROWTH_STAGES = ["🌰", "🌱", "🌿", "🌳", "🌻"];

export default function RoadmapScreen() {
  const router = useRouter();

  return (
    <ScrollView
      style={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollBase}
    >
      <View style={styles.container}>
        <AnimatedTreesBackground />

        <View style={styles.contentWrapper}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>

          <Header />

          <GrassRow emojis={["🌱", "🌿", "🌱", "🌾", "🌱", "🌿", "🌱"]} />

          {PHASES.map((phase, index) => (
            <React.Fragment key={phase.id}>
              <PhaseCard phase={phase} index={index} delay={index * 150} />
              {index < PHASES.length - 1 && (
                <GardenSeparator emojis={SEPARATORS[index % SEPARATORS.length]} />
              )}
            </React.Fragment>
          ))}

          <GrassRow emojis={["🌻", "🌿", "🌸", "🌾", "🌼", "🌿", "🌻"]} />

          <FooterSign />
        </View>
      </View>
    </ScrollView>
  );
}

function Header() {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [floatAnim]);

  return (
    <View style={styles.headerSection}>
      <Animated.View
        style={[styles.logoContainer, { transform: [{ translateY: floatAnim }] }]}
      >
        <Text style={styles.logoEmoji}>🗺️</Text>
      </Animated.View>
      <Text style={styles.mainTitle}>Garden Roadmap</Text>
      <Text style={styles.subtitle}>
        Watch BugetGarden grow from a tiny seed{"\n"}into a flourishing garden 🌻
      </Text>
    </View>
  );
}

function GrassRow({ emojis }: { emojis: string[] }) {
  return (
    <View style={styles.grassRow}>
      {emojis.map((e, i) => (
        <Text key={i} style={styles.grassEmoji}>{e}</Text>
      ))}
    </View>
  );
}

function GardenSeparator({ emojis }: { emojis: string[] }) {
  return (
    <View style={styles.separatorContainer}>
      <View style={styles.separatorLine} />
      <View style={styles.separatorEmojis}>
        {emojis.map((e, i) => (
          <FloatingEmoji key={i} emoji={e} delay={i * 200} />
        ))}
      </View>
      <View style={styles.separatorLine} />
    </View>
  );
}

function FloatingEmoji({ emoji, delay }: { emoji: string; delay: number }) {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -5,
          duration: 1200 + delay * 0.3,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1200 + delay * 0.3,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [floatAnim, delay]);

  return (
    <Animated.Text
      style={[styles.separatorEmoji, { transform: [{ translateY: floatAnim }] }]}
    >
      {emoji}
    </Animated.Text>
  );
}

function PhaseCard({
  phase,
  index,
  delay,
}: {
  phase: Phase;
  index: number;
  delay: number;
}) {
  const slideAnim = useRef(new Animated.Value(60)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const wobbleAnim = useRef(new Animated.Value(0)).current;

  const isActive = phase.status === "active";
  const tilt = index % 2 === 0 ? "-1.5deg" : "1.5deg";

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
    ]).start();

    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ]),
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(wobbleAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(wobbleAnim, {
            toValue: -1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(wobbleAnim, {
            toValue: 0,
            duration: 1000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [isActive, delay]);

  const wobbleRotation = wobbleAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ["-1deg", "0deg", "1deg"],
  });

  const cardBg = isActive ? "#1A2E0E" : "#1C1208";
  const cardBorder = isActive ? "#4CAF50" : "#5C3D1A";
  const borderWidth = isActive ? 2 : 1.5;
  const shadowColor = isActive ? "#4CAF50" : "#8B6914";

  return (
    <Animated.View
      style={[
        styles.cardOuter,
        {
          opacity: opacityAnim,
          transform: [
            { translateY: slideAnim },
            { rotate: isActive ? wobbleRotation : tilt },
          ],
          shadowColor,
          shadowOpacity: isActive ? 0.6 : 0.25,
        },
      ]}
    >
      <View
        style={[
          styles.card,
          { backgroundColor: cardBg, borderColor: cardBorder, borderWidth },
        ]}
      >
        {/* Top nails */}
        <View style={styles.nailRow}>
          <View style={[styles.nail, { backgroundColor: isActive ? "#4CAF50" : "#8B6914" }]} />
          <View style={[styles.nail, { backgroundColor: isActive ? "#4CAF50" : "#8B6914" }]} />
        </View>

        {/* Emoji bubble */}
        <View style={styles.emojiSection}>
          <View
            style={[
              styles.emojiBubble,
              { backgroundColor: isActive ? "rgba(76,175,80,0.2)" : "rgba(139,105,20,0.15)" },
            ]}
          >
            <Text style={styles.phaseEmoji}>{phase.emoji}</Text>
          </View>
          {isActive && <ActiveBadge />}
        </View>

        {/* Growth progress */}
        <View style={styles.growthRow}>
          {GROWTH_STAGES.map((g, i) => (
            <Text
              key={i}
              style={[
                styles.growthStage,
                i === phase.id - 1 && styles.growthStageCurrent,
                i < phase.id - 1 && styles.growthStagePast,
              ]}
            >
              {g}
            </Text>
          ))}
        </View>

        {/* Title */}
        <Text style={[styles.cardTitle, isActive && styles.cardTitleActive]}>
          {phase.title}
        </Text>
        <Text style={styles.cardSubtitle}>{phase.subtitle}</Text>

        {/* Divider */}
        <View
          style={[
            styles.cardDivider,
            { backgroundColor: isActive ? "rgba(76,175,80,0.3)" : "rgba(139,105,20,0.3)" },
          ]}
        />

        {/* Items */}
        <View style={styles.itemsContainer}>
          {phase.items.map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <Text style={styles.itemBullet}>{isActive ? "🌱" : "○"}</Text>
              <Text style={[styles.itemText, !isActive && styles.itemTextUpcoming]}>
                {item}
              </Text>
            </View>
          ))}
        </View>

        {/* Tagline */}
        <View
          style={[
            styles.taglineBox,
            { borderColor: isActive ? "rgba(76,175,80,0.4)" : "rgba(139,105,20,0.3)" },
          ]}
        >
          <Text style={[styles.taglineText, isActive && styles.taglineTextActive]}>
            👉 {phase.tagline}
          </Text>
        </View>

        {/* Bottom nails */}
        <View style={styles.nailRow}>
          <View style={[styles.nail, { backgroundColor: isActive ? "#4CAF50" : "#8B6914" }]} />
          <View style={[styles.nail, { backgroundColor: isActive ? "#4CAF50" : "#8B6914" }]} />
        </View>
      </View>
    </Animated.View>
  );
}

function ActiveBadge() {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnim]);

  return (
    <Animated.View style={[styles.activeBadge, { transform: [{ scale: pulseAnim }] }]}>
      <Text style={styles.activeBadgeText}>🌟 Now Growing!</Text>
    </Animated.View>
  );
}

function FooterSign() {
  return (
    <View style={styles.footerSign}>
      <View style={styles.footerSignPost} />
      <View style={styles.footerSignBoard}>
        <Text style={styles.footerSignNail}>●   ●</Text>
        <Text style={styles.footerText}>
          We're not just building a finance app —{"\n"}
          we're building a system that helps you{"\n"}
          stay consistent, motivated, and in{"\n"}
          control of your money. 🌱
        </Text>
        <Text style={styles.footerSignNail}>●   ●</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    width: "100%",
  },
  scrollBase: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingBottom: 48,
    alignItems: "center",
    minHeight: "100%",
    width: "100%",
    position: "relative",
    backgroundColor: "#121212",
  },
  contentWrapper: {
    flex: 1,
    width: "100%",
    maxWidth: 500,
    alignItems: "center",
    zIndex: 1,
    paddingHorizontal: 20,
  },
  backButton: {
    alignSelf: "flex-start",
    marginTop: 16,
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  backButtonText: {
    color: "#AAAAAA",
    fontSize: 14,
    fontWeight: "600",
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 16,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#E8F5E9",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 46,
  },
  mainTitle: {
    fontSize: 34,
    fontWeight: "900",
    marginBottom: 10,
    textAlign: "center",
    color: "#E8F5E9",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    color: "#7CB87A",
  },
  grassRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginVertical: 8,
    width: "100%",
  },
  grassEmoji: {
    fontSize: 20,
  },
  separatorContainer: {
    width: "100%",
    alignItems: "center",
    marginVertical: 4,
    gap: 4,
  },
  separatorLine: {
    width: "60%",
    height: 1,
    backgroundColor: "rgba(76,175,80,0.15)",
  },
  separatorEmojis: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "center",
    paddingVertical: 6,
  },
  separatorEmoji: {
    fontSize: 22,
  },
  cardOuter: {
    width: "100%",
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 10,
    marginVertical: 4,
  },
  card: {
    borderRadius: 18,
    padding: 20,
    gap: 12,
  },
  nailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  nail: {
    width: 10,
    height: 10,
    borderRadius: 5,
    opacity: 0.8,
  },
  emojiSection: {
    alignItems: "center",
    gap: 8,
  },
  emojiBubble: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  phaseEmoji: {
    fontSize: 40,
  },
  activeBadge: {
    backgroundColor: "rgba(76,175,80,0.25)",
    borderWidth: 1,
    borderColor: "rgba(76,175,80,0.6)",
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 14,
  },
  activeBadgeText: {
    color: "#81C784",
    fontSize: 13,
    fontWeight: "700",
  },
  growthRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 2,
  },
  growthStage: {
    fontSize: 16,
    opacity: 0.2,
  },
  growthStagePast: {
    opacity: 0.5,
  },
  growthStageCurrent: {
    opacity: 1,
    fontSize: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    color: "#D4A853",
    letterSpacing: 0.3,
  },
  cardTitleActive: {
    color: "#81C784",
  },
  cardSubtitle: {
    fontSize: 12,
    textAlign: "center",
    color: "#7A6040",
    fontStyle: "italic",
  },
  cardDivider: {
    height: 1,
    borderRadius: 1,
    marginVertical: 2,
  },
  itemsContainer: {
    gap: 10,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  itemBullet: {
    fontSize: 14,
    marginTop: 2,
    color: "#666",
  },
  itemText: {
    fontSize: 14,
    color: "#C8B99A",
    flex: 1,
    lineHeight: 20,
  },
  itemTextUpcoming: {
    color: "#6B5A42",
  },
  taglineBox: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 4,
  },
  taglineText: {
    fontSize: 13,
    fontStyle: "italic",
    color: "#7A6040",
    lineHeight: 18,
    textAlign: "center",
  },
  taglineTextActive: {
    color: "#81C784",
  },
  footerSign: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 8,
  },
  footerSignPost: {
    width: 8,
    height: 28,
    backgroundColor: "#5C3D1A",
    borderRadius: 4,
  },
  footerSignBoard: {
    backgroundColor: "#1E1008",
    borderWidth: 2,
    borderColor: "#5C3D1A",
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 10,
    maxWidth: 320,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  footerSignNail: {
    color: "#8B6914",
    fontSize: 10,
    letterSpacing: 12,
  },
  footerText: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 22,
    color: "#9A8060",
  },
});
