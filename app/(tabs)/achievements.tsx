import { NavMenu } from "@/components/nav-menu";
import { PageTransition } from "@/components/page-transition";
import { getStoredToken } from "@/lib/api";
import { AchievementDto, fetchAchievements } from "@/lib/quests-api";
import { styles } from "@/styles/tabs/achievements.styles";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BADGE_IMAGES: Record<string, number> = {
  badge:   require("@/assets/badges/badge.png"),
  badge_1: require("@/assets/badges/badge_1.png"),
  badge_2: require("@/assets/badges/badge_2.png"),
  badge_3: require("@/assets/badges/badge_3.png"),
  badge_4: require("@/assets/badges/badge_4.png"),
  badge_5: require("@/assets/badges/badge_5.png"),
  badge_6: require("@/assets/badges/badge_6.png"),
  badge_7: require("@/assets/badges/badge_7.png"),
  badge_8: require("@/assets/badges/badge_8.png"),
};

const DIFFICULTY: Record<string, {
  ring: string;
  fillColor: string;
  coinsColor: string;
  unlockedColor: string;
  shadowColor: string;
}> = {
  easy: {
    ring: "#74C69D",
    fillColor: "#52B788",
    coinsColor: "#2D6A4F",
    unlockedColor: "#2D6A4F",
    shadowColor: "#52B788",
  },
  medium: {
    ring: "#FFD54F",
    fillColor: "#F9A825",
    coinsColor: "#E65100",
    unlockedColor: "#E65100",
    shadowColor: "#F9C74F",
  },
  hard: {
    ring: "#52B788",
    fillColor: "#40916C",
    coinsColor: "#1B4332",
    unlockedColor: "#1B4332",
    shadowColor: "#2D6A4F",
  },
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
        <View style={styles.scrollInner}>
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
        </View>
      </ScrollView>
    </PageTransition>
  );
}

function AchievementRow({ achievement: a }: { achievement: AchievementDto }) {
  const cfg = DIFFICULTY[a.difficulty] ?? DIFFICULTY.easy;
  const progress = Math.min(a.currentCount / a.targetCount, 1);

  return (
    <View style={[
      styles.row,
      a.unlocked
        ? { borderColor: cfg.ring, shadowColor: cfg.shadowColor, shadowOpacity: 0.18 }
        : styles.rowLocked,
    ]}>
      {/* Badge */}
      <View style={[styles.badgeRing, a.unlocked && { borderColor: cfg.ring }]}>
        {a.unlocked ? (
          <Image
            source={BADGE_IMAGES[a.badge] ?? BADGE_IMAGES["badge"]}
            style={styles.badgeImage}
          />
        ) : (
          <View style={styles.badgeImageWrapper}>
            <Image
              source={BADGE_IMAGES[a.badge] ?? BADGE_IMAGES["badge"]}
              style={[
                styles.badgeImage,
                Platform.select({ web: { filter: "grayscale(100%)" } as any }),
              ]}
            />
            <View style={styles.badgeGreyOverlay} />
            <Text style={styles.lockIcon}>🔒</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.title, !a.unlocked && styles.titleLocked]}>
          {a.title}
        </Text>

        <View style={styles.progressTrack}>
          <View style={[
            styles.progressFill,
            { width: `${progress * 100}%`, backgroundColor: a.unlocked ? cfg.fillColor : "#CCCCCC" },
          ]} />
        </View>

        <View style={styles.meta}>
          <Text style={styles.metaCount}>{a.currentCount}/{a.targetCount}</Text>
          <Text style={[styles.metaCoins, { color: a.unlocked ? cfg.coinsColor : "#BBBBBB" }]}>
            +{a.coinReward} coins
          </Text>
          {a.difficulty === "hard" && <Text style={styles.metaExtra}>🌸</Text>}
          {a.unlocked && (
            <Text style={[styles.doneLabel, { color: cfg.unlockedColor }]}>✓ Done</Text>
          )}
        </View>
      </View>
    </View>
  );
}
