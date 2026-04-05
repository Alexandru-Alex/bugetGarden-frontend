import { Redirect, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

export default function HelloScreen() {
  const router = useRouter();
  const [token, setToken] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    if (Platform.OS === "web") {
      setToken(localStorage.getItem("auth_token"));
    } else {
      SecureStore.getItemAsync("auth_token").then(setToken);
    }
  }, []);

  if (token === undefined) return null;
  if (!token) return <Redirect href="/landing" />;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello</Text>
      <Pressable style={styles.btn} onPress={() => router.replace("/(tabs)")}>
        <Text style={styles.btnText}>Go to Dashboard</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4a9e2f",
    alignItems: "center",
    justifyContent: "center",
    gap: 32,
  },
  text: {
    fontSize: 64,
    fontWeight: "bold",
    color: "#ffffff",
  },
  btn: {
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 50,
  },
  btnText: {
    color: "#1b5e20",
    fontSize: 16,
    fontWeight: "bold",
  },
});
