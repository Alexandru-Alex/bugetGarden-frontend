import { ACCOUNT_QUERY_KEY } from "@/lib/query-keys";
import { fetchTasksProgress, CompletedTaskNotification } from "@/lib/quests-api";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export const TASKS_TODAY_KEY = ["tasks", "today"];
export const TASKS_MONTH_KEY = ["tasks", "month"];

export function useQuestProgress() {
  const queryClient = useQueryClient();

  const checkProgress = useCallback(async (): Promise<CompletedTaskNotification[]> => {
    try {
      const progress = await fetchTasksProgress();
      queryClient.invalidateQueries({ queryKey: TASKS_TODAY_KEY });
      queryClient.invalidateQueries({ queryKey: TASKS_MONTH_KEY });
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
      queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEY });
      return progress.newlyCompleted;
    } catch {
      return [];
    }
  }, [queryClient]);

  return { checkProgress };
}
