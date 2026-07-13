import { useEffect } from "react";
import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { endGuestSession } from "@/utils/guest";

export default function AuthLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      endGuestSession();
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isSignedIn) {
    return <Redirect href="/(onboarding)/gender" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="splash" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="verify-email" />
    </Stack>
  );
}