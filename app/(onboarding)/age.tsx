import { useState } from "react";
import { View, Text, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Header } from "@/components/ui/Header";
import { useUserContext } from "@/context/UserContext";
import { useThemeContext } from "@/context/ThemeContext";
import { validateAge } from "@/utils/validation";

export default function AgeScreen() {
  const router = useRouter();
  const { saveOnboardingData } = useUserContext();
  const { isDark, colors } = useThemeContext();
  const [age, setAge] = useState("");
  const [error, setError] = useState("");

  const handleNext = () => {
    const numAge = parseInt(age, 10);
    const validation = validateAge(numAge);
    if (!validation.isValid) {
      setError(validation.error!);
      return;
    }

    saveOnboardingData({ age: numAge });
    router.push("/(onboarding)/height");
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
          <Text
            style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
            className="text-sm font-semibold tracking-wider"
          >
            2 of 8
          </Text>
        }
      />

      <View className="flex-1 px-6 justify-center">
        <View className="mb-8">
          <Text 
            style={{ color: isDark ? colors.text.dark : colors.text.light }}
            className="text-3xl font-extrabold tracking-tight mb-2"
          >
            How old are you?
          </Text>
          <Text 
            style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
            className="text-base font-medium"
          >
            Your age helps us determine your metabolic rate
          </Text>
        </View>

        <Input
          value={age}
          onChangeText={(text) => {
            setAge(text.replace(/[^0-9]/g, ""));
            setError("");
          }}
          placeholder="Enter your age"
          keyboardType="numeric"
          error={error}
        />
      </View>

      <View className="px-6 pb-8 mt-auto">
        <Button
          title="Next"
          onPress={handleNext}
          disabled={!age}
          size="lg"
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}
