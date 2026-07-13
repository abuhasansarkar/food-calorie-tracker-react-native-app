import { ActivityLevel, GoalType, Gender } from "@/types/user";

export interface BMRResult {
  bmr: number;
  tdee: number;
  goalCalories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export function calculateBMR(
  gender: Gender,
  weightKg: number,
  heightCm: number,
  age: number
): number {
  if (gender === Gender.Male) {
    return 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age;
  }
  return 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * age;
}

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multipliers: Record<ActivityLevel, number> = {
    [ActivityLevel.Sedentary]: 1.2,
    [ActivityLevel.LightlyActive]: 1.375,
    [ActivityLevel.ModeratelyActive]: 1.55,
    [ActivityLevel.VeryActive]: 1.725,
    [ActivityLevel.ExtremelyActive]: 1.9,
  };
  return Math.round(bmr * multipliers[activityLevel]);
}

export function calculateGoalCalories(
  tdee: number,
  goalType: GoalType
): number {
  switch (goalType) {
    case GoalType.LoseWeight:
      return tdee - 500;
    case GoalType.GainWeight:
    case GoalType.BuildMuscle:
      return tdee + 300;
    case GoalType.Maintain:
    default:
      return tdee;
  }
}

export function calculateMacros(
  calories: number,
  goalType: GoalType
): { proteinG: number; carbsG: number; fatG: number } {
  let proteinRatio: number;
  let carbsRatio: number;
  let fatRatio: number;

  switch (goalType) {
    case GoalType.LoseWeight:
      proteinRatio = 0.35;
      carbsRatio = 0.35;
      fatRatio = 0.30;
      break;
    case GoalType.BuildMuscle:
      proteinRatio = 0.35;
      carbsRatio = 0.40;
      fatRatio = 0.25;
      break;
    case GoalType.GainWeight:
      proteinRatio = 0.25;
      carbsRatio = 0.45;
      fatRatio = 0.30;
      break;
    case GoalType.Maintain:
    default:
      proteinRatio = 0.30;
      carbsRatio = 0.40;
      fatRatio = 0.30;
      break;
  }

  return {
    proteinG: Math.round((calories * proteinRatio) / 4),
    carbsG: Math.round((calories * carbsRatio) / 4),
    fatG: Math.round((calories * fatRatio) / 9),
  };
}

export function calculateNutritionPlan(
  gender: Gender,
  weightKg: number,
  heightCm: number,
  age: number,
  activityLevel: ActivityLevel,
  goalType: GoalType
): BMRResult {
  const bmr = calculateBMR(gender, weightKg, heightCm, age);
  const tdee = calculateTDEE(bmr, activityLevel);
  const goalCalories = calculateGoalCalories(tdee, goalType);
  const macros = calculateMacros(goalCalories, goalType);

  return {
    bmr: Math.round(bmr),
    tdee,
    goalCalories,
    ...macros,
  };
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

export function calculateCaloriesBurned(
  weightKg: number,
  durationMinutes: number,
  mets: number
): number {
  return Math.round((mets * 3.5 * weightKg * durationMinutes) / 200);
}

export function calculateWeightChange(
  dailySurplus: number,
  days: number
): number {
  return (dailySurplus * days) / 7700;
}
