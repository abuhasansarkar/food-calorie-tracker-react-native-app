import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Header } from "@/components/ui/Header";
import { Input } from "@/components/ui/Input";
import { useTabBarVisibility } from "@/context/TabBarVisibilityContext";
import { useThemeContext } from "@/context/ThemeContext";
import { useMemo, useState } from "react";
import { ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

interface FoodEntry {
  name: string;
  serving: string;
  calories: number;
  protein: number;
  icon: string;
  category: string;
}

const FOOD_DATABASE: FoodEntry[] = [
  { name: "Chicken Breast", serving: "150g", calories: 247, protein: 46, icon: "🍗", category: "Lunch" },
  { name: "Brown Rice", serving: "200g", calories: 216, protein: 5, icon: "🍚", category: "Lunch" },
  { name: "Avocado", serving: "100g", calories: 160, protein: 2, icon: "🥑", category: "Breakfast" },
  { name: "Greek Yogurt", serving: "200g", calories: 146, protein: 20, icon: "🥛", category: "Breakfast" },
  { name: "Banana", serving: "120g", calories: 107, protein: 1.3, icon: "🍌", category: "Snacks" },
  { name: "Oatmeal with Honey", serving: "100g", calories: 340, protein: 11, icon: "🥣", category: "Breakfast" },
  { name: "Peanut Butter", serving: "32g", calories: 188, protein: 8, icon: "🥜", category: "Snacks" },
  { name: "Salmon", serving: "150g", calories: 280, protein: 25, icon: "🐟", category: "Dinner" },
];

const CATEGORIES = ["All", "Breakfast", "Lunch", "Dinner", "Snacks"];

export default function FoodsScreen() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const { isDark, colors } = useThemeContext();
  const { handleScroll } = useTabBarVisibility();
  const insets = useSafeAreaInsets();

  const filteredFoods = useMemo(() => {
    let result = FOOD_DATABASE;

    if (activeCategory !== "All") {
      result = result.filter((food) => food.category === activeCategory);
    }

    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter((food) => food.name.toLowerCase().includes(query));
    }

    return result;
  }, [search, activeCategory]);

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
            {CATEGORIES.map((category) => {
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
        {filteredFoods.length === 0 ? (
          <EmptyState
            title="No foods found"
            description="Try a different search term or category"
          />
        ) : (
          <View className="gap-3">
            {filteredFoods.map((food, index) => (
              <TouchableOpacity key={`${food.name}-${index}`} activeOpacity={0.85}>
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
