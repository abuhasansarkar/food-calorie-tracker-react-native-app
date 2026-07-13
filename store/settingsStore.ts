import { useState, useCallback } from "react";
import { storageService } from "@/services/storage";
import { Config } from "@/constants/Config";

export interface AppSettings {
  theme: "light" | "dark" | "system";
  notificationsEnabled: boolean;
  mealReminders: boolean;
  reminderTime: string;
  weightReminders: boolean;
  weightReminderDay: string;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  language: string;
  unitSystem: "metric" | "imperial";
  privacyAnalytics: boolean;
  privacyPersonalization: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: "system",
  notificationsEnabled: true,
  mealReminders: true,
  reminderTime: "08:00",
  weightReminders: true,
  weightReminderDay: "Monday",
  soundEnabled: true,
  hapticEnabled: true,
  language: "en",
  unitSystem: "metric",
  privacyAnalytics: true,
  privacyPersonalization: true,
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

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const stored = await storageService.get<AppSettings>(
        Config.storage.keys.SETTINGS
      );
      if (stored) {
        setSettings({ ...DEFAULT_SETTINGS, ...stored });
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
