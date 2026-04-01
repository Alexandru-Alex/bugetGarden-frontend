import { AnimatedTreesBackground } from "@/components/animated-trees";
import { ThemedText } from "@/components/themed-text";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const [modalVisible, setModalVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const successScaleAnim = React.useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnim]);

  const handleSubmitEmail = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail.includes("@")) {
      alert("Please enter a valid email address with @");
      return;
    }

    try {
      const formData = new URLSearchParams();
      formData.append("email", trimmedEmail);

      await fetch(
        "https://bugetgarden-backend-production-7c3b.up.railway.app/email-add",
        {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        },
      );

      setEmailSubmitted(true);
      setShowCelebration(true);

      Animated.timing(successScaleAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.elastic(1.2),
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        setEmail("");
        setEmailSubmitted(false);
        setModalVisible(false);
        successScaleAnim.setValue(0.5);
        setTimeout(() => setShowCelebration(false), 500);
      }, 2500);
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollBase}
      >
        <View style={styles.container}>
          <AnimatedTreesBackground />
          <View style={styles.contentWrapper}>
            <View style={styles.headerSection}>
              <View style={styles.logoContainer}>
                <ThemedText style={styles.logoEmoji}>🌱</ThemedText>
              </View>

              <ThemedText type="title" style={styles.mainTitle}>
                BugetGarden
              </ThemedText>

              <ThemedText style={styles.subtitle}>
                Save smartly, earn coins and grow your virtual garden
              </ThemedText>
            </View>

            <View style={styles.featuresSection}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                ✨ Key Features
              </ThemedText>

              <FeatureCard
                icon="💰"
                title="Dynamic Budget Score"
                description="Calculate your budget score based on your spending and savings, in real-time"
              />

              <FeatureCard
                icon="🪙"
                title="Earn Coins"
                description="Get virtual coins for every saving you make and use them at the garden shop"
              />

              <FeatureCard
                icon="🌳"
                title="Grow Your Virtual Garden"
                description="Buy trees and plants with your earned coins and watch your garden grow"
              />

              <FeatureCard
                icon="📊"
                title="Detailed Analytics"
                description="Track your spending, savings and garden progress over time"
              />
            </View>

            <RoadmapButton onPress={() => router.push("/(tabs)/roadmap")} />

            <View style={styles.benefitsSection}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Why Choose BugetGarden?
              </ThemedText>

              <BenefitItem text="Turn your savings into virtual coins and rewards" />
              <BenefitItem text="Grow your virtual garden with coins you earn" />
              <BenefitItem text="Track your budget and garden progress in real-time" />
              <BenefitItem text="Understand your spending and saving habits better" />
            </View>

            <SocialProofSection />

            <View style={styles.ctaSection}>
              <View style={styles.urgencyBadge}>
                <Text style={styles.urgencyText}>
                  ⚡ Limited spots — secure yours now
                </Text>
              </View>
              <Animated.View style={[{ transform: [{ scale: pulseAnim }] }, { width: "100%" }]}>
                <Pressable
                  style={({ pressed }) => [
                    styles.wishlistButton,
                    pressed && styles.wishlistButtonPressed,
                  ]}
                  onPress={() => setModalVisible(true)}
                >
                  <ThemedText style={styles.wishlistButtonText}>
                    ❤️ Join the Waitlist
                  </ThemedText>
                </Pressable>
              </Animated.View>
              <Text style={styles.ctaSubtext}>Free • No spam • Cancel anytime</Text>
            </View>

            <View style={styles.footer}>
              <ThemedText style={styles.footerText}>
                Manage your budget smartly and grow your virtual garden with
                earned coins 🌻
              </ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !emailSubmitted && setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          {emailSubmitted ? (
            <Animated.View
              style={[
                styles.successPopup,
                { transform: [{ scale: successScaleAnim }] },
              ]}
            >
              <View style={styles.successIconContainer}>
                <ThemedText style={styles.successEmoji}>🌱</ThemedText>
              </View>
              <ThemedText style={styles.successTitle}>Thank You!</ThemedText>
              <ThemedText style={styles.successMessage}>
                We've received your email and will notify you when BugetGarden
                launches.
              </ThemedText>
              <ThemedText style={styles.successSubtext}>
                Start growing your garden soon! 🌻
              </ThemedText>
            </Animated.View>
          ) : (
            <View style={styles.modalContent}>
              <ThemedText style={styles.modalTitle}>
                Join the Waitlist!
              </ThemedText>
              <ThemedText style={styles.modalDescription}>
                Enter your email to be notified when BugetGarden launches
              </ThemedText>

              <TextInput
                style={styles.emailInput}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />

              <Pressable
                style={({ pressed }) => [
                  styles.submitButton,
                  pressed && styles.submitButtonPressed,
                ]}
                onPress={handleSubmitEmail}
              >
                <ThemedText style={styles.submitButtonText}>
                  Add to Wishlist
                </ThemedText>
              </Pressable>

              <Pressable
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <ThemedText style={styles.closeButtonText}>Cancel</ThemedText>
              </Pressable>
            </View>
          )}
        </View>
      </Modal>

      {showCelebration && <CelebrationEffect />}
    </>
  );
}

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <View style={styles.featureCard}>
      <ThemedText style={styles.featureIcon}>{icon}</ThemedText>
      <View style={styles.featureContent}>
        <ThemedText type="defaultSemiBold" style={styles.featureTitle}>
          {title}
        </ThemedText>
        <ThemedText style={styles.featureDescription}>{description}</ThemedText>
      </View>
    </View>
  );
}

