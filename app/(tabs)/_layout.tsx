import { Stack } from "expo-router";
import React from "react";
import { NavTransition } from "@/lib/nav-direction";

export default function TabLayout() {
  return (
    <Stack
      screenOptions={() => ({
        headerShown: false,
        animation: NavTransition.isForward() ? "slide_from_right" : "slide_from_left",
      })}
    />
  );
}
