import { useState } from "react";
import { View, Text, TouchableOpacity, StatusBar, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/ui/Header";
import { ActivityLevel } from "@/types/user";
import { useUserContext } from "@/context/UserContext";
import { useThemeContext } from "@/context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const LEVELS = [
  {
    key: ActivityLevel.Sedentary,
    label: "Low",
    description: "Little or no exercise",
  },
  {
    key: ActivityLevel.LightlyActive,
    label: "Lightly Active",
    description: "Light exercise 1-2 days/week",
  },
  {
    key: ActivityLevel.ModeratelyActive,
    label: "Moderate",
    description: "3-4 days / week",
  },
  {
    key: ActivityLevel.VeryActive,
    label: "High",
    description: "5-6 days / week",
  },
  {
    key: ActivityLevel.ExtremelyActive,
    label: "Very High",
    description: "Daily intense training",
  },
];

export default function ActivityLevelScreen() {
  const router = useRouter();
  const { saveOnboardingData, onboardingData } = useUserContext();
  const { isDark, colors } = useThemeContext();
  
  // Set default initial value from context if exists, else Moderate
  const initialValue = onboardingData?.activityLevel || ActivityLevel.ModeratelyActive;
  const [selected, setSelected] = useState<ActivityLevel | null>(initialValue);

  const handleNext = async () => {
    if (!selected) return;
    await saveOnboardingData({ activityLevel: selected });
    router.push("/(onboarding)/gym-experience");
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
            6 of 8
          </Text>
        }
      />

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }} className="flex-1 px-6">
        <View className="mb-8 mt-4">
          <Text 
            style={{ color: isDark ? colors.text.dark : colors.text.light }}
            className="text-3xl font-extrabold tracking-tight mb-2 text-center"
          >
            Activity level
          </Text>
          <Text 
            style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
            className="text-base font-medium text-center"
          >
            How active are you daily?
          </Text>
        </View>

        <View className="gap-3">
          {LEVELS.map((level) => {
            const isSelected = selected === level.key;
            return (
              <TouchableOpacity
                key={level.key}
                onPress={() => setSelected(level.key)}
                className="flex-row items-center justify-between p-4 rounded-2xl border-2"
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
