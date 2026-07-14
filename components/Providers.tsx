import { NutritionProvider } from "@/context/NutritionContext";
import { ProgressProvider } from "@/context/ProgressContext";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { UserProvider } from "@/context/UserContext";
import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ReactNode } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env file");
}

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

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <ThemeProvider>
            <UserProvider>
              <SubscriptionProvider>
                <NutritionProvider>
                  <ProgressProvider>
                    {children}
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
