import { useMemo } from "react";
import { Gender, ActivityLevel, GoalType } from "@/types/user";
import { calorieService, CalorieRequirements } from "@/services/calorie";

interface UseCaloriesOptions {
  gender: Gender;
  weightKg: number;
  heightCm: number;
  age: number;
  activityLevel: ActivityLevel;
  goalType: GoalType;
  consumedCalories?: number;
  burnedCalories?: number;
}

export function useCalories(options: UseCaloriesOptions) {
  const requirements: CalorieRequirements = useMemo(
    () =>
      calorieService.calculateRequirements(
        options.gender,
        options.weightKg,
        options.heightCm,
        options.age,
        options.activityLevel,
        options.goalType
      ),
    [options.gender, options.weightKg, options.heightCm, options.age, options.activityLevel, options.goalType]
  );

  const mealTargets = useMemo(
    () => calorieService.getMealCalorieTargets(requirements.goalCalories),
    [requirements.goalCalories]
  );

  const remainingCalories = useMemo(
    () =>
      calorieService.calculateRemainingCalories(
        requirements.goalCalories,
        options.consumedCalories || 0,
        options.burnedCalories || 0
      ),
    [requirements.goalCalories, options.consumedCalories, options.burnedCalories]
  );

  const calorieProgress = useMemo(
    () =>
      calorieService.calculateCalorieProgress(
        options.consumedCalories || 0,
        requirements.goalCalories
      ),
    [options.consumedCalories, requirements.goalCalories]
  );

  const macroProgress = useMemo(
    () => ({
      protein: calorieService.getMacroProgress(options.consumedCalories || 0, requirements.proteinG),
      carbs: calorieService.getMacroProgress(options.consumedCalories || 0, requirements.carbsG),
      fat: calorieService.getMacroProgress(options.consumedCalories || 0, requirements.fatG),
    }),
    [options.consumedCalories, requirements.proteinG, requirements.carbsG, requirements.fatG]
  );

  return {
    ...requirements,
    mealTargets,
    remainingCalories,
    calorieProgress,
    macroProgress,
  };
}
