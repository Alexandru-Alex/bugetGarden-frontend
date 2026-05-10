import { FlowerPetals } from "@/components/flower-petals";
import { GrassWave } from "@/components/grass-wave";
import { ThemedText } from "@/components/themed-text";
import { api, saveToken } from "@/lib/api";
import { useFocusStyle } from "@/lib/use-focus-style";
import { auth, styles } from "@/styles/landing.styles";
import { Ionicons } from "@expo/vector-icons";
import { makeRedirectUri, useAuthRequest, ResponseType } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import * as Crypto from "expo-crypto";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
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
import type { AnimatedStyle, SharedValue } from "react-native-reanimated";
import type { ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path as SvgPath, Text as SvgText } from "react-native-svg";

WebBrowser.maybeCompleteAuthSession();

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

const { width: W, height: H } = Dimensions.get("window");

const BG_IMAGE = require("@/assets/images/welcome-bg.webp");

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
    <Svg width={SVG_W} height={SVG_H} style={{ overflow: "visible" }} pointerEvents="none">
      <ArcWord word="Money"  r={R_OUT} fontSize={58} charSpacing={38} />
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

const APPLE_AUTH_ENABLED = false;

const APPLE_DISCOVERY = {
  authorizationEndpoint: "https://appleid.apple.com/auth/authorize",
  tokenEndpoint: "https://appleid.apple.com/auth/token",
};
// Replace with your real Apple Services ID from Apple Developer Console
const APPLE_WEB_CLIENT_ID = "com.g3d0manz00.bugetGardenfront.web";

