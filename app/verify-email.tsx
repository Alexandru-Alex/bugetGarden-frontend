import { BASE_URL } from "@/lib/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";

export default function VerifyEmailScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.replace("/email-verified?error=invalid");
      return;
    }
    if (Platform.OS === "web") {
      window.location.href = `${BASE_URL}/verify-email?token=${encodeURIComponent(String(token))}`;
    }
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator color="#346739" size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f5f9f4" },
});
