import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Header } from "@/components/ui/Header";
import { useThemeContext } from "@/context/ThemeContext";
import { useNutritionContext } from "@/context/NutritionContext";
import { MealType, FoodItem } from "@/types/meal";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const DETECTED_FOODS = [
  {
    name: "Grilled Chicken Breast",
    serving: "150g",
    calories: 247,
    protein: 46,
    carbs: 0,
    fat: 5.4,
    icon: "🍗",
  },
  {
    name: "Steamed Rice",
    serving: "200g",
    calories: 216,
    protein: 4.4,
    carbs: 45,
    fat: 0.4,
    icon: "🍚",
  },
  {
    name: "Mixed Vegetables",
    serving: "100g",
    calories: 65,
    protein: 2.5,
    carbs: 13,
    fat: 0.2,
    icon: "🥗",
  },
];

export default function MealResultScreen() {
  const router = useRouter();
  const { isDark, colors } = useThemeContext();
  const { addMeal } = useNutritionContext();
  const [selectedMealType, setSelectedMealType] = useState<MealType>(MealType.Breakfast);

  const totalCalories = DETECTED_FOODS.reduce((sum, f) => sum + f.calories, 0);
  const totalProtein = DETECTED_FOODS.reduce((sum, f) => sum + f.protein, 0);
  const totalCarbs = DETECTED_FOODS.reduce((sum, f) => sum + f.carbs, 0);
  const totalFat = DETECTED_FOODS.reduce((sum, f) => sum + f.fat, 0);

  const handleLogMeal = () => {
    const foodsToLog: FoodItem[] = DETECTED_FOODS.map((f, i) => ({
      id: `scanned_${Date.now()}_${i}`,
      name: f.name,
      servingSize: f.serving,
      calories: f.calories,
      proteinG: f.protein,
      carbsG: f.carbs,
      fatG: f.fat,
    }));

    addMeal(selectedMealType, foodsToLog);
    router.replace("/(tabs)/home");
  };

  return (
    <SafeAreaView
      style={{ backgroundColor: isDark ? colors.background.dark : colors.background.light }}
      className="flex-1"
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Header title="Scan Results" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} className="flex-1 px-4">
        
        {/* Main Calorie result Card */}
        <Card variant="elevated" className="items-center mb-4 py-6">
          <Badge label="95% AI Confidence" variant="success" size="sm" />
          <View className="flex-row items-baseline mt-4">
            <Text 
              style={{ color: colors.primary[500] }}
              className="text-6xl font-black tracking-tight"
            >
              {totalCalories}
            </Text>
            <Text 
              style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
              className="text-lg font-bold ml-1"
            >
              kcal
            </Text>
          </View>
          <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-xs font-semibold mt-1">
            Total Meal Calories
          </Text>
        </Card>

        {/* Macros card */}
        <View className="flex-row gap-3 mb-4">
          <Card variant="outlined" className="flex-1 items-center py-3">
            <Text style={{ color: "#3B82F6" }} className="text-base font-black">
              {totalProtein}g
            </Text>
            <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-[10px] font-bold uppercase tracking-wider mt-0.5">
              Protein
            </Text>
          </Card>
          
          <Card variant="outlined" className="flex-1 items-center py-3">
            <Text style={{ color: "#F59E0B" }} className="text-base font-black">
              {totalCarbs}g
            </Text>
            <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-[10px] font-bold uppercase tracking-wider mt-0.5">
              Carbs
            </Text>
          </Card>
          
          <Card variant="outlined" className="flex-1 items-center py-3">
            <Text style={{ color: "#10B981" }} className="text-base font-black">
              {totalFat.toFixed(1)}g
            </Text>
            <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-[10px] font-bold uppercase tracking-wider mt-0.5">
              Fat
            </Text>
          </Card>
        </View>

        {/* Food list card */}
        <Card variant="outlined" className="mb-4">
          <Text 
            style={{ color: isDark ? colors.text.dark : colors.text.light }}
            className="text-base font-bold mb-3"
          >
            Detected Foods
          </Text>
          
          <View className="gap-2">
            {DETECTED_FOODS.map((food, index) => {
              const isLast = index === DETECTED_FOODS.length - 1;
              return (
                <View
                  key={index}
                  style={{
                    borderBottomWidth: isLast ? 0 : 1,
                    borderBottomColor: isDark ? colors.border.dark : "rgba(0,0,0,0.05)",
                  }}
                  className="flex-row items-center justify-between py-3"
                >
                  <View className="flex-row items-center flex-1 pr-3">
                    <View 
                      style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" }}
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    >
                      <Text className="text-lg">{food.icon}</Text>
                    </View>
                    <View className="flex-1">
                      <Text 
                        style={{ color: isDark ? colors.text.dark : colors.text.light }}
                        className="text-sm font-bold"
                      >
                        {food.name}
                      </Text>
                      <Text 
                        style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
                        className="text-xs font-semibold mt-0.5"
                      >
                        {food.serving}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ color: colors.primary[500] }} className="text-sm font-black">
                    {food.calories} kcal
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Action card */}
        <Card variant="outlined" className="mb-4">
          <Text 
            style={{ color: isDark ? colors.text.dark : colors.text.light }}
            className="text-base font-bold mb-3"
          >
            Log as Meal
          </Text>
          
          <View className="flex-row gap-2 mb-4 justify-between">
            {Object.values(MealType).map((meal) => {
              const isSelected = selectedMealType === meal;
              return (
                <TouchableOpacity
                  key={meal}
                  onPress={() => setSelectedMealType(meal)}
                  className="px-4 py-2 rounded-full border flex-1 items-center justify-center mr-1"
                  style={{
                    backgroundColor: isSelected 
                      ? colors.primary[500] 
                      : (isDark ? colors.surface.dark : colors.white),
                    borderColor: isSelected 
                      ? colors.primary[500] 
                      : (isDark ? colors.border.dark : colors.neutral[200]),
                  }}
                  activeOpacity={0.8}
                >
                  <Text 
                    style={{ 
                      color: isSelected ? colors.black : (isDark ? colors.text.secondary : colors.neutral[600]),
                      fontWeight: isSelected ? "700" : "500",
                    }}
                    className="text-xs capitalize"
                  >
                    {meal}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Button
            title="Log Meal"
            onPress={handleLogMeal}
            fullWidth
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
