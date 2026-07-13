export interface WeightEntry {
  id: string;
  userId: string;
  weightKg: number;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface CalorieEntry {
  date: string;
  consumed: number;
  goal: number;
  burned?: number;
}

export interface ProgressData {
  weights: WeightEntry[];
  calories: CalorieEntry[];
  startDate: string;
  startWeightKg: number;
  currentWeightKg: number;
  goalWeightKg: number;
  weightChange: number;
  totalDays: number;
  streakDays: number;
}

export interface WeeklyProgress {
  weekStart: string;
  weekEnd: string;
  averageWeightKg: number;
  totalCalories: number;
  averageCalories: number;
  mealsLogged: number;
}

export interface MonthlyProgress {
  month: string;
  year: number;
  startWeightKg: number;
  endWeightKg: number;
  weightChange: number;
  totalCalories: number;
  averageDailyCalories: number;
  daysTracked: number;
}
