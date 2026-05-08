import { api, getStoredToken } from "@/lib/api";
import { CURRENCIES, type Currency } from "@/lib/currency";
import { useFocusStyle } from "@/lib/use-focus-style";
import { ITEM_H, PICKER_H, styles } from "@/styles/hello.styles";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated from "react-native-reanimated";

export default function HelloScreen() {
  const router = useRouter();
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [isNewUser, setIsNewUser] = useState<boolean | undefined>(undefined);
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [open, setOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const name$ = useFocusStyle();

  useEffect(() => {
    getStoredToken().then(setToken);
    if (Platform.OS === "web") {
      setIsNewUser(localStorage.getItem("is_new_user") === "true");
    } else {
      SecureStore.getItemAsync("is_new_user").then((v) => setIsNewUser(v === "true"));
    }
  }, []);

  const scrollToIndex = useCallback((index: number, animated = true) => {
    scrollRef.current?.scrollTo({ y: index * ITEM_H, animated });
  }, []);

  const handleOpen = useCallback(() => {
    setOpen(true);
    const idx = CURRENCIES.findIndex((c) => c.code === currency);
    setTimeout(() => scrollToIndex(idx, false), 50);
  }, [currency, scrollToIndex]);

  const handleScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
      const clamped = Math.max(0, Math.min(CURRENCIES.length - 1, idx));
      setCurrency(CURRENCIES[clamped].code);
    },
    []
  );

  const handleItemPress = useCallback(
    (index: number) => {
      scrollToIndex(index);
      setCurrency(CURRENCIES[index].code);
    },
    [scrollToIndex]
  );

  if (token === undefined || isNewUser === undefined) return null;
  if (!token) return <Redirect href="/landing" />;
  if (!isNewUser) return <Redirect href="/dashboard" />;

  const handleContinue = async () => {
    if (!name.trim()) return;
    try {
      await api.patch("/accounts", { name: name.trim(), currency });
    } catch {
      // network errors are non-fatal; continue to dashboard
    }
    if (Platform.OS === "web") {
      localStorage.setItem("is_new_user", "false");
    } else {
      await SecureStore.setItemAsync("is_new_user", "false");
    }
    router.replace("/dashboard");
  };

  const selected = CURRENCIES.find((c) => c.code === currency)!;

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
          <Animated.View style={[styles.inputWrap, name$.style]}>
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
              onFocus={name$.onFocus}
              onBlur={name$.onBlur}
              autoFocus
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={handleContinue}
              underlineColorAndroid="transparent"
            />
          </Animated.View>

          <View style={styles.currencySection}>
            <Text style={styles.currencyLabel}>Currency</Text>

            <Pressable
              style={({ pressed }) => [
                styles.currencyTrigger,
                open && styles.currencyTriggerOpen,
                pressed && !open && styles.currencyTriggerPressed,
              ]}
              onPress={open ? () => setOpen(false) : handleOpen}
            >
              <Text style={[styles.currencyTriggerSymbol, open && styles.currencyTriggerTextOpen]}>
                {selected.symbol}
              </Text>
              <Text style={[styles.currencyTriggerCode, open && styles.currencyTriggerTextOpen]}>
                {selected.code}
              </Text>
              <Ionicons
                name={open ? "chevron-up" : "chevron-down"}
                size={16}
                color={open ? "#ffffff" : "#79AE6F"}
              />
            </Pressable>

            {open && Platform.OS === "web" ? (
              <View style={styles.webPickerContainer}>
                <ScrollView
                  style={styles.webPickerScroll}
                  showsVerticalScrollIndicator={false}
                >
                  {CURRENCIES.map(({ code, symbol }, i) => (
                    <Pressable
                      key={code}
                      style={[
                        styles.webPickerItem,
                        currency === code && styles.webPickerItemSelected,
                      ]}
                      onPress={() => {
                        setCurrency(code);
                        setOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.webPickerSymbol,
                          currency === code && styles.webPickerTextSelected,
                        ]}
                      >
                        {symbol}
                      </Text>
                      <Text
                        style={[
                          styles.webPickerCode,
                          currency === code && styles.webPickerTextSelected,
                        ]}
                      >
                        {code}
                      </Text>
                      {currency === code && (
                        <Ionicons name="checkmark" size={16} color="#ffffff" />
                      )}
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            ) : open && (
              <View style={styles.wheelContainer}>
                <ScrollView
                  ref={scrollRef}
                  style={styles.wheelScroll}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ITEM_H}
                  decelerationRate="fast"
                  scrollEventThrottle={16}
                  onMomentumScrollEnd={handleScrollEnd}
                  onScrollEndDrag={handleScrollEnd}
                  contentContainerStyle={styles.wheelContent}
                >
                  {CURRENCIES.map(({ code, symbol }, i) => (
                    <Pressable
                      key={code}
                      style={styles.wheelItem}
                      onPress={() => handleItemPress(i)}
                    >
                      <Text style={styles.wheelSymbol}>{symbol}</Text>
                      <Text style={styles.wheelCode}>{code}</Text>
                    </Pressable>
                  ))}
                </ScrollView>

                <LinearGradient
                  colors={["#ffffff", "rgba(255,255,255,0)"]}
                  style={styles.wheelFadeTop}
                  pointerEvents="none"
                />
                <LinearGradient
                  colors={["rgba(255,255,255,0)", "#ffffff"]}
                  style={styles.wheelFadeBottom}
                  pointerEvents="none"
                />
                <View style={styles.wheelHighlight} pointerEvents="none" />
              </View>
            )}
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
