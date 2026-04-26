import { NavMenu } from "@/components/nav-menu";
import { PageTransition } from "@/components/page-transition";
import { getStoredToken } from "@/lib/api";
import { AchievementDto, fetchAchievements } from "@/lib/tasks-api";
import { styles } from "@/styles/tabs/achievements.styles";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DIFFICULTY: Record<
  string,
  { emoji: string; badgeBg: string; fillColor: string; coinsColor: string; unlockedLabel: string; unlockedColor: string }
> = {
  easy: {
    emoji: "🌿",
    badgeBg: "#E8F5E9",
    fillColor: "#52B788",
    coinsColor: "#2E7D32",
    unlockedLabel: "✓ Done",
    unlockedColor: "#2E7D32",
  },
  medium: {
    emoji: "⚡",
    badgeBg: "#FFF8E1",
    fillColor: "#FFC107",
    coinsColor: "#B8860B",
    unlockedLabel: "✓ Done",
    unlockedColor: "#B8860B",
  },
  hard: {
    emoji: "💎",
    badgeBg: "#FCE4EC",
    fillColor: "#FF6B6B",
    coinsColor: "#C62828",
    unlockedLabel: "✓ Done",
    unlockedColor: "#C62828",
  },
};

const LOCKED_CONFIG = {
  badgeBg: "#EBEBEB",
  fillColor: "#CCCCCC",
};

export default function AchievementsScreen() {
  const [token, setToken] = useState<string | null | undefined>(undefined);

  useEffect(() => { getStoredToken().then(setToken); }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["achievements"],
    queryFn: fetchAchievements,
    enabled: !!token,
  });

  if (token === undefined) return null;
  if (!token) return <Redirect href="/landing" />;

  const { unlocked, locked } = (data ?? []).reduce<{
    unlocked: AchievementDto[];
    locked: AchievementDto[];
  }>(
    (acc, a) => {
      (a.unlocked ? acc.unlocked : acc.locked).push(a);
      return acc;
    },
    { unlocked: [], locked: [] },
  );

  return (
    <PageTransition style={styles.root}>
      <NavMenu />
      <LinearGradient
        colors={["#2A4A2E", "#346739"]}
        style={[styles.header, Platform.OS === "web" && { paddingTop: 56 }]}
      >
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerSection}>
            <Text style={styles.headerLabel}>Achievements</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading && <ActivityIndicator color="#346739" style={{ marginTop: 40 }} />}

        {!isLoading && (
          <>
            {unlocked.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Unlocked ({unlocked.length})</Text>
                {unlocked.map((a) => <AchievementRow key={a.id} achievement={a} />)}
              </>
            )}

            {locked.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>In progress ({locked.length})</Text>
                {locked.map((a) => <AchievementRow key={a.id} achievement={a} />)}
              </>
            )}
          </>
        )}
      </ScrollView>
    </PageTransition>
  );
}

function AchievementRow({ achievement: a }: { achievement: AchievementDto }) {
  const cfg = DIFFICULTY[a.difficulty] ?? DIFFICULTY.easy;
  const progress = Math.min(a.currentCount / a.targetCount, 1);

  const badgeBg = a.unlocked ? cfg.badgeBg : LOCKED_CONFIG.badgeBg;
  const fillColor = a.unlocked ? cfg.fillColor : LOCKED_CONFIG.fillColor;

  return (
    <View style={[styles.row, !a.unlocked && styles.rowLocked]}>
      <View style={[styles.badge, { backgroundColor: badgeBg }]}>
        <Text style={[styles.badgeEmoji, !a.unlocked && { opacity: 0.35 }]}>
          {a.unlocked ? cfg.emoji : "🔒"}
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, !a.unlocked && styles.titleLocked]}>
          {a.title}
        </Text>

        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: fillColor }]}
          />
        </View>

        <View style={styles.meta}>
          <Text style={styles.metaCount}>
            {a.currentCount}/{a.targetCount}
          </Text>
          <Text style={[styles.metaCoins, { color: a.unlocked ? cfg.coinsColor : "#AAAAAA" }]}>
            +{a.coinReward} coins
          </Text>
          {a.difficulty === "hard" && <Text style={styles.metaFlower}>🌸</Text>}
          {a.unlocked && (
            <Text style={[styles.unlockedBadge, { color: cfg.unlockedColor }]}>
              {cfg.unlockedLabel}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
