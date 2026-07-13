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
      this.permissionGranted = true;
      return true;
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
    console.log("Local notification:", payload.title, payload.body);
  }

  async scheduleNotification(
    notification: ScheduledNotification
  ): Promise<void> {
    this.scheduledNotifications.push(notification);
    console.log(
      `Scheduled notification "${notification.title}" at ${notification.hour}:${notification.minute}`
    );
  }

  async cancelNotification(id: string): Promise<void> {
    this.scheduledNotifications = this.scheduledNotifications.filter(
      (n) => n.id !== id
    );
  }

  async cancelAllNotifications(): Promise<void> {
    this.scheduledNotifications = [];
  }

  getScheduledNotifications(): ScheduledNotification[] {
    return this.scheduledNotifications;
  }

  async getBadgeCount(): Promise<number> {
    return 0;
  }

  async setBadgeCount(count: number): Promise<void> {
    console.log(`Badge count set to ${count}`);
  }
}

export const notificationService = new NotificationService();
