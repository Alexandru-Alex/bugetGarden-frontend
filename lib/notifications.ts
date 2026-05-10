import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const HOUR_KEY = "notif_hour";
const ENABLED_KEY = "notif_enabled";
const DEFAULT_HOUR = 20;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function getSavedHour(): Promise<number> {
  if (Platform.OS === "web") return DEFAULT_HOUR;
  const stored = await SecureStore.getItemAsync(HOUR_KEY);
  return stored !== null ? parseInt(stored, 10) : DEFAULT_HOUR;
}

export async function saveHour(hour: number): Promise<void> {
  if (Platform.OS === "web") return;
  await SecureStore.setItemAsync(HOUR_KEY, String(hour));
}

export async function requestPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function scheduleDaily(hour: number): Promise<void> {
  if (Platform.OS === "web") return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Money Garden 🌱",
      body: "Don't forget to log your expenses and income today!",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute: 0,
    },
  });
}

export async function cancelAll(): Promise<void> {
  if (Platform.OS === "web") return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function setEnabledFlag(value: boolean): Promise<void> {
  if (Platform.OS === "web") return;
  await SecureStore.setItemAsync(ENABLED_KEY, value ? "1" : "0");
}

export async function ensureScheduled(): Promise<void> {
  if (Platform.OS === "web") return;
  const enabled = await SecureStore.getItemAsync(ENABLED_KEY);
  if (enabled !== "1") return;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  if (scheduled.length === 0) {
    const hour = await getSavedHour();
    await scheduleDaily(hour);
  }
}
