import { useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/ui/Header";
import { GymExperience } from "@/types/user";
import { useUserContext } from "@/context/UserContext";
import { useThemeContext } from "@/context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const LEVELS = [
  {
    key: GymExperience.Beginner,
    label: "Beginner",
    description: "New to fitness",
  },
  {
    key: GymExperience.Intermediate,
    label: "Intermediate",
    description: "1-2 years",
  },
  {
    key: GymExperience.Advanced,
    label: "Advanced",
    description: "2+ years",
  },
];

export default function GymExperienceScreen() {
  const router = useRouter();
  const { saveOnboardingData, onboardingData } = useUserContext();
  const { isDark, colors } = useThemeContext();
  
  const initialValue = onboardingData?.gymExperience || GymExperience.Beginner;
  const [selected, setSelected] = useState<GymExperience | null>(initialValue);

  const handleNext = async () => {
    if (!selected) return;
    await saveOnboardingData({ gymExperience: selected });
    router.push("/(onboarding)/goal");
  };

  return (
    <SafeAreaView
      style={{ backgroundColor: isDark ? colors.background.dark : colors.background.light }}
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
            6 of 7
          </Text>
        }
      />

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }} className="flex-1 px-6">
        <View className="mb-8 mt-4">
          <Text 
            style={{ color: isDark ? colors.text.dark : colors.text.light }}
            className="text-3xl font-extrabold tracking-tight mb-2 text-center"
          >
            Gym experience
          </Text>
          <Text 
            style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
            className="text-base font-medium text-center"
          >
            How experienced are you?
          </Text>
        </View>

        <View className="gap-3">
          {LEVELS.map((level) => {
            const isSelected = selected === level.key;
            return (
              <TouchableOpacity
                key={level.key}
                onPress={() => setSelected(level.key)}
                className="flex-row items-center justify-between p-5 rounded-2xl border-2"
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
                <View className="flex-1 pr-4">
                  <Text
                    style={{
                      color: isSelected ? colors.primary[500] : (isDark ? colors.text.dark : colors.text.light),
                    }}
                    className="text-lg font-bold"
                  >
                    {level.label}
                  </Text>
                  <Text 
                    style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
                    className="text-sm mt-0.5 font-medium"
                  >
                    {level.description}
                  </Text>
                </View>

                {/* Radio selection circle */}
                <View 
                  style={{ 
                    borderColor: isSelected ? colors.primary[500] : (isDark ? colors.border.dark : colors.border.light),
                    backgroundColor: isSelected ? colors.primary[500] : "transparent"
                  }}
                  className="w-6 h-6 rounded-full border-2 items-center justify-center"
                >
                  {isSelected && (
                    <MaterialCommunityIcons name="check" size={14} color={colors.black} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="mt-8">
          <Button
            title="Next"
            onPress={handleNext}
            disabled={!selected}
            size="lg"
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
