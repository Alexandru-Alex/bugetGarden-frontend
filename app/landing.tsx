import { FlowerPetals } from "@/components/flower-petals";
import { GrassWave } from "@/components/grass-wave";
import { ThemedText } from "@/components/themed-text";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";

WebBrowser.maybeCompleteAuthSession();
import {
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path as SvgPath, Text as SvgText } from "react-native-svg";
import { SafeAreaView } from "react-native-safe-area-context";

function GoogleLogo({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <SvgPath fill="#FFC107" d="M43.6 20H24v8h11.3c-1.1 5.4-5.8 9-11.3 9-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 7.1 29.3 5 24 5 13.5 5 5 13.5 5 24s8.5 19 19 19c10.5 0 18-7.5 18-19 0-1.3-.1-2.7-.4-4z" />
      <SvgPath fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 7.1 29.3 5 24 5 16.3 5 9.7 9.4 6.3 14.7z" />
      <SvgPath fill="#4CAF50" d="M24 43c5.2 0 9.9-1.9 13.5-5.1l-6.2-5.2C29.4 34.5 26.8 35.5 24 35.5c-5.4 0-10-3.5-11.7-8.4l-6.5 5C9.5 38.4 16.2 43 24 43z" />
      <SvgPath fill="#1976D2" d="M43.6 20H24v8h11.3c-.5 2.5-2 4.7-4.1 6.2l6.2 5.2C41.2 36.1 44 30.4 44 24c0-1.3-.1-2.7-.4-4z" />
    </Svg>
  );
}

const { width: W } = Dimensions.get("window");

// Arc text layout — fără TextPath, fiecare caracter pozitionat matematic
const SVG_W = W - 16;
const R_OUT = 180;
const R_IN  =  92;
const CX = SVG_W / 2;
const CY = R_OUT + 60;
const SVG_H = CY + 12;

// Pozitia si rotatia unui caracter la distanta `s` pe arc de raza `r`
// Arcul merge de la θ=π (stanga) la θ=0 (dreapta), trecand prin θ=π/2 (sus)
function charOnArc(s: number, r: number) {
  const θ = Math.PI - s / r;
  return {
    x: CX + r * Math.cos(θ),
    y: CY - r * Math.sin(θ),
    rot: 90 - θ * (180 / Math.PI),
  };
}

function ArcWord({ word, r, fontSize, charSpacing }: {
  word: string; r: number; fontSize: number; charSpacing: number;
}) {
  const totalWidth = (word.length - 1) * charSpacing;
  const midArc = (Math.PI * r) / 2;
  const startArc = midArc - totalWidth / 2;

  const chars = word.split('').map((char, i) => {
    const { x, y, rot } = charOnArc(startArc + i * charSpacing, r);
    return { char, x, y, rot };
  });

  return (
    <>
      {/* Shadow */}
      {chars.map(({ char, x, y, rot }, i) => (
        <SvgText key={`sh-${i}`} x={x} y={y} fontSize={fontSize}
          fontFamily="Pacifico_400Regular" textAnchor="middle"
          fill="rgba(90,40,0,0.85)" stroke="rgba(90,40,0,0.85)"
          strokeWidth={14} strokeLinejoin="round"
          transform={`rotate(${rot}, ${x}, ${y})`}>
          {char}
        </SvgText>
      ))}
      {/* Glow */}
      {chars.map(({ char, x, y, rot }, i) => (
        <SvgText key={`gl-${i}`} x={x} y={y} fontSize={fontSize}
          fontFamily="Pacifico_400Regular" textAnchor="middle"
          fill="rgba(240,175,40,0.35)" stroke="rgba(240,175,40,0.35)"
          strokeWidth={6} strokeLinejoin="round"
          transform={`rotate(${rot}, ${x}, ${y})`}>
          {char}
        </SvgText>
      ))}
      {/* Main */}
      {chars.map(({ char, x, y, rot }, i) => (
        <SvgText key={`m-${i}`} x={x} y={y} fontSize={fontSize}
          fontFamily="Pacifico_400Regular" textAnchor="middle"
          fill="#FFE566" stroke="#FFE566" strokeWidth={2.5} strokeLinejoin="round"
          transform={`rotate(${rot}, ${x}, ${y})`}>
          {char}
        </SvgText>
      ))}
    </>
  );
}

function ArcTitle() {
  return (
    <Svg width={SVG_W} height={SVG_H} style={{ overflow: "visible" }}>
      <ArcWord word="Budget" r={R_OUT} fontSize={58} charSpacing={38} />
      <ArcWord word="Garden" r={R_IN}  fontSize={50} charSpacing={32} />
    </Svg>
  );
}

// ─── Auth Modal ─────────────────────────────────────────────────────────────

