import { View, Text, ScrollView, TouchableOpacity, StatusBar, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useState } from "react";
import { useThemeContext } from "@/context/ThemeContext";
import { useSubscriptionContext } from "@/context/SubscriptionContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SubscriptionTier } from "@/types/subscription";

export default function PaywallScreen() {
  const router = useRouter();
  const { isDark, colors } = useThemeContext();
  const { plans, refreshSubscription } = useSubscriptionContext();
  const [subscribingId, setSubscribingId] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    setSubscribingId(planId);
    // In production, this would trigger an in-app purchase flow
    // For now, simulate subscription activation
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await refreshSubscription();
      router.replace("/(tabs)/home");
    } catch {
      Alert.alert("Subscription Error", "Unable to process subscription. Please try again.");
    } finally {
      setSubscribingId(null);
    }
  };

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
          {plans.map((plan, index) => {
            const isPopular = index === 1;
            const isFree = plan.tier === SubscriptionTier.Free;
            return (
              <Card
                key={plan.id}
                variant={isPopular ? "elevated" : "outlined"}
                style={{
                  borderColor: isPopular
                    ? colors.primary[500]
                    : isDark ? colors.border.dark : colors.border.light,
                  borderWidth: isPopular ? 2 : 1,
                }}
                className="p-5"
              >
                {isPopular && (
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
                    {plan.name}
                  </Text>
                  <View className="flex-row items-baseline">
                    <Text
                      style={{ color: colors.primary[500] }}
                      className="text-2xl font-black tracking-tight"
                    >
                      ${plan.price}
                    </Text>
                    <Text
                      style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
                      className="text-sm font-bold ml-1"
                    >
                      {isFree ? "forever" : `/${plan.interval}`}
                    </Text>
                  </View>
                </View>

                {/* Features list */}
                <View className="gap-2.5 mb-5">
                  {plan.features.map((feature, i) => (
                    <View key={i} className="flex-row items-center gap-2.5">
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
                  title={isFree ? "Continue Free" : `Subscribe - $${plan.price}/${plan.interval}`}
                  onPress={() => {
                    if (isFree) {
                      router.replace("/(tabs)/home");
                    } else {
                      handleSubscribe(plan.id);
                    }
                  }}
                  variant={isPopular ? "primary" : "outline"}
                  loading={subscribingId === plan.id}
                  disabled={subscribingId !== null}
                  fullWidth
                />
              </Card>
            );
          })}
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
