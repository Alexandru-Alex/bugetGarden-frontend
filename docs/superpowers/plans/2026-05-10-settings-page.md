# Settings Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the `/settings` screen with a shop-promo banner and user profile card, wired into the navigation menu.

**Architecture:** Single screen (`app/settings.tsx`) with its own styles file (`styles/settings.styles.ts`). Reuses the `["account"]` React Query cache already populated by other screens — no extra network requests. Follows the `PageTransition` + `NavMenu` + `ScrollView` pattern used by every other secondary page.

**Tech Stack:** React Native, Expo Router, React Query (`@tanstack/react-query`), `expo-linear-gradient`, `react-native-safe-area-context`, `Nunito` fonts.

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `styles/settings.styles.ts` | All styles for the settings screen |
| Create | `app/settings.tsx` | Settings screen component |
| Modify | `app/_layout.tsx` | Register `settings` route in the root Stack |
| Modify | `components/nav-menu.tsx` | Fix Settings path from `""` to `"/settings"` |

---

## Task 1: Create the styles file

**Files:**
- Create: `styles/settings.styles.ts`

- [ ] **Step 1: Create `styles/settings.styles.ts`**

```typescript
import { StyleSheet } from "react-native";

export const GREEN_DARK = "#346739";
export const GREEN_MED = "#79AE6F";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f2f5f2",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
  },
  title: {
    fontFamily: "Nunito_900Black",
    fontSize: 28,
    color: "#1a2e1b",
    marginBottom: 20,
  },
  banner: {
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  bannerLeft: {
    flex: 1,
    paddingRight: 12,
  },
  bannerKicker: {
    fontFamily: "Nunito_700Bold",
    fontSize: 11,
    color: "#9FCB98",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  bannerTitle: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 15,
    color: "#ffffff",
    lineHeight: 21,
    marginBottom: 10,
  },
  bannerCta: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    gap: 4,
  },
  bannerCtaText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 12,
    color: "#ffffff",
  },
  bannerCoinImg: {
    width: 56,
    height: 56,
  },
  profileCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2.5,
    borderColor: GREEN_MED,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 16,
    color: "#1a2e1b",
    marginBottom: 2,
  },
  profileEmail: {
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
    color: "#6b7f6b",
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add styles/settings.styles.ts
git commit -m "feat: add settings page styles"
```

---

## Task 2: Create the settings screen

**Files:**
- Create: `app/settings.tsx`
- Read: `app/(tabs)/dashboard.tsx` lines 19-28 — `AccountDto` interface and `ACCOUNT_QUERY_KEY`

- [ ] **Step 1: Create `app/settings.tsx`**

```typescript
import { NavMenu } from "@/components/nav-menu";
import { PageTransition } from "@/components/page-transition";
import { AccountDto, ACCOUNT_QUERY_KEY } from "@/app/(tabs)/dashboard";
import { api, getStoredToken } from "@/lib/api";
import { styles } from "@/styles/settings.styles";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, useRouter, usePathname } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NavTransition } from "@/lib/nav-direction";

export default function SettingsScreen() {
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    getStoredToken().then(setToken);
  }, []);

  const { data: account } = useQuery<AccountDto>({
    queryKey: ACCOUNT_QUERY_KEY,
    queryFn: () => api.get("/accounts"),
    staleTime: Infinity,
    enabled: !!token,
  });

  if (token === undefined) return null;
  if (!token) return <Redirect href="/landing" />;

  const goToStore = () => {
    NavTransition.setDirection(pathname, "/store");
    router.replace("/store");
  };

  return (
    <PageTransition style={styles.root}>
      <NavMenu />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 64 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Settings</Text>

        {/* Shop banner */}
        <Pressable onPress={goToStore}>
          <LinearGradient
            colors={["#2A4A2E", "#346739", "#4a8050"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.banner}
          >
            <View style={styles.bannerLeft}>
              <Text style={styles.bannerKicker}>Shop</Text>
              <Text style={styles.bannerTitle}>
                Visit the shop to buy flowers for your garden
              </Text>
              <View style={styles.bannerCta}>
                <Text style={styles.bannerCtaText}>Go to Store</Text>
                <Ionicons name="chevron-forward" size={12} color="#FFE566" />
              </View>
            </View>
            <Image
              source={require("../assets/images/coin.png")}
              style={styles.bannerCoinImg}
              resizeMode="contain"
            />
          </LinearGradient>
        </Pressable>

        {/* Profile card */}
        <View style={styles.profileCard}>
          <Image
            source={require("../assets/avatars/gardener_1.png")}
            style={styles.avatar}
            resizeMode="cover"
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName} numberOfLines={1}>
              {account?.displayName ?? "—"}
            </Text>
            <Text style={styles.profileEmail} numberOfLines={1}>
              {account?.email ?? "—"}
            </Text>
          </View>
        </View>
      </ScrollView>
    </PageTransition>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/settings.tsx
git commit -m "feat: add settings screen"
```

---

## Task 3: Wire up routing

**Files:**
- Modify: `app/_layout.tsx` — add `<Stack.Screen name="settings" options={{ headerShown: false }} />`
- Modify: `components/nav-menu.tsx` — change Settings path from `""` to `"/settings"`

- [ ] **Step 1: Add route to `app/_layout.tsx`**

In `app/_layout.tsx`, after the `store` Stack.Screen (line 68), add:

```tsx
<Stack.Screen name="settings" options={{ headerShown: false }} />
```

So the Stack block ends with:
```tsx
            <Stack.Screen name="store" options={{ headerShown: false }} />
            <Stack.Screen name="settings" options={{ headerShown: false }} />
          </Stack>
```

- [ ] **Step 2: Fix Settings path in `components/nav-menu.tsx`**

In `components/nav-menu.tsx` line 34, change:
```ts
{ label: "Settings", icon: "settings-outline" as const, path: ""     },
```
to:
```ts
{ label: "Settings", icon: "settings-outline" as const, path: "/settings" },
```

- [ ] **Step 3: Commit**

```bash
git add app/_layout.tsx components/nav-menu.tsx
git commit -m "feat: wire up /settings route in nav and root stack"
```

---

## Verification

- [ ] Run the app (`npx expo start`) and open on web or Android
- [ ] Open the nav menu → tap "Settings" → should navigate to `/settings`
- [ ] Verify "Settings" title appears
- [ ] Verify the green gradient banner appears with coin image on the right
- [ ] Tap the banner → should navigate to `/store`
- [ ] Verify the profile card shows the correct avatar, display name, and email
- [ ] Back navigation (router.back or hamburger) returns to previous page
