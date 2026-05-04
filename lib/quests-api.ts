import { BASE_URL, getStoredToken } from "@/lib/api";

export interface TaskDto {
  id: string;
  taskDefinitionId: string;
  title: string;
  type: "daily" | "monthly";
  currentCount: number;
  targetCount: number;
  completed: boolean;
  coinReward: number;
  scoreReward: number;
}

export interface CompletedTaskNotification {
  taskId: string;
  title: string;
  coinReward: number;
  scoreReward: number;
}

export interface TasksProgressResponse {
  dailyTasks: TaskDto[];
  monthlyTasks: TaskDto[];
  newlyCompleted: CompletedTaskNotification[];
}

export interface AchievementDto {
  id: string;
  title: string;
  badge: string;
  currentCount: number;
  targetCount: number;
  unlocked: boolean;
  coinReward: number;
  difficulty: "easy" | "medium" | "hard";
}

async function authHeaders() {
  const token = await getStoredToken();
  return { Authorization: token ?? "", "Content-Type": "application/json" };
}

export async function fetchTodayTasks(): Promise<TaskDto[]> {
  const res = await fetch(`${BASE_URL}/tasks/today`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch today tasks");
  return res.json();
}

export async function fetchMonthTasks(): Promise<TaskDto[]> {
  const res = await fetch(`${BASE_URL}/tasks/month`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch month tasks");
  return res.json();
}

export async function fetchTasksProgress(): Promise<TasksProgressResponse> {
  const res = await fetch(`${BASE_URL}/tasks/progress`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch tasks progress");
  return res.json();
}

export async function fetchAchievements(): Promise<AchievementDto[]> {
  const res = await fetch(`${BASE_URL}/achievements`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch achievements");
  return res.json();
}
