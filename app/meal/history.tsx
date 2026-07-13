import { View, Text, ScrollView, TouchableOpacity, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Header } from "@/components/ui/Header";
import { useThemeContext } from "@/context/ThemeContext";
import { useNutritionContext } from "@/context/NutritionContext";
import { useMemo } from "react";

export default function MealHistoryScreen() {
  const router = useRouter();
  const { isDark, colors } = useThemeContext();
  const { currentMeals, mealHistory } = useNutritionContext();

  const historyDays = useMemo(() => {
    const days: { date: string; meals: typeof mealHistory.meals }[] = [];

    if (currentMeals?.meals.length) {
      days.push({ date: "Today", meals: currentMeals.meals });
    }

    if (mealHistory.meals.length) {
      const grouped = new Map<string, typeof mealHistory.meals>();
      for (const meal of mealHistory.meals) {
        const key = meal.date;
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)!.push(meal);
      }

      for (const [date, meals] of grouped) {
        if (date === currentMeals?.date) continue;
        days.push({ date, meals });
      }
    }

    return days;
  }, [currentMeals, mealHistory.meals]);

  if (historyDays.length === 0) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: isDark ? colors.background.dark : colors.background.light }}
        className="flex-1"
      >
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <Header title="Meal History" onBack={() => router.back()} />
        <EmptyState title="No meals logged yet" description="Start by scanning your first meal" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? colors.background.dark : colors.background.light }}
      className="flex-1"
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Header
        title="Meal History"
        subtitle={`${historyDays.length} days tracked`}
        onBack={() => router.back()}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} className="flex-1 px-4 mt-2">
        {historyDays.map((day, dayIndex) => (
          <View key={dayIndex} className="mb-6">
            <Text style={{ color: isDark ? colors.text.dark : colors.text.light }} className="text-base font-bold mb-3">
              {day.date}
            </Text>
            <View className="gap-3">
              {day.meals.map((meal, mealIndex) => (
                <TouchableOpacity key={meal.id || mealIndex} activeOpacity={0.85}>
                  <Card variant="outlined">
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2.5 mb-1.5">
                          <Badge label={meal.type} variant="primary" size="sm" />
                          <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[400] }} className="text-xs font-semibold">
                            {new Date(meal.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                          </Text>
                        </View>
                        <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[600] }} className="text-sm font-semibold">
                          {meal.foods.map((f) => f.name).join(", ")}
                        </Text>
                      </View>
                      <View className="items-end">
                        <View className="flex-row items-baseline gap-0.5">
                          <Text style={{ color: colors.primary[500] }} className="text-base font-extrabold">
                            {meal.totalCalories}
                          </Text>
                          <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-[10px] font-bold">
                            kcal
                          </Text>
                        </View>
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
