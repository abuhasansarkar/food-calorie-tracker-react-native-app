import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const GUEST_KEY = "aceky_guest_mode";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://api.acekyai.com";

export async function startGuestSession(): Promise<void> {
  await SecureStore.setItemAsync(GUEST_KEY, "true");
}

export async function endGuestSession(): Promise<void> {
  await SecureStore.deleteItemAsync(GUEST_KEY);
}

export async function isGuestSession(): Promise<boolean> {
  const flag = await SecureStore.getItemAsync(GUEST_KEY);
  return flag === "true";
}

const GUEST_DATA_KEYS = [
  "@aceky_meal_data",
  "@aceky_progress_data",
  "@aceky_weekly_progress",
];

export async function migrateGuestData(): Promise<void> {
  try {
    for (const key of GUEST_DATA_KEYS) {
      const raw = await AsyncStorage.getItem(key);
      if (raw) {
        const data = JSON.parse(raw);
        try {
          const response = await fetch(`${API_BASE_URL}/api/data/migrate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key, data }),
          });
          if (response.ok) {
            if (__DEV__) console.log(`[Guest] Migrated ${key}`);
          }
        } catch {
          if (__DEV__) console.warn(`[Guest] Upload failed for ${key}, data remains locally`);
        }
      }
    }
  } catch {}
}

export async function clearGuestData(): Promise<void> {
  for (const key of GUEST_DATA_KEYS) {
    try {
      await AsyncStorage.removeItem(key);
    } catch {}
  }
}
