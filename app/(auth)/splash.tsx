import { useEffect } from "react";
import { View, Text, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/expo";
import { useThemeContext } from "@/context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { isGuestSession } from "@/utils/guest";
import * as SecureStore from "expo-secure-store";

const ONBOARDING_COMPLETED_KEY = "aceky_onboarding_completed";

export default function SplashScreen() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const { isDark, colors } = useThemeContext();

  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);
  const iconPulse = useSharedValue(1);
  const subtitleOpacity = useSharedValue(0);
  const tagOpacity = useSharedValue(0);

  useEffect(() => {
    logoScale.value = withSpring(1, { damping: 10, stiffness: 100 });
    logoOpacity.value = withTiming(1, { duration: 600 });

    iconPulse.value = withRepeat(
      withTiming(1.08, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );

    subtitleOpacity.value = withDelay(500, withTiming(1, { duration: 500 }));
    tagOpacity.value = withDelay(1000, withTiming(1, { duration: 400 }));
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconPulse.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const tagStyle = useAnimatedStyle(() => ({
    opacity: tagOpacity.value,
  }));

  useEffect(() => {
    if (!isLoaded) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      if (cancelled) return;

      const isGuest = await isGuestSession();

      if (isSignedIn || isGuest) {
        const onboardingDone = await SecureStore.getItemAsync(ONBOARDING_COMPLETED_KEY);
        router.replace(onboardingDone === "true" ? "/(tabs)/home" : "/(onboarding)/gender");
      } else {
        router.replace("/(auth)/welcome");
      }
    }, 2000);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isLoaded, isSignedIn, router]);

  return (
    <View className="flex-1">
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <LinearGradient
        colors={
          isDark
            ? ["#0a0a0a", "#1a1a1a", "#0f0f0f"]
            : ["#f0fdf4", "#ffffff", "#fafdf5"]
        }
        className="flex-1 items-center justify-center"
      >
        {/* Animated Brand Icon */}
        <Animated.View style={iconStyle}>
          <View
            style={{
              backgroundColor: isDark
                ? "rgba(204, 255, 0, 0.1)"
                : "rgba(132, 204, 22, 0.12)",
              borderColor: isDark
                ? "rgba(204, 255, 0, 0.25)"
                : "rgba(132, 204, 22, 0.25)",
            }}
            className="w-32 h-32 rounded-[36px] items-center justify-center mb-6 border-2"
          >
            <Animated.View style={logoStyle}>
              <MaterialCommunityIcons
                name="dumbbell"
                size={72}
                color={colors.primary[500]}
              />
            </Animated.View>
          </View>
        </Animated.View>

        {/* Brand Title with letter spacing */}
        <Animated.View style={logoStyle}>
          <Text
            style={{ color: isDark ? colors.text.dark : colors.text.light }}
            className="text-5xl font-extrabold tracking-tight"
          >
            AceKy{" "}
            <Text style={{ color: colors.primary[500] }}>AI</Text>
          </Text>
        </Animated.View>

        {/* Subtitle */}
        <Animated.View style={subtitleStyle}>
          <Text
            style={{
              color: isDark ? colors.text.secondary : colors.neutral[500],
            }}
            className="text-base font-medium mt-4 tracking-wide"
          >
            AI-Powered Food & Fitness Tracker
          </Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.View
          style={tagStyle}
          className="mt-12 flex-row items-center gap-2"
        >
          {["Scan", "Track", "Transform"].map((step, i) => (
            <View key={step} className="flex-row items-center">
              {i > 0 && (
                <View
                  style={{
                    backgroundColor: isDark
                      ? "rgba(204, 255, 0, 0.2)"
                      : "rgba(132, 204, 22, 0.2)",
                  }}
                  className="w-6 h-px mx-1"
                />
              )}
              <View
                style={{
                  backgroundColor: isDark
                    ? "rgba(204, 255, 0, 0.08)"
                    : "rgba(132, 204, 22, 0.08)",
                  borderColor: isDark
                    ? "rgba(204, 255, 0, 0.15)"
                    : "rgba(132, 204, 22, 0.15)",
                }}
                className="px-3 py-1.5 rounded-full border"
              >
                <Text
                  style={{ color: colors.primary[500] }}
                  className="text-[10px] font-black tracking-widest"
                >
                  {step.toUpperCase()}
                </Text>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* Loading indicator at bottom */}
        <Animated.View
          style={{ opacity: tagOpacity }}
          className="absolute bottom-16"
        >
          <View className="flex-row gap-1.5">
            {[0, 1, 2].map((i) => (
              <Dot key={i} delay={i * 200} />
            ))}
          </View>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

function Dot({ delay }: { delay: number }) {
  const dotOpacity = useSharedValue(0.3);

  useEffect(() => {
    const anim = withRepeat(
      withDelay(
        delay,
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    dotOpacity.value = anim;
  }, []);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
  }));

  return (
    <Animated.View
      style={[
        dotStyle,
        {
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: "#CCFF00",
        },
      ]}
    />
  );
}
