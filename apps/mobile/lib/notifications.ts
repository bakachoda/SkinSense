import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const perm: any = await Notifications.getPermissionsAsync();
    let isGranted = perm?.granted ?? perm?.status === "granted";
    if (!isGranted) {
      const req: any = await Notifications.requestPermissionsAsync();
      isGranted = req?.granted ?? req?.status === "granted";
    }
    return Boolean(isGranted);
  } catch (e) {
    console.warn("Notification permission request failed:", e);
    return false;
  }
}

export async function scheduleRoutineReminders({
  amEnabled = true,
  pmEnabled = true,
  scanEnabled = true,
}: {
  amEnabled?: boolean;
  pmEnabled?: boolean;
  scanEnabled?: boolean;
}) {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (amEnabled) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "☀️ Morning Skincare Routine",
          body: "Time for your morning routine! Cleanse, apply your serum, and protect with SPF.",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 7,
          minute: 0,
        },
      });
    }

    if (pmEnabled) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🌙 Evening Skincare Routine",
          body: "Wash off the day and apply your nighttime repair treatments before bed.",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 21,
          minute: 0,
        },
      });
    }

    if (scanEnabled) {
      // 14 days in seconds: 14 * 24 * 3600 = 1209600
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "📸 Time for your Bi-weekly Progress Scan!",
          body: "See how your skin barrier and concerns have evolved over the last 14 days.",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 14 * 24 * 3600,
          repeats: true,
        },
      });
    }
  } catch (e) {
    console.warn("Failed to schedule local notifications:", e);
  }
}
