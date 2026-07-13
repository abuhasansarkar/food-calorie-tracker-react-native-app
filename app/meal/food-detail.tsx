import { View, Text, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { useThemeContext } from "@/context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface Suggestion {
  name: string;
  reason: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export default function FoodDetailScreen() {
  const router = useRouter();
  const { isDark, colors } = useThemeContext();
  const params = useLocalSearchParams<{
    name: string;
    serving: string;
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
    fiber: string;
    sugar: string;
    confidence: string;
    suggestions: string;
  }>();

  const suggestions: Suggestion[] = params.suggestions
    ? JSON.parse(params.suggestions)
    : [];

  const macroItems = [
    { label: "Calories", value: `${params.calories}`, unit: "kcal", color: colors.primary[500], icon: "fire" },
    { label: "Protein", value: `${params.protein}`, unit: "g", color: "#3B82F6", icon: "food-steak" },
    { label: "Carbs", value: `${params.carbs}`, unit: "g", color: "#F59E0B", icon: "bread-slice" },
    { label: "Fat", value: `${params.fat}`, unit: "g", color: "#10B981", icon: "oil" },
    { label: "Fiber", value: `${params.fiber || "0"}`, unit: "g", color: "#8B5CF6", icon: "leaf" },
    { label: "Sugar", value: `${params.sugar || "0"}`, unit: "g", color: "#EC4899", icon: "candy" },
  ];

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? colors.background.dark : colors.background.light }}
      className="flex-1"
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Header title={params.name || "Food Detail"} onBack={() => router.back()} />

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} className="flex-1 px-4">
        <Card variant="elevated" className="items-center mb-4 py-6">
          <View
            style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" }}
            className="w-20 h-20 rounded-full items-center justify-center mb-4"
          >
            <Text className="text-4xl">🍽️</Text>
          </View>
          <Text
            style={{ color: isDark ? colors.text.dark : colors.text.light }}
            className="text-2xl font-black text-center mb-1"
          >
            {params.name}
          </Text>
          <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-sm font-semibold">
            Serving: {params.serving}
          </Text>
          {params.confidence && (
            <View className="flex-row items-center mt-2" style={{ gap: 4 }}>
              <MaterialCommunityIcons name="shield-check" size={14} color="#10B981" />
              <Text style={{ color: "#10B981" }} className="text-xs font-bold">
                {params.confidence}% AI Confidence
              </Text>
            </View>
          )}
        </Card>

        <Text
          style={{ color: isDark ? colors.text.dark : colors.text.light }}
          className="text-base font-black mb-3"
        >
          Nutritional Breakdown
        </Text>
        <View className="flex-row flex-wrap" style={{ gap: 8, marginBottom: 16 }}>
          {macroItems.map((item) => (
            <Card key={item.label} variant="outlined" className="py-3 px-4" style={{ width: "48%" }}>
              <View className="flex-row items-center" style={{ gap: 6 }}>
                <MaterialCommunityIcons name={item.icon as keyof typeof MaterialCommunityIcons.glyphMap} size={16} color={item.color} />
                <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-[10px] font-bold uppercase tracking-wider">
                  {item.label}
                </Text>
              </View>
              <Text style={{ color: item.color }} className="text-xl font-black mt-1">
                {item.value}
                <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500], fontSize: 12 }} className="font-bold"> {item.unit}</Text>
              </Text>
            </Card>
          ))}
        </View>

        {suggestions.length > 0 && (
          <Card variant="outlined" className="mb-4">
            <Text
              style={{ color: isDark ? colors.text.dark : colors.text.light }}
              className="text-base font-black mb-3"
            >
              <MaterialCommunityIcons name="lightbulb-outline" size={18} color="#F59E0B" /> Healthier Alternatives
            </Text>
            <View style={{ gap: 10 }}>
              {suggestions.map((s, i) => (
                <View
                  key={i}
                  style={{
                    backgroundColor: isDark ? "rgba(245, 158, 11, 0.08)" : "rgba(245, 158, 11, 0.05)",
                    borderColor: isDark ? "rgba(245, 158, 11, 0.2)" : "rgba(245, 158, 11, 0.15)",
                    borderWidth: 1,
                    borderRadius: 12,
                    padding: 12,
                  }}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <Text
                      style={{ color: isDark ? colors.text.dark : colors.text.light }}
                      className="text-sm font-black"
                    >
                      {s.name}
                    </Text>
                    <View className="flex-row items-center" style={{ gap: 2 }}>
                      <MaterialCommunityIcons name="fire" size={12} color={colors.primary[500]} />
                      <Text style={{ color: colors.primary[500] }} className="text-xs font-black">{s.calories} kcal</Text>
                    </View>
                  </View>
                  <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[600] }} className="text-xs font-semibold mb-2 leading-5">
                    {s.reason}
                  </Text>
                  <View className="flex-row" style={{ gap: 12 }}>
                    <Text style={{ color: "#3B82F6" }} className="text-[10px] font-bold">P {s.proteinG}g</Text>
                    <Text style={{ color: "#F59E0B" }} className="text-[10px] font-bold">C {s.carbsG}g</Text>
                    <Text style={{ color: "#10B981" }} className="text-[10px] font-bold">F {s.fatG}g</Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>
        )}

        <View className="flex-row" style={{ gap: 10 }}>
          <Button
            title="Edit Food"
            variant="outline"
            className="flex-1"
            icon={<MaterialCommunityIcons name="pencil" size={16} color={colors.primary[500]} />}
            onPress={() => router.back()}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
