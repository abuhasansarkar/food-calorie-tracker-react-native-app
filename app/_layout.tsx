import { NutritionProvider } from "@/context/NutritionContext";
import { ProgressProvider } from "@/context/ProgressContext";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { UserProvider } from "@/context/UserContext";
import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect } from "react";
import { analyticsService } from "@/services/analytics";
import { notificationService } from "@/services/notifications";
import { ErrorBoundary } from "@/components/ErrorBoundary";
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
  useEffect(() => {
    analyticsService.startAutoFlush();
    notificationService.init();
    return () => {
      analyticsService.destroy();
      notificationService.cleanup();
    };
  }, []);

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <UserProvider>
            <SubscriptionProvider>
              <NutritionProvider>
                <ProgressProvider>
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
                </ProgressProvider>
              </NutritionProvider>
            </SubscriptionProvider>
          </UserProvider>
        </ThemeProvider>
      </SafeAreaProvider>
      </ErrorBoundary>
    </ClerkProvider>
  );
}
