import { AnimatedTreesBackground } from "@/components/animated-trees";
import { ThemedText } from "@/components/themed-text";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isLargeScreewn = width > 768;
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

  const handleWishlist = () => {
    setModalVisible(true);
  };

  const handleSubmitEmail = async () => {
    const trimmedEmail = email.trim();

    // Validate email contains @
    if (!trimmedEmail.includes("@")) {
      alert("Please enter a valid email address with @");
      return;
    }

    try {
      const formData = new URLSearchParams();
      formData.append("email", trimmedEmail);

      const response = await fetch(
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

      // Mark as submitted and animate success
      setEmailSubmitted(true);
      setShowCelebration(true);
      console.log("Email submitted successfully:", trimmedEmail);

      Animated.timing(successScaleAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.elastic(1.2),
        useNativeDriver: true,
      }).start();

      // Close modal after delay
      setTimeout(() => {
        setEmail("");
        setEmailSubmitted(false);
        setModalVisible(false);
        successScaleAnim.setValue(0.5);
        setTimeout(() => setShowCelebration(false), 500);
      }, 2500);
    } catch (error) {
      console.error("Error submitting email:", error);
      alert(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollBase]}
      >
        <View style={[styles.container, { backgroundColor: "#121212" }]}>
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

            {/* Features Section */}
            <View style={styles.featuresSection}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                ✨ Key Features
              </ThemedText>

              <FeatureCard
                icon="�"
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

            {/* Benefits Section */}
            <View style={styles.benefitsSection}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Why Choose BugetGarden?
              </ThemedText>

              <BenefitItem text="Turn your savings into virtual coins and rewards" />
              <BenefitItem text="Grow your virtual garden with coins you earn" />
              <BenefitItem text="Track your budget and garden progress in real-time" />
              <BenefitItem text="Understand your spending and saving habits better" />
            </View>

            {/* CTA Section */}
            <View style={styles.ctaSection}>
              <Animated.View style={[{ transform: [{ scale: pulseAnim }] }]}>
                <Pressable
                  style={({ pressed }) => [
                    styles.wishlistButton,
                    pressed && styles.wishlistButtonPressed,
                  ]}
                  onPress={handleWishlist}
                >
                  <ThemedText style={styles.wishlistButtonText}>
                    ❤️ Add to Wishlist
                  </ThemedText>
                </Pressable>
              </Animated.View>
            </View>

            {/* Footer */}
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

function CelebrationEffect() {
  const particles = Array.from({ length: 15 }).map((_, i) => {
    const types = ["🪙", "✨", "⭐", "🌸", "💚", "🎉"];
    return {
      id: i,
      leftPercent: Math.random() * 100,
      delay: i * 50,
      type: types[Math.floor(Math.random() * types.length)],
    };
  });

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

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

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
      {emoji}
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
  scrollLarge: {
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    padding: 20,
    paddingBottom: 40,
    alignItems: "center",
    minHeight: "100%",
    width: "100%",
    position: "relative",
  },
  contentWrapper: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    zIndex: 1,
  },
  containerLarge: {
    width: "100%",
    alignSelf: "center",
    padding: 60,
    alignItems: "center",
    position: "relative",
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
    color: "#FFFFFF", // 👈
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 500,
    color: "#AAAAAA", // 👈
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 18,
    textAlign: "center",
    width: "100%",
    color: "#FFFFFF", // 👈
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
    backgroundColor: "transparent", // 👈 AICI
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
    color: "#FFFFFF", // 👈
  },
  featureDescription: {
    fontSize: 13,
    opacity: 0.7,
    lineHeight: 18,
    textAlign: "left",
    color: "#AAAAAA", // 👈
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
    color: "#FFFFFF", // 👈
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
    color: "#AAAAAA", // 👈
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
    backgroundColor: "#1E1E1E", // 👈 ASTA LIPSEȘTE

    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#FFFFFF", // 👈
  },
  modalDescription: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
    lineHeight: 20,
    color: "#AAAAAA", // 👈
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
    color: "#AAAAAA", // 👈
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
    fontSize: 40,
    top: -50,
  },
});
