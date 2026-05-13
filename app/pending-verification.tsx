import { BASE_URL, clearPendingEmail, getPendingEmail, getStoredToken, logout } from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PendingVerificationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [toast, setToast] = useState("");
  const [cooldown, setCooldown] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cooldownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    Promise.all([getStoredToken(), getPendingEmail()]).then(([t, e]) => {
      setToken(t);
      setEmail(e);
    });
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      if (cooldownTimer.current) clearTimeout(cooldownTimer.current);
    };
  }, []);

  if (token === undefined) return null;
  if (!token) return <Redirect href="/landing" />;

  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(""), 3000);
  };

  const handleResend = async () => {
    if (cooldown || sending) return;
    setSending(true);
    try {
      const res = await fetch(`${BASE_URL}/resend-verification`, {
        method: "POST",
        headers: { Authorization: token, "Content-Type": "application/json" },
        body: "{}",
      });
      if (res.ok) {
        setCooldown(true);
        showToast("Verification email sent!");
        if (cooldownTimer.current) clearTimeout(cooldownTimer.current);
        cooldownTimer.current = setTimeout(() => setCooldown(false), 60_000);
      } else {
        showToast("Failed to resend. Try again.");
      }
    } catch {
      showToast("Network error. Try again.");
    } finally {
      setSending(false);
    }
  };

  const handleContinue = async () => {
    setChecking(true);
    try {
      const res = await fetch(`${BASE_URL}/accounts`, {
        headers: { Authorization: token },
      });
      if (res.status === 403) {
        showToast("Email not yet verified. Check your inbox.");
        return;
      }
      if (res.ok) {
        await clearPendingEmail();
        const isNewUser = Platform.OS === "web"
          ? localStorage.getItem("is_new_user") === "true"
          : (await SecureStore.getItemAsync("is_new_user")) === "true";
        router.replace(isNewUser ? "/hello" : "/dashboard");
      }
    } catch {
      showToast("Network error. Try again.");
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/landing");
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 16 },
      ]}
    >
      {toast ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}

      <View style={styles.inner}>
        <View style={styles.iconCircle}>
          <Ionicons name="mail-outline" size={40} color="#346739" />
        </View>

        <Text style={styles.title}>Check your email</Text>
        <Text style={styles.subtitle}>
          {email
            ? `We sent a verification link to\n${email}`
            : "We sent a verification link to your email address."}
          {"\n"}Click it to activate your account.
        </Text>
        <Text style={styles.expiry}>Link expires in 24 hours.</Text>

        <Pressable
          style={({ pressed }) => [
            styles.primaryBtn,
            (checking || sending) && styles.btnDisabled,
            pressed && !checking && !sending && styles.primaryBtnPressed,
          ]}
          onPress={handleContinue}
          disabled={checking || sending}
        >
          {checking ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.primaryBtnText}>I've verified my email</Text>
          )}
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.secondaryBtn,
            (sending || cooldown) && styles.secondaryBtnDisabled,
            pressed && !sending && !cooldown && styles.secondaryBtnPressed,
          ]}
          onPress={handleResend}
          disabled={sending || cooldown}
        >
          {sending ? (
            <ActivityIndicator color="#346739" size="small" />
          ) : (
            <Text
              style={[
                styles.secondaryBtnText,
                cooldown && styles.secondaryBtnTextMuted,
              ]}
            >
              {cooldown ? "Email sent ✓" : "Resend email"}
            </Text>
          )}
        </Pressable>
      </View>

      <Pressable onPress={handleLogout} style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f9f4",
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  inner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#e8f4e8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 26,
    color: "#346739",
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Nunito_700Bold",
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    lineHeight: 23,
    maxWidth: 300,
  },
  expiry: {
    fontSize: 12,
    color: "#aaa",
    marginTop: -4,
  },
  primaryBtn: {
    marginTop: 8,
    backgroundColor: "#346739",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
    minHeight: 50,
    justifyContent: "center",
  },
  primaryBtnPressed: { opacity: 0.85 },
  btnDisabled: { opacity: 0.5 },
  primaryBtnText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
    color: "#fff",
  },
  secondaryBtn: {
    borderWidth: 1.5,
    borderColor: "#346739",
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 32,
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
    minHeight: 50,
    justifyContent: "center",
  },
  secondaryBtnPressed: { backgroundColor: "#f0f8f0" },
  secondaryBtnDisabled: { borderColor: "#9FCB98" },
  secondaryBtnText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
    color: "#346739",
  },
  secondaryBtnTextMuted: { color: "#9FCB98" },
  logoutBtn: {
    alignSelf: "center",
    paddingVertical: 8,
  },
  logoutText: {
    fontSize: 14,
    color: "#aaa",
  },
  toast: {
    position: "absolute",
    top: 80,
    left: 24,
    right: 24,
    backgroundColor: "#346739",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    zIndex: 10,
  },
  toastText: {
    fontFamily: "Nunito_700Bold",
    color: "#fff",
    fontSize: 14,
  },
});
