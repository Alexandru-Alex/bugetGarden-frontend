import { clearPendingEmail, getStoredToken } from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function EmailVerifiedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { success } = useLocalSearchParams<{ success?: string }>();
  const [isNewUser, setIsNewUser] = useState(false);

  const isSuccess = success === "true";

  useEffect(() => {
    if (Platform.OS === "web") {
      setIsNewUser(localStorage.getItem("is_new_user") === "true");
    } else {
      SecureStore.getItemAsync("is_new_user").then((v) => setIsNewUser(v === "true"));
    }
  }, []);

  const handleContinue = async () => {
    await clearPendingEmail();
    const token = await getStoredToken();
    router.replace(token ? (isNewUser ? "/hello" : "/dashboard") : "/landing");
  };

  const handleTryAgain = async () => {
    const token = await getStoredToken();
    router.replace(token ? "/pending-verification" : "/landing");
  };

  return (
    <View
      style={[
        styles.container,
        isSuccess ? styles.containerSuccess : styles.containerError,
        { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 32 },
      ]}
    >
      <View style={styles.inner}>
        <View
          style={[
            styles.iconCircle,
            isSuccess ? styles.iconCircleSuccess : styles.iconCircleError,
          ]}
        >
          <Ionicons
            name={isSuccess ? "checkmark" : "close"}
            size={40}
            color="#fff"
          />
        </View>

        <Text style={[styles.title, isSuccess ? styles.titleSuccess : styles.titleError]}>
          {isSuccess ? "Email verified!" : "Link expired or invalid"}
        </Text>

        <Text style={styles.subtitle}>
          {isSuccess
            ? "Your account is ready. You can now use Money Garden."
            : "This link has already been used or has expired.\nOpen the app to request a new one."}
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.btn,
            isSuccess ? styles.btnSuccess : styles.btnError,
            pressed && styles.btnPressed,
          ]}
          onPress={isSuccess ? handleContinue : handleTryAgain}
        >
          <Text style={styles.btnText}>
            {isSuccess ? "Continue to app" : "Request a new link"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  containerSuccess: { backgroundColor: "#f5f9f4" },
  containerError: { backgroundColor: "#fdf5f5" },
  inner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  iconCircleSuccess: { backgroundColor: "#346739" },
  iconCircleError: { backgroundColor: "#e74c3c" },
  title: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 28,
    textAlign: "center",
  },
  titleSuccess: { color: "#346739" },
  titleError: { color: "#c0392b" },
  subtitle: {
    fontFamily: "Nunito_700Bold",
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    lineHeight: 23,
    maxWidth: 300,
  },
  btn: {
    marginTop: 8,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
  },
  btnSuccess: { backgroundColor: "#346739" },
  btnError: { backgroundColor: "#e74c3c" },
  btnPressed: { opacity: 0.85 },
  btnText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
    color: "#fff",
  },
});
