import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  hour: number;
  minute: number;
  days: number[];
  enabled: boolean;
}

class NotificationService {
  private scheduledNotifications: ScheduledNotification[] = [];
  private permissionGranted = false;

  async requestPermission(): Promise<boolean> {
    try {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
        });
      }

      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        this.permissionGranted = finalStatus === "granted";
      } else {
        this.permissionGranted = true;
      }

      return this.permissionGranted;
    } catch {
      this.permissionGranted = false;
      return false;
    }
  }

  async sendLocalNotification(payload: NotificationPayload): Promise<void> {
    if (!this.permissionGranted) {
      console.warn("Notification permission not granted");
      return;
    }
    await Notifications.scheduleNotificationAsync({
      content: {
        title: payload.title,
        body: payload.body,
        data: payload.data,
      },
      trigger: null,
    });
  }

  async scheduleNotification(notification: ScheduledNotification): Promise<void> {
    this.scheduledNotifications.push(notification);

    await Notifications.cancelScheduledNotificationAsync(notification.id);

    const trigger: Notifications.WeeklyTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: notification.days[0],
      hour: notification.hour,
      minute: notification.minute,
    };

    await Notifications.scheduleNotificationAsync({
      identifier: notification.id,
      content: {
        title: notification.title,
        body: notification.body,
      },
      trigger,
    });
  }

  async cancelNotification(id: string): Promise<void> {
    this.scheduledNotifications = this.scheduledNotifications.filter(
      (n) => n.id !== id,
    );
    await Notifications.cancelScheduledNotificationAsync(id);
  }

  async cancelAllNotifications(): Promise<void> {
    this.scheduledNotifications = [];
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  getScheduledNotifications(): ScheduledNotification[] {
    return this.scheduledNotifications;
  }

  async getBadgeCount(): Promise<number> {
    return 0;
  }

  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }
}

export const notificationService = new NotificationService();