interface BenefitItemProps {
  text: string;
}

const SOCIAL_PROOF_AVATARS = [
  { color: "#FF6B6B", label: "A" },
  { color: "#4CAF50", label: "M" },
  { color: "#2196F3", label: "S" },
  { color: "#FF9800", label: "L" },
  { color: "#9C27B0", label: "R" },
];

const TARGET_COUNT = 1247;

function SocialProofSection() {
  const [count, setCount] = useState(0);
  const progressAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const steps = 50;
    const stepDuration = 1200 / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setCount(Math.round((step / steps) * TARGET_COUNT));
      if (step >= steps) clearInterval(timer);
    }, stepDuration);

    Animated.timing(progressAnim, {
      toValue: 0.73,
      duration: 1800,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();

    return () => clearInterval(timer);
  }, [progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.socialProofSection}>
      <View style={styles.avatarRow}>
        {SOCIAL_PROOF_AVATARS.map((av, i) => (
          <View
            key={i}
            style={[styles.avatar, { backgroundColor: av.color, marginLeft: i === 0 ? 0 : -10 }]}
          >
            <Text style={styles.avatarLabel}>{av.label}</Text>
          </View>
        ))}
        <View style={styles.joinedTextContainer}>
          <Text style={styles.joinedCount}>{count.toLocaleString()}+</Text>
          <Text style={styles.joinedLabel}> already joined</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>🔥 Early access filling up</Text>
          <Text style={styles.progressPercent}>73%</Text>
        </View>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
      </View>
    </View>
  );
}

const PARTICLE_TYPES = ["🪙", "✨", "⭐", "🌸", "💚", "🎉"];

function CelebrationEffect() {
  const particles = useMemo(
    () =>
      Array.from({ length: 15 }, (_, i) => ({
        id: i,
        leftPercent: Math.random() * 100,
        delay: i * 50,
        type: PARTICLE_TYPES[Math.floor(Math.random() * PARTICLE_TYPES.length)],
      })),
    [],
  );

  return (
    <View style={styles.celebrationContainer} pointerEvents="none">
      {particles.map((particle) => (
        <FallingObject
          key={particle.id}
          left={particle.leftPercent}
          delay={particle.delay}
          emoji={particle.type}
        />
      ))}
    </View>
  );
}

function FallingObject({
  left,
  delay,
  emoji,
}: {
  left: number;
  delay: number;
  emoji: string;
}) {
  const fallAnim = React.useRef(new Animated.Value(-50)).current;
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fallAnim, {
        toValue: 1500,
        duration: 2800 + delay,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 360,
        duration: 2500 + delay,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fallAnim, rotateAnim, delay]);

  const rotation = useMemo(
    () => rotateAnim.interpolate({ inputRange: [0, 360], outputRange: ["0deg", "360deg"] }),
    [rotateAnim],
  );

  return (
    <Animated.View
      style={[
        styles.fallingCoin,
        {
          left: `${left}%`,
          transform: [{ translateY: fallAnim }, { rotate: rotation }],
        },
      ]}
    >
      <Text style={styles.fallingCoinText}>{emoji}</Text>
    </Animated.View>
  );
}

