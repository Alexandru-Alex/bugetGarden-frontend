import { AnimatedTreesBackground } from "@/components/animated-trees";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { styles } from "./roadmap.styles";

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