function AuthModal({ visible, onClose, onSuccess }: {
  visible: boolean;
  onClose: () => void;
  onSuccess: (newUser: boolean) => void;
}) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const email$    = useFocusStyle();
  const password$ = useFocusStyle();
  const confirm$  = useFocusStyle();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    ...GOOGLE_CLIENT_IDS,
    redirectUri: makeRedirectUri({ scheme: "bugetgardenfront", path: "auth" }),
  });

  const [appleRequest, appleResponse, applePromptAsync] = useAuthRequest(
    {
      clientId: APPLE_WEB_CLIENT_ID,
      scopes: ["name", "email"],
      redirectUri: makeRedirectUri({ scheme: "bugetgardenfront", path: "auth" }),
      responseType: ResponseType.Code,
      usePKCE: false,
      extraParams: { response_mode: "query" },
    },
    APPLE_DISCOVERY,
  );

  useEffect(() => {
    if (googleResponse?.type === "success") {
      const { authentication } = googleResponse;
      if (authentication?.accessToken) {
        handleGoogleToken(authentication.accessToken);
      }
    }
  }, [googleResponse]);

  useEffect(() => {
    if (Platform.OS !== "web") {
      const { GoogleSignin } = require("@react-native-google-signin/google-signin");
      GoogleSignin.configure({
        webClientId: GOOGLE_CLIENT_IDS.webClientId,
        iosClientId: GOOGLE_CLIENT_IDS.iosClientId,
        offlineAccess: false,
      });
    }
  }, []);

  const handleNativeGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError("");
      const { GoogleSignin } = require("@react-native-google-signin/google-signin");
      await GoogleSignin.hasPlayServices();
      // Close modal before launching native intent — RN Modal has higher Android
      // Z-order than the Google account picker, so picker appears behind if modal stays open.
      onClose();
      await new Promise(resolve => setTimeout(resolve, 150));
      await GoogleSignin.signOut().catch(() => {});
      await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();
      await handleGoogleToken(tokens.accessToken);
    } catch (e: unknown) {
      console.error("Native Google sign-in error:", e);
      setError(e instanceof Error ? e.message : "Google sign-in failed. Please try again later.");
      setLoading(false);
    }
  };

  const handleGoogleToken = async (accessToken: string) => {
    setLoading(true);
    setError("");
    try {
      const data = await api.post<{ token: string; newUser: boolean }>(
        "/authorization-google",
        { token: accessToken, provider: "google" },
        { auth: false },
      );
      await saveToken(data.token);
      if (Platform.OS === "web") {
        localStorage.setItem("is_new_user", String(data.newUser));
      } else {
        await SecureStore.setItemAsync("is_new_user", String(data.newUser));
      }
      onSuccess(data.newUser);
    } catch (e: unknown) {
      console.error("Backend auth error:", e);
      setError(e instanceof Error ? e.message : "Google sign-in failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleAppleBackendAuth = async (payload: {
    identityToken: string | null;
    authorizationCode: string | null;
    user?: string | null;
    email?: string | null;
    fullName?: { givenName: string | null; familyName: string | null } | null;
  }) => {
    setLoading(true);
    setError("");
    try {
      const data = await api.post<{ token: string; newUser: boolean }>(
        "/authorization-apple",
        payload,
        { auth: false },
      );
      await saveToken(data.token);
      if (Platform.OS === "web") {
        localStorage.setItem("is_new_user", String(data.newUser));
      } else {
        await SecureStore.setItemAsync("is_new_user", String(data.newUser));
      }
      onSuccess(data.newUser);
    } catch (e: unknown) {
      console.error("Backend Apple auth error:", e);
      setError(e instanceof Error ? e.message : "Apple sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (appleResponse?.type === "success") {
      handleAppleBackendAuth({
        authorizationCode: appleResponse.params.code ?? null,
        identityToken: null,
      });
    }
  }, [appleResponse]);

  const handleAppleSignIn = async () => {
    if (Platform.OS === "web") {
      await applePromptAsync();
      return;
    }
    try {
      setLoading(true);
      setError("");
      const AppleAuth = require("expo-apple-authentication");
      const credential = await AppleAuth.signInAsync({
        requestedScopes: [
          AppleAuth.AppleAuthenticationScope.FULL_NAME,
          AppleAuth.AppleAuthenticationScope.EMAIL,
        ],
      });
      await handleAppleBackendAuth({
        identityToken: credential.identityToken ?? null,
        authorizationCode: credential.authorizationCode ?? null,
        user: credential.user ?? null,
        email: credential.email ?? null,
        fullName: credential.fullName
          ? {
              givenName: credential.fullName.givenName ?? null,
              familyName: credential.fullName.familyName ?? null,
            }
          : null,
      });
    } catch (e: unknown) {
      if ((e as { code?: string }).code !== "ERR_REQUEST_CANCELED") {
        console.error("Apple sign-in error:", e);
        setError(e instanceof Error ? e.message : "Apple sign-in failed. Please try again.");
      }
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
      setError("Fill in all fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (mode === "signup") {
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (!/\d/.test(password)) {
        setError("Password must contain at least one digit.");
        return;
      }
      if (!/[^a-zA-Z0-9]/.test(password)) {
        setError("Password must contain at least one special character.");
        return;
      }
      if (!confirmPassword) {
        setError("Confirm password.");
        return;
      }
      if (password !== confirmPassword) {
        setError("The passwords do not match.");
        return;
      }
    }
    setLoading(true);
    try {
      const hashedPassword = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        password,
      );
      if (mode === "signup") {
        const data = await api.post<{ token: string; newUser: boolean }>(
          "/sign-up",
          { email, password: hashedPassword },
          { auth: false },
        );
        await saveToken(data.token);
        if (Platform.OS === "web") {
          localStorage.setItem("is_new_user", String(data.newUser));
        } else {
          await SecureStore.setItemAsync("is_new_user", String(data.newUser));
        }
        onSuccess(data.newUser);
      } else {
        const data = await api.post<{ token: string; newUser: boolean }>(
          "/sign-in",
          { email, password: hashedPassword },
          { auth: false },
        );
        await saveToken(data.token);
        onSuccess(false);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ceva nu a mers. Încearcă din nou.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={[StyleSheet.absoluteFill, auth.backdropOverlay]} onPress={onClose} />
      <KeyboardAvoidingView
        style={auth.backdrop}
        behavior="padding"
        pointerEvents="box-none"
      >
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
                : "Create your MoneyGarden"}
            </Text>

            {/* Tab switcher */}
            <View style={auth.tabs}>
              <Pressable
                style={[auth.tab, mode === "login" && auth.tabActive]}
                onPress={() => { setMode("login"); setError(""); setConfirmPassword(""); }}
              >
                <Text style={[auth.tabText, mode === "login" && auth.tabTextActive]}>
                  Sign In
                </Text>
              </Pressable>
              <Pressable
                style={[auth.tab, mode === "signup" && auth.tabActive]}
                onPress={() => { setMode("signup"); setError(""); setConfirmPassword(""); }}
              >
                <Text style={[auth.tabText, mode === "signup" && auth.tabTextActive]}>
                  Sign Up
                </Text>
              </Pressable>
            </View>

        
            {/* Email field */}
            <Animated.View style={[auth.inputWrap, email$.style]}>
              <Ionicons name="mail-outline" size={18} color="#79AE6F" style={auth.inputIcon} />
              <TextInput
                style={auth.input}
                placeholder="Email"
                placeholderTextColor="#79AE6F"
                value={email}
                onChangeText={setEmail}
                onFocus={email$.onFocus}
                onBlur={email$.onBlur}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </Animated.View>

            {/* Password field */}
            <Animated.View style={[auth.inputWrap, password$.style]}>
              <Ionicons name="lock-closed-outline" size={18} color="#79AE6F" style={auth.inputIcon} />
              <TextInput
                style={auth.input}
                placeholder="Password"
                placeholderTextColor="#79AE6F"
                value={password}
                onChangeText={setPassword}
                onFocus={password$.onFocus}
                onBlur={password$.onBlur}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <Pressable onPress={() => setShowPassword((v) => !v)} style={auth.eyeBtn}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color="#79AE6F" />
              </Pressable>
            </Animated.View>

            {/* Confirm password field (signup only) */}
            {mode === "signup" && (
              <Animated.View style={[auth.inputWrap, confirm$.style]}>
                <Ionicons name="lock-closed-outline" size={18} color="#79AE6F" style={auth.inputIcon} />
                <TextInput
                  style={auth.input}
                  placeholder="Confirm password"
                  placeholderTextColor="#79AE6F"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onFocus={confirm$.onFocus}
                  onBlur={confirm$.onBlur}
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                />
                <Pressable onPress={() => setShowConfirm((v) => !v)} style={auth.eyeBtn}>
                  <Ionicons name={showConfirm ? "eye-off-outline" : "eye-outline"} size={18} color="#79AE6F" />
                </Pressable>
              </Animated.View>
            )}

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
              onPress={() => Platform.OS === "web" ? googlePromptAsync() : handleNativeGoogleSignIn()}
              disabled={loading || (Platform.OS === "web" && !googleRequest)}
            >
              <GoogleLogo size={20} />
              <Text style={auth.googleText}>Continue with Google</Text>
            </Pressable>

            {/* Apple button — hidden on Android (Apple SDK not available) */}
            {APPLE_AUTH_ENABLED && Platform.OS !== "android" && (
              <Pressable
                style={({ pressed }) => [auth.appleBtn, pressed && auth.appleBtnPressed]}
                onPress={handleAppleSignIn}
                disabled={loading || (Platform.OS === "web" && !appleRequest)}
              >
                <Ionicons name="logo-apple" size={20} color="#000000" />
                <Text style={auth.appleText}>Sign in with Apple</Text>
              </Pressable>
            )}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Landing Screen ──────────────────────────────────────────────────────────

type LandingAnimProps = {
  contentStyle: AnimatedStyle<ViewStyle>;
  btnStyle: AnimatedStyle<ViewStyle>;
  pulseRingStyle: AnimatedStyle<ViewStyle>;
  time: SharedValue<number>;
  onGetStarted: () => void;
};

function MobileLanding({ contentStyle, btnStyle, pulseRingStyle, time, onGetStarted }: LandingAnimProps) {
  return (
    <>
      <View style={StyleSheet.absoluteFill}>
        <Image source={BG_IMAGE} style={{ width: W, height: H }} resizeMode="cover" />
        <GrassBoundary>
          <GrassWave time={time} />
        </GrassBoundary>
      </View>
      <View style={styles.overlay} />
      <View style={styles.petalsLayer} pointerEvents="none">
        <FlowerPetals />
      </View>
      <SafeAreaView style={styles.safe}>
        {/* userSelect:"none" applied in HeroSection (web) — not needed on mobile */}
        <Animated.View style={[styles.content, contentStyle]}>
          <ArcTitle />
          <View style={styles.taglineWrap}>
            <ThemedText style={styles.tagline}>Save smartly, grow your garden</ThemedText>
          </View>
          <Animated.View style={[styles.btnWrapper, btnStyle]}>
            <Pressable
              style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaButtonPressed]}
              onPress={onGetStarted}
            >
              <Animated.View style={[styles.pulseRing, pulseRingStyle]} />
              <Text style={styles.ctaText}>Get Started 🌿</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </SafeAreaView>
    </>
  );
}

function HeroSection({ contentStyle, btnStyle, pulseRingStyle, time, onGetStarted }: LandingAnimProps) {
  return (
    <View style={styles.heroSection}>
      <View style={styles.heroBg}>
        <Image source={BG_IMAGE} style={{ width: "100%" as any, height: "100%" as any }} resizeMode="cover" />
        <GrassBoundary>
          <GrassWave time={time} />
        </GrassBoundary>
      </View>
      <View style={styles.overlay} />
      <View style={styles.petalsLayer} pointerEvents="none">
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
            <Text style={styles.ctaText}>Get Started 🌿</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

function StickyAppBtn({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <View style={styles.stickyAppBtn}>
      <Animated.View style={animStyle}>
        <Pressable
          style={styles.appBtnPressable}
          onPress={onPress}
          // @ts-ignore — onHoverIn/onHoverOut are React Native Web-specific
          onHoverIn={() => { scale.value = withTiming(1.05, { duration: 150 }); }}
          // @ts-ignore
          onHoverOut={() => { scale.value = withTiming(1, { duration: 150 }); }}
        >
          <Text style={styles.appBtnText}>App →</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

function WebLanding({ onGetStarted, contentStyle, btnStyle, pulseRingStyle, time }: LandingAnimProps) {
  return (
    <>
      <StickyAppBtn onPress={onGetStarted} />
      <ScrollView style={styles.webScroll} contentContainerStyle={styles.webScrollContent}>
        <HeroSection
          contentStyle={contentStyle}
          btnStyle={btnStyle}
          pulseRingStyle={pulseRingStyle}
          time={time}
          onGetStarted={onGetStarted}
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

        {/* Final CTA */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaSectionTitle}>Start your garden today</Text>
          <Text style={styles.ctaSectionSub}>
            Track spending. Earn coins. Grow your garden.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.ctaSectionBtn, pressed && styles.ctaSectionBtnPressed]}
            onPress={onGetStarted}
          >
            <Text style={styles.ctaSectionBtnText}>Get Started 🌿</Text>
          </Pressable>
        </View>

        {/* Footer */}
        <View style={styles.footerSection}>
          <Text style={styles.footerText}>© 2026 Money Garden</Text>
        </View>
      </ScrollView>
    </>
  );
}

function PhoneMockup({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.phoneFrame}>
      <View style={styles.phoneNotch} />
      <View style={styles.phoneScreen}>{children}</View>
    </View>
  );
}

function FeatureSection({
  icon,
  title,
  body,
  mockup,
  reversed = false,
  tinted = false,
}: {
  icon: string;
  title: string;
  body: string;
  mockup: React.ReactNode;
  reversed?: boolean;
  tinted?: boolean;
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

function ScoreMockup() {
  return (
    <PhoneMockup>
      <Text style={styles.mockHeader}>Budget Score</Text>
      <Text style={styles.mockScoreValue}>87</Text>
      <View style={styles.mockBarBg}>
        <View style={[styles.mockBarFill, { width: "87%" as any }]} />
      </View>
      <Text style={styles.mockScoreTag}>Great job! 🌿 Keep it up</Text>
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

export default function LandingScreen() {
  const router = useRouter();
  const [authVisible, setAuthVisible] = useState(false);

  const time = useSharedValue(0);
  const fadeAnim = useSharedValue(Platform.OS === "android" ? 1 : 0);
  const slideAnim = useSharedValue(Platform.OS === "android" ? 0 : 40);
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
    <View style={[styles.container, isWeb && styles.containerWeb]}>
      {isWeb ? (
        <WebLanding onGetStarted={() => setAuthVisible(true)} contentStyle={contentStyle} btnStyle={btnStyle} pulseRingStyle={pulseRingStyle} time={time} />
      ) : (
        <MobileLanding contentStyle={contentStyle} btnStyle={btnStyle} pulseRingStyle={pulseRingStyle} time={time} onGetStarted={() => setAuthVisible(true)} />
      )}
      <AuthModal
        visible={authVisible}
        onClose={() => setAuthVisible(false)}
        onSuccess={(newUser) => {
          setAuthVisible(false);
          if (newUser) {
            router.replace("/hello");
          } else {
            router.replace("/garden");
          }
        }}
      />
    </View>
  );
}