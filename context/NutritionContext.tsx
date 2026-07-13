import { createContext, useContext, ReactNode } from "react";
import { DailyMeals, MealType, FoodItem } from "@/types/meal";
import { useMealStore } from "@/store/mealStore";

interface NutritionContextType {
  currentMeals: DailyMeals | null;
  isLoading: boolean;
  addMeal: (type: MealType, foods: FoodItem[], imageUrl?: string, notes?: string) => void;
  removeMeal: (mealId: string) => void;
  removeFoodFromMeal: (mealId: string, foodId: string) => void;
  getMealsForDate: (date: string) => DailyMeals | null;
  calculateRemainingCalories: (goalCalories: number) => number;
}

const NutritionContext = createContext<NutritionContextType | undefined>(undefined);

export function NutritionProvider({ children }: { children: ReactNode }) {
  const mealStore = useMealStore();

  const calculateRemainingCalories = (goalCalories: number): number => {
    if (!mealStore.currentMeals) return goalCalories;
    return goalCalories - mealStore.currentMeals.totalCalories;
  };

  return (
    <NutritionContext.Provider
      value={{
        currentMeals: mealStore.currentMeals,
        isLoading: mealStore.isLoading,
        addMeal: mealStore.addMeal,
        removeMeal: mealStore.removeMeal,
        removeFoodFromMeal: mealStore.removeFoodFromMeal,
        getMealsForDate: mealStore.getMealsForDate,
        calculateRemainingCalories,
      }}
    >
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
