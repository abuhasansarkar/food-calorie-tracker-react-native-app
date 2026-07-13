import { useEffect, useState } from "react";
import { Stack, Redirect } from "expo-router";
import { useAuth } from "@clerk/expo";
import { View, ActivityIndicator } from "react-native";
import * as SecureStore from "expo-secure-store";
import { isGuestSession } from "@/utils/guest";

const ONBOARDING_COMPLETED_KEY = "aceky_onboarding_completed";

export default function OnboardingLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);
  const [isGuest, setIsGuest] = useState<boolean | null>(null);

  useEffect(() => {
    async function check() {
      const [flag, guestFlag] = await Promise.all([
        SecureStore.getItemAsync(ONBOARDING_COMPLETED_KEY),
        isGuestSession(),
      ]);
      setOnboardingDone(flag === "true");
      setIsGuest(guestFlag);
    }
    if (isLoaded) {
      check();
    }
  }, [isLoaded]);

  if (!isLoaded || isGuest === null || onboardingDone === null) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isSignedIn && !isGuest) {
    return <Redirect href="/(auth)/splash" />;
  }

  if (onboardingDone === true) {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="gender" />
      <Stack.Screen name="age" />
      <Stack.Screen name="height" />
      <Stack.Screen name="weight" />
      <Stack.Screen name="goal-weight" />
      <Stack.Screen name="activity-level" />
      <Stack.Screen name="gym-experience" />
      <Stack.Screen name="goal" />
      <Stack.Screen name="calorie-result" />
      <Stack.Screen name="paywall" />
    </Stack>
  );
}
