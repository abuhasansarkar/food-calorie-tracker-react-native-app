import { Stack } from "expo-router";

export default function MealLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="analyzing" />
      <Stack.Screen name="result" />
      <Stack.Screen name="food-detail" />
      <Stack.Screen name="history" />
    </Stack>
  );
}
