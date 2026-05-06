# Quests Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Quests screen to use a full-screen green gradient with floating white cards, matching the Forest-app reference design while keeping MoneyGarden's palette and typography.

**Architecture:** Replace the current two-tone header+card structure with a full-screen `LinearGradient` wrapping everything. All content (header, tabs, summary card, quest cards) floats on top of the gradient. Only two files change: the styles file (full rewrite) and the screen component (full restructure).

**Tech Stack:** React Native, Expo LinearGradient (already installed), React Query (existing), Nunito fonts (existing).

---

## File Map

| File | Action |
|------|--------|
| `styles/tabs/quests.styles.ts` | Full rewrite — all new style tokens |
| `app/(tabs)/quests.tsx` | Full restructure — new layout tree + sub-components |

---

### Task 1: Rewrite styles

**Files:**
- Modify: `styles/tabs/quests.styles.ts`

- [ ] **Step 1: Replace the entire file with the new styles**

```typescript
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // ── Root ──────────────────────────────────────────────────────────────────
  root: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 48,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  headerSection: {
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  headerLabel: {
    fontFamily: "Nunito_900Black",
    fontSize: 32,
    color: "#FFFFFF",
    textAlign: "center",
  },
  headerSubtitle: {
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    color: "#9FCB98",
    textAlign: "center",
    marginTop: 4,
  },

  // ── Tab toggle ────────────────────────────────────────────────────────────
  tabRow: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.18)",
    borderRadius: 14,
    padding: 4,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 11,
  },
  tabActive: {
    backgroundColor: "#FFFFFF",
  },
  tabText: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 14,
    color: "#FFFFFF",
  },
  tabTextActive: {
    color: "#346739",
  },

  // ── Summary card ──────────────────────────────────────────────────────────
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.35)",
    padding: 18,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  summaryLeft: {
    flex: 1,
    marginRight: 12,
  },
  summaryTitle: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 14,
    color: "#FFFFFF",
    marginBottom: 10,
  },
  progressPill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  progressPillText: {
    fontFamily: "Nunito_900Black",
    fontSize: 16,
    color: "#FFFFFF",
  },
  summaryEmoji: {
    fontSize: 48,
  },

  // ── Quest card ────────────────────────────────────────────────────────────
  taskCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: "#1A3A1A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  taskTitle: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 15,
    color: "#1A2A1A",
    flex: 1,
  },
  completedCheck: {
    fontSize: 18,
    marginLeft: 8,
  },
  progressBarContainer: {
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E8F2E8",
    overflow: "hidden",
    marginTop: 12,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 12,
  },
  progressBarLabel: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    textAlign: "center",
    textAlignVertical: "center",
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 12,
    lineHeight: 24,
  },
  rewardRow: {
    marginTop: 10,
  },
  rewardText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 12,
    color: "#5A8A5A",
  },

  // ── Bonus card ────────────────────────────────────────────────────────────
  bonusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "#52B788",
    alignItems: "center",
  },
  bonusText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    color: "#2D7A56",
    textAlign: "center",
    lineHeight: 20,
  },

  // ── Empty / Loading ───────────────────────────────────────────────────────
  emptyText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 40,
    paddingHorizontal: 32,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add styles/tabs/quests.styles.ts
git commit -m "style: rewrite quests styles for full-gradient redesign"
```

---

### Task 2: Rewrite the screen component

**Files:**
- Modify: `app/(tabs)/quests.tsx`

- [ ] **Step 1: Replace the entire file with the new implementation**

