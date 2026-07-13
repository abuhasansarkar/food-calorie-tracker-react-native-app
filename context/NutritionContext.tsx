import { createContext, useContext, ReactNode, useCallback, useMemo } from "react";
import { DailyMeals, MealType, FoodItem, MealHistory } from "@/types/meal";
import { useMealStore } from "@/store/mealStore";

interface NutritionContextType {
  currentMeals: DailyMeals | null;
  mealHistory: MealHistory;
  isLoading: boolean;
  addMeal: (type: MealType, foods: FoodItem[], imageUrl?: string, notes?: string) => void;
  removeMeal: (mealId: string) => void;
  removeFoodFromMeal: (mealId: string, foodId: string) => void;
  getMealsForDate: (date: string) => DailyMeals | null;
  calculateRemainingCalories: (goalCalories: number) => number;
  clearCurrentMeals: () => void;
}

const NutritionContext = createContext<NutritionContextType | undefined>(undefined);

export function NutritionProvider({ children }: { children: ReactNode }) {
  const mealStore = useMealStore();

  const calculateRemainingCalories = useCallback(
    (goalCalories: number): number => {
      if (!mealStore.currentMeals) return goalCalories;
      return goalCalories - mealStore.currentMeals.totalCalories;
    },
    [mealStore.currentMeals],
  );

  const contextValue = useMemo(() => ({
    currentMeals: mealStore.currentMeals,
    mealHistory: mealStore.mealHistory,
    isLoading: mealStore.isLoading,
    addMeal: mealStore.addMeal,
    removeMeal: mealStore.removeMeal,
    removeFoodFromMeal: mealStore.removeFoodFromMeal,
    getMealsForDate: mealStore.getMealsForDate,
    calculateRemainingCalories,
    clearCurrentMeals: mealStore.clearCurrentMeals,
  }), [
    mealStore.currentMeals,
    mealStore.mealHistory,
    mealStore.isLoading,
    mealStore.addMeal,
    mealStore.removeMeal,
    mealStore.removeFoodFromMeal,
    mealStore.getMealsForDate,
    mealStore.clearCurrentMeals,
    calculateRemainingCalories,
  ]);

  return (
    <NutritionContext.Provider value={contextValue}>
      {children}
    </NutritionContext.Provider>
  );
}

export function useNutritionContext(): NutritionContextType {
  const context = useContext(NutritionContext);
  if (!context) {
    throw new Error("useNutritionContext must be used within a NutritionProvider");
  }
  return context;
}
