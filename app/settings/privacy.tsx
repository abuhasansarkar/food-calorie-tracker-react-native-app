import { Text, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "@/components/ui/Header";
import { Toggle } from "@/components/ui/Toggle";
import { Card } from "@/components/ui/Card";
import { useThemeContext } from "@/context/ThemeContext";
import { useSettingsStore } from "@/store/settingsStore";
import { useRouter } from "expo-router";

export default function PrivacyScreen() {
  const router = useRouter();
  const { isDark, colors } = useThemeContext();
  const { settings, updateSettings } = useSettingsStore();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? colors.background.dark : colors.background.light }}
      className="flex-1"
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Header title="Privacy" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} className="flex-1 px-4 mt-4">
        <Card variant="outlined" className="mb-4">
          <Toggle
            label="Analytics"
            description="Help us improve by sharing usage data"
            value={settings.privacyAnalytics}
            onValueChange={(v) =>
              updateSettings({ privacyAnalytics: v })
            }
          />
          <Toggle
            label="Personalization"
            description="Personalized recommendations based on your data"
            value={settings.privacyPersonalization}
            onValueChange={(v) =>
              updateSettings({ privacyPersonalization: v })
            }
          />
          <Toggle
            label="Share with Research"
            description="Anonymized data for nutrition research"
            value={settings.shareData ?? false}
            onValueChange={(v) =>
              updateSettings({ shareData: v })
            }
          />
        </Card>

        <Card variant="filled">
          <Text 
            style={{ color: isDark ? colors.text.secondary : colors.neutral[600] }}
            className="text-sm leading-6 font-semibold"
          >
            Your privacy is important to us. We use industry-standard encryption
            to protect your data. You can learn more about our practices in our
            Privacy Policy.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
