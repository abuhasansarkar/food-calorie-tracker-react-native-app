import { useState } from "react";
import { View, Text, TouchableOpacity, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/ui/Header";
import { Gender } from "@/types/user";
import { useUserContext } from "@/context/UserContext";
import { useThemeContext } from "@/context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const GENDERS = [
  { key: Gender.Male, label: "Male", icon: "gender-male" as const },
  { key: Gender.Female, label: "Female", icon: "gender-female" as const },
  { key: Gender.Other, label: "Other", icon: "gender-transgender" as const },
];

export default function GenderScreen() {
  const router = useRouter();
  const { saveOnboardingData } = useUserContext();
  const { isDark, colors } = useThemeContext();
  const [selected, setSelected] = useState<Gender | null>(null);

  const handleNext = async () => {
    if (!selected) return;
    await saveOnboardingData({ gender: selected });
    router.push("/(onboarding)/age");
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
            1 of 8
          </Text>
        }
      />

      <View className="flex-1 px-6 justify-center">
        <View className="mb-10">
          <Text 
            style={{ color: isDark ? colors.text.dark : colors.text.light }}
            className="text-3xl font-extrabold tracking-tight mb-2"
          >
            What&apos;s your gender?
          </Text>
          <Text 
            style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
            className="text-base font-medium"
          >
            This helps us personalize your experience
          </Text>
        </View>

        {/* Side-by-side cards for Male & Female, Other below */}
        <View className="gap-4">
          <View className="flex-row gap-4">
            {GENDERS.filter(g => g.key !== Gender.Other).map((gender) => {
              const isSelected = selected === gender.key;
              return (
                <TouchableOpacity
                  key={gender.key}
                  onPress={() => setSelected(gender.key)}
                  className="flex-1 items-center justify-center py-10 rounded-2xl border-2"
                  style={{
                    borderColor: isSelected
                      ? colors.primary[500]
                      : isDark ? colors.border.dark : colors.border.light,
                    backgroundColor: isSelected
                      ? (isDark ? "rgba(204, 255, 0, 0.05)" : "rgba(132, 204, 22, 0.05)")
                      : isDark ? colors.surface.dark : colors.white,
                  }}
                  activeOpacity={0.8}
                >
                  <View 
                    style={{ 
                      backgroundColor: isSelected 
                        ? colors.primary[500] 
                        : isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)" 
                    }}
                    className="w-14 h-14 rounded-full items-center justify-center mb-4"
                  >
                    <MaterialCommunityIcons
                      name={gender.icon}
                      size={28}
                      color={isSelected ? colors.black : (isDark ? colors.text.secondary : colors.neutral[500])}
                    />
                  </View>
                  <Text
                    style={{
                      color: isSelected ? colors.primary[500] : (isDark ? colors.text.dark : colors.text.light),
                    }}
                    className="text-base font-bold"
                  >
                    {gender.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Full-width card for Other */}
          {GENDERS.filter(g => g.key === Gender.Other).map((gender) => {
            const isSelected = selected === gender.key;
            return (
              <TouchableOpacity
                key={gender.key}
                onPress={() => setSelected(gender.key)}
                className="flex-row items-center p-5 rounded-2xl border-2"
                style={{
                  borderColor: isSelected
                    ? colors.primary[500]
                    : isDark ? colors.border.dark : colors.border.light,
                  backgroundColor: isSelected
                    ? (isDark ? "rgba(204, 255, 0, 0.05)" : "rgba(132, 204, 22, 0.05)")
                    : isDark ? colors.surface.dark : colors.white,
                }}
                activeOpacity={0.8}
              >
                <View 
                  style={{ 
                    backgroundColor: isSelected 
                      ? colors.primary[500] 
                      : isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)" 
                  }}
                  className="w-10 h-10 rounded-full items-center justify-center mr-4"
                >
                  <MaterialCommunityIcons
                    name={gender.icon}
                    size={20}
                    color={isSelected ? colors.black : (isDark ? colors.text.secondary : colors.neutral[500])}
                  />
                </View>
                <Text
                  style={{
                    color: isSelected ? colors.primary[500] : (isDark ? colors.text.dark : colors.text.light),
                  }}
                  className="text-base font-bold"
                >
                  {gender.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View className="px-6 pb-8 mt-auto">
        <Button
          title="Next"
          onPress={handleNext}
          disabled={!selected}
          size="lg"
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}
