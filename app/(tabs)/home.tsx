import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from "react-native";
import { useMemo } from "react";
import { useRouter } from "expo-router";
import { Card } from "@/components/ui/Card";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Header } from "@/components/ui/Header";
import { Badge } from "@/components/ui/Badge";
import { useUserContext } from "@/context/UserContext";
import { useNutritionContext } from "@/context/NutritionContext";
import { useThemeContext } from "@/context/ThemeContext";
import { calculateNutritionPlan } from "@/utils/nutrition";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function HomeScreen() {
  const router = useRouter();
  const { user, onboardingData } = useUserContext();
  const { currentMeals } = useNutritionContext();
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
      // Return reasonable fallbacks for gaining weight if profile is incomplete
      return {
        goalCalories: 3250,
        proteinG: 180,
        carbsG: 430,
        fatG: 110,
      };
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

  const displayName = user?.name || "Alex";
  const goalCalories = plan.goalCalories;
  const consumedCalories = currentMeals?.totalCalories || 0;
  const remainingCalories = Math.max(0, goalCalories - consumedCalories);
  const caloriePercentage = (consumedCalories / goalCalories) * 100;

  const consumedProtein = currentMeals?.totalProtein || 0;
  const goalProtein = plan.proteinG;
  const proteinPercentage = Math.min(100, (consumedProtein / goalProtein) * 100);

  const consumedCarbs = currentMeals?.totalCarbs || 0;
  const goalCarbs = plan.carbsG;
  const carbsPercentage = Math.min(100, (consumedCarbs / goalCarbs) * 100);

  const consumedFat = currentMeals?.totalFat || 0;
  const goalFat = plan.fatG;
  const fatPercentage = Math.min(100, (consumedFat / goalFat) * 100);

  return (
    <SafeAreaView
      style={{ backgroundColor: isDark ? colors.background.dark : colors.background.light }}
      className="flex-1"
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      <Header
        title={`Hi, ${displayName} 🧑👋`}
        subtitle="Ready to crush your goals today?"
        rightAction={<Badge label="XP 1,250" variant="primary" />}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} className="flex-1 px-4">
        
        {/* Streak Notification Card */}
        <Card variant="filled" className="mb-4 flex-row items-center justify-between p-3.5">
          <View className="flex-row items-center gap-3">
            <View className="w-9 h-9 rounded-full bg-amber-500/15 items-center justify-center">
              <MaterialCommunityIcons name="fire" size={20} color="#F59E0B" />
            </View>
            <View>
              <Text style={{ color: isDark ? colors.text.dark : colors.text.light }} className="text-sm font-bold">
                14 days streak
              </Text>
              <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-xs font-medium">
                Keep it up!
              </Text>
            </View>
          </View>
          <Badge label="Active" variant="success" size="sm" />
        </Card>

        {/* Calorie Progress Ring Dashboard */}
        <Card variant="elevated" className="mb-4 items-center py-6">
          <Text 
            style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
            className="text-sm font-bold uppercase tracking-wider mb-4"
          >
            Calories Tracker
          </Text>
          
          <ProgressRing
            progress={caloriePercentage}
            size={160}
            strokeWidth={12}
            color={colors.primary[500]}
            showPercentage={false}
            label={`${Math.round(caloriePercentage)}%`}
          />
          
          <View className="flex-row justify-between w-full mt-6 px-4">
            <View className="items-center flex-1">
              <Text style={{ color: isDark ? colors.text.dark : colors.text.light }} className="text-lg font-bold">
                {consumedCalories}
              </Text>
              <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-xs font-medium">
                Consumed
              </Text>
            </View>
            
            <View className="items-center flex-1 border-x border-neutral-200 dark:border-neutral-800">
              <Text style={{ color: isDark ? colors.text.dark : colors.text.light }} className="text-lg font-bold">
                {goalCalories}
              </Text>
              <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-xs font-medium">
                Goal (kcal)
              </Text>
            </View>
            
            <View className="items-center flex-1">
              <Text style={{ color: colors.primary[500] }} className="text-lg font-bold">
                {remainingCalories}
              </Text>
              <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-xs font-medium">
                Remaining
              </Text>
            </View>
          </View>
        </Card>

        {/* Macros Breakdown (Row layout with meters) */}
        <View className="flex-row gap-3 mb-4">
          {/* Protein */}
          <Card variant="outlined" className="flex-1 items-center p-3">
            <Text style={{ color: colors.primary[500] }} className="text-base font-bold">
              {consumedProtein}g / {goalProtein}g
            </Text>
            <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-xs font-medium mt-0.5">
              Protein
            </Text>
            <View className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-1.5 mt-2.5">
              <View
                style={{ width: `${proteinPercentage}%`, backgroundColor: "#3B82F6" }}
                className="rounded-full h-1.5"
              />
            </View>
          </Card>
          
          {/* Carbs */}
          <Card variant="outlined" className="flex-1 items-center p-3">
            <Text style={{ color: colors.primary[500] }} className="text-base font-bold">
              {consumedCarbs}g / {goalCarbs}g
            </Text>
            <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-xs font-medium mt-0.5">
              Carbs
            </Text>
            <View className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-1.5 mt-2.5">
              <View
                style={{ width: `${carbsPercentage}%`, backgroundColor: "#F59E0B" }}
                className="rounded-full h-1.5"
              />
            </View>
          </Card>

          {/* Fat */}
          <Card variant="outlined" className="flex-1 items-center p-3">
            <Text style={{ color: colors.primary[500] }} className="text-base font-bold">
              {consumedFat}g / {goalFat}g
            </Text>
            <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-xs font-medium mt-0.5">
              Fat
            </Text>
            <View className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-1.5 mt-2.5">
              <View
                style={{ width: `${fatPercentage}%`, backgroundColor: "#10B981" }}
                className="rounded-full h-1.5"
              />
            </View>
          </Card>
        </View>

        {/* AI Scan CTA Banner */}
        <TouchableOpacity 
          onPress={() => router.replace("/(tabs)/scan")} 
          activeOpacity={0.9} 
          className="mb-4"
        >
          <Card 
            style={{ 
              borderColor: colors.primary[500],
              backgroundColor: isDark ? "rgba(204, 255, 0, 0.03)" : "rgba(132, 204, 22, 0.03)"
            }}
            variant="outlined" 
            className="flex-row items-center justify-between p-4"
          >
            <View className="flex-1 pr-4">
              <View className="flex-row items-center gap-2 mb-1.5">
                <MaterialCommunityIcons name="camera" size={20} color={colors.primary[500]} />
                <Text style={{ color: colors.primary[500] }} className="text-base font-bold uppercase tracking-wider">
                  AI Meal Scan
                </Text>
              </View>
              <Text style={{ color: isDark ? colors.text.dark : colors.text.light }} className="text-sm font-semibold mb-1">
                Scan your food with AI
              </Text>
              <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-xs font-medium">
                Track macros instantly via your camera
              </Text>
            </View>
            <View style={{ backgroundColor: colors.primary[500] }} className="w-9 h-9 rounded-full items-center justify-center">
              <MaterialCommunityIcons name="chevron-right" size={22} color={colors.black} />
            </View>
          </Card>
        </TouchableOpacity>

        {/* Today's Tasks widget */}
        <Card variant="outlined" className="mb-4">
          <Text 
            style={{ color: isDark ? colors.text.dark : colors.text.light }}
            className="text-base font-bold mb-3"
          >
            Today&apos;s Tasks
          </Text>
          
          <View className="gap-3">
            {/* Calorie task */}
            <View className="flex-row items-center justify-between py-1">
              <View className="flex-row items-center gap-3">
                <View 
                  style={{ backgroundColor: caloriePercentage >= 100 ? colors.primary[500] : (isDark ? colors.border.dark : colors.neutral[100]) }}
                  className="w-5 h-5 rounded-full items-center justify-center"
                >
                  {caloriePercentage >= 100 && (
                    <MaterialCommunityIcons name="check" size={12} color={colors.black} />
                  )}
                </View>
                <Text style={{ color: isDark ? colors.text.dark : colors.text.light }} className="text-sm font-medium">
                  Eat {goalCalories} calories
                </Text>
              </View>
              <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-xs font-bold">
                {consumedCalories} / {goalCalories}
              </Text>
            </View>
            
            <View style={{ backgroundColor: isDark ? colors.border.dark : colors.border.light }} className="h-px w-full" />

            {/* Protein task */}
            <View className="flex-row items-center justify-between py-1">
              <View className="flex-row items-center gap-3">
                <View 
                  style={{ backgroundColor: proteinPercentage >= 100 ? colors.primary[500] : (isDark ? colors.border.dark : colors.neutral[100]) }}
                  className="w-5 h-5 rounded-full items-center justify-center"
                >
                  {proteinPercentage >= 100 && (
                    <MaterialCommunityIcons name="check" size={12} color={colors.black} />
                  )}
                </View>
                <Text style={{ color: isDark ? colors.text.dark : colors.text.light }} className="text-sm font-medium">
                  Consume {goalProtein}g Protein
                </Text>
              </View>
              <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-xs font-bold">
                {consumedProtein} / {goalProtein}g
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
