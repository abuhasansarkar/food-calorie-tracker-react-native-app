import { NutritionProvider } from "@/context/NutritionContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { UserProvider } from "@/context/UserContext";
import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { Stack } from "expo-router";
import "../global.css";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env file");
}

// Clerk can warn when dev keys are used in development and/or accidentally in production.
// This helps make misconfiguration obvious at runtime.
if (
  typeof publishableKey === "string" &&
  (publishableKey.includes("test") ||
    publishableKey.includes("dev") ||
    publishableKey.includes("pk_test"))
) {
  console.warn(
    "[Clerk] Detected a publishable key that looks like a dev/test key. " +
      "If you're deploying, make sure you use the correct live keys in production " +
      "(EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY).",
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ThemeProvider>
        <UserProvider>
          <NutritionProvider>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(onboarding)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="meal" />
              <Stack.Screen name="settings" />
            </Stack>
          </NutritionProvider>
        </UserProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}
