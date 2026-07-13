import { useEffect, useState, useRef } from "react";
import { View, Text, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Loader } from "@/components/ui/Loader";
import { useThemeContext } from "@/context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { aiService } from "@/services/ai";

export default function AnalyzingScreen() {
  const router = useRouter();
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const { isDark, colors } = useThemeContext();
  const [dots, setDots] = useState("");
  const [statusText, setStatusText] = useState("Analyzing");
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    if (imageUri) {
      setStatusText("Analyzing");
      aiService
        .analyzeFoodImage(imageUri)
        .then((result) => {
          router.replace({
            pathname: "/meal/result",
            params: {
              imageUri,
              scannedData: JSON.stringify(result),
            },
          });
        })
        .catch(() => {
          router.replace({
            pathname: "/meal/result",
            params: imageUri ? { imageUri } : {},
          });
        });
    } else {
      // No image URI - go to result in manual mode after a brief delay
      const timer = setTimeout(() => {
        router.replace({ pathname: "/meal/result" });
      }, 500);
      return () => {
        clearInterval(dotInterval);
        clearTimeout(timer);
      };
    }

    return () => {
      clearInterval(dotInterval);
    };
  }, []);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? colors.background.dark : colors.background.light }}
      className="flex-1 justify-center px-6"
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View className="items-center">
        <View
          style={{ backgroundColor: isDark ? "rgba(204, 255, 0, 0.08)" : "rgba(132, 204, 22, 0.08)" }}
          className="w-24 h-24 rounded-full items-center justify-center mb-6"
        >
          <MaterialCommunityIcons name="robot" size={44} color={colors.primary[500]} />
        </View>
        <Text
          style={{ color: isDark ? colors.text.dark : colors.text.light }}
          className="text-2xl font-black mb-2 text-center"
        >
          {statusText}{dots}
        </Text>
        <Text
          style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
          className="text-base font-semibold text-center mb-8 px-4"
        >
          Our AI is identifying the foods in your image
        </Text>
        <Loader size="large" color={colors.primary[500]} />
        <View className="flex-row gap-6 mt-12">
          <View className="items-center">
            <View
              style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" }}
              className="w-10 h-10 rounded-full items-center justify-center"
            >
              <MaterialCommunityIcons name="magnify" size={20} color={isDark ? colors.text.secondary : colors.neutral[600]} />
            </View>
            <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-xs font-semibold mt-2">Detecting</Text>
          </View>
          <View className="items-center">
            <View
              style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" }}
              className="w-10 h-10 rounded-full items-center justify-center"
            >
              <MaterialCommunityIcons name="scale" size={20} color={isDark ? colors.text.secondary : colors.neutral[600]} />
            </View>
            <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-xs font-semibold mt-2">Measuring</Text>
          </View>
          <View className="items-center">
            <View
              style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" }}
              className="w-10 h-10 rounded-full items-center justify-center"
            >
              <MaterialCommunityIcons name="calculator" size={20} color={isDark ? colors.text.secondary : colors.neutral[600]} />
            </View>
            <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-xs font-semibold mt-2">Calculating</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}