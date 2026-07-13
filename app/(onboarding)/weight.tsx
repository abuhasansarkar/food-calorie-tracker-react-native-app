import { useState } from "react";
import { View, Text, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/ui/Header";
import { ScrollRuler } from "@/components/ui/ScrollRuler";
import { useUserContext } from "@/context/UserContext";
import { useThemeContext } from "@/context/ThemeContext";

const MIN_WEIGHT = 30;
const MAX_WEIGHT = 180;
const DEFAULT_WEIGHT = 55;

export default function WeightScreen() {
  const router = useRouter();
  const { saveOnboardingData, onboardingData } = useUserContext();
  const { isDark, colors } = useThemeContext();
  const [selectedWeight, setSelectedWeight] = useState(
    onboardingData?.weightKg || DEFAULT_WEIGHT,
  );

  const handleNext = () => {
    saveOnboardingData({ weightKg: selectedWeight });
    router.push("/(onboarding)/goal-weight");
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? colors.background.dark : colors.background.light }}
      className="flex-1"
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Header
        title=""
        onBack={() => router.back()}
        rightAction={
          <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-sm font-semibold tracking-wider">
            4 of 8
          </Text>
        }
      />
      <View className="flex-1 justify-center">
        <View className="px-6 mb-12">
          <Text style={{ color: isDark ? colors.text.dark : colors.text.light }} className="text-3xl font-extrabold tracking-tight mb-2 text-center">
            What's your current weight?
          </Text>
          <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-base font-medium text-center">
            This helps us track your progress accurately
          </Text>
        </View>
        <View className="items-center mb-8">
          <View className="flex-row items-baseline justify-center">
            <Text style={{ color: colors.primary[500] }} className="text-6xl font-black tracking-tighter">
              {selectedWeight}
            </Text>
            <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-xl font-bold ml-1">
              kg
            </Text>
          </View>
        </View>
        <ScrollRuler
          minValue={MIN_WEIGHT}
          maxValue={MAX_WEIGHT}
          defaultValue={selectedWeight}
          unit="kg"
          onValueChange={setSelectedWeight}
        />
      </View>
      <View className="px-6 pb-8 mt-auto">
        <Button title="Next" onPress={handleNext} size="lg" fullWidth />
      </View>
    </SafeAreaView>
  );
}
