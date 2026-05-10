import { ensureScheduled } from "@/lib/notifications";
import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { NavTransition } from "@/lib/nav-direction";

let _notifGuard = false;

export default function TabLayout() {
  useEffect(() => {
    if (_notifGuard) return;
    _notifGuard = true;
    ensureScheduled();
  }, []);

  return (
    <Stack
      screenOptions={() => ({
        headerShown: false,
        animation: NavTransition.isForward() ? "slide_from_right" : "slide_from_left",
      })}
    />
  );
}
