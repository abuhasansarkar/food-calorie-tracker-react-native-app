import { View, Text, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { useThemeContext } from "@/context/ThemeContext";
import { useSubscriptionContext } from "@/context/SubscriptionContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SubscriptionTier } from "@/types/subscription";

export default function SubscriptionScreen() {
  const router = useRouter();
  const { isDark, colors } = useThemeContext();
  const { plans, currentTier, isLoading } = useSubscriptionContext();
  const currentPlanLabel = currentTier === SubscriptionTier.Free ? "Free" : currentTier === SubscriptionTier.Premium ? "Premium" : "Premium Plus";

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? colors.background.dark : colors.background.light }}
      className="flex-1"
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Header title="Subscription" onBack={() => router.back()} />

      <Text 
        style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
        className="text-sm font-semibold px-4 mt-2 mb-4"
      >
        You&apos;re currently on the <Text style={{ color: colors.primary[500] }} className="font-extrabold">{currentPlanLabel}</Text> plan
      </Text>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} className="flex-1 px-4">
        {plans.map((plan, index) => {
          const isPopular = index === 1;
          const isCurrent = plan.tier === currentTier;
          return (
            <Card
              key={plan.id}
              variant="outlined"
              style={{
                borderColor: isCurrent
                  ? colors.primary[500]
                  : (isDark ? colors.border.dark : colors.border.light),
                borderWidth: isCurrent ? 2 : 1,
              }}
              className="mb-4 p-5"
            >
              {isPopular && !isCurrent && (
                <View 
                  style={{ backgroundColor: colors.primary[500] }} 
                  className="rounded-full px-3 py-1.5 self-start mb-4"
                >
                  <Text className="text-black text-[10px] font-black tracking-wider">
                    RECOMMENDED
                  </Text>
                </View>
              )}

              {isCurrent && (
                <View 
                  style={{ backgroundColor: colors.primary[500] }} 
                  className="rounded-full px-3 py-1.5 self-start mb-4"
                >
                  <Text className="text-black text-[10px] font-black tracking-wider">
                    CURRENT PLAN
                  </Text>
                </View>
              )}

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
                  {plan.interval && (
                    <Text 
                      style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
                      className="text-sm font-bold ml-1"
                    >
                      /{plan.interval}
                    </Text>
                  )}
                </View>
              </View>

              <View className="gap-2.5 mb-5">
                {plan.features.map((feature, i) => (
                  <View key={i} className="flex-row items-center gap-2.5">
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

              {!isCurrent ? (
                <Button
                  title={`Subscribe to ${plan.name}`}
                  onPress={() => {}}
                  variant={isPopular ? "primary" : "outline"}
                  disabled
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
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
