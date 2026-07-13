import * as SecureStore from "expo-secure-store";

class StorageService {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await SecureStore.getItemAsync(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Storage set error for key ${key}:`, error);
    }
  }

  async remove(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  }

  async clear(): Promise<void> {
    // SecureStore doesn't support key enumeration on Android < 10.
    // We clear known keys instead.
    const knownKeys = [
      "aceky_guest_mode",
      "aceky_onboarding_data",
      "aceky_onboarding_completed",
      "aceky_theme_mode",
      "aceky_settings",
      "@aceky_auth_token",
      "@aceky_user_data",
      "@aceky_onboarding_data",
      "@aceky_theme",
      "@aceky_settings",
      "@aceky_calorie_goal",
    ];
    await Promise.allSettled(
      knownKeys.map((key) => SecureStore.deleteItemAsync(key).catch(() => {}))
    );
  }

  async getString(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  }

  async setString(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error(`Storage setString error for key ${key}:`, error);
    }
  }

  async has(key: string): Promise<boolean> {
    const value = await this.getString(key);
    return value !== null;
  }
}

export const storageService = new StorageService();
