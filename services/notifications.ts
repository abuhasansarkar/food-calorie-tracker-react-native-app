import * as Device from "expo-device";
import { Platform } from "react-native";
type ExpoNotifications = typeof import("expo-notifications");

let NotificationsModule: ExpoNotifications | null = null;
let handlerInitialized = false;
let environmentChecked = false;
let isExpoGo = false;

async function checkEnvironment(): Promise<void> {
  if (environmentChecked) return;
  environmentChecked = true;
  try {
    const { default: Constants } = await import("expo-constants");
    isExpoGo = String(Constants.executionEnvironment) === "storeClient";
  } catch {
    isExpoGo = true;
  }
}

async function getNotifications(): Promise<ExpoNotifications | null> {
  if (NotificationsModule) return NotificationsModule;
  await checkEnvironment();
  if (isExpoGo) {
    return null;
  }
  try {
    NotificationsModule = await import("expo-notifications");
    if (!handlerInitialized) {
      NotificationsModule.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
      handlerInitialized = true;
    }
    return NotificationsModule;
  } catch {
    return null;
  }
}

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
  private notificationListener: { remove: () => void } | null = null;
  private responseListener: { remove: () => void } | null = null;

  async init(): Promise<boolean> {
    const granted = await this.requestPermission();
    if (granted) {
      await this.setupListeners();
    }
    return granted;
  }

  async requestPermission(): Promise<boolean> {
    try {
      const Notifications = await getNotifications();
      if (!Notifications) return false;

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

  async getExpoPushToken(): Promise<string | null> {
    const Notifications = await getNotifications();
    if (!Notifications || !this.permissionGranted) return null;
    try {
      const { default: Constants } = await import("expo-constants");
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) return null;
      const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
      return tokenData.data;
    } catch {
      return null;
    }
  }

  private async setupListeners(): Promise<void> {
    const Notifications = await getNotifications();
    if (!Notifications) return;

    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        if (__DEV__) {
          console.log("[Notifications] Received:", notification.request.content.title);
        }
      },
    );

    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        if (__DEV__) {
          console.log("[Notifications] Response:", response.actionIdentifier, data);
        }
      },
    );
  }

  cleanup(): void {
    if (this.notificationListener) {
      this.notificationListener.remove();
      this.notificationListener = null;
    }
    if (this.responseListener) {
      this.responseListener.remove();
      this.responseListener = null;
    }
  }

  async sendLocalNotification(payload: NotificationPayload): Promise<void> {
    const Notifications = await getNotifications();
    if (!Notifications || !this.permissionGranted) {
      if (!this.permissionGranted) console.warn("Notification permission not granted");
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
    const Notifications = await getNotifications();
    if (!Notifications) return;

    await this.cancelNotification(notification.id);

    this.scheduledNotifications.push(notification);

    for (const day of notification.days) {
      const dayId = `${notification.id}-${day}`;
      await Notifications.scheduleNotificationAsync({
        identifier: dayId,
        content: {
          title: notification.title,
          body: notification.body,
        },
        trigger: {
          type: "weekly",
          weekday: day,
          hour: notification.hour,
          minute: notification.minute,
        } as any,
      });
    }
  }

  async cancelNotification(id: string): Promise<void> {
    const Notifications = await getNotifications();
    if (!Notifications) return;

    this.scheduledNotifications = this.scheduledNotifications.filter(
      (n) => n.id !== id,
    );

    for (let day = 1; day <= 7; day++) {
      await Notifications.cancelScheduledNotificationAsync(`${id}-${day}`);
    }
  }

  async scheduleTimeIntervalNotification(
    id: string,
    title: string,
    body: string,
    seconds: number,
    data?: Record<string, unknown>,
  ): Promise<void> {
    const Notifications = await getNotifications();
    if (!Notifications) return;

    await Notifications.cancelScheduledNotificationAsync(id);

    await Notifications.scheduleNotificationAsync({
      identifier: id,
      content: { title, body, data },
      trigger: { type: "timeInterval", seconds } as any,
    });
  }

  async cancelAllNotifications(): Promise<void> {
    const Notifications = await getNotifications();
    if (!Notifications) return;

    this.scheduledNotifications = [];
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  getScheduledNotifications(): ScheduledNotification[] {
    return this.scheduledNotifications;
  }

  async setBadgeCount(count: number): Promise<void> {
    const Notifications = await getNotifications();
    if (!Notifications) return;
    await Notifications.setBadgeCountAsync(count);
  }
}

export const notificationService = new NotificationService();
