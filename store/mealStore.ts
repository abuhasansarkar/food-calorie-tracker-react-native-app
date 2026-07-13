import { useState, useCallback } from "react";
import { Meal, MealType, FoodItem, DailyMeals, MealHistory } from "@/types/meal";
import { generateId } from "@/utils/helpers";
import { getToday } from "@/utils/date";

interface MealStore {
  currentMeals: DailyMeals | null;
  mealHistory: MealHistory;
  isLoading: boolean;
  addMeal: (type: MealType, foods: FoodItem[], imageUrl?: string, notes?: string) => void;
  removeMeal: (mealId: string) => void;
  removeFoodFromMeal: (mealId: string, foodId: string) => void;
  getMealsForDate: (date: string) => DailyMeals | null;
  loadMealHistory: () => void;
  clearCurrentMeals: () => void;
}

export function useMealStore(): MealStore {
  const [currentMeals, setCurrentMeals] = useState<DailyMeals | null>(null);
  const [mealHistory, setMealHistory] = useState<MealHistory>({
    meals: [],
    totalCount: 0,
    offset: 0,
    limit: 20,
  });
  const [isLoading, setIsLoading] = useState(false);

  const recalculateTotals = (meals: Meal[]): Pick<
    DailyMeals,
    "totalCalories" | "totalProtein" | "totalCarbs" | "totalFat"
  > => {
    return meals.reduce(
      (totals, meal) => ({
        totalCalories: totals.totalCalories + meal.totalCalories,
        totalProtein: totals.totalProtein + meal.totalProtein,
        totalCarbs: totals.totalCarbs + meal.totalCarbs,
        totalFat: totals.totalFat + meal.totalFat,
      }),
      { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 }
    );
  };

  const addMeal = useCallback(
    (type: MealType, foods: FoodItem[], imageUrl?: string, notes?: string) => {
      const today = getToday();
      const meal: Meal = {
        id: generateId(),
        userId: "current",
        type,
        foods,
        totalCalories: foods.reduce((sum, f) => sum + f.calories, 0),
        totalProtein: foods.reduce((sum, f) => sum + f.proteinG, 0),
        totalCarbs: foods.reduce((sum, f) => sum + f.carbsG, 0),
        totalFat: foods.reduce((sum, f) => sum + f.fatG, 0),
        imageUrl,
        notes,
        createdAt: new Date().toISOString(),
        date: today,
      };

      setCurrentMeals((prev) => {
        const meals = prev?.meals || [];
        const updatedMeals = [...meals, meal];
        const totals = recalculateTotals(updatedMeals);

        return {
          date: today,
          meals: updatedMeals,
          goalCalories: prev?.goalCalories || 2000,
          ...totals,
        };
      });

      setMealHistory((prev) => ({
        ...prev,
        meals: [meal, ...prev.meals],
        totalCount: prev.totalCount + 1,
      }));
    },
    []
  );

  const removeMeal = useCallback((mealId: string) => {
    setCurrentMeals((prev) => {
      if (!prev) return null;
      const updatedMeals = prev.meals.filter((m) => m.id !== mealId);
      const totals = recalculateTotals(updatedMeals);

      return {
        ...prev,
        meals: updatedMeals,
        ...totals,
      };
    });
  }, []);

  const removeFoodFromMeal = useCallback(
    (mealId: string, foodId: string) => {
      setCurrentMeals((prev) => {
        if (!prev) return null;
        const updatedMeals = prev.meals.map((meal) => {
          if (meal.id !== mealId) return meal;
          const updatedFoods = meal.foods.filter((f) => f.id !== foodId);
          return {
            ...meal,
            foods: updatedFoods,
            totalCalories: updatedFoods.reduce((sum, f) => sum + f.calories, 0),
            totalProtein: updatedFoods.reduce((sum, f) => sum + f.proteinG, 0),
            totalCarbs: updatedFoods.reduce((sum, f) => sum + f.carbsG, 0),
            totalFat: updatedFoods.reduce((sum, f) => sum + f.fatG, 0),
          };
        });
        const totals = recalculateTotals(updatedMeals);
        return { ...prev, meals: updatedMeals, ...totals };
      });
    },
    []
  );

  const getMealsForDate = useCallback((date: string): DailyMeals | null => {
    if (currentMeals?.date === date) return currentMeals;
    return null;
  }, [currentMeals]);

  const loadMealHistory = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  const clearCurrentMeals = useCallback(() => {
    setCurrentMeals(null);
  }, []);

  return {
    currentMeals,
    mealHistory,
    isLoading,
    addMeal,
    removeMeal,
    removeFoodFromMeal,
    getMealsForDate,
    loadMealHistory,
    clearCurrentMeals,
  };
}
