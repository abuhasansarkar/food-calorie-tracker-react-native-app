import { useMemo } from "react";
import { View, Text, ScrollView, SafeAreaView, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useUserContext } from "@/context/UserContext";
import { useThemeContext } from "@/context/ThemeContext";
import { calculateNutritionPlan } from "@/utils/nutrition";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function CalorieResultScreen() {
  const router = useRouter();
  const { onboardingData, completeOnboarding } = useUserContext();
  const { isDark, colors } = useThemeContext();

  const plan = useMemo(() => {
    if (
      !onboardingData?.gender ||
      !onboardingData?.weightKg ||
      !onboardingData?.heightCm ||
      !onboardingData?.age ||
      !onboardingData?.activityLevel ||
      !onboardingData?.goalType
    ) {
      return null;
    }

    return calculateNutritionPlan(
      onboardingData.gender,
      onboardingData.weightKg,
      onboardingData.heightCm,
      onboardingData.age,
      onboardingData.activityLevel,
      onboardingData.goalType
    );
  }, [onboardingData]);

  const handleContinue = async () => {
    await completeOnboarding();
    router.replace("/(tabs)/home");
  };

  if (!plan) {
    return (
      <View 
        style={{ backgroundColor: isDark ? colors.background.dark : colors.background.light }}
        className="flex-1 items-center justify-center"
      >
        <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}>
          Missing onboarding data
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={{ backgroundColor: isDark ? colors.background.dark : colors.background.light }}
      className="flex-1"
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
        className="flex-1 px-6"
      >
        <View className="items-center mt-8 mb-8">
          <Text 
            style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
            className="text-base font-bold uppercase tracking-wider mb-2"
          >
            Your Daily Calorie Target
          </Text>
          
          <View className="flex-row items-baseline justify-center my-4">
            <Text 
              style={{ color: colors.primary[500] }}
              className="text-7xl font-black tracking-tighter"
            >
              {plan.goalCalories.toLocaleString()}
            </Text>
          </View>
          
          <Text 
            style={{ color: isDark ? colors.text.dark : colors.text.light }}
            className="text-base font-semibold text-center max-w-[260px] leading-6"
          >
            To reach your goal weight of {onboardingData?.goalWeightKg || 70}kg
          </Text>
        </View>

        {/* Macros Breakdown Card (Mockup styled list) */}
        <Card variant="outlined" className="mb-8">
          <Text 
            style={{ color: isDark ? colors.text.dark : colors.text.light }}
            className="text-base font-bold mb-4"
          >
            Target Macros
          </Text>

          <View className="gap-4">
            {/* Protein Row */}
            <View className="flex-row items-center justify-between py-1">
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-full bg-blue-500/10 items-center justify-center">
                  <MaterialCommunityIcons name="water" size={18} color="#3B82F6" />
                </View>
                <Text style={{ color: isDark ? colors.text.dark : colors.text.light }} className="text-sm font-semibold">
                  Protein
                </Text>
              </View>
              <Text style={{ color: isDark ? colors.text.dark : colors.text.light }} className="text-base font-bold">
                {plan.proteinG}g
              </Text>
            </View>

            {/* Carbs Row */}
            <View className="flex-row items-center justify-between py-1">
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-full bg-amber-500/10 items-center justify-center">
                  <MaterialCommunityIcons name="corn" size={18} color="#F59E0B" />
                </View>
                <Text style={{ color: isDark ? colors.text.dark : colors.text.light }} className="text-sm font-semibold">
                  Carbs
                </Text>
              </View>
              <Text style={{ color: isDark ? colors.text.dark : colors.text.light }} className="text-base font-bold">
                {plan.carbsG}g
              </Text>
            </View>

            {/* Fats Row */}
            <View className="flex-row items-center justify-between py-1">
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-full bg-emerald-500/10 items-center justify-center">
                  <MaterialCommunityIcons name="food-apple" size={18} color="#10B981" />
                </View>
                <Text style={{ color: isDark ? colors.text.dark : colors.text.light }} className="text-sm font-semibold">
                  Fats
                </Text>
              </View>
              <Text style={{ color: isDark ? colors.text.dark : colors.text.light }} className="text-base font-bold">
                {plan.fatG}g
              </Text>
            </View>
          </View>
        </Card>

        {/* Metabolism Insights Card */}
        <Card variant="filled" className="mb-8">
          <Text 
            style={{ color: isDark ? colors.text.dark : colors.text.light }}
            className="text-base font-bold mb-3"
          >
            Metabolic Metrics
          </Text>
          <View className="flex-row justify-between py-2.5 border-b border-neutral-200 dark:border-neutral-800">
            <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-sm font-medium">
              Basal Metabolic Rate (BMR)
            </Text>
            <Text style={{ color: isDark ? colors.text.dark : colors.text.light }} className="font-bold text-sm">
              {plan.bmr} kcal
            </Text>
          </View>
          <View className="flex-row justify-between py-2.5">
            <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-sm font-medium">
              Total Daily Energy (TDEE)
            </Text>
            <Text style={{ color: isDark ? colors.text.dark : colors.text.light }} className="font-bold text-sm">
              {plan.tdee} kcal
            </Text>
          </View>
        </Card>

        {/* Bottom Actions */}
        <View className="mt-auto">
          <Button
            title="Let's Go!"
            onPress={handleContinue}
            size="lg"
            fullWidth
          />
          <Text 
            style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
            className="text-xs text-center font-medium mt-4"
          >
            You&apos;re all set to start your transformation!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
