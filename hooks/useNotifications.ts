import { useState, useCallback, useEffect } from "react";
import { notificationService, ScheduledNotification } from "@/services/notifications";

interface UseNotificationsReturn {
  permissionGranted: boolean;
  scheduledNotifications: ScheduledNotification[];
  requestPermission: () => Promise<boolean>;
  scheduleMealReminder: (hour: number, minute: number) => Promise<void>;
  scheduleWeightReminder: (hour: number, minute: number, day: string) => Promise<void>;
  cancelNotification: (id: string) => Promise<void>;
  cancelAll: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [scheduledNotifications, setScheduledNotifications] = useState<
    ScheduledNotification[]
  >([]);

  useEffect(() => {
    setScheduledNotifications(
      notificationService.getScheduledNotifications()
    );
  }, []);

  const requestPermission = useCallback(async () => {
    const granted = await notificationService.requestPermission();
    setPermissionGranted(granted);
    return granted;
  }, []);

  const scheduleMealReminder = useCallback(
    async (hour: number, minute: number) => {
      const notification: ScheduledNotification = {
        id: `meal-reminder-${hour}-${minute}`,
        title: "Time to Log Your Meal!",
        body: "Don't forget to track what you ate today.",
        hour,
        minute,
        days: [1, 2, 3, 4, 5, 6, 7],
        enabled: true,
      };

      await notificationService.scheduleNotification(notification);
      setScheduledNotifications(
        notificationService.getScheduledNotifications()
      );
    },
    []
  );

  const scheduleWeightReminder = useCallback(
    async (hour: number, minute: number, day: string) => {
      const dayMap: Record<string, number> = {
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
        Sunday: 0,
      };

      const notification: ScheduledNotification = {
        id: `weight-reminder-${day}`,
        title: "Weigh-In Reminder",
        body: "Time to log your weekly weight!",
        hour,
        minute,
        days: [dayMap[day] || 1],
        enabled: true,
      };

      await notificationService.scheduleNotification(notification);
      setScheduledNotifications(
        notificationService.getScheduledNotifications()
      );
    },
    []
  );

  const cancelNotification = useCallback(async (id: string) => {
    await notificationService.cancelNotification(id);
    setScheduledNotifications(
      notificationService.getScheduledNotifications()
    );
  }, []);

  const cancelAll = useCallback(async () => {
    await notificationService.cancelAllNotifications();
    setScheduledNotifications([]);
  }, []);

  return {
    permissionGranted,
    scheduledNotifications,
    requestPermission,
    scheduleMealReminder,
    scheduleWeightReminder,
    cancelNotification,
    cancelAll,
  };
}
