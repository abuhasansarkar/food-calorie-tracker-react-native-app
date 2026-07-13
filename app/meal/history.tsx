import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Header } from "@/components/ui/Header";
import { useThemeContext } from "@/context/ThemeContext";

const MEAL_HISTORY = [
  {
    date: "Today",
    meals: [
      {
        type: "Breakfast",
        foods: ["Oatmeal", "Banana", "Coffee"],
        calories: 320,
        time: "8:30 AM",
      },
      {
        type: "Lunch",
        foods: ["Grilled Chicken", "Rice", "Salad"],
        calories: 520,
        time: "12:30 PM",
      },
    ],
  },
  {
    date: "Yesterday",
    meals: [
      {
        type: "Breakfast",
        foods: ["Eggs", "Toast", "Orange Juice"],
        calories: 380,
        time: "7:45 AM",
      },
      {
        type: "Lunch",
        foods: ["Turkey Sandwich", "Chips"],
        calories: 450,
        time: "1:00 PM",
      },
      {
        type: "Dinner",
        foods: ["Pasta", "Meatballs", "Salad"],
        calories: 680,
        time: "7:00 PM",
      },
    ],
  },
];

export default function MealHistoryScreen() {
  const router = useRouter();
  const { isDark, colors } = useThemeContext();

  if (MEAL_HISTORY.length === 0) {
    return (
      <SafeAreaView
        style={{ backgroundColor: isDark ? colors.background.dark : colors.background.light }}
        className="flex-1"
      >
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <Header title="Meal History" onBack={() => router.back()} />
        <EmptyState
          title="No meals logged yet"
          description="Start by scanning your first meal"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ backgroundColor: isDark ? colors.background.dark : colors.background.light }}
      className="flex-1"
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Header
        title="Meal History"
        subtitle={`${MEAL_HISTORY.length} days tracked`}
        onBack={() => router.back()}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} className="flex-1 px-4 mt-2">
        {MEAL_HISTORY.map((day, dayIndex) => (
          <View key={dayIndex} className="mb-6">
            <Text 
              style={{ color: isDark ? colors.text.dark : colors.text.light }}
              className="text-base font-bold mb-3"
            >
              {day.date}
            </Text>

            <View className="gap-3">
              {day.meals.map((meal, mealIndex) => (
                <TouchableOpacity key={mealIndex} activeOpacity={0.85}>
                  <Card variant="outlined">
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2.5 mb-1.5">
                          <Badge
                            label={meal.type}
                            variant="primary"
                            size="sm"
                          />
                          <Text 
                            style={{ color: isDark ? colors.text.secondary : colors.neutral[400] }}
                            className="text-xs font-semibold"
                          >
                            {meal.time}
                          </Text>
                        </View>
                        
                        <Text 
                          style={{ color: isDark ? colors.text.secondary : colors.neutral[600] }}
                          className="text-sm font-semibold"
                        >
                          {meal.foods.join(", ")}
                        </Text>
                      </View>
                      
                      <View className="items-end">
                        <View className="flex-row items-baseline gap-0.5">
                          <Text style={{ color: colors.primary[500] }} className="text-base font-extrabold">
                            {meal.calories}
                          </Text>
                          <Text 
                            style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
                            className="text-[10px] font-bold"
                          >
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
