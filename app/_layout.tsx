import {
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from "@expo-google-fonts/nunito";
import { Pacifico_400Regular } from "@expo-google-fonts/pacifico";
import { FontDisplay, useFonts } from "expo-font";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LogBox, Platform } from "react-native";
import { Analytics } from "@vercel/analytics/react";

const isWeb = Platform.OS === "web";

LogBox.ignoreLogs(["Looks like you have configured linking in multiple places"]);
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useColorScheme } from "@/hooks/use-color-scheme";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,       // 30s înainte de re-fetch
      gcTime: 5 * 60 * 1000,  // 5min în cache după unmount
      retry: 2,
    },
    mutations: {
      retry: 0, // fără retry la mutații — integritate date
    },
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded] = useFonts({
    Nunito_700Bold:      { uri: Nunito_700Bold,      display: FontDisplay.SWAP },
    Nunito_800ExtraBold: { uri: Nunito_800ExtraBold, display: FontDisplay.SWAP },
    Nunito_900Black:     { uri: Nunito_900Black,     display: FontDisplay.SWAP },
    Pacifico_400Regular: { uri: Pacifico_400Regular, display: FontDisplay.SWAP },
  });

  // On web, font-display:swap shows fallback text immediately — no need to block.
  // On native, wait so the splash screen covers the unstyled frame.
  if (!fontsLoaded && !isWeb) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <Stack initialRouteName={isWeb ? "index" : "landing"}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="landing" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="hello" options={{ headerShown: false }} />
            <Stack.Screen name="category-entries" options={{ headerShown: false }} />
            <Stack.Screen name="manage-categories" options={{ headerShown: false }} />
            <Stack.Screen name="edit-entry" options={{ headerShown: false }} />
            <Stack.Screen name="create-categories" options={{ headerShown: false }} />
            <Stack.Screen name="budgets" options={{ headerShown: false }} />
            <Stack.Screen name="goals/transaction" options={{ headerShown: false }} />
            <Stack.Screen name="store" options={{ headerShown: false }} />
            <Stack.Screen name="settings" options={{ headerShown: false }} />
            <Stack.Screen name="change-email" options={{ headerShown: false }} />
            <Stack.Screen name="change-password" options={{ headerShown: false }} />
            <Stack.Screen name="privacy-policy" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
          {isWeb && <Analytics />}
        </ThemeProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
