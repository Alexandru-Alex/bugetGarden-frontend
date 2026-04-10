import { api, getStoredToken } from "@/lib/api";
import { styles } from "@/styles/hello.styles";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

type Currency = "USD" | "EUR";

export default function HelloScreen() {
  const router = useRouter();
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [isNewUser, setIsNewUser] = useState<boolean | undefined>(undefined);
  const [name, setName] = useState("");
  const [nameFocused, setNameFocused] = useState(false);
  const [currency, setCurrency] = useState<Currency>("USD");

  useEffect(() => {
    getStoredToken().then(setToken);
    if (Platform.OS === "web") {
      setIsNewUser(localStorage.getItem("is_new_user") === "true");
    } else {
      SecureStore.getItemAsync("is_new_user").then((v) => setIsNewUser(v === "true"));
    }
  }, []);

  if (token === undefined || isNewUser === undefined) return null;
  if (!token) return <Redirect href="/landing" />;
  if (!isNewUser) return <Redirect href="/dashboard" />;

  const handleContinue = async () => {
    if (!name.trim()) return;
    try {
      await api.patch("/accounts", { name: name.trim(), currency });
    } catch {
      // ignoră erorile de rețea, continuă oricum
    }
    if (Platform.OS === "web") {
      localStorage.setItem("is_new_user", "false");
    } else {
      await SecureStore.setItemAsync("is_new_user", "false");
    }
    router.replace("/dashboard");
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

          <View style={styles.currencySection}>
            <Text style={styles.currencyLabel}>Currency</Text>
            <View style={styles.currencyRow}>
              {(["USD", "EUR"] as Currency[]).map((c) => (
                <Pressable
                  key={c}
                  style={({ pressed }) => [
                    styles.currencyOption,
                    currency === c && styles.currencyOptionSelected,
                    pressed && currency !== c && styles.currencyOptionPressed,
                  ]}
                  onPress={() => setCurrency(c)}
                >
                  <Text
                    style={[
                      styles.currencySymbol,
                      currency === c && styles.currencySymbolSelected,
                    ]}
                  >
                    {c === "USD" ? "$" : "€"}
                  </Text>
                  <Text
                    style={[
                      styles.currencyName,
                      currency === c && styles.currencyNameSelected,
                    ]}
                  >
                    {c}
                  </Text>
                </Pressable>
              ))}
            </View>
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