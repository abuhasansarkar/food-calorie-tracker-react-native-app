import { View, Text, ScrollView, StatusBar, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Header } from "@/components/ui/Header";
import { useThemeContext } from "@/context/ThemeContext";
import { Meal, FoodItem } from "@/types/meal";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getFoodIcon } from "@/utils/helpers";

export default function MealDetailScreen() {
  const router = useRouter();
  const { isDark, colors } = useThemeContext();
  const params = useLocalSearchParams<{ meal: string }>();

  const meal: Meal | null = params.meal ? JSON.parse(params.meal) : null;

  if (!meal) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: isDark ? colors.background.dark : colors.background.light }}
        className="flex-1"
      >
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <Header title="Meal Details" onBack={() => router.back()} />
        <View className="flex-1 items-center justify-center">
          <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}>Meal not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const mealTime = new Date(meal.createdAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? colors.background.dark : colors.background.light }}
      className="flex-1"
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Header title="Meal Details" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} className="flex-1 px-4">
        {meal.imageUrl && (
          <View className="mb-4 overflow-hidden rounded-2xl" style={{ height: 220 }}>
            <Image
              source={{ uri: meal.imageUrl }}
              style={{ width: "100%", height: "100%", resizeMode: "cover" }}
            />
          </View>
        )}

        <Card variant="elevated" className="items-center mb-4 py-5">
          <Badge
            label={meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}
            variant="primary"
            size="sm"
          />
          <View className="flex-row items-baseline mt-4">
            <Text style={{ color: colors.primary[500] }} className="text-5xl font-black tracking-tight">
              {meal.totalCalories}
            </Text>
            <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-lg font-bold ml-1">
              kcal
            </Text>
          </View>
          <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-xs font-semibold mt-1">
            Logged at {mealTime}
          </Text>
          {meal.notes && (
            <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-xs font-semibold mt-1 italic">
              {meal.notes}
            </Text>
          )}
        </Card>

        <View className="flex-row gap-3 mb-4">
          <Card variant="outlined" className="flex-1 items-center py-3">
            <Text style={{ color: "#3B82F6" }} className="text-base font-black">{meal.totalProtein}g</Text>
            <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-[10px] font-bold uppercase tracking-wider mt-0.5">Protein</Text>
          </Card>
          <Card variant="outlined" className="flex-1 items-center py-3">
            <Text style={{ color: "#F59E0B" }} className="text-base font-black">{meal.totalCarbs}g</Text>
            <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-[10px] font-bold uppercase tracking-wider mt-0.5">Carbs</Text>
          </Card>
          <Card variant="outlined" className="flex-1 items-center py-3">
            <Text style={{ color: "#10B981" }} className="text-base font-black">{(meal.totalFat ?? 0).toFixed(1)}g</Text>
            <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-[10px] font-bold uppercase tracking-wider mt-0.5">Fat</Text>
          </Card>
        </View>

        <Card variant="outlined" className="mb-4">
          <Text style={{ color: isDark ? colors.text.dark : colors.text.light }} className="text-base font-bold mb-3">
            Foods ({meal.foods.length})
          </Text>
          <View style={{ gap: 8 }}>
            {meal.foods.map((food, index) => (
              <TouchableOpacity
                key={food.id || index}
                onPress={() => {
                  router.push({
                    pathname: "/meal/food-detail",
                    params: {
                      name: food.name,
                      serving: food.servingSize,
                      calories: String(food.calories),
                      protein: String(food.proteinG),
                      carbs: String(food.carbsG),
                      fat: String(food.fatG),
                      fiber: String(food.fiberG ?? 0),
                      sugar: String(food.sugarG ?? 0),
                      confidence: "100",
                      suggestions: "[]",
                    },
                  });
                }}
                activeOpacity={0.7}
                style={{
                  backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1" style={{ gap: 10 }}>
                    <View
                      style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" }}
                      className="w-9 h-9 rounded-full items-center justify-center"
                    >
                      <Text className="text-base">{getFoodIcon(food.name)}</Text>
                    </View>
                    <View className="flex-1">
                      <Text style={{ color: isDark ? colors.text.dark : colors.text.light }} className="text-sm font-bold">
                        {food.name}
                      </Text>
                      <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-[10px] font-semibold mt-0.5">
                        {food.servingSize}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text style={{ color: colors.primary[500] }} className="text-sm font-black">{food.calories} kcal</Text>
                    <View className="flex-row" style={{ gap: 6, marginTop: 2 }}>
                      <Text style={{ color: "#3B82F6" }} className="text-[9px] font-bold">P {food.proteinG}g</Text>
                      <Text style={{ color: "#F59E0B" }} className="text-[9px] font-bold">C {food.carbsG}g</Text>
                      <Text style={{ color: "#10B981" }} className="text-[9px] font-bold">F {food.fatG}g</Text>
                    </View>
                  </View>
                </View>
                <View className="flex-row items-center mt-2" style={{ gap: 3 }}>
                  <MaterialCommunityIcons name="chevron-right" size={14} color={isDark ? colors.text.secondary : colors.neutral[400]} />
                  <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[400] }} className="text-[10px] font-semibold">View Details</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Button
          title="Back to Home"
          variant="outline"
          fullWidth
          onPress={() => router.replace("/(tabs)/home")}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
