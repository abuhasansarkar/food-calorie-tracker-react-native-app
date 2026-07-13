import { Stack } from "expo-router";

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="notifications" />
      <Stack.Screen name="reminders" />
      <Stack.Screen name="appearance" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="subscription" />
    </Stack>
  );
}
