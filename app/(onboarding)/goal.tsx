import { useState } from "react";
import { View, Text, TouchableOpacity, StatusBar, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/ui/Header";
import { GoalType } from "@/types/user";
import { useUserContext } from "@/context/UserContext";
import { useThemeContext } from "@/context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const GOALS = [
  {
    key: GoalType.GainWeight,
    label: "Gain Weight",
    icon: "trending-up" as const,
    description: "Build muscle & gain size",
  },
  {
    key: GoalType.BuildMuscle,
    label: "Build Muscle",
    icon: "dumbbell" as const,
    description: "Increase strength & muscle",
  },
  {
    key: GoalType.Maintain,
    label: "Maintain",
    icon: "adjust" as const,
    description: "Keep your current weight",
  },
  {
    key: GoalType.LoseWeight,
    label: "Lose Weight",
    icon: "trending-down" as const,
    description: "Calorie deficit to shed body fat",
  },
];

export default function GoalScreen() {
  const router = useRouter();
  const { saveOnboardingData, onboardingData } = useUserContext();
  const { isDark, colors } = useThemeContext();
  
  const initialValue = onboardingData?.goalType || GoalType.GainWeight;
  const [selected, setSelected] = useState<GoalType | null>(initialValue);

  const handleNext = async () => {
    if (!selected) return;
    await saveOnboardingData({ goalType: selected });
    router.push("/(onboarding)/calorie-result");
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? colors.background.dark : colors.background.light }}
      className="flex-1"
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Header 
        title="" 
        onBack={() => router.back()} 
        rightAction={
          <Text 
            style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
            className="text-sm font-semibold tracking-wider"
          >
            8 of 8
          </Text>
        }
      />

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }} className="flex-1 px-6">
        <View className="mb-8 mt-4">
          <Text 
            style={{ color: isDark ? colors.text.dark : colors.text.light }}
            className="text-3xl font-extrabold tracking-tight mb-2 text-center"
          >
            Your Goal
          </Text>
          <Text 
            style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
            className="text-base font-medium text-center"
          >
            What&apos;s your main goal?
          </Text>
        </View>

        <View className="gap-3">
          {GOALS.map((goal) => {
            const isSelected = selected === goal.key;
            return (
              <TouchableOpacity
                key={goal.key}
                onPress={() => setSelected(goal.key)}
                className="flex-row items-center justify-between p-4 rounded-2xl border-2"
                style={{
                  borderColor: isSelected
                    ? colors.primary[500]
                    : isDark ? colors.border.dark : colors.border.light,
                  backgroundColor: isSelected
                    ? (isDark ? "rgba(204, 255, 0, 0.05)" : "rgba(132, 204, 22, 0.05)")
                    : isDark ? colors.surface.dark : colors.white,
                }}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center flex-1 pr-4">
                  {/* Goal Icon */}
                  <View 
                    style={{ 
                      backgroundColor: isSelected 
                        ? colors.primary[500] 
                        : isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)" 
                    }}
                    className="w-10 h-10 rounded-xl items-center justify-center mr-4"
                  >
                    <MaterialCommunityIcons
                      name={goal.icon}
                      size={20}
                      color={isSelected ? colors.black : (isDark ? colors.text.secondary : colors.neutral[500])}
                    />
                  </View>

                  <View className="flex-1">
                    <Text
                      style={{
                        color: isSelected ? colors.primary[500] : (isDark ? colors.text.dark : colors.text.light),
                      }}
                      className="text-base font-bold"
                    >
                      {goal.label}
                    </Text>
                    <Text 
                      style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
                      className="text-xs mt-0.5 font-medium"
                    >
                      {goal.description}
                    </Text>
                  </View>
                </View>

                {/* Selection indicator */}
                <View 
                  style={{ 
                    borderColor: isSelected ? colors.primary[500] : (isDark ? colors.border.dark : colors.border.light),
                    backgroundColor: isSelected ? colors.primary[500] : "transparent"
                  }}
                  className="w-6 h-6 rounded-full border-2 items-center justify-center"
                >
                  {isSelected && (
                    <MaterialCommunityIcons name="check" size={14} color={colors.black} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="mt-8">
          <Button
            title="Next"
            onPress={handleNext}
            disabled={!selected}
            size="lg"
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
