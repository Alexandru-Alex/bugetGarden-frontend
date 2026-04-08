import { Ionicons } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function HelloScreen() {
  const router = useRouter();
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [isNewUser, setIsNewUser] = useState<boolean | undefined>(undefined);
  const [name, setName] = useState("");
  const [nameFocused, setNameFocused] = useState(false);

  useEffect(() => {
    if (Platform.OS === "web") {
      setToken(localStorage.getItem("auth_token"));
      setIsNewUser(localStorage.getItem("is_new_user") === "true");
    } else {
      SecureStore.getItemAsync("auth_token").then(setToken);
      SecureStore.getItemAsync("is_new_user").then((v) => setIsNewUser(v === "true"));
    }
  }, []);

  if (token === undefined || isNewUser === undefined) return null;
  if (!token) return <Redirect href="/landing" />;
  if (!isNewUser) return <Redirect href="/garden" />;

  const handleContinue = async () => {
    if (!name.trim()) return;
    try {
      await fetch(
        "http://localhost:8080/accounts/name",
        {
          method: "POST",
          headers: {
            "Content-Type": "text/plain",
            Authorization: token,
          },
          body: name.trim(),
        }
      );
    } catch {
      // ignoră erorile de rețea, continuă oricum
    }
    if (Platform.OS === "web") {
      localStorage.setItem("is_new_user", "false");
    } else {
      await SecureStore.setItemAsync("is_new_user", "false");
    }
    router.replace("/garden");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome!</Text>
          <Text style={styles.subtitle}>What should we call you?</Text>
        </View>

        <View style={styles.card}>
          <View style={[styles.inputWrap, nameFocused && styles.inputWrapFocused]}>
            <Ionicons
              name="person-outline"
              size={18}
              color="#79AE6F"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor="#79AE6F"
              value={name}
              onChangeText={setName}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
              autoFocus
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={handleContinue}
              underlineColorAndroid="transparent"
            />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.btn,
              !name.trim() && styles.btnDisabled,
              pressed && name.trim() && styles.btnPressed,
            ]}
            onPress={handleContinue}
            disabled={!name.trim()}
          >
            <Text style={styles.btnText}>Continue</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#346739",
  },
  inner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 32,
  },
  header: {
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontFamily: "Pacifico_400Regular",
    fontSize: 48,
    color: "#ffffff",
  },
  subtitle: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 14,
    color: "#9FCB98",
    letterSpacing: 0.4,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#ffffff",
    borderRadius: 28,
    padding: 28,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#79AE6F",
    borderRadius: 14,
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
  },
  inputWrapFocused: {
    borderColor: "#346739",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: "Nunito_700Bold",
    fontSize: 15,
    color: "#346739",
    paddingVertical: 12,
    ...Platform.select({
      web: { outlineWidth: 0, outlineStyle: "none" } as any,
      default: {},
    }),
  },
  btn: {
    backgroundColor: "#346739",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#346739",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  btnDisabled: {
    backgroundColor: "#9FCB98",
    shadowOpacity: 0,
    elevation: 0,
  },
  btnPressed: {
    backgroundColor: "#2d5a30",
    transform: [{ scale: 0.98 }],
  },
  btnText: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 16,
    color: "#ffffff",
    letterSpacing: 0.4,
  },
});
