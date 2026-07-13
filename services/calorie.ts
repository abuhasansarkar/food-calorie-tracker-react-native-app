import { ActivityLevel, GoalType, Gender } from "@/types/user";
import { calculateNutritionPlan } from "@/utils/nutrition";

export interface CalorieRequirements {
  bmr: number;
  tdee: number;
  goalCalories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface MealCalorieBreakdown {
  breakfastPercent: number;
  lunchPercent: number;
  dinnerPercent: number;
  snackPercent: number;
}

const DEFAULT_MEAL_BREAKDOWN: MealCalorieBreakdown = {
  breakfastPercent: 0.25,
  lunchPercent: 0.35,
  dinnerPercent: 0.30,
  snackPercent: 0.10,
};

class CalorieService {
  calculateRequirements(
    gender: Gender,
    weightKg: number,
    heightCm: number,
    age: number,
    activityLevel: ActivityLevel,
    goalType: GoalType
  ): CalorieRequirements {
    return calculateNutritionPlan(
      gender,
      weightKg,
      heightCm,
      age,
      activityLevel,
      goalType
    );
  }

  getMealCalorieTargets(
    totalCalories: number,
    breakdown: MealCalorieBreakdown = DEFAULT_MEAL_BREAKDOWN
  ): Record<string, number> {
    return {
      breakfast: Math.round(totalCalories * breakdown.breakfastPercent),
      lunch: Math.round(totalCalories * breakdown.lunchPercent),
      dinner: Math.round(totalCalories * breakdown.dinnerPercent),
      snack: Math.round(totalCalories * breakdown.snackPercent),
    };
  }

  calculateRemainingCalories(
    goalCalories: number,
    consumedCalories: number,
    burnedCalories: number = 0
  ): number {
    return goalCalories - consumedCalories + burnedCalories;
  }

  calculateCalorieProgress(consumed: number, goal: number): number {
    if (goal === 0) return 0;
    return Math.min((consumed / goal) * 100, 100);
  }

  estimateWeightChange(
    averageDailyCalories: number,
    tdee: number,
    days: number
  ): number {
    const dailySurplus = averageDailyCalories - tdee;
    return (dailySurplus * days) / 7700;
  }

  getMacroProgress(
    current: number,
    goal: number
  ): { percentage: number; remaining: number } {
    return {
      percentage: goal > 0 ? Math.min((current / goal) * 100, 100) : 0,
      remaining: Math.max(goal - current, 0),
    };
  }
}

export const calorieService = new CalorieService();
