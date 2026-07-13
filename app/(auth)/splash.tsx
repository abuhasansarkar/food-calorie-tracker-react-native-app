import { useEffect } from "react";
import { View, Text, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/expo";
import { useThemeContext } from "@/context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { isGuestSession } from "@/utils/guest";
import * as SecureStore from "expo-secure-store";

const ONBOARDING_COMPLETED_KEY = "aceky_onboarding_completed";

export default function SplashScreen() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const { isDark, colors } = useThemeContext();

  useEffect(() => {
    // Wait for Clerk to finish loading, then decide where to navigate
    if (!isLoaded) return;

    const navigate = async () => {
      const timer = setTimeout(async () => {
        const isGuest = await isGuestSession();

        if (isSignedIn || isGuest) {
          // User is authenticated (or guest) — check if onboarding is done
          const onboardingDone = await SecureStore.getItemAsync(ONBOARDING_COMPLETED_KEY);
          if (onboardingDone === "true") {
            // Already fully set up — go directly to the Home tab
            router.replace("/(tabs)/home");
          } else {
            // Authenticated but onboarding not done — start onboarding
            router.replace("/(onboarding)/gender");
          }
        } else {
          // Not signed in and not a guest — show the Welcome screen
          router.replace("/(auth)/welcome");
        }
      }, 2000);

      return () => clearTimeout(timer);
    };

    navigate();
  }, [isLoaded, isSignedIn, router]);

  return (
    <View
      style={{ backgroundColor: isDark ? colors.background.dark : colors.background.light }}
      className="flex-1 items-center justify-center"
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* Brand Icon */}
      <View 
        style={{ 
          backgroundColor: isDark ? "rgba(204, 255, 0, 0.1)" : "rgba(132, 204, 22, 0.1)",
          borderColor: isDark ? "rgba(204, 255, 0, 0.2)" : "rgba(132, 204, 22, 0.2)",
        }}
        className="w-28 h-28 rounded-[32px] items-center justify-center mb-6 border-2"
      >
        <MaterialCommunityIcons 
          name="dumbbell" 
          size={64} 
          color={colors.primary[500]} 
        />
      </View>

      {/* Brand Title */}
      <Text 
        style={{ color: isDark ? colors.text.dark : colors.text.light }}
        className="text-4xl font-extrabold tracking-tight"
      >
        AceKy <Text style={{ color: colors.primary[500] }}>AI</Text>
      </Text>

      {/* Subtitle */}
      <Text 
        style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
        className="text-base font-medium mt-3 tracking-wide"
      >
        AI-Powered Food & Fitness Tracker
      </Text>
    </View>
  );
}