function RoadmapButton({ onPress }: { onPress: () => void }) {
  const glowAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, [glowAnim]);

  const borderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(76,175,80,0.3)", "rgba(76,175,80,1)"],
  });

  const shadowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.75],
  });

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.96,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 150,
      easing: Easing.out(Easing.back(2)),
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.roadmapButtonWrapper,
        {
          transform: [{ scale: scaleAnim }],
          borderColor,
          shadowOpacity,
        },
      ]}
    >
      <Pressable
        style={styles.roadmapButton}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Text style={styles.roadmapButtonEmoji}>🗺️</Text>
        <View style={styles.roadmapButtonContent}>
          <Text style={styles.roadmapButtonTitle}>View Roadmap</Text>
          <Text style={styles.roadmapButtonSub}>See what's coming next →</Text>
        </View>
        <View style={styles.roadmapButtonBadge}>
          <Text style={styles.roadmapButtonBadgeText}>NEW</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function BenefitItem({ text }: BenefitItemProps) {
  return (
    <View style={styles.benefitItem}>
      <ThemedText style={styles.benefitCheckmark}>✓</ThemedText>
      <ThemedText style={styles.benefitText}>{text}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  scrollBase: {
    flexGrow: 1,
    width: "100%",
  },
  container: {
    flex: 1,
    padding: 20,
    paddingBottom: 40,
    alignItems: "center",
    minHeight: "100%",
    width: "100%",
    position: "relative",
    backgroundColor: "#121212",
  },
  contentWrapper: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    zIndex: 1,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 48,
    marginTop: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    backgroundColor: "#E8F5E9",
  },
  logoEmoji: {
    fontSize: 50,
  },
  mainTitle: {
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 500,
    color: "#AAAAAA",
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 18,
    textAlign: "center",
    width: "100%",
    color: "#FFFFFF",
  },
  featuresSection: {
    marginBottom: 36,
    gap: 14,
    alignItems: "center",
  },
  featureCard: {
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    gap: 14,
    backgroundColor: "transparent",
    width: "100%",
    maxWidth: 500,
  },
  featureIcon: {
    fontSize: 32,
    width: 50,
    textAlign: "center",
    minWidth: 50,
  },
  featureContent: {
    flex: 1,
    justifyContent: "center",
  },
  featureTitle: {
    fontSize: 16,
    marginBottom: 4,
    textAlign: "left",
    color: "#FFFFFF",
  },
  featureDescription: {
    fontSize: 13,
    opacity: 0.7,
    lineHeight: 18,
    textAlign: "left",
    color: "#AAAAAA",
  },
  benefitsSection: {
    marginBottom: 36,
    gap: 10,
    alignItems: "center",
  },
  benefitItem: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    paddingVertical: 8,
    maxWidth: 500,
    width: "100%",
  },
  benefitCheckmark: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4CAF50",
    marginTop: 2,
    minWidth: 20,
  },
  benefitText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
    textAlign: "left",
    color: "#FFFFFF",
  },
  ctaSection: {
    gap: 12,
    marginBottom: 32,
    width: "100%",
    maxWidth: 500,
    alignItems: "center",
  },
  wishlistButton: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 24,
    paddingHorizontal: 30,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  wishlistButtonPressed: {
    backgroundColor: "#FF5252",
    opacity: 0.95,
  },
  wishlistButtonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  footer: {
    paddingTop: 24,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  footerText: {
    fontSize: 14,
    opacity: 0.6,
    fontStyle: "italic",
    textAlign: "center",
    color: "#AAAAAA",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    borderRadius: 20,
    padding: 30,
    width: "100%",
    maxWidth: 400,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    backgroundColor: "#1E1E1E",
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#FFFFFF",
  },
  modalDescription: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
    lineHeight: 20,
    color: "#AAAAAA",
  },
  emailInput: {
    borderWidth: 2,
    borderColor: "#4CAF50",
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: "#333",
    backgroundColor: "#F5F5F5",
  },
  submitButton: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonPressed: {
    backgroundColor: "#FF5252",
    opacity: 0.9,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  closeButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 14,
    color: "#AAAAAA",
  },
  successPopup: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingVertical: 50,
    borderRadius: 20,
    backgroundColor: "#66BB6A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    maxWidth: 350,
  },
  successEmoji: {
    fontSize: 60,
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
    textAlign: "center",
  },
  successMessage: {
    fontSize: 16,
    textAlign: "center",
    color: "#FFFFFF",
    marginBottom: 12,
    lineHeight: 24,
  },
  successSubtext: {
    fontSize: 14,
    textAlign: "center",
    color: "rgba(255,255,255,0.9)",
    fontStyle: "italic",
  },
  celebrationContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  fallingCoin: {
    position: "absolute",
    top: -50,
  },
  fallingCoinText: {
    fontSize: 40,
  },
  // Social proof
  socialProofSection: {
    width: "100%",
    maxWidth: 500,
    marginBottom: 28,
    gap: 16,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#121212",
  },
  avatarLabel: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  joinedTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 14,
  },
  joinedCount: {
    color: "#4CAF50",
    fontWeight: "bold",
    fontSize: 15,
  },
  joinedLabel: {
    color: "#AAAAAA",
    fontSize: 14,
  },
  progressContainer: {
    gap: 8,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  progressPercent: {
    color: "#FF6B6B",
    fontSize: 13,
    fontWeight: "bold",
  },
  progressTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: "#FF6B6B",
  },
  // CTA extras
  urgencyBadge: {
    backgroundColor: "rgba(255, 107, 107, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.4)",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  urgencyText: {
    color: "#FF8A80",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  ctaSubtext: {
    color: "#666666",
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
  roadmapButtonWrapper: {
    width: "100%",
    maxWidth: 500,
    marginBottom: 28,
    borderRadius: 16,
    borderWidth: 1.5,
    backgroundColor: "rgba(76, 175, 80, 0.08)",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
    elevation: 6,
  },
  roadmapButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 14,
  },
  roadmapButtonEmoji: {
    fontSize: 32,
  },
  roadmapButtonContent: {
    flex: 1,
    gap: 2,
  },
  roadmapButtonTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  roadmapButtonSub: {
    color: "#4CAF50",
    fontSize: 12,
    fontWeight: "500",
  },
  roadmapButtonBadge: {
    backgroundColor: "#4CAF50",
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  roadmapButtonBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
