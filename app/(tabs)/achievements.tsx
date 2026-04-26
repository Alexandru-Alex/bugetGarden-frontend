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

const DIFFICULTY_COLORS = {
  easy:   { bg: "#1E3A2F", text: "#4CAF50" },
  medium: { bg: "#2D2A1A", text: "#FFC107" },
  hard:   { bg: "#2D1A1A", text: "#FF6B6B" },
};

const DIFFICULTY_LABELS = {
  easy: "Ușor",
  medium: "Mediu",
  hard: "Dificil",
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
            <Text style={styles.sectionTitle}>Deblocate ({unlocked.length})</Text>
            {unlocked.map((a) => <AchievementCard key={a.id} achievement={a} />)}

            <Text style={styles.sectionTitle}>În progres ({locked.length})</Text>
            {locked.map((a) => <AchievementCard key={a.id} achievement={a} />)}
          </>
        )}
      </ScrollView>
    </PageTransition>
  );
}

function AchievementCard({ achievement: a }: { achievement: AchievementDto }) {
  const progress = Math.min(a.currentCount / a.targetCount, 1);
  const colors   = DIFFICULTY_COLORS[a.difficulty];

  return (
    <View style={[styles.card, !a.unlocked && styles.cardLocked]}>
      <View style={[styles.difficultyBadge, { backgroundColor: colors.bg }]}>
        <Text style={[styles.difficultyText, { color: colors.text }]}>
          {DIFFICULTY_LABELS[a.difficulty]}
        </Text>
      </View>
      <Text style={styles.cardTitle}>{a.title}</Text>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            a.unlocked && styles.progressFillUnlocked,
            { width: `${progress * 100}%` },
          ]}
        />
      </View>
      <View style={styles.meta}>
        <Text style={styles.metaText}>{a.currentCount}/{a.targetCount}</Text>
        <Text style={styles.metaText}>+{a.coinReward} coins</Text>
        {a.difficulty === "hard" && <Text style={styles.metaText}>🌸</Text>}
        {a.unlocked && <Text style={styles.metaText}>✅</Text>}
      </View>
    </View>
  );
}
