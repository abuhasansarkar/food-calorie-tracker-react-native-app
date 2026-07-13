import { useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "@/components/ui/Header";
import { Card } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { useThemeContext } from "@/context/ThemeContext";
import { useSettingsStore } from "@/store/settingsStore";
import { useNotifications, MealTime } from "@/hooks/useNotifications";
import { useRouter } from "expo-router";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const DAY_FULL: Record<string, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};

const FULL_TO_SHORT: Record<string, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

export default function RemindersScreen() {
  const router = useRouter();
  const { isDark, colors } = useThemeContext();
  const { settings, updateSettings } = useSettingsStore();
  const { init, scheduleAllMealReminders, cancelAllMealReminders, scheduleWeightReminder, cancelWeightReminder } = useNotifications();

  const selectedDayIndex = DAYS.indexOf(FULL_TO_SHORT[settings.weightReminderDay] || "Mon");

  useEffect(() => {
    init();
  }, [init]);

  const getMealTimes = useCallback((): MealTime[] => [
    { label: "Breakfast", id: "breakfast", hour: parseInt(settings.breakfastTime.split(":")[0], 10), minute: parseInt(settings.breakfastTime.split(":")[1], 10) },
    { label: "Lunch", id: "lunch", hour: parseInt(settings.lunchTime.split(":")[0], 10), minute: parseInt(settings.lunchTime.split(":")[1], 10) },
    { label: "Dinner", id: "dinner", hour: parseInt(settings.dinnerTime.split(":")[0], 10), minute: parseInt(settings.dinnerTime.split(":")[1], 10) },
    { label: "Snack", id: "snack", hour: parseInt(settings.snackTime.split(":")[0], 10), minute: parseInt(settings.snackTime.split(":")[1], 10) },
  ], [settings.breakfastTime, settings.lunchTime, settings.dinnerTime, settings.snackTime]);

  const handleMealRemindersToggle = useCallback(async (v: boolean) => {
    await updateSettings({ mealReminders: v });
    if (v) {
      await scheduleAllMealReminders(getMealTimes());
    } else {
      await cancelAllMealReminders();
    }
  }, [updateSettings, getMealTimes, scheduleAllMealReminders, cancelAllMealReminders]);

  const handleDaySelect = useCallback(async (index: number) => {
    const fullDay = DAY_FULL[DAYS[index]];
    await updateSettings({ weightReminderDay: fullDay });
    if (settings.weightReminders) {
      await cancelWeightReminder(settings.weightReminderDay);
      await scheduleWeightReminder(9, 0, fullDay);
    }
  }, [settings.weightReminders, settings.weightReminderDay, updateSettings, cancelWeightReminder, scheduleWeightReminder]);

  const mealTimes: { label: string; time: string }[] = [
    { label: "Breakfast", time: settings.breakfastTime },
    { label: "Lunch", time: settings.lunchTime },
    { label: "Dinner", time: settings.dinnerTime },
    { label: "Snack", time: settings.snackTime },
  ];

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? colors.background.dark : colors.background.light }}
      className="flex-1"
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Header title="Meal Reminders" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} className="flex-1 px-4 mt-4">
        <Card variant="outlined" className="mb-4">
          <Toggle
            label="Enable Meal Reminders"
            value={settings.mealReminders}
            onValueChange={handleMealRemindersToggle}
          />

          {settings.mealReminders && (
            <View className="mt-4">
              {mealTimes.map((meal, index) => (
                <View
                  key={meal.label}
                  className="flex-row items-center justify-between py-3.5"
                  style={{
                    borderBottomWidth: index < mealTimes.length - 1 ? 1 : 0,
                    borderBottomColor: isDark ? colors.border.dark : colors.border.light,
                  }}
                >
                  <Text style={{ color: isDark ? colors.text.dark : colors.text.light }} className="text-base font-semibold">
                    {meal.label}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <Text style={{ color: colors.primary[500] }} className="text-base font-bold">
                      {meal.time}
                    </Text>
                    <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[400] }}>›</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </Card>

        <Card variant="outlined">
          <Text 
            style={{ color: isDark ? colors.text.dark : colors.text.light }}
            className="text-base font-bold mb-4"
          >
            Weight Reminder Day
          </Text>
          <View className="flex-row justify-between">
            {DAYS.map((day, index) => {
              const isSelected = selectedDayIndex === index;
              return (
                <TouchableOpacity
                  key={day}
                  onPress={() => handleDaySelect(index)}
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: isSelected
                      ? colors.primary[500]
                      : (isDark ? colors.surface.dark : colors.neutral[100]),
                    borderWidth: isDark ? 1 : 0,
                    borderColor: isDark ? colors.border.dark : "transparent",
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={{
                      color: isSelected
                        ? colors.black
                        : (isDark ? colors.text.secondary : colors.neutral[600]),
                      fontWeight: isSelected ? "700" : "500",
                    }}
                    className="text-xs"
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
