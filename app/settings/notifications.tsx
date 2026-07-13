import { useState } from "react";
import { ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "@/components/ui/Header";
import { Toggle } from "@/components/ui/Toggle";
import { Card } from "@/components/ui/Card";
import { useThemeContext } from "@/context/ThemeContext";
import { useRouter } from "expo-router";

export default function NotificationsScreen() {
  const router = useRouter();
  const { isDark, colors } = useThemeContext();
  const [settings, setSettings] = useState({
    mealReminders: true,
    weightReminders: true,
    streakAlerts: true,
    tipsAndTricks: false,
    promotions: false,
  });

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? colors.background.dark : colors.background.light }}
      className="flex-1"
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Header title="Notifications" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={{ paddingBottom: 24, paddingHorizontal: 16 }} className="flex-1 mt-4">
        <Card variant="outlined">
          <Toggle
            label="Meal Reminders"
            description="Get reminded to log your meals"
            value={settings.mealReminders}
            onValueChange={(v) =>
              setSettings((s) => ({ ...s, mealReminders: v }))
            }
          />
          <Toggle
            label="Weight Reminders"
            description="Weekly weigh-in reminders"
            value={settings.weightReminders}
            onValueChange={(v) =>
              setSettings((s) => ({ ...s, weightReminders: v }))
            }
          />
          <Toggle
            label="Streak Alerts"
            description="Notifications about your tracking streaks"
            value={settings.streakAlerts}
            onValueChange={(v) =>
              setSettings((s) => ({ ...s, streakAlerts: v }))
            }
          />
          <Toggle
            label="Tips & Tricks"
            description="Nutritional tips and advice"
            value={settings.tipsAndTricks}
            onValueChange={(v) =>
              setSettings((s) => ({ ...s, tipsAndTricks: v }))
            }
          />
          <Toggle
            label="Promotions"
            description="Special offers and promotions"
            value={settings.promotions}
            onValueChange={(v) =>
              setSettings((s) => ({ ...s, promotions: v }))
            }
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
