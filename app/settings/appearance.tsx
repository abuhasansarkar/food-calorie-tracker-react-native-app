import { View, Text, TouchableOpacity, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "@/components/ui/Header";
import { Card } from "@/components/ui/Card";
import { useThemeContext } from "@/context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const THEMES = [
  { key: "system", label: "System", icon: "cellphone" as const },
  { key: "light", label: "Light", icon: "white-balance-sunny" as const },
  { key: "dark", label: "Dark", icon: "weather-night" as const },
];

export default function AppearanceScreen() {
  const router = useRouter();
  const { mode, setMode, isDark, colors } = useThemeContext();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? colors.background.dark : colors.background.light }}
      className="flex-1"
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Header title="Appearance" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} className="flex-1 px-4 mt-4">
        <Card variant="outlined">
          <Text 
            style={{ color: isDark ? colors.text.dark : colors.text.light }}
            className="text-base font-bold mb-4"
          >
            Theme Mode
          </Text>
          
          <View className="gap-3">
            {THEMES.map((theme) => {
              const isSelected = mode === theme.key;
              return (
                <TouchableOpacity
                  key={theme.key}
                  onPress={() => setMode(theme.key as any)}
                  className="flex-row items-center p-4 rounded-2xl border-2"
                  style={{
                    borderColor: isSelected
                      ? colors.primary[500]
                      : (isDark ? colors.border.dark : colors.border.light),
                    backgroundColor: isSelected
                      ? (isDark ? "rgba(204, 255, 0, 0.05)" : "rgba(132, 204, 22, 0.05)")
                      : (isDark ? colors.surface.dark : colors.white),
                  }}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name={theme.icon}
                    size={22}
                    color={isSelected ? colors.primary[500] : (isDark ? colors.text.secondary : colors.neutral[500])}
                  />
                  <Text
                    style={{
                      color: isSelected 
                        ? colors.primary[500] 
                        : (isDark ? colors.text.dark : colors.neutral[800]),
                      fontWeight: isSelected ? "700" : "500",
                    }}
                    className="text-base flex-1 ml-3"
                  >
                    {theme.label}
                  </Text>
                  {isSelected && (
                    <MaterialCommunityIcons name="check" size={20} color={colors.primary[500]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
