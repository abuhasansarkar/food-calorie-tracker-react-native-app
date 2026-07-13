import { useMemo } from "react";
import { View, Text, ScrollView, SafeAreaView, StatusBar } from "react-native";
import { Card } from "@/components/ui/Card";
import { ChartCard } from "@/components/ui/ChartCard";
import { Header } from "@/components/ui/Header";
import { useUserContext } from "@/context/UserContext";
import { useThemeContext } from "@/context/ThemeContext";

const WEIGHT_DATA = [
  { label: "Mon", value: 71.2 },
  { label: "Tue", value: 70.8 },
  { label: "Wed", value: 70.5 },
  { label: "Thu", value: 70.3 },
  { label: "Fri", value: 70.0 },
  { label: "Sat", value: 69.8 },
  { label: "Sun", value: 69.5 },
];

export default function ProgressScreen() {
  const { onboardingData } = useUserContext();
  const { isDark, colors } = useThemeContext();

  const weightMetrics = useMemo(() => {
    const current = onboardingData?.weightKg || 70.5;
    const goal = onboardingData?.goalWeightKg || 65.0;
    
    // Check if goal is weight gain or loss
    const isGain = goal > current;
    const start = isGain ? current - 3.5 : current + 4.5;
    const difference = current - start;
    const diffText = difference > 0 ? `+${difference.toFixed(1)} kg` : `${difference.toFixed(1)} kg`;
    const label = isGain ? "Total Gained" : "Total Lost";
    
    return {
      current,
      goal,
      start,
      diffText,
      label,
    };
  }, [onboardingData]);

  // Adjust chart data based on user current weight
  const dynamicWeightData = useMemo(() => {
    const scaleFactor = weightMetrics.current / 69.5;
    return WEIGHT_DATA.map((d) => ({
      label: d.label,
      value: parseFloat((d.value * scaleFactor).toFixed(1)),
    }));
  }, [weightMetrics]);

  return (
    <SafeAreaView
      style={{ backgroundColor: isDark ? colors.background.dark : colors.background.light }}
      className="flex-1"
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Header title="Your Progress" />

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} className="flex-1 px-4">
        {/* Top Weight Stats */}
        <View className="flex-row gap-3 mb-4">
          <Card variant="outlined" className="flex-1 items-center py-3">
            <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-[10px] font-bold uppercase tracking-wider mb-1">
              Current
            </Text>
            <Text style={{ color: isDark ? colors.text.dark : colors.text.light }} className="text-lg font-black">
              {weightMetrics.current} kg
            </Text>
          </Card>
          <Card variant="outlined" className="flex-1 items-center py-3">
            <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-[10px] font-bold uppercase tracking-wider mb-1">
              Start
            </Text>
            <Text style={{ color: isDark ? colors.text.dark : colors.text.light }} className="text-lg font-black">
              {weightMetrics.start.toFixed(1)} kg
            </Text>
          </Card>
          <Card variant="outlined" className="flex-1 items-center py-3">
            <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-[10px] font-bold uppercase tracking-wider mb-1">
              Goal
            </Text>
            <Text style={{ color: colors.primary[500] }} className="text-lg font-black">
              {weightMetrics.goal} kg
            </Text>
          </Card>
        </View>

        {/* Dynamic Weight Trend Chart */}
        <ChartCard
          title="Weight Trend (This Week)"
          data={dynamicWeightData}
          height={180}
          className="mb-4"
        />

        {/* Info grids */}
        <View className="flex-row gap-3 mb-4">
          <Card variant="outlined" className="flex-1 p-4">
            <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-xs font-semibold">
              {weightMetrics.label}
            </Text>
            <Text style={{ color: colors.primary[500] }} className="text-xl font-black mt-1">
              {weightMetrics.diffText}
            </Text>
          </Card>
          <Card variant="outlined" className="flex-1 p-4">
            <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-xs font-semibold">
              Days Tracked
            </Text>
            <Text style={{ color: isDark ? colors.text.dark : colors.text.light }} className="text-xl font-black mt-1">
              45 days
            </Text>
          </Card>
        </View>

        <View className="flex-row gap-3 mb-4">
          <Card variant="outlined" className="flex-1 p-4">
            <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-xs font-semibold">
              Current Streak
            </Text>
            <Text style={{ color: "#F59E0B" }} className="text-xl font-black mt-1">
              14 days
            </Text>
          </Card>
          <Card variant="outlined" className="flex-1 p-4">
            <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-xs font-semibold">
              BMI Status
            </Text>
            <Text style={{ color: isDark ? colors.text.dark : colors.text.light }} className="text-xl font-black mt-1">
              22.4 (Normal)
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
            <Text style={{ color: colors.primary[500] }} className="text-3xl font-black tracking-tight">
              2,850
            </Text>
            <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-sm font-semibold">
              kcal / day
            </Text>
          </View>
          
          <View className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2">
            <View
              style={{ width: "87%", backgroundColor: colors.primary[500] }}
              className="rounded-full h-2"
            />
          </View>
          <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-xs font-semibold mt-2.5">
            2,850 / 3,250 target kcal (Surplus)
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
