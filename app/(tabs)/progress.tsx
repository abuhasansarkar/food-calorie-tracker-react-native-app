import { useMemo } from "react";
import { View, Text, ScrollView, StatusBar } from "react-native";
import { Card } from "@/components/ui/Card";
import { ChartCard } from "@/components/ui/ChartCard";
import { Header } from "@/components/ui/Header";
import { useUserContext } from "@/context/UserContext";
import { useThemeContext } from "@/context/ThemeContext";
import { useProgressContext } from "@/context/ProgressContext";
import { useNutritionContext } from "@/context/NutritionContext";
import { calculateNutritionPlan } from "@/utils/nutrition";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTabBarVisibility } from "@/context/TabBarVisibilityContext";

export default function ProgressScreen() {
  const { onboardingData } = useUserContext();
  const { isDark, colors } = useThemeContext();
  const progressStore = useProgressContext();
  const { currentMeals } = useNutritionContext();
  const { handleScroll } = useTabBarVisibility();
  const insets = useSafeAreaInsets();

  // -- Weight-related metrics from real stored data --
  const weightMetrics = useMemo(() => {
    const current = progressStore.progressData.currentWeightKg || onboardingData?.weightKg || 0;
    const goal = onboardingData?.goalWeightKg || 0;
    const start = progressStore.progressData.startWeightKg || 0;

    const hasData = current > 0 && start > 0;
    const difference = hasData ? current - start : 0;
    const diffText = hasData
      ? difference > 0
        ? `+${difference.toFixed(1)} kg`
        : `${difference.toFixed(1)} kg`
      : "—";
    const isGain = goal > start;
    const label = isGain ? "Total Gained" : "Total Lost";

    const streakDays = progressStore.progressData.streakDays || 0;
    const totalDays = progressStore.progressData.totalDays || 0;

    return { current, goal, start, diffText, label, streakDays, totalDays, hasData };
  }, [progressStore.progressData, onboardingData]);

  // -- Weight chart: use real recorded weight history if available --
  const chartWeightData = useMemo(() => {
    const realWeights = progressStore.progressData.weights;
    if (realWeights.length >= 2) {
      const recent = realWeights.slice(-7);
      return recent.map((entry) => {
        const date = new Date(entry.date);
        const dayLabel = date.toLocaleDateString("en-US", { weekday: "short" });
        return {
          label: dayLabel,
          value: entry.weightKg,
        };
      });
    }
    return [];
  }, [progressStore.progressData.weights]);

  // -- Calorie metrics: use NutritionContext for today and ProgressStore for weekly --
  const calorieMetrics = useMemo(() => {
    const hasPlan = !!(
      onboardingData?.gender &&
      onboardingData?.weightKg &&
      onboardingData?.heightCm &&
      onboardingData?.age &&
      onboardingData?.activityLevel &&
      onboardingData?.goalType
    );
    const plan = hasPlan && onboardingData
      ? calculateNutritionPlan(
          onboardingData.gender!,
          onboardingData.weightKg!,
          onboardingData.heightCm!,
          onboardingData.age!,
          onboardingData.activityLevel!,
          onboardingData.goalType!
        )
      : null;

    const goal = plan?.goalCalories || 0;

    // Weekly average from stored calorie entries
    const weekEntries = progressStore.progressData.calories.slice(-7);
    const weekTotal = weekEntries.reduce((sum, e) => sum + e.consumed, 0);
    const weekAvg =
      weekEntries.length > 0
        ? Math.round(weekTotal / weekEntries.length)
        : 0;

    const hasCalorieData = weekEntries.length > 0 || (currentMeals?.totalCalories ?? 0) > 0;
    const progressPercent = goal > 0 ? Math.min((weekAvg / goal) * 100, 100) : 0;
    const isSurplus = weekAvg >= goal;

    return { goal, weekAvg, progressPercent, isSurplus, hasCalorieData };
  }, [progressStore.progressData.calories, onboardingData, currentMeals]);

  // -- BMI calculation --
  const bmiInfo = useMemo(() => {
    if (!onboardingData?.weightKg || !onboardingData?.heightCm) {
      return { value: "—", label: "" };
    }
    const heightM = onboardingData.heightCm / 100;
    const bmi = onboardingData.weightKg / (heightM * heightM);
    let label = "";
    if (bmi < 18.5) label = "Underweight";
    else if (bmi < 25) label = "Normal";
    else if (bmi < 30) label = "Overweight";
    else label = "Obese";
    return { value: bmi.toFixed(1), label };
  }, [onboardingData]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? colors.background.dark : colors.background.light }}
      className="flex-1"
      edges={["top", "left", "right"]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Header title="Your Progress" />

      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
        className="flex-1 px-4"
      >
        {/* Top Weight Stats */}
        <View className="flex-row gap-3 mb-4">
          <Card variant="outlined" className="flex-1 items-center py-3">
            <Text
              style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
              className="text-[10px] font-bold uppercase tracking-wider mb-1"
            >
              Current
            </Text>
            <Text
              style={{ color: isDark ? colors.text.dark : colors.text.light }}
              className="text-lg font-black"
            >
              {weightMetrics.current > 0 ? `${weightMetrics.current} kg` : "—"}
            </Text>
          </Card>
          <Card variant="outlined" className="flex-1 items-center py-3">
            <Text
              style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
              className="text-[10px] font-bold uppercase tracking-wider mb-1"
            >
              Start
            </Text>
            <Text
              style={{ color: isDark ? colors.text.dark : colors.text.light }}
              className="text-lg font-black"
            >
              {weightMetrics.start > 0 ? `${weightMetrics.start.toFixed(1)} kg` : "—"}
            </Text>
          </Card>
          <Card variant="outlined" className="flex-1 items-center py-3">
            <Text
              style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
              className="text-[10px] font-bold uppercase tracking-wider mb-1"
            >
              Goal
            </Text>
            <Text style={{ color: colors.primary[500] }} className="text-lg font-black">
              {weightMetrics.goal > 0 ? `${weightMetrics.goal} kg` : "—"}
            </Text>
          </Card>
        </View>

        {/* Weight Trend Chart — from real data */}
        <ChartCard
          title="Weight Trend (This Week)"
          data={chartWeightData}
          height={180}
          className="mb-4"
        />

        {/* Info grids */}
        <View className="flex-row gap-3 mb-4">
          <Card variant="outlined" className="flex-1 p-4">
            <Text
              style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
              className="text-xs font-semibold"
            >
              {weightMetrics.label}
            </Text>
            <Text style={{ color: colors.primary[500] }} className="text-xl font-black mt-1">
              {weightMetrics.hasData ? weightMetrics.diffText : "—"}
            </Text>
          </Card>
          <Card variant="outlined" className="flex-1 p-4">
            <Text
              style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
              className="text-xs font-semibold"
            >
              Days Tracked
            </Text>
            <Text
              style={{ color: isDark ? colors.text.dark : colors.text.light }}
              className="text-xl font-black mt-1"
            >
              {weightMetrics.totalDays > 0 ? `${weightMetrics.totalDays} days` : "—"}
            </Text>
          </Card>
        </View>

        <View className="flex-row gap-3 mb-4">
          <Card variant="outlined" className="flex-1 p-4">
            <Text
              style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
              className="text-xs font-semibold"
            >
              Current Streak
            </Text>
            <Text style={{ color: "#F59E0B" }} className="text-xl font-black mt-1">
              {weightMetrics.streakDays > 0
                ? `${weightMetrics.streakDays} days`
                : "No streak yet"}
            </Text>
          </Card>
          <Card variant="outlined" className="flex-1 p-4">
            <Text
              style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
              className="text-xs font-semibold"
            >
              BMI Status
            </Text>
            <Text
              style={{ color: isDark ? colors.text.dark : colors.text.light }}
              className="text-xl font-black mt-1"
            >
              {bmiInfo.value !== "—"
                ? `${bmiInfo.value} (${bmiInfo.label})`
                : "—"}
            </Text>
          </Card>
        </View>

        {/* Weekly calories average */}
        <Card variant="outlined" className="mb-4">
          <Text
            style={{ color: isDark ? colors.text.dark : colors.text.light }}
            className="text-base font-bold mb-1"
          >
            Weekly Average Calories
          </Text>
          <View className="flex-row items-baseline gap-1 mt-1 mb-3">
            <Text
              style={{ color: colors.primary[500] }}
              className="text-3xl font-black tracking-tight"
            >
              {calorieMetrics.weekAvg > 0
                ? calorieMetrics.weekAvg.toLocaleString()
                : "—"}
            </Text>
            <Text
              style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
              className="text-sm font-semibold"
            >
              kcal / day
            </Text>
          </View>

          <View className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2">
            <View
              style={{
                width: `${calorieMetrics.progressPercent}%`,
                backgroundColor: colors.primary[500],
              }}
              className="rounded-full h-2"
            />
          </View>
          <Text
            style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
            className="text-xs font-semibold mt-2.5"
          >
            {calorieMetrics.weekAvg > 0
              ? `${calorieMetrics.weekAvg.toLocaleString()} / ${calorieMetrics.goal.toLocaleString()} target kcal (${
                  calorieMetrics.isSurplus ? "Surplus" : "Deficit"
                })`
              : "No calorie data yet. Log your first meal to start tracking!"}
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
