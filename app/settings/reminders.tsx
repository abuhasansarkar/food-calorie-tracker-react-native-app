import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "@/components/ui/Header";
import { Card } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { useThemeContext } from "@/context/ThemeContext";
import { useRouter } from "expo-router";

const MEAL_TIMES = [
  { label: "Breakfast", time: "08:00" },
  { label: "Lunch", time: "12:00" },
  { label: "Dinner", time: "18:00" },
  { label: "Snack", time: "15:00" },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function RemindersScreen() {
  const router = useRouter();
  const { isDark, colors } = useThemeContext();
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [selectedDay, setSelectedDay] = useState(0);

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
            value={remindersEnabled}
            onValueChange={setRemindersEnabled}
          />

          {remindersEnabled && (
            <View className="mt-4">
              {MEAL_TIMES.map((meal, index) => (
                <TouchableOpacity
                  key={meal.label}
                  className="flex-row items-center justify-between py-3.5"
                  style={{
                    borderBottomWidth: index < MEAL_TIMES.length - 1 ? 1 : 0,
                    borderBottomColor: isDark ? colors.border.dark : colors.border.light,
                  }}
                  activeOpacity={0.7}
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
                </TouchableOpacity>
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
              const isSelected = selectedDay === index;
              return (
                <TouchableOpacity
                  key={day}
                  onPress={() => setSelectedDay(index)}
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