const GOOGLE_CLIENT_IDS = {
  webClientId: "975323074001-kuerkjh4jje7oidr8kb4l888p6lh81sv.apps.googleusercontent.com",
  androidClientId: "975323074001-qdr2kgv00149gc5ru0106sa9qffuj5nh.apps.googleusercontent.com",
  iosClientId: "975323074001-re455uukp107dpf8l25q75nia9co29td.apps.googleusercontent.com",
};

function AuthModal({ visible, onClose, onSuccess }: {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    ...GOOGLE_CLIENT_IDS,
    redirectUri: makeRedirectUri({ scheme: "bugetgardenfront", path: "auth" }),
  });

  useEffect(() => {
    if (googleRequest) {
      console.log("REDIRECT URI:", googleRequest.redirectUri);
    }
  }, [googleRequest]);

  useEffect(() => {
    if (googleResponse?.type === "success") {
      const { authentication } = googleResponse;
      if (authentication?.accessToken) {
        handleGoogleToken(authentication.accessToken);
      }
    }
  }, [googleResponse]);

  const handleGoogleToken = async (accessToken: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: accessToken, provider: "google" }),
      });
      if (!res.ok) throw new Error("Server error");
      onSuccess();
    } catch {
      setError("Autentificarea cu Google a eșuat. Încearcă din nou.");
    } finally {
      setLoading(false);
    }
  };

  const cardY = useSharedValue(60);
  const cardOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      cardY.value = withSpring(0, { damping: 18, stiffness: 200 });
      cardOpacity.value = withTiming(1, { duration: 220 });
    } else {
      cardY.value = withTiming(60, { duration: 180 });
      cardOpacity.value = withTiming(0, { duration: 180 });
    }
  }, [visible]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cardY.value }],
    opacity: cardOpacity.value,
  }));

  const handleSubmit = async () => {
    setError("");
    if (!email || !password) {
      setError("Completează toate câmpurile.");
      return;
    }
    if (mode === "signup" && !name) {
      setError("Introdu numele tău.");
      return;
    }
    setLoading(true);
    try {
      // TODO: înlocuiește cu apelul real de autentificare
      await new Promise((r) => setTimeout(r, 800));
      onSuccess();
    } catch {
      setError("Ceva nu a mers. Încearcă din nou.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={auth.backdrop}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View style={[auth.card, cardStyle]}>
          {/* Garden decoration top */}
          <View style={auth.gardenStrip}>
            <Text style={auth.gardenEmoji}>🌿</Text>
            <Text style={auth.gardenEmoji}>🌸</Text>
            <Text style={auth.gardenEmoji}>🍃</Text>
            <Text style={auth.gardenEmoji}>🌼</Text>
            <Text style={auth.gardenEmoji}>🌿</Text>
          </View>

          <ScrollView contentContainerStyle={auth.scroll} keyboardShouldPersistTaps="handled">
            <Text style={auth.title}>
              {mode === "login" ? "Welcome back! 🌱" : "Plant your seed 🌱"}
            </Text>
            <Text style={auth.subtitle}>
              {mode === "login"
                ? "Sign in to your garden"
                : "Create your BudgetGarden"}
            </Text>

            {/* Tab switcher */}
            <View style={auth.tabs}>
              <Pressable
                style={[auth.tab, mode === "login" && auth.tabActive]}
                onPress={() => { setMode("login"); setError(""); }}
              >
                <Text style={[auth.tabText, mode === "login" && auth.tabTextActive]}>
                  Sign In
                </Text>
              </Pressable>
              <Pressable
                style={[auth.tab, mode === "signup" && auth.tabActive]}
                onPress={() => { setMode("signup"); setError(""); }}
              >
                <Text style={[auth.tabText, mode === "signup" && auth.tabTextActive]}>
                  Sign Up
                </Text>
              </Pressable>
            </View>

            {/* Name field (signup only) */}
            {mode === "signup" && (
              <View style={[auth.inputWrap, nameFocused && auth.inputWrapFocused]}>
                <Ionicons name="person-outline" size={18} color="#8aab6e" style={auth.inputIcon} />
                <TextInput
                  style={auth.input}
                  placeholder="Your name"
                  placeholderTextColor="#8aab6e"
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  autoCapitalize="words"
                />
              </View>
            )}

            {/* Email field */}
            <View style={[auth.inputWrap, emailFocused && auth.inputWrapFocused]}>
              <Ionicons name="mail-outline" size={18} color="#8aab6e" style={auth.inputIcon} />
              <TextInput
                style={auth.input}
                placeholder="Email"
                placeholderTextColor="#8aab6e"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            {/* Password field */}
            <View style={[auth.inputWrap, passwordFocused && auth.inputWrapFocused]}>
              <Ionicons name="lock-closed-outline" size={18} color="#8aab6e" style={auth.inputIcon} />
              <TextInput
                style={auth.input}
                placeholder="Password"
                placeholderTextColor="#8aab6e"
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {error ? <Text style={auth.error}>{error}</Text> : null}

            <Pressable
              style={({ pressed }) => [auth.submitBtn, pressed && auth.submitBtnPressed]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={auth.submitText}>
                {loading ? "..." : mode === "login" ? "Sign In 🌿" : "Grow my garden 🌱"}
              </Text>
            </Pressable>

            {/* Divider */}
            <View style={auth.divider}>
              <View style={auth.dividerLine} />
              <Text style={auth.dividerText}>or</Text>
              <View style={auth.dividerLine} />
            </View>

            {/* Google button */}
            <Pressable
              style={({ pressed }) => [auth.googleBtn, pressed && auth.googleBtnPressed]}
              onPress={() => googlePromptAsync()}
              disabled={!googleRequest || loading}
            >
              <GoogleLogo size={20} />
              <Text style={auth.googleText}>Continue with Google</Text>
            </Pressable>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Landing Screen ──────────────────────────────────────────────────────────

export default function LandingScreen() {
  const router = useRouter();
  const [authVisible, setAuthVisible] = useState(false);

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
      <View style={styles.petalsLayer} pointerEvents="none">
        <FlowerPetals />
      </View>

      <SafeAreaView style={styles.safe}>
        <Animated.View style={[styles.content, contentStyle]}>
          <Text style={styles.emoji}>🌱</Text>

          <ArcTitle />

          <View style={styles.taglineWrap}>
            <ThemedText style={styles.tagline}>
              Save smartly, grow your garden
            </ThemedText>
          </View>

          <Animated.View style={[styles.btnWrapper, btnStyle]}>
            <Pressable
              style={({ pressed }) => [
                styles.ctaButton,
                pressed && styles.ctaButtonPressed,
              ]}
              onPress={() => setAuthVisible(true)}
            >
              <Animated.View style={[styles.pulseRing, pulseRingStyle]} />
              <Text style={styles.ctaText}>Get Started 🌿</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </SafeAreaView>

      <AuthModal
        visible={authVisible}
        onClose={() => setAuthVisible(false)}
        onSuccess={() => {
          setAuthVisible(false);
          router.replace("/(tabs)");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#5a9e2f",
    ...(Platform.OS === "web" ? { minHeight: "100vh", overflow: "hidden" } : {}),
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.12)",
    zIndex: 1,
  },
  petalsLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  safe: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 80,
    zIndex: 3,
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
  taglineWrap: {
    backgroundColor: "rgba(0,0,0,0.22)",
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 2,
    marginBottom: 22,
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
    paddingHorizontal: 18,
    paddingVertical: 6,
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

const auth = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    paddingHorizontal: 20,
    ...(Platform.OS === "web"
      ? { position: "fixed" as any, top: 0, left: 0, right: 0, bottom: 0 }
      : {}),
  },
  card: {
    backgroundColor: "#f0f9ec",
    borderRadius: 28,
    overflow: "hidden",
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
    maxHeight: "88%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  gardenStrip: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#d6f0c8",
    borderBottomWidth: 1,
    borderBottomColor: "#b8dfa8",
  },
  gardenEmoji: {
    fontSize: 22,
  },
  scroll: {
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 36,
  },
  title: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 26,
    color: "#1b4d1b",
    textAlign: "center",
    width: "100%",
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 14,
    color: "#5a8a3c",
    textAlign: "center",
    width: "100%",
    marginBottom: 20,
    letterSpacing: 0.4,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#d4ebc8",
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    color: "#5a8a3c",
  },
  tabTextActive: {
    color: "#1b4d1b",
    fontFamily: "Nunito_800ExtraBold",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#b8dfa8",
    borderRadius: 14,
    backgroundColor: "#ffffff",
    marginBottom: 12,
    paddingHorizontal: 14,
  },
  inputWrapFocused: {
    borderColor: "#4a9e2f",
    shadowColor: "#4a9e2f",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: "Nunito_700Bold",
    fontSize: 15,
    color: "#1b4d1b",
    paddingVertical: 12,
  },
  error: {
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
    color: "#c0392b",
    textAlign: "center",
    marginBottom: 10,
  },
  submitBtn: {
    backgroundColor: "#4a9e2f",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
    shadowColor: "#4a9e2f",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  submitBtnPressed: {
    backgroundColor: "#3a7e22",
    transform: [{ scale: 0.98 }],
  },
  submitText: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 16,
    color: "#ffffff",
    letterSpacing: 0.4,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#d4ebc8",
  },
  dividerText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
    color: "#8aab6e",
    marginHorizontal: 12,
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111111",
    borderRadius: 16,
    paddingVertical: 13,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  googleBtnPressed: {
    backgroundColor: "#2a2a2a",
    transform: [{ scale: 0.98 }],
  },
  googleText: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 15,
    color: "#ffffff",
    letterSpacing: 0.3,
  },
});
