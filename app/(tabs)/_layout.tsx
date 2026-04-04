import { Tabs } from "expo-router";
import React from "react";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      initialRouteName="garden"
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarStyle: { display: "none" },
      }}
    >
      <Tabs.Screen
        name="garden"
        options={{
          title: "Garden",
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="roadmap"
        options={{
          title: "Roadmap",
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
        }}
      />
    </Tabs>
  );
}
