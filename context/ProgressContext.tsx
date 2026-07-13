import { createContext, useContext, ReactNode } from "react";
import { ProgressData, WeeklyProgress, MonthlyProgress, CalorieEntry } from "@/types/progress";
import { useProgressStore } from "@/store/progressStore";

interface ProgressContextType {
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

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const store = useProgressStore();

  return (
    <ProgressContext.Provider
      value={{
        progressData: store.progressData,
        weeklyProgress: store.weeklyProgress,
        isLoading: store.isLoading,
        addWeightEntry: store.addWeightEntry,
        removeWeightEntry: store.removeWeightEntry,
        updateCalorieEntry: store.updateCalorieEntry,
        getCalorieEntry: store.getCalorieEntry,
        calculateWeeklyProgress: store.calculateWeeklyProgress,
        calculateMonthlyProgress: store.calculateMonthlyProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgressContext(): ProgressContextType {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error("useProgressContext must be used within a ProgressProvider");
  }
  return context;
}
