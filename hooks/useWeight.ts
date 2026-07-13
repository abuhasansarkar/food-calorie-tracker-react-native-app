import { useCallback, useRef } from "react";
import { useProgressContext } from "@/context/ProgressContext";
import { WeeklyProgress, MonthlyProgress } from "@/types/progress";

export function useWeight() {
  const store = useProgressContext();
  const storeRef = useRef(store);
  storeRef.current = store;

  const addWeight = useCallback(
    (weightKg: number, notes?: string) => {
      storeRef.current.addWeightEntry(weightKg, notes);
    },
    [],
  );

  const getWeeklyProgress = useCallback((): WeeklyProgress[] => {
    return storeRef.current.weeklyProgress;
  }, []);

  const calcWeeklyProgress = useCallback(() => {
    storeRef.current.calculateWeeklyProgress();
  }, []);

  const getMonthlyProgress = useCallback((): MonthlyProgress => {
    return storeRef.current.calculateMonthlyProgress();
  }, []);

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
    calcWeeklyProgress,
    getMonthlyProgress,
  };
}
