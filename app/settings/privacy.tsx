import { useState } from "react";
import { View, Text, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "@/components/ui/Header";
import { Toggle } from "@/components/ui/Toggle";
import { Card } from "@/components/ui/Card";
import { useThemeContext } from "@/context/ThemeContext";
import { useRouter } from "expo-router";

export default function PrivacyScreen() {
  const router = useRouter();
  const { isDark, colors } = useThemeContext();
  const [settings, setSettings] = useState({
    analytics: true,
    personalization: true,
    shareData: false,
  });

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
            value={settings.analytics}
            onValueChange={(v) =>
              setSettings((s) => ({ ...s, analytics: v }))
            }
          />
          <Toggle
            label="Personalization"
            description="Personalized recommendations based on your data"
            value={settings.personalization}
            onValueChange={(v) =>
              setSettings((s) => ({ ...s, personalization: v }))
            }
          />
          <Toggle
            label="Share with Research"
            description="Anonymized data for nutrition research"
            value={settings.shareData}
            onValueChange={(v) =>
              setSettings((s) => ({ ...s, shareData: v }))
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
