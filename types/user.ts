export enum Gender {
  Male = "male",
  Female = "female",
  Other = "other",
}

export enum GoalType {
  LoseWeight = "lose_weight",
  Maintain = "maintain",
  GainWeight = "gain_weight",
  BuildMuscle = "build_muscle",
}

export enum ActivityLevel {
  Sedentary = "sedentary",
  LightlyActive = "lightly_active",
  ModeratelyActive = "moderately_active",
  VeryActive = "very_active",
  ExtremelyActive = "extremely_active",
}

export enum GymExperience {
  Beginner = "beginner",
  Intermediate = "intermediate",
  Advanced = "advanced",
}

export interface OnboardingData {
  gender: Gender | null;
  age: number | null;
  heightCm: number | null;
  weightKg: number | null;
  goalWeightKg: number | null;
  activityLevel: ActivityLevel | null;
  gymExperience: GymExperience | null;
  goalType: GoalType | null;
  dailyCalories: number | null;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  onboardingCompleted: boolean;
  onboardingData: OnboardingData;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
