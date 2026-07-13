import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Header } from "@/components/ui/Header";
import { Input } from "@/components/ui/Input";
import { Loader } from "@/components/ui/Loader";
import { useTabBarVisibility } from "@/context/TabBarVisibilityContext";
import { useThemeContext } from "@/context/ThemeContext";
import { useNutritionContext } from "@/context/NutritionContext";
import { useMemo, useState, useEffect } from "react";
import { Image, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { foodService, FoodReference } from "@/services/foods";

export default function FoodsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [foods, setFoods] = useState<FoodReference[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [isLoadingFoods, setIsLoadingFoods] = useState(true);
  const { isDark, colors } = useThemeContext();
  const { handleScroll } = useTabBarVisibility();
  const { mealHistory } = useNutritionContext();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    foodService.getAllFoods().then((data) => {
      setFoods(data);
      setIsLoadingFoods(false);
    });
    foodService.getCategories().then(setCategories);
  }, []);

  const filteredFoods = useMemo(() => {
    let result = foods;

    if (activeCategory !== "All") {
      result = result.filter((food) => food.category === activeCategory);
    }

    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter((food) => food.name.toLowerCase().includes(query));
    }

    return result;
  }, [search, activeCategory, foods]);

  const loggedMeals = useMemo(() => {
    let meals = mealHistory.meals;
    if (activeCategory !== "All") {
      const cat = activeCategory.toLowerCase();
      meals = meals.filter((m) => m.type === cat || (cat === "snacks" && m.type === "snack"));
    }
    return meals;
  }, [mealHistory.meals, activeCategory]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? colors.background.dark : colors.background.light }}
      className="flex-1"
      edges={["top", "left", "right"]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Header title="Food Database" />
      <View className="px-4 mb-4">
        <Input
          value={search}
          onChangeText={setSearch}
          placeholder="Search foods..."
          className="mb-4"
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row"
        >
          <View className="flex-row gap-2">
            {categories.map((category) => {
              const isSelected = activeCategory === category;
              return (
                <TouchableOpacity
                  key={category}
                  onPress={() => setActiveCategory(category)}
                  className="px-4 py-2 rounded-full border"
                  style={{
                    backgroundColor: isSelected ? colors.primary[500] : (isDark ? colors.surface.dark : colors.white),
                    borderColor: isSelected ? colors.primary[500] : (isDark ? colors.border.dark : colors.neutral[200]),
                  }}
                  activeOpacity={0.8}
                  accessibilityLabel={`Filter by ${category}`}
                >
                  <Text
                    style={{
                      color: isSelected ? colors.black : (isDark ? colors.text.secondary : colors.neutral[600]),
                      fontWeight: isSelected ? "700" : "500",
                    }}
                    className="text-xs"
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
        className="flex-1 px-4"
      >
        {loggedMeals.length > 0 && (
          <View className="mb-5">
            <View className="flex-row items-center mb-3" style={{ gap: 6 }}>
              <MaterialCommunityIcons name="history" size={18} color={colors.primary[500]} />
              <Text
                style={{ color: isDark ? colors.text.dark : colors.text.light }}
                className="text-base font-black"
              >
                Logged Meals
              </Text>
            </View>
            <View style={{ gap: 10 }}>
              {loggedMeals.map((meal) => (
                <TouchableOpacity
                  key={meal.id}
                  onPress={() => {
                    router.push({
                      pathname: "/meal/meal-detail",
                      params: { meal: JSON.stringify(meal) },
                    });
                  }}
                  activeOpacity={0.85}
                >
                  <Card variant="outlined" className="py-3 px-4">
                    <View className="flex-row items-center">
                      {meal.imageUrl ? (
                        <Image
                          source={{ uri: meal.imageUrl }}
                          style={{ width: 50, height: 50, borderRadius: 10, marginRight: 12 }}
                        />
                      ) : (
                        <View
                          style={{
                            backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                            width: 50, height: 50, borderRadius: 10, marginRight: 12,
                            alignItems: "center", justifyContent: "center",
                          }}
                        >
                          <MaterialCommunityIcons name="food-apple" size={24} color={colors.primary[500]} />
                        </View>
                      )}
                      <View className="flex-1">
                        <View className="flex-row items-center" style={{ gap: 6 }}>
                          <Badge
                            label={meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}
                            variant="primary"
                            size="sm"
                          />
                          <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[400] }} className="text-[10px] font-semibold">
                            {new Date(meal.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                          </Text>
                        </View>
                        <Text
                          style={{ color: isDark ? colors.text.dark : colors.text.light }}
                          className="text-sm font-bold mt-1"
                          numberOfLines={1}
                        >
                          {meal.foods.map((f) => f.name).join(", ")}
                        </Text>
                        <View className="flex-row items-center mt-1" style={{ gap: 8 }}>
                          <View className="flex-row items-center" style={{ gap: 2 }}>
                            <MaterialCommunityIcons name="fire" size={12} color={colors.primary[500]} />
                            <Text style={{ color: colors.primary[500] }} className="text-xs font-black">{meal.totalCalories} kcal</Text>
                          </View>
                          <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-[10px] font-semibold">{meal.foods.length} items</Text>
                        </View>
                      </View>
                      <MaterialCommunityIcons name="chevron-right" size={20} color={isDark ? colors.text.secondary : colors.neutral[400]} />
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View className="flex-row items-center mb-3" style={{ gap: 6 }}>
          <MaterialCommunityIcons name="book-open-variant" size={18} color={isDark ? colors.text.secondary : colors.neutral[500]} />
          <Text
            style={{ color: isDark ? colors.text.dark : colors.text.light }}
            className="text-base font-black"
          >
            Reference Database
          </Text>
        </View>

        {isLoadingFoods ? (
          <Loader />
        ) : filteredFoods.length === 0 ? (
          <EmptyState
            title="No foods found"
            description="Try a different search term or category"
          />
        ) : (
          <View className="gap-3">
            {filteredFoods.map((food) => (
              <TouchableOpacity key={food.id} activeOpacity={0.85}>
                <Card variant="outlined">
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center flex-1 pr-3">
                      <View
                        style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" }}
                        className="w-11 h-11 rounded-full items-center justify-center mr-3"
                      >
                        <Text className="text-xl">{food.icon}</Text>
                      </View>
                      <View className="flex-1">
                        <Text style={{ color: isDark ? colors.text.dark : colors.text.light }} className="text-base font-bold">
                          {food.name}
                        </Text>
                        <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-xs font-semibold mt-0.5">
                          {food.serving}
                        </Text>
                      </View>
                    </View>
                    <View className="items-end">
                      <View className="flex-row items-baseline gap-0.5">
                        <Text style={{ color: colors.primary[500] }} className="text-base font-extrabold">
                          {food.calories}
                        </Text>
                        <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-[10px] font-bold">
                          kcal
                        </Text>
                      </View>
                      <View className="mt-1">
                        <Badge label={`${food.protein}g protein`} variant="success" size="sm" />
                      </View>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
