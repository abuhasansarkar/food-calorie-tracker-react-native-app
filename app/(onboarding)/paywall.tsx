import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

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

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-6 pt-12 pb-6">
        <Text className="text-3xl font-bold text-gray-900 text-center mb-2">
          Unlock Premium
        </Text>
        <Text className="text-base text-gray-500 text-center">
          Get the most out of your nutrition journey
        </Text>
      </View>

      <View className="px-6 gap-4 pb-8">
        {PLANS.map((plan) => (
          <Card
            key={plan.tier}
            variant={plan.popular ? "elevated" : "outlined"}
            className={plan.popular ? "border-2 border-blue-500" : ""}
          >
            {plan.popular && (
              <View className="bg-blue-500 rounded-full px-3 py-1 self-start mb-3">
                <Text className="text-white text-xs font-bold">
                  MOST POPULAR
                </Text>
              </View>
            )}

            <Text className="text-xl font-bold text-gray-900">
              {plan.tier}
            </Text>
            <View className="flex-row items-baseline mt-2 mb-4">
              <Text className="text-3xl font-bold text-gray-900">
                {plan.price}
              </Text>
              <Text className="text-base text-gray-500 ml-1">
                {plan.period}
              </Text>
            </View>

            <View className="gap-3">
              {plan.features.map((feature, index) => (
                <View key={index} className="flex-row items-center gap-2">
                  <Text className="text-green-500 text-lg">✓</Text>
                  <Text className="text-sm text-gray-600">{feature}</Text>
                </View>
              ))}
            </View>

            <View className="mt-4">
              <Button
                title={plan.tier === "Free" ? "Continue Free" : `Subscribe to ${plan.tier}`}
                onPress={() => router.replace("/(tabs)/home")}
                variant={plan.popular ? "primary" : "outline"}
                fullWidth
              />
            </View>
          </Card>
        ))}
      </View>

      <TouchableOpacity
        onPress={() => router.replace("/(tabs)/home")}
        className="items-center pb-8"
      >
        <Text className="text-sm text-gray-500">Restore Purchases</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
