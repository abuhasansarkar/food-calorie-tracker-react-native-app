import { useState, useCallback, useEffect } from "react";
import { storageService } from "@/services/storage";
import { apiService } from "@/services/api";
import { Config } from "@/constants/Config";

export interface AppSettings {
  theme: "light" | "dark" | "system";
  notificationsEnabled: boolean;
  mealReminders: boolean;
  reminderTime: string;
  breakfastTime: string;
  lunchTime: string;
  dinnerTime: string;
  snackTime: string;
  weightReminders: boolean;
  weightReminderDay: string;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  language: string;
  unitSystem: "metric" | "imperial";
  privacyAnalytics: boolean;
  privacyPersonalization: boolean;
  streakAlerts: boolean;
  tipsAndTricks: boolean;
  promotions: boolean;
  aiMealFollowUp: boolean;
  shareData: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: "system",
  notificationsEnabled: true,
  mealReminders: true,
  reminderTime: "08:00",
  breakfastTime: "08:00",
  lunchTime: "12:00",
  dinnerTime: "18:00",
  snackTime: "15:00",
  weightReminders: true,
  weightReminderDay: "Monday",
  soundEnabled: true,
  hapticEnabled: true,
  language: "en",
  unitSystem: "metric",
  privacyAnalytics: true,
  privacyPersonalization: true,
  streakAlerts: true,
  tipsAndTricks: false,
  promotions: false,
  aiMealFollowUp: false,
  shareData: false,
};

interface SettingsStore {
  settings: AppSettings;
  isLoading: boolean;
  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
}

export function useSettingsStore(): SettingsStore {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      let remoteDefaults: Partial<AppSettings> = {};
      try {
        const response = await apiService.get<Partial<AppSettings>>("/settings/defaults");
        if (response.success && response.data) {
          remoteDefaults = response.data;
        }
      } catch (error) {
        if (__DEV__) console.warn("[SettingsStore] Failed to fetch remote defaults:", error);
      }

      const mergedDefaults = { ...DEFAULT_SETTINGS, ...remoteDefaults };

      const stored = await storageService.get<AppSettings>(
        Config.storage.keys.SETTINGS
      );
      if (stored) {
        setSettings({ ...mergedDefaults, ...stored });
      } else {
        setSettings(mergedDefaults);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSettings = useCallback(
    async (updates: Partial<AppSettings>) => {
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);
      await storageService.set(Config.storage.keys.SETTINGS, newSettings);
    },
    [settings]
  );

  const resetSettings = useCallback(async () => {
    setSettings(DEFAULT_SETTINGS);
    await storageService.set(Config.storage.keys.SETTINGS, DEFAULT_SETTINGS);
  }, []);

  return {
    settings,
    isLoading,
    loadSettings,
    updateSettings,
    resetSettings,
  };
}
