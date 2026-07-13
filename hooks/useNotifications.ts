import { useState, useCallback, useEffect } from "react";
import { notificationService, ScheduledNotification } from "@/services/notifications";

export interface MealTime {
  label: string;
  id: string;
  hour: number;
  minute: number;
}

const FOLLOW_UP_DELAY_SECONDS = 3600;

const FOLLOW_UP_MESSAGES: Record<string, { title: string; body: string }> = {
  Breakfast: {
    title: "Morning Check-in",
    body: "How's your energy after breakfast? Stay hydrated and keep crushing your goals!",
  },
  Lunch: {
    title: "Midday Check-in",
    body: "How are you feeling after lunch? Great choices today! Remember to drink water.",
  },
  Dinner: {
    title: "Evening Check-in",
    body: "Nice dinner choice! Your body is getting great fuel. How do you feel?",
  },
  Snack: {
    title: "Snack Check-in",
    body: "Hope that snack hit the spot! Small choices add up to big results.",
  },
};

function getFollowUpMessage(mealLabel: string): { title: string; body: string } {
  return FOLLOW_UP_MESSAGES[mealLabel] || {
    title: "Meal Follow-up",
    body: "Hope you enjoyed your meal! Keep tracking for the best results.",
  };
}

interface UseNotificationsReturn {
  permissionGranted: boolean;
  scheduledNotifications: ScheduledNotification[];
  init: () => Promise<boolean>;
  requestPermission: () => Promise<boolean>;
  scheduleMealReminder: (hour: number, minute: number) => Promise<void>;
  scheduleAllMealReminders: (mealTimes: MealTime[]) => Promise<void>;
  cancelAllMealReminders: () => Promise<void>;
  scheduleWeightReminder: (hour: number, minute: number, day: string) => Promise<void>;
  cancelWeightReminder: (day: string) => Promise<void>;
  scheduleMealFollowUp: (mealLabel: string) => Promise<void>;
  cancelMealFollowUp: () => Promise<void>;
  cancelNotification: (id: string) => Promise<void>;
  cancelAll: () => Promise<void>;
}

const DAY_MAP: Record<string, number> = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
};

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

  const init = useCallback(async () => {
    const granted = await notificationService.init();
    setPermissionGranted(granted);
    return granted;
  }, []);

  const requestPermission = useCallback(async () => {
    const granted = await notificationService.requestPermission();
    setPermissionGranted(granted);
    return granted;
  }, []);

  const scheduleMealReminder = useCallback(
    async (hour: number, minute: number) => {
      const notification: ScheduledNotification = {
        id: `meal-${hour}-${minute}`,
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
    [],
  );

  const scheduleAllMealReminders = useCallback(
    async (mealTimes: MealTime[]) => {
      for (const mt of mealTimes) {
        const notification: ScheduledNotification = {
          id: `meal-${mt.id}`,
          title: `${mt.label} Reminder`,
          body: `Time for ${mt.label.toLowerCase()}! Don't forget to track your meal.`,
          hour: mt.hour,
          minute: mt.minute,
          days: [1, 2, 3, 4, 5, 6, 7],
          enabled: true,
        };
        await notificationService.scheduleNotification(notification);
      }
      setScheduledNotifications(
        notificationService.getScheduledNotifications()
      );
    },
    [],
  );

  const cancelAllMealReminders = useCallback(async () => {
    const all = notificationService.getScheduledNotifications();
    for (const n of all) {
      if (n.id.startsWith("meal-")) {
        await notificationService.cancelNotification(n.id);
      }
    }
    setScheduledNotifications(
      notificationService.getScheduledNotifications()
    );
  }, []);

  const scheduleWeightReminder = useCallback(
    async (hour: number, minute: number, day: string) => {
      const weekday = DAY_MAP[day] || 1;

      const notification: ScheduledNotification = {
        id: `weight-${day}`,
        title: "Weigh-In Reminder",
        body: "Time to log your weekly weight!",
        hour,
        minute,
        days: [weekday],
        enabled: true,
      };

      await notificationService.scheduleNotification(notification);
      setScheduledNotifications(
        notificationService.getScheduledNotifications()
      );
    },
    [],
  );

  const cancelWeightReminder = useCallback(async (day: string) => {
    await notificationService.cancelNotification(`weight-${day}`);
    setScheduledNotifications(
      notificationService.getScheduledNotifications()
    );
  }, []);

  const scheduleMealFollowUp = useCallback(
    async (mealLabel: string) => {
      const msg = getFollowUpMessage(mealLabel);
      await notificationService.scheduleTimeIntervalNotification(
        "meal-follow-up",
        msg.title,
        msg.body,
        FOLLOW_UP_DELAY_SECONDS,
        { type: "meal_follow_up", mealLabel },
      );
    },
    [],
  );

  const cancelMealFollowUp = useCallback(async () => {
    await notificationService.cancelNotification("meal-follow-up");
  }, []);

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
    init,
    requestPermission,
    scheduleMealReminder,
    scheduleAllMealReminders,
    cancelAllMealReminders,
    scheduleWeightReminder,
    cancelWeightReminder,
    scheduleMealFollowUp,
    cancelMealFollowUp,
    cancelNotification,
    cancelAll,
  };
}
