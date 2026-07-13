import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from "react-native";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Header } from "@/components/ui/Header";
import { useThemeContext } from "@/context/ThemeContext";

const RECENT_FOODS = [
  { name: "Chicken Breast", serving: "150g", calories: 247, protein: 46, icon: "🍗" },
  { name: "Brown Rice", serving: "200g", calories: 216, protein: 5, icon: "🍚" },
  { name: "Avocado", serving: "100g", calories: 160, protein: 2, icon: "🥑" },
  { name: "Greek Yogurt", serving: "200g", calories: 146, protein: 20, icon: "🥛" },
  { name: "Banana", serving: "120g", calories: 107, protein: 1.3, icon: "🍌" },
  { name: "Oatmeal with Honey", serving: "100g", calories: 340, protein: 11, icon: "🥣" },
  { name: "Peanut Butter", serving: "32g", calories: 188, protein: 8, icon: "🥜" },
];

export default function FoodsScreen() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const { isDark, colors } = useThemeContext();

  const filteredFoods = RECENT_FOODS.filter((food) =>
    food.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView
      style={{ backgroundColor: isDark ? colors.background.dark : colors.background.light }}
      className="flex-1"
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

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 mb-2">
          {["All", "Breakfast", "Lunch", "Dinner", "Snacks"].map((category) => {
            const isSelected = activeCategory === category;
            return (
              <TouchableOpacity
                key={category}
                onPress={() => setActiveCategory(category)}
                className="px-4 py-2 rounded-full border mr-2"
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
                    color: isSelected 
                      ? colors.black 
                      : (isDark ? colors.text.secondary : colors.neutral[600]),
                    fontWeight: isSelected ? "700" : "500",
                  }}
                  className="text-xs"
                >
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} className="flex-1 px-4">
        {search && filteredFoods.length === 0 ? (
          <EmptyState
            title="No foods found"
            description="Try a different search term"
          />
        ) : (
          <View className="gap-3">
            {(search ? filteredFoods : RECENT_FOODS).map((food, index) => (
              <TouchableOpacity key={index} activeOpacity={0.85}>
                <Card variant="outlined">
                  <View className="flex-row justify-between items-center">
                    {/* Left side: Icon placeholder and name */}
                    <View className="flex-row items-center flex-1 pr-3">
                      <View 
                        style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" }}
                        className="w-11 h-11 rounded-full items-center justify-center mr-3"
                      >
                        <Text className="text-xl">{food.icon}</Text>
                      </View>
                      <View className="flex-1">
                        <Text 
                          style={{ color: isDark ? colors.text.dark : colors.text.light }}
                          className="text-base font-bold"
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

                    {/* Right side: calories and protein */}
                    <View className="items-end">
                      <View className="flex-row items-baseline gap-0.5">
                        <Text 
                          style={{ color: colors.primary[500] }}
                          className="text-base font-extrabold"
                        >
                          {food.calories}
                        </Text>
                        <Text 
                          style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
                          className="text-[10px] font-bold"
                        >
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
