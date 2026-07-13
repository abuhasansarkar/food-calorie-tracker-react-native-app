import { useState, useCallback, useEffect, useRef } from "react";
import { Meal, MealType, FoodItem, DailyMeals, MealHistory } from "@/types/meal";
import { generateId } from "@/utils/helpers";
import { getToday } from "@/utils/date";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MEALS_STORAGE_KEY = "aceky_current_meals";
const HISTORY_STORAGE_KEY = "aceky_meal_history";

interface MealStore {
  currentMeals: DailyMeals | null;
  mealHistory: MealHistory;
  isLoading: boolean;
  isLoaded: boolean;
  addMeal: (type: MealType, foods: FoodItem[], imageUrl?: string, notes?: string) => void;
  removeMeal: (mealId: string) => void;
  removeFoodFromMeal: (mealId: string, foodId: string) => void;
  getMealsForDate: (date: string) => DailyMeals | null;
  loadMealHistory: () => void;
  clearCurrentMeals: () => void;
}

async function saveToStorage(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    if (__DEV__) console.warn(`[MealStore] Failed to save ${key}:`, error);
  }
}

async function loadFromStorage<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (error) {
    if (__DEV__) console.warn(`[MealStore] Failed to load ${key}:`, error);
    return null;
  }
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
  const [isLoaded, setIsLoaded] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    Promise.all([
      loadFromStorage<DailyMeals>(MEALS_STORAGE_KEY),
      loadFromStorage<MealHistory>(HISTORY_STORAGE_KEY),
    ]).then(([meals, history]) => {
      if (meals) setCurrentMeals(meals);
      if (history) setMealHistory(history);
      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveToStorage(MEALS_STORAGE_KEY, currentMeals);
    }
  }, [currentMeals, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      saveToStorage(HISTORY_STORAGE_KEY, mealHistory);
    }
  }, [mealHistory, isLoaded]);

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
    isLoaded,
    addMeal,
    removeMeal,
    removeFoodFromMeal,
    getMealsForDate,
    loadMealHistory,
    clearCurrentMeals,
  };
}