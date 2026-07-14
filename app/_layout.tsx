import { Providers } from "@/components/Providers";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { analyticsService } from "@/services/analytics";
import { notificationService } from "@/services/notifications";
import "../global.css";

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
    <Providers>
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
    </Providers>
  );
}
