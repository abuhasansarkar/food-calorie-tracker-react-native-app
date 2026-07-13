import { View, Text, ScrollView, TouchableOpacity, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

import { useThemeContext } from "@/context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const PLANS = [
  {
    tier: "Free",
    price: "$0",
    period: "forever",
    features: [
      "3 daily AI scans",
      "7-day meal history",
      "Basic nutrition tracking",
      "Weight tracking",
    ],
  },
  {
    tier: "Premium",
    price: "$9.99",
    period: "/month",
    popular: true,
    features: [
      "50 daily AI scans",
      "90-day meal history",
      "Advanced nutrition insights",
      "Macro tracking",
      "Meal reminders",
      "Progress charts",
      "No ads",
    ],
  },
  {
    tier: "Premium Plus",
    price: "$19.99",
    period: "/month",
    features: [
      "Unlimited AI scans",
      "Unlimited meal history",
      "Personalized meal plans",
      "Recipe suggestions",
      "AI coach chat",
      "Priority support",
      "All Premium features",
    ],
  },
];

export default function PaywallScreen() {
  const router = useRouter();
  const { isDark, colors } = useThemeContext();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? colors.background.dark : colors.background.light }}
      className="flex-1"
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        className="flex-1"
      >
        {/* Header */}
        <View className="px-6 pt-10 pb-6 items-center">
          <View
            style={{
              backgroundColor: isDark ? "rgba(204, 255, 0, 0.08)" : "rgba(132, 204, 22, 0.08)",
              borderColor: isDark ? "rgba(204, 255, 0, 0.2)" : "rgba(132, 204, 22, 0.2)",
            }}
            className="w-16 h-16 rounded-2xl items-center justify-center mb-5 border-2"
          >
            <MaterialCommunityIcons name="star" size={32} color={colors.primary[500]} />
          </View>

          <Text
            style={{ color: isDark ? colors.text.dark : colors.text.light }}
            className="text-3xl font-extrabold tracking-tight text-center mb-2"
          >
            Unlock Premium
          </Text>
          <Text
            style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
            className="text-base font-medium text-center max-w-[280px]"
          >
            Get the most out of your nutrition journey
          </Text>
        </View>

        {/* Plans */}
        <View className="px-5 gap-4">
          {PLANS.map((plan) => (
            <Card
              key={plan.tier}
              variant={plan.popular ? "elevated" : "outlined"}
              style={{
                borderColor: plan.popular
                  ? colors.primary[500]
                  : isDark ? colors.border.dark : colors.border.light,
                borderWidth: plan.popular ? 2 : 1,
              }}
              className="p-5"
            >
              {plan.popular && (
                <View
                  style={{ backgroundColor: colors.primary[500] }}
                  className="rounded-full px-3 py-1.5 self-start mb-4"
                >
                  <Text className="text-black text-[10px] font-black tracking-wider">
                    MOST POPULAR
                  </Text>
                </View>
              )}

              {/* Tier name + price */}
              <View className="flex-row justify-between items-center mb-4">
                <Text
                  style={{ color: isDark ? colors.text.dark : colors.text.light }}
                  className="text-xl font-black"
                >
                  {plan.tier}
                </Text>
                <View className="flex-row items-baseline">
                  <Text
                    style={{ color: colors.primary[500] }}
                    className="text-2xl font-black tracking-tight"
                  >
                    {plan.price}
                  </Text>
                  <Text
                    style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
                    className="text-sm font-bold ml-1"
                  >
                    {plan.period}
                  </Text>
                </View>
              </View>

              {/* Features list */}
              <View className="gap-2.5 mb-5">
                {plan.features.map((feature, index) => (
                  <View key={index} className="flex-row items-center gap-2.5">
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={16}
                      color={colors.primary[500]}
                    />
                    <Text
                      style={{ color: isDark ? colors.text.secondary : colors.neutral[600] }}
                      className="text-sm font-semibold"
                    >
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>

                <Button
                  title={plan.tier === "Free" ? "Continue Free" : `Subscribe to ${plan.tier}`}
                  onPress={() => {
                    if (plan.tier === "Free") {
                      router.replace("/(tabs)/home");
                    }
                  }}
                  variant={plan.popular ? "primary" : "outline"}
                  disabled={plan.tier !== "Free"}
                  fullWidth
                />
            </Card>
          ))}
        </View>

        {/* Restore Purchases */}
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/home")}
          className="items-center py-8"
        >
          <Text
            style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
            className="text-sm font-semibold"
          >
            Restore Purchases
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