```tsx
import { NavMenu } from "@/components/nav-menu";
import { PageTransition } from "@/components/page-transition";
import { TASKS_MONTH_KEY, TASKS_TODAY_KEY } from "@/hooks/use-quest-progress";
import { getStoredToken } from "@/lib/api";
import { fetchMonthTasks, fetchTodayTasks, TaskDto } from "@/lib/quests-api";
import { styles } from "@/styles/tabs/quests.styles";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function QuestsScreen() {
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<"daily" | "monthly">("daily");

  useEffect(() => {
    getStoredToken().then(setToken);
  }, []);

  const dailyQuery = useQuery({
    queryKey: TASKS_TODAY_KEY,
    queryFn: fetchTodayTasks,
    enabled: !!token,
  });

  const monthlyQuery = useQuery({
    queryKey: TASKS_MONTH_KEY,
    queryFn: fetchMonthTasks,
    enabled: !!token,
  });

  if (token === undefined) return null;
  if (!token) return <Redirect href="/landing" />;

  const tasks = activeTab === "daily" ? dailyQuery.data ?? [] : monthlyQuery.data ?? [];
  const isLoading = activeTab === "daily" ? dailyQuery.isLoading : monthlyQuery.isLoading;
  const completed = tasks.filter((t) => t.completed).length;
  const allDone = tasks.length > 0 && completed === tasks.length;

  const subtitle =
    activeTab === "daily"
      ? "Complete daily quests for a bonus flower 🌸"
      : "Complete monthly quests for bonus coins 🌺";

  return (
    <PageTransition style={styles.root}>
      <NavMenu />
      <LinearGradient
        colors={["#2A4A2E", "#346739", "#79AE6F"]}
        style={[styles.gradient, Platform.OS === "web" && { paddingTop: 56 }]}
      >
        <SafeAreaView edges={["top"]} style={styles.safeArea}>
          <View style={styles.headerSection}>
            <Text style={styles.headerLabel}>Quests</Text>
            <Text style={styles.headerSubtitle}>{subtitle}</Text>
          </View>

          <View style={styles.tabRow}>
            {(["daily", "monthly"] as const).map((tab) => (
              <Pressable
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab === "daily" ? "Daily" : "Monthly"}
                </Text>
              </Pressable>
            ))}
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {isLoading && (
              <ActivityIndicator color="#FFFFFF" style={{ marginTop: 40 }} />
            )}

            {!isLoading && (
              <>
                {tasks.length === 0 && (
                  <Text style={styles.emptyText}>
                    {activeTab === "daily"
                      ? "You don't have any quests assigned for today."
                      : "You don't have any monthly quests assigned."}
                  </Text>
                )}

                {tasks.length > 0 && (
                  <>
                    <SummaryCard completed={completed} total={tasks.length} />
                    {tasks.map((task) => (
                      <QuestCard key={task.id} task={task} />
                    ))}
                    <View style={styles.bonusCard}>
                      <Text style={styles.bonusText}>
                        {allDone
                          ? activeTab === "daily"
                            ? "🌸 You've completed all daily quests! You receive a bonus flower."
                            : "🌺 You've completed all monthly quests! You receive bonus coins + an unlocked flower."
                          : `${completed}/${tasks.length} completed — ${tasks.length - completed} left for the bonus`}
                      </Text>
                    </View>
                  </>
                )}
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </PageTransition>
  );
}

function SummaryCard({ completed, total }: { completed: number; total: number }) {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryLeft}>
        <Text style={styles.summaryTitle}>Complete all quests to unlock rewards.</Text>
        <View style={styles.progressPill}>
          <Text style={styles.progressPillText}>
            {completed}/{total}
          </Text>
        </View>
      </View>
      <Text style={styles.summaryEmoji}>🎁</Text>
    </View>
  );
}

function QuestCard({ task }: { task: TaskDto }) {
  const progress = Math.min(task.currentCount / task.targetCount, 1);
  const labelColor = progress < 0.3 ? "#5A8A5A" : "#FFFFFF";

  return (
    <View style={styles.taskCard}>
      <View style={styles.titleRow}>
        <Text style={styles.taskTitle}>{task.title}</Text>
        {task.completed && <Text style={styles.completedCheck}>✅</Text>}
      </View>

      <View style={styles.progressBarContainer}>
        <LinearGradient
          colors={["#346739", "#52B788"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressBarFill, { width: `${progress * 100}%` }]}
        />
        <Text style={[styles.progressBarLabel, { color: labelColor }]}>
          {task.currentCount}/{task.targetCount}
        </Text>
      </View>

      <View style={styles.rewardRow}>
        <Text style={styles.rewardText}>
          +{task.coinReward} coins · +{task.scoreReward} budget score
        </Text>
      </View>
    </View>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/(tabs)/quests.tsx
git commit -m "feat: redesign Quests screen with full-gradient Forest-app style"
```

---

## Self-Review

**Spec coverage:**
- ✅ Full-screen gradient `#2A4A2E` → `#346739` → `#79AE6F`
- ✅ Daily/Monthly tabs kept, pill style on gradient
- ✅ Header: title + dynamic subtitle
- ✅ SummaryCard with progress pill + 🎁 emoji
- ✅ QuestCard: title row + wide progress bar with count + rewards row
- ✅ BonusCard restyled with new radius/margin
- ✅ Empty state: white text, no card
- ✅ Loading: `ActivityIndicator color="#FFFFFF"`
- ✅ Web padding top 56 preserved
- ✅ Progress label color switches at progress < 0.3

**Placeholder scan:** None found.

**Type consistency:** `TaskDto` from `lib/quests-api.ts` used correctly throughout — `id`, `title`, `currentCount`, `targetCount`, `completed`, `coinReward`, `scoreReward` all referenced.
