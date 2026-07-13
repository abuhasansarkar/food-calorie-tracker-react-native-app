import { useCallback } from "react";
import { useProgressContext } from "@/context/ProgressContext";
import { WeeklyProgress, MonthlyProgress } from "@/types/progress";

export function useWeight() {
  const store = useProgressContext();

  const addWeight = useCallback(
    (weightKg: number, notes?: string) => {
      store.addWeightEntry(weightKg, notes);
    },
    [store]
  );

  const getWeeklyProgress = useCallback((): WeeklyProgress[] => {
    store.calculateWeeklyProgress();
    return store.weeklyProgress;
  }, [store]);

  const getMonthlyProgress = useCallback((): MonthlyProgress => {
    return store.calculateMonthlyProgress();
  }, [store]);

  return {
    weights: store.progressData.weights,
    currentWeightKg: store.progressData.currentWeightKg,
    startWeightKg: store.progressData.startWeightKg,
    goalWeightKg: store.progressData.goalWeightKg,
    weightChange: store.progressData.weightChange,
    streakDays: store.progressData.streakDays,
    totalDays: store.progressData.totalDays,
    isLoading: store.isLoading,
    addWeight,
    removeWeightEntry: store.removeWeightEntry,
    getWeeklyProgress,
    getMonthlyProgress,
  };
}
