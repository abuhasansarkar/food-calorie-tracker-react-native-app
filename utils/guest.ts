import * as SecureStore from "expo-secure-store";

export const GUEST_KEY = "aceky_guest_mode";

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
