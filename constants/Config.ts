export const Config = {
  app: {
    name: "AceKy AI",
    slug: "aceky-ai",
    version: "1.0.0",
    scheme: "acekyai",
  },
  api: {
    baseUrl: process.env.EXPO_PUBLIC_API_URL || "https://api.acekyai.com",
    timeout: 30000,
    retries: 3,
  },
  ai: {
    model: "food-gpt-v1",
    confidenceThreshold: 0.7,
    maxFoodItems: 20,
  },
  storage: {
    keys: {
      AUTH_TOKEN: "@aceky_auth_token",
      USER_DATA: "@aceky_user_data",
      ONBOARDING_DATA: "@aceky_onboarding_data",
      THEME: "@aceky_theme",
      SETTINGS: "@aceky_settings",
      CALORIE_GOAL: "@aceky_calorie_goal",
    },
  },
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
  calorie: {
    minDaily: 1200,
    maxDaily: 5000,
    deficitMax: 500,
    surplusMax: 500,
  },
  weight: {
    minKg: 20,
    maxKg: 300,
    minCm: 50,
    maxCm: 300,
    minAge: 10,
    maxAge: 120,
  },
  subscription: {
    free: {
      dailyScans: 3,
      mealHistory: 7,
    },
    premium: {
      dailyScans: 50,
      mealHistory: 90,
    },
  },
} as const;
