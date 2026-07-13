export const Routes = {
  // Auth
  SPLASH: "/(auth)/splash",
  WELCOME: "/(auth)/welcome",
  LOGIN: "/(auth)/login",
  REGISTER: "/(auth)/register",
  FORGOT_PASSWORD: "/(auth)/forgot-password",
  VERIFY_EMAIL: "/(auth)/verify-email",

  // Onboarding
  GENDER: "/(onboarding)/gender",
  AGE: "/(onboarding)/age",
  HEIGHT: "/(onboarding)/height",
  WEIGHT: "/(onboarding)/weight",
  GOAL_WEIGHT: "/(onboarding)/goal-weight",
  ACTIVITY_LEVEL: "/(onboarding)/activity-level",
  GYM_EXPERIENCE: "/(onboarding)/gym-experience",
  GOAL: "/(onboarding)/goal",
  CALORIE_RESULT: "/(onboarding)/calorie-result",
  PAYWALL: "/(onboarding)/paywall",

  // Main Tabs
  HOME: "/(tabs)/home",
  FOODS: "/(tabs)/foods",
  SCAN: "/(tabs)/scan",
  PROGRESS: "/(tabs)/progress",
  PROFILE: "/(tabs)/profile",

  // Coach
  COACH: "/(tabs)/coach",

  // Meal
  ANALYZING: "/meal/analyzing",
  MEAL_RESULT: "/meal/result",
  MEAL_HISTORY: "/meal/history",

  // Settings
  NOTIFICATIONS: "/settings/notifications",
  REMINDERS: "/settings/reminders",
  APPEARANCE: "/settings/appearance",
  PRIVACY: "/settings/privacy",
  SUBSCRIPTION: "/settings/subscription",
} as const;
