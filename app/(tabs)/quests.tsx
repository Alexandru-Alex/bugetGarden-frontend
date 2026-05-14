import { NavMenu } from "@/components/nav-menu";
import { PageTransition } from "@/components/page-transition";
import { TASKS_MONTH_KEY, TASKS_TODAY_KEY } from "@/hooks/use-quest-progress";
import { getStoredToken } from "@/lib/api";
import { ACCOUNT_QUERY_KEY } from "@/lib/query-keys";
import { claimTaskReward, fetchMonthTasks, fetchTodayTasks, TaskDto } from "@/lib/quests-api";
import { styles } from "@/styles/tabs/quests.styles";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TAB_PERIOD = { daily: "DAILY", monthly: "MONTHLY" } as const;

export default function QuestsScreen() {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<"daily" | "monthly">("daily");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getStoredToken().then(setToken);
  }, []);

  useEffect(() => {
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current); };
  }, []);

  const showToast = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMsg(msg);
    toastTimer.current = setTimeout(() => setToastMsg(null), 3000);
  }, []);

  const rewardMutation = useMutation({
    mutationFn: () => claimTaskReward(TAB_PERIOD[activeTab]),
    onSuccess: (data) => {
      showToast(`Congratulations! You received ${data.coins} coins 🎉`);
      queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEY });
    },
  });

  const handleTabChange = useCallback((tab: "daily" | "monthly") => {
    setActiveTab(tab);
    rewardMutation.reset();
  }, [rewardMutation]);

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
        {toastMsg && (
          <View style={styles.toast} pointerEvents="none">
            <Text style={styles.toastText}>{toastMsg}</Text>
          </View>
        )}
        <SafeAreaView edges={["top"]} style={styles.safeArea}>
          <View style={[styles.inner, Platform.OS === "web" && styles.innerWeb]}>
          <View style={styles.headerSection}>
            <Text style={styles.headerLabel}>Quests</Text>
            <Text style={styles.headerSubtitle}>{subtitle}</Text>
          </View>

          <View style={styles.tabRow}>
            {(["daily", "monthly"] as const).map((tab) => (
              <Pressable
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => handleTabChange(tab)}
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
              <ActivityIndicator color="#FFFFFF" style={styles.loader} />
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
                  <View style={styles.questsContainer}>
                    <SummaryCard
                      completed={completed}
                      total={tasks.length}
                      rewardClaimed={rewardMutation.isSuccess}
                      onChestPress={() => rewardMutation.mutate()}
                    />
                    {tasks.map((task) => (
                      <QuestCard key={task.id} task={task} />
                    ))}
                    {allDone && (
                      <View style={styles.bonusCard}>
                        <Text style={styles.bonusTextWhite}>
                          {activeTab === "daily"
                            ? "🌸 You've completed all daily quests! You receive a bonus flower."
                            : "🌺 You've completed all monthly quests! You receive bonus coins + an unlocked flower."}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </>
            )}
          </ScrollView>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </PageTransition>
  );
}

const chestImages = [
  require("@/assets/images/chest_quests_1.png"),
  require("@/assets/images/chest_quests_2.png"),
  require("@/assets/images/chest_quests_3.png"),
];

function SummaryCard({
  completed,
  total,
  rewardClaimed,
  onChestPress,
}: {
  completed: number;
  total: number;
  rewardClaimed: boolean;
  onChestPress: () => void;
}) {
  const chestIndex = Math.min(Math.max(completed, 1), 3);
  const isPressable = completed >= 3 && !rewardClaimed;

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
      <Pressable
        disabled={!isPressable}
        onPress={onChestPress}
        style={({ pressed }) => ({ opacity: isPressable && pressed ? 0.75 : rewardClaimed ? 0.5 : 1 })}
      >
        <Image
          source={chestImages[chestIndex - 1]}
          style={styles.chestImage}
          resizeMode="contain"
        />
      </Pressable>
    </View>
  );
}

function QuestCard({ task }: { task: TaskDto }) {
  const progress = task.targetCount > 0 ? Math.min(task.currentCount / task.targetCount, 1) : 0;
  const labelColor = progress < 0.5 ? "#5A8A5A" : "#FFFFFF";

  return (
    <View style={styles.taskCard}>
      <View style={styles.titleRow}>
        <Text style={styles.taskTitle}>{task.title}</Text>
        {task.completed && <Text style={styles.completedCheck}>✓</Text>}
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
