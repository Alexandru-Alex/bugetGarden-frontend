import { NavMenu } from "@/components/nav-menu";
import { api } from "@/lib/api";
import { inputOutline, styles } from "@/styles/change-account.styles";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import * as Crypto from "expo-crypto";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ChangePasswordScreen() {
  const insets = useSafeAreaInsets();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: async () => {
      const [hashedCurrent, hashedNew] = await Promise.all([
        Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, currentPassword),
        Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, newPassword),
      ]);
      return api.patch("/accounts/password", { currentPassword: hashedCurrent, newPassword: hashedNew });
    },
    onSuccess: () => {
      setToastVisible(true);
      toastTimer.current = setTimeout(() => {
        setToastVisible(false);
        router.canGoBack() ? router.back() : router.replace("/settings");
      }, 2000);
    },
  });

  const canSubmit = currentPassword.length > 0 && newPassword.length > 0 && !isPending;
  const errorMsg = error?.message ?? null;

  return (
    <View style={styles.root}>
      <NavMenu />
      <LinearGradient
        colors={["#2A4A2E", "#346739"]}
        style={[styles.header, { paddingTop: Platform.OS === "web" ? 56 : insets.top + 56 }]}
      >
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={styles.headerSubRow}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
            onPress={() => router.canGoBack() ? router.back() : router.replace("/settings")}
          >
            <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
          </Pressable>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionLabel}>Current Password</Text>
          <View style={styles.inputBox}>
            <Ionicons name="lock-closed-outline" size={18} color="#79AE6F" style={styles.inputIcon} />
            <TextInput
              style={[styles.textInput, inputOutline]}
              value={currentPassword}
              onChangeText={(t) => { reset(); setCurrentPassword(t); }}
              placeholder="Enter current password"
              placeholderTextColor="#B8D4B8"
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.sectionLabel}>New Password</Text>
          <View style={styles.inputBox}>
            <Ionicons name="key-outline" size={18} color="#79AE6F" style={styles.inputIcon} />
            <TextInput
              style={[styles.textInput, inputOutline]}
              value={newPassword}
              onChangeText={(t) => { reset(); setNewPassword(t); }}
              placeholder="Enter new password"
              placeholderTextColor="#B8D4B8"
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

          <Pressable
            style={({ pressed }) => [
              styles.saveBtn,
              pressed && styles.saveBtnPressed,
              !canSubmit && styles.saveBtnDisabled,
            ]}
            onPress={() => mutate()}
            disabled={!canSubmit}
          >
            <Text style={styles.saveBtnText}>{isPending ? "Saving…" : "Save"}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      {toastVisible && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>Password updated successfully</Text>
        </View>
      )}
    </View>
  );
}
