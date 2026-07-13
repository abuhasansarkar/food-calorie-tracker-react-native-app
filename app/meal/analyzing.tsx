import { useEffect, useState, useRef } from "react";
import { View, Text, StatusBar, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useThemeContext } from "@/context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { aiService } from "@/services/ai";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  FadeIn,
  FadeInDown,
} from "react-native-reanimated";

const STEPS = [
  { key: "detecting", icon: "magnify", label: "Detecting", description: "Identifying food items" },
  { key: "measuring", icon: "scale", label: "Measuring", description: "Estimating portion sizes" },
  { key: "calculating", icon: "calculator", label: "Calculating", description: "Computing nutrition data" },
  { key: "analyzing", icon: "brain", label: "Analyzing", description: "Cross-referencing databases" },
];

export default function AnalyzingScreen() {
  const router = useRouter();
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const { isDark, colors } = useThemeContext();
  const [statusText, setStatusText] = useState("Analyzing");
  const [dots, setDots] = useState("");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const startedRef = useRef(false);

  // Scan ring animation
  const scanRotation = useSharedValue(0);
  const scanScale = useSharedValue(1);

  useEffect(() => {
    scanRotation.value = withRepeat(
      withTiming(360, { duration: 3000, easing: Easing.linear }),
      -1,
    );
    scanScale.value = withRepeat(
      withTiming(1.15, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, []);

  // Step progression
  useEffect(() => {
    if (failed || currentStepIndex >= STEPS.length - 1) return;
    const timer = setTimeout(() => {
      setCurrentStepIndex((prev) => prev + 1);
    }, 3000);
    return () => clearTimeout(timer);
  }, [currentStepIndex, failed]);

  // Dots animation
  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(dotInterval);
  }, []);

  // API call
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    if (!imageUri) {
      router.replace({ pathname: "/meal/result" });
      return;
    }

    let cancelled = false;
    setStatusText("Analyzing");

    const callApi = async (retries = 0): Promise<void> => {
      if (cancelled) return;
      try {
        const result = await aiService.analyzeFoodImage(imageUri);
        if (cancelled) return;
        if (!result.foods || result.foods.length === 0) {
          throw new Error("No foods detected");
        }
        const validFoods = result.foods.filter(
          (f) => f.calories > 0 && f.name && f.name.trim().length > 0,
        );
        if (validFoods.length === 0) {
          throw new Error("Invalid food data");
        }
        setCurrentStepIndex(STEPS.length - 1);
        if (!cancelled) {
          await new Promise((r) => setTimeout(r, 800));
        }
        if (cancelled) return;
        router.replace({
          pathname: "/meal/result",
          params: {
            imageUri,
            scannedData: JSON.stringify({
              ...result,
              foods: validFoods,
            }),
          },
        });
      } catch (error) {
        if (cancelled) return;
        if (retries < 2) {
          setCurrentStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1));
          if (!cancelled) {
            await new Promise((r) => setTimeout(r, 2000));
          }
          if (cancelled) return;
          return callApi(retries + 1);
        }
        setFailed(true);
        if (!cancelled) {
          await new Promise((r) => setTimeout(r, 1500));
        }
        if (cancelled) return;
        router.replace({
          pathname: "/meal/result",
          params: { imageUri },
        });
      }
    };

    callApi();

    return () => {
      cancelled = true;
    };
  }, []);

  const scanRingStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${scanRotation.value}deg` },
      { scale: scanScale.value },
    ],
  }));

  const innerRingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${-scanRotation.value * 0.7}deg` }],
  }));

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: isDark ? colors.background.dark : colors.background.light,
      }}
      className="flex-1"
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Background Image with Overlay */}
      {imageUri && (
        <View className="absolute inset-0">
          <Image
            source={{ uri: imageUri }}
            style={{ width: "100%", height: "100%" }}
            blurRadius={60}
          />
          <View
            className="absolute inset-0"
            style={{
              backgroundColor: isDark
                ? "rgba(0,0,0,0.7)"
                : "rgba(255,255,255,0.75)",
            }}
          />
        </View>
      )}

      {/* Content */}
      <View className="flex-1 items-center justify-center px-6">
        {/* Scanning Radar Ring */}
        <View className="w-44 h-44 items-center justify-center mb-8">
          {/* Outer spinning ring */}
          <Animated.View
            style={[
              scanRingStyle,
              {
                position: "absolute",
                width: 176,
                height: 176,
                borderRadius: 88,
                borderWidth: 2,
                borderColor: "transparent",
                borderTopColor: colors.primary[500],
                borderRightColor: colors.primary[400],
              },
            ]}
          />
          {/* Inner counter-rotating ring */}
          <Animated.View
            style={[
              innerRingStyle,
              {
                position: "absolute",
                width: 140,
                height: 140,
                borderRadius: 70,
                borderWidth: 1.5,
                borderColor: "transparent",
                borderBottomColor: colors.primary[500],
                borderLeftColor: colors.primary[400],
                opacity: 0.6,
              },
            ]}
          />
          {/* Pulsing dot in center */}
          <View
            style={{
              backgroundColor: colors.primary[500],
              width: 12,
              height: 12,
              borderRadius: 6,
              opacity: 0.8,
            }}
          />
          {/* Center icon */}
          <View className="absolute">
            {failed ? (
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={48}
                color="#EF4444"
              />
            ) : (
              <MaterialCommunityIcons
                name="food-apple"
                size={46}
                color={colors.primary[500]}
              />
            )}
          </View>
        </View>

        {/* Status Text */}
        <Text
          style={{
            color: failed ? "#EF4444" : isDark ? colors.text.dark : colors.text.light,
          }}
          className="text-2xl font-black mb-2 text-center"
        >
          {failed ? "Scan Failed" : `${statusText}${dots}`}
        </Text>
        <Text
          style={{
            color: failed
              ? "#EF4444"
              : isDark
                ? colors.text.secondary
                : colors.neutral[500],
          }}
          className="text-sm font-semibold text-center mb-10 px-8 leading-5"
        >
          {failed
            ? "Could not analyze the image. Showing sample data instead."
            : "Our AI is identifying the foods in your image"}
        </Text>

        {/* Steps timeline */}
        <View className="w-full max-w-xs gap-4">
          {STEPS.map((step, index) => {
            const isActive = index === currentStepIndex && !failed;
            const isCompleted = index < currentStepIndex || failed;
            const isPending = index > currentStepIndex;

            return (
              <Animated.View
                key={step.key}
                entering={FadeInDown.delay(200 + index * 150).duration(400)}
                className="flex-row items-center gap-4"
              >
                {/* Step indicator */}
                <View
                  style={{
                    backgroundColor: isCompleted
                      ? colors.primary[500]
                      : isActive
                        ? "rgba(204, 255, 0, 0.15)"
                        : isDark
                          ? "rgba(255,255,255,0.05)"
                          : "rgba(0,0,0,0.04)",
                    borderColor: isCompleted
                      ? colors.primary[500]
                      : isActive
                        ? colors.primary[500]
                        : isDark
                          ? colors.border.dark
                          : colors.neutral[200],
                  }}
                  className="w-10 h-10 rounded-full items-center justify-center border"
                >
                  {isCompleted ? (
                    <MaterialCommunityIcons
                      name="check"
                      size={18}
                      color={isDark ? "#000" : "#000"}
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name={step.icon as any}
                      size={18}
                      color={
                        isActive
                          ? colors.primary[500]
                          : isDark
                            ? colors.text.secondary
                            : colors.neutral[400]
                      }
                    />
                  )}
                </View>

                {/* Step text */}
                <View className="flex-1">
                  <Text
                    style={{
                      color: isCompleted
                        ? colors.primary[500]
                        : isActive
                          ? isDark
                            ? colors.text.dark
                            : colors.text.light
                          : isDark
                            ? colors.text.secondary
                            : colors.neutral[400],
                      fontWeight: isActive || isCompleted ? "700" : "500",
                    }}
                    className="text-sm"
                  >
                    {step.label}
                  </Text>
                  <Text
                    style={{
                      color: isDark ? colors.text.secondary : colors.neutral[500],
                    }}
                    className="text-[10px] font-medium mt-0.5"
                  >
                    {step.description}
                  </Text>
                </View>

                {/* Spinner for active step */}
                {isActive && <StepSpinner color={colors.primary[500]} />}
              </Animated.View>
            );
          })}
        </View>

        {/* Retry badge */}
        {!failed && (
          <Animated.Text
            entering={FadeIn.duration(600)}
            style={{ color: isDark ? colors.text.secondary : colors.neutral[400] }}
            className="text-[11px] font-medium mt-10 text-center"
          >
            Analyzing with AI nutrition database
          </Animated.Text>
        )}
      </View>
    </SafeAreaView>
  );
}

function StepSpinner({ color }: { color: string }) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 800, easing: Easing.linear }),
      -1,
    );
  }, []);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View
      style={[
        spinStyle,
        {
          width: 16,
          height: 16,
          borderRadius: 8,
          borderWidth: 2,
          borderColor: color,
          borderTopColor: "transparent",
        },
      ]}
    />
  );
}
