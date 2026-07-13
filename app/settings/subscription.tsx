import { View, Text, ScrollView, SafeAreaView, StatusBar } from "react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { useThemeContext } from "@/context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const PLANS = [
  {
    tier: "Free",
    price: "$0",
    features: ["3 daily scans", "7-day history", "Basic tracking"],
  },
  {
    tier: "Premium",
    price: "$9.99",
    period: "/month",
    popular: true,
    features: [
      "50 daily scans",
      "90-day history",
      "Macro tracking",
      "No ads",
    ],
  },
  {
    tier: "Premium Plus",
    price: "$19.99",
    period: "/month",
    features: [
      "Unlimited scans",
      "Unlimited history",
      "Meal plans",
      "AI coach",
    ],
  },
];

export default function SubscriptionScreen() {
  const router = useRouter();
  const { isDark, colors } = useThemeContext();
  const currentPlan = "Free";

  return (
    <SafeAreaView
      style={{ backgroundColor: isDark ? colors.background.dark : colors.background.light }}
      className="flex-1"
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Header title="Subscription" onBack={() => router.back()} />

      <Text 
        style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
        className="text-sm font-semibold px-4 mt-2 mb-4"
      >
        You&apos;re currently on the <Text style={{ color: colors.primary[500] }} className="font-extrabold">{currentPlan}</Text> plan
      </Text>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} className="flex-1 px-4">
        {PLANS.map((plan) => (
          <Card
            key={plan.tier}
            variant={plan.popular ? "outlined" : "outlined"}
            style={{
              borderColor: plan.popular 
                ? colors.primary[500] 
                : (isDark ? colors.border.dark : colors.border.light),
              borderWidth: plan.popular ? 2 : 1,
            }}
            className="mb-4 p-5"
          >
            {plan.popular && (
              <View 
                style={{ backgroundColor: colors.primary[500] }} 
                className="rounded-full px-3 py-1.5 self-start mb-4"
              >
                <Text className="text-black text-[10px] font-black tracking-wider">
                  RECOMMENDED
                </Text>
              </View>
            )}

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
                {plan.period && (
                  <Text 
                    style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
                    className="text-sm font-bold ml-1"
                  >
                    {plan.period}
                  </Text>
                )}
              </View>
            </View>

            <View className="gap-2.5 mb-5">
              {plan.features.map((feature, index) => (
                <View key={index} className="flex-row items-center gap-2.5">
                  <MaterialCommunityIcons name="check-circle" size={16} color={colors.primary[500]} />
                  <Text 
                    style={{ color: isDark ? colors.text.secondary : colors.neutral[600] }}
                    className="text-sm font-semibold"
                  >
                    {feature}
                  </Text>
                </View>
              ))}
            </View>

            {plan.tier !== currentPlan ? (
              <Button
                title={`Subscribe to ${plan.tier}`}
                onPress={() => {}}
                variant={plan.popular ? "primary" : "outline"}
                fullWidth
              />
            ) : (
              <Button
                title="Current Plan"
                onPress={() => {}}
                disabled
                fullWidth
              />
            )}
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
