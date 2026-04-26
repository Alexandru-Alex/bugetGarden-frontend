import { NavMenu } from "@/components/nav-menu";
import { PageTransition } from "@/components/page-transition";
import { TASKS_MONTH_KEY, TASKS_TODAY_KEY } from "@/hooks/use-task-progress";
import { getStoredToken } from "@/lib/api";
import { fetchMonthTasks, fetchTodayTasks, TaskDto } from "@/lib/tasks-api";
import { styles } from "@/styles/tabs/tasks.styles";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TasksScreen() {
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<"daily" | "monthly">("daily");

  useEffect(() => { getStoredToken().then(setToken); }, []);

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

  return (
    <PageTransition style={styles.root}>
      <NavMenu />
      <LinearGradient
        colors={["#2A4A2E", "#346739"]}
        style={[styles.header, Platform.OS === "web" && { paddingTop: 56 }]}
      >
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerSection}>
            <Text style={styles.headerLabel}>Tasks</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
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

          {isLoading && <ActivityIndicator color="#346739" style={{ marginTop: 24 }} />}

          {!isLoading && (
            <>
              {tasks.length === 0 && (
                <Text style={styles.emptyText}>
                  {activeTab === "daily"
                    ? "You don’t have any tasks assigned for today."
                    : "You don’t have any monthly tasks assigned."}
                </Text>
              )}

              {tasks.map((task) => <TaskCard key={task.id} task={task} />)}

              {tasks.length > 0 && (
                <View style={styles.bonusCard}>
                  <Text style={styles.bonusText}>
                    {allDone
                      ? activeTab === "daily"
                        ? "🌸 You’ve completed all daily tasks! You receive a bonus flower."
                        : "🌺 You’ve completed all monthly tasks! You receive bonus coins + an unlocked flower."
                      : `${completed}/${tasks.length} completed — you still have ${tasks.length - completed} left for the bonus`}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </PageTransition>
  );
}

function TaskCard({ task }: { task: TaskDto }) {
  const progress = Math.min(task.currentCount / task.targetCount, 1);

  return (
    <View style={styles.taskCard}>
      <Text style={styles.taskTitle}>{task.title}</Text>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            task.completed && styles.progressFillComplete,
            { width: `${progress * 100}%` },
          ]}
        />
      </View>
      <View style={styles.rewardRow}>
        <Text style={styles.rewardText}>{task.currentCount}/{task.targetCount}</Text>
        <Text style={styles.rewardText}>+{task.coinReward} coins</Text>
        <Text style={styles.rewardText}>+{task.scoreReward} budget score</Text>
        {task.completed && <Text style={styles.rewardText}>✅</Text>}
      </View>
    </View>
  );
}
