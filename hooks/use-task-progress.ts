import { fetchTasksProgress, CompletedTaskNotification } from "@/lib/tasks-api";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { Alert } from "react-native";

export const TASKS_TODAY_KEY = ["tasks", "today"];
export const TASKS_MONTH_KEY = ["tasks", "month"];

export function useTaskProgress() {
  const queryClient = useQueryClient();

  const checkProgress = useCallback(async () => {
    try {
      const progress = await fetchTasksProgress();

      if (progress.newlyCompleted.length > 0) {
        showCompletionToast(progress.newlyCompleted);
      }

      queryClient.invalidateQueries({ queryKey: TASKS_TODAY_KEY });
      queryClient.invalidateQueries({ queryKey: TASKS_MONTH_KEY });
    } catch {
      // ignorăm erorile de progress — nu blochează acțiunea principală
    }
  }, [queryClient]);

  return { checkProgress };
}

function showCompletionToast(completed: CompletedTaskNotification[]) {
  const titles = completed.map((t) => t.title).join(", ");
  const totalCoins = completed.reduce((sum, t) => sum + t.coinReward, 0);
  Alert.alert(
    "Task completat! 🎉",
    `${titles}\n+${totalCoins} coins`,
    [{ text: "OK" }]
  );
}
