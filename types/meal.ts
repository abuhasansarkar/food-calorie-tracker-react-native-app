export enum MealType {
  Breakfast = "breakfast",
  Lunch = "lunch",
  Dinner = "dinner",
  Snack = "snack",
}

export interface FoodItem {
  id: string;
  name: string;
  servingSize: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number;
  sugarG?: number;
  imageUrl?: string;
}

export interface Meal {
  id: string;
  userId: string;
  type: MealType;
  foods: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  imageUrl?: string;
  notes?: string;
  createdAt: string;
  date: string;
}

export interface DailyMeals {
  date: string;
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  goalCalories: number;
}

export interface ScanResult {
  foods: FoodItem[];
  totalCalories: number;
  confidence: number;
}

export interface MealHistory {
  meals: Meal[];
  totalCount: number;
  offset: number;
  limit: number;
}
