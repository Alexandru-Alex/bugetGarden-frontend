import { NavMenu } from "@/components/nav-menu";
import { getStoredToken } from "@/lib/api";
import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StatisticsScreen() {
  const [token, setToken] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    getStoredToken().then(setToken);
  }, []);

  if (token === undefined) return null;
  if (!token) return <Redirect href="/landing" />;

  return (
    <View style={styles.root}>
      <NavMenu />
      <SafeAreaView style={styles.center} edges={["top"]}>
        <Text style={styles.placeholder}>Statistics</Text>
        <Text style={styles.sub}>Coming soon</Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F8F5",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholder: {
    fontFamily: "Pacifico_400Regular",
    fontSize: 32,
    color: "#346739",
  },
  sub: {
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    color: "#79AE6F",
    marginTop: 8,
  },
});
