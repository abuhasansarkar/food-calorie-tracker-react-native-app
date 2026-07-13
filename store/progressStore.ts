import { useState, useCallback } from "react";
import { WeightEntry, CalorieEntry, ProgressData, WeeklyProgress, MonthlyProgress } from "@/types/progress";
import { generateId } from "@/utils/helpers";
import { getToday, getWeekRange, getMonthRange } from "@/utils/date";

interface ProgressStore {
  progressData: ProgressData;
  weeklyProgress: WeeklyProgress[];
  isLoading: boolean;
  addWeightEntry: (weightKg: number, notes?: string) => void;
  removeWeightEntry: (id: string) => void;
  updateCalorieEntry: (date: string, consumed: number, goal: number) => void;
  getCalorieEntry: (date: string) => CalorieEntry | undefined;
  calculateWeeklyProgress: () => void;
  calculateMonthlyProgress: () => MonthlyProgress;
}

export function useProgressStore(): ProgressStore {
  const today = getToday();

  const [progressData, setProgressData] = useState<ProgressData>({
    weights: [],
    calories: [],
    startDate: today,
    startWeightKg: 0,
    currentWeightKg: 0,
    goalWeightKg: 0,
    weightChange: 0,
    totalDays: 0,
    streakDays: 0,
  });

  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addWeightEntry = useCallback(
    (weightKg: number, notes?: string) => {
      const entry: WeightEntry = {
        id: generateId(),
        userId: "current",
        weightKg,
        date: today,
        notes,
        createdAt: new Date().toISOString(),
      };

      setProgressData((prev) => {
        const weights = [...prev.weights, entry].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        const startWeightKg = weights[0]?.weightKg || weightKg;
        const currentWeightKg = weightKg;
        const weightChange = currentWeightKg - startWeightKg;

        return {
          ...prev,
          weights,
          startWeightKg,
          currentWeightKg,
          weightChange,
          totalDays: weights.length,
          streakDays: calculateStreak(weights),
        };
      });
    },
    [today]
  );

  const removeWeightEntry = useCallback((id: string) => {
    setProgressData((prev) => {
      const weights = prev.weights.filter((w) => w.id !== id);
      if (weights.length === 0) return prev;
      const startWeightKg = weights[0].weightKg;
      const currentWeightKg = weights[weights.length - 1].weightKg;
      return {
        ...prev,
        weights,
        startWeightKg,
        currentWeightKg,
        weightChange: currentWeightKg - startWeightKg,
        totalDays: weights.length,
        streakDays: calculateStreak(weights),
      };
    });
  }, []);

  const updateCalorieEntry = useCallback(
    (date: string, consumed: number, goal: number) => {
      setProgressData((prev) => {
        const existing = prev.calories.findIndex((c) => c.date === date);
        const entry: CalorieEntry = { date, consumed, goal };
        const calories = [...prev.calories];

        if (existing >= 0) {
          calories[existing] = entry;
        } else {
          calories.push(entry);
        }

        return { ...prev, calories };
      });
    },
    []
  );

  const getCalorieEntry = useCallback(
    (date: string): CalorieEntry | undefined => {
      return progressData.calories.find((c) => c.date === date);
    },
    [progressData.calories]
  );

  const calculateWeeklyProgress = useCallback(() => {
    const { start, end } = getWeekRange();
    setIsLoading(true);

    const weekMeals = progressData.calories.filter(
      (c) => c.date >= start && c.date <= end
    );

    const weekWeights = progressData.weights.filter(
      (w) => w.date >= start && w.date <= end
    );

    const week: WeeklyProgress = {
      weekStart: start,
      weekEnd: end,
      averageWeightKg:
        weekWeights.reduce((sum, w) => sum + w.weightKg, 0) /
        (weekWeights.length || 1),
      totalCalories: weekMeals.reduce((sum, c) => sum + c.consumed, 0),
      averageCalories:
        weekMeals.reduce((sum, c) => sum + c.consumed, 0) /
        (weekMeals.length || 1),
      mealsLogged: weekMeals.length,
    };

    setWeeklyProgress((prev) => {
      const existing = prev.findIndex((w) => w.weekStart === start);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = week;
        return updated;
      }
      return [...prev, week];
    });

    setIsLoading(false);
  }, [progressData]);

  const calculateMonthlyProgress = useCallback((): MonthlyProgress => {
    const { start, end } = getMonthRange();
    const monthWeights = progressData.weights.filter(
      (w) => w.date >= start && w.date <= end
    );
    const monthCalories = progressData.calories.filter(
      (c) => c.date >= start && c.date <= end
    );

    return {
      month: new Date().toLocaleDateString("en-US", { month: "long" }),
      year: new Date().getFullYear(),
      startWeightKg: monthWeights[0]?.weightKg || 0,
      endWeightKg: monthWeights[monthWeights.length - 1]?.weightKg || 0,
      weightChange:
        (monthWeights[monthWeights.length - 1]?.weightKg || 0) -
        (monthWeights[0]?.weightKg || 0),
      totalCalories: monthCalories.reduce((sum, c) => sum + c.consumed, 0),
      averageDailyCalories:
        monthCalories.reduce((sum, c) => sum + c.consumed, 0) /
        (monthCalories.length || 1),
      daysTracked: monthCalories.length,
    };
  }, [progressData]);

  return {
    progressData,
    weeklyProgress,
    isLoading,
    addWeightEntry,
    removeWeightEntry,
    updateCalorieEntry,
    getCalorieEntry,
    calculateWeeklyProgress,
    calculateMonthlyProgress,
  };
}

function calculateStreak(weights: WeightEntry[]): number {
  if (weights.length === 0) return 0;

  const sorted = [...weights].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  let streak = 1;
  const today = new Date();
  const latestDate = new Date(sorted[0].date);

  const daysSinceLatest = Math.round(
    (today.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (daysSinceLatest > 1) return 0;

  for (let i = 1; i < sorted.length; i++) {
    const curr = new Date(sorted[i - 1].date);
    const prev = new Date(sorted[i].date);
    const diffDays = Math.round(
      (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
