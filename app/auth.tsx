import * as WebBrowser from "expo-web-browser";
import { View, ActivityIndicator } from "react-native";

// Această pagină este destinația de redirect OAuth pe web.
// maybeCompleteAuthSession() detectează token-ul din hash, trimite mesaj
// ferestrei părinte (landing.tsx) și închide popup-ul automat.
WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#1a2e1a" }}>
      <ActivityIndicator size="large" color="#4a9e2f" />
    </View>
  );
}
