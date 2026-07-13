import { useEffect, useCallback } from "react";
import { ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "@/components/ui/Header";
import { Toggle } from "@/components/ui/Toggle";
import { Card } from "@/components/ui/Card";
import { useThemeContext } from "@/context/ThemeContext";
import { useSettingsStore } from "@/store/settingsStore";
import { useNotifications, MealTime } from "@/hooks/useNotifications";
import { useRouter } from "expo-router";

export default function NotificationsScreen() {
  const router = useRouter();
  const { isDark, colors } = useThemeContext();
  const { settings, updateSettings } = useSettingsStore();
  const { init, scheduleAllMealReminders, cancelAllMealReminders, scheduleWeightReminder, cancelWeightReminder, cancelMealFollowUp } = useNotifications();

  useEffect(() => {
    init();
  }, [init]);

  const getMealTimes = useCallback((): MealTime[] => [
    { label: "Breakfast", id: "breakfast", hour: parseInt(settings.breakfastTime.split(":")[0], 10), minute: parseInt(settings.breakfastTime.split(":")[1], 10) },
    { label: "Lunch", id: "lunch", hour: parseInt(settings.lunchTime.split(":")[0], 10), minute: parseInt(settings.lunchTime.split(":")[1], 10) },
    { label: "Dinner", id: "dinner", hour: parseInt(settings.dinnerTime.split(":")[0], 10), minute: parseInt(settings.dinnerTime.split(":")[1], 10) },
    { label: "Snack", id: "snack", hour: parseInt(settings.snackTime.split(":")[0], 10), minute: parseInt(settings.snackTime.split(":")[1], 10) },
  ], [settings.breakfastTime, settings.lunchTime, settings.dinnerTime, settings.snackTime]);

  const handleMealRemindersChange = useCallback(async (v: boolean) => {
    await updateSettings({ mealReminders: v });
    if (v) {
      await scheduleAllMealReminders(getMealTimes());
    } else {
      await cancelAllMealReminders();
    }
  }, [updateSettings, getMealTimes, scheduleAllMealReminders, cancelAllMealReminders]);

  const handleAIFollowUpChange = useCallback(async (v: boolean) => {
    await updateSettings({ aiMealFollowUp: v });
    if (!v) {
      await cancelMealFollowUp();
    }
  }, [updateSettings, cancelMealFollowUp]);

  const handleWeightRemindersChange = useCallback(async (v: boolean) => {
    await updateSettings({ weightReminders: v });
    if (v) {
      await scheduleWeightReminder(9, 0, settings.weightReminderDay);
    } else {
      await cancelWeightReminder(settings.weightReminderDay);
    }
  }, [updateSettings, settings.weightReminderDay, scheduleWeightReminder, cancelWeightReminder]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? colors.background.dark : colors.background.light }}
      className="flex-1"
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Header title="Notifications" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={{ paddingBottom: 24, paddingHorizontal: 16 }} className="flex-1 mt-4">
        <Card variant="outlined">
          <Toggle
            label="Meal Reminders"
            description="Get reminded to log your meals"
            value={settings.mealReminders}
            onValueChange={handleMealRemindersChange}
          />
          <Toggle
            label="AI Meal Follow-up"
            description="Get AI-powered tips 1 hour after logging a meal"
            value={settings.aiMealFollowUp}
            onValueChange={handleAIFollowUpChange}
          />
          <Toggle
            label="Weight Reminders"
            description="Weekly weigh-in reminders"
            value={settings.weightReminders}
            onValueChange={handleWeightRemindersChange}
          />
          <Toggle
            label="Streak Alerts"
            description="Notifications about your tracking streaks"
            value={settings.streakAlerts}
            onValueChange={(v) =>
              updateSettings({ streakAlerts: v })
            }
          />
          <Toggle
            label="Tips & Tricks"
            description="Nutritional tips and advice"
            value={settings.tipsAndTricks}
            onValueChange={(v) =>
              updateSettings({ tipsAndTricks: v })
            }
          />
          <Toggle
            label="Promotions"
            description="Special offers and promotions"
            value={settings.promotions}
            onValueChange={(v) =>
              updateSettings({ promotions: v })
            }
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
