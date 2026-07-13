import { View, Text, ScrollView, TouchableOpacity, Alert, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Header } from "@/components/ui/Header";
import { useUserContext } from "@/context/UserContext";
import { useThemeContext } from "@/context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTabBarVisibility } from "@/context/TabBarVisibilityContext";

const MENU_ITEMS = [
  { title: "Notifications", route: "/settings/notifications", icon: "bell-outline" },
  { title: "Meal Reminders", route: "/settings/reminders", icon: "clock-outline" },
  { title: "Appearance", route: "/settings/appearance", icon: "palette-outline" },
  { title: "Privacy", route: "/settings/privacy", icon: "lock-outline" },
  { title: "Subscription", route: "/settings/subscription", icon: "star-outline" },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, onboardingData, isGuest, logout } = useUserContext();
  const { isDark, colors } = useThemeContext();
  const { handleScroll } = useTabBarVisibility();
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/splash");
        },
      },
    ]);
  };

  const activityLabel = onboardingData?.activityLevel
    ? onboardingData.activityLevel.replace("Active", "").replace("Moderately", "Mod").replace("Lightly", "Light").replace("Extremely", "High")
    : "—";

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? colors.background.dark : colors.background.light }}
      className="flex-1"
      edges={["top", "left", "right"]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Header title="Profile" />

      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
        className="flex-1 px-4"
      >
        {/* User Card */}
        <Card variant="outlined" className="flex-row items-center mb-4 p-4">
          <Avatar
            name={user?.name || "Alex"}
            imageUrl={user?.avatar}
            size={64}
          />
          <View className="ml-4 flex-1">
            <Text 
              style={{ color: isDark ? colors.text.dark : colors.text.light }}
              className="text-lg font-black"
            >
              {user?.name || "Alex Sarkar"}
            </Text>
            <Text 
              style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
              className="text-xs font-semibold mt-0.5"
            >
              {isGuest ? "Guest Session" : user?.email || "alex@aceky.ai"}
            </Text>
            <View className="flex-row gap-2 mt-2">
              <Badge label={isGuest ? "Guest" : "Free"} variant="neutral" size="sm" />
              {onboardingData?.goalType && (
                <Badge
                  label={onboardingData.goalType.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  variant="primary"
                  size="sm"
                />
              )}
            </View>
            {isGuest && (
              <TouchableOpacity onPress={() => router.replace("/(auth)/welcome")} className="mt-2.5">
                <Text style={{ color: colors.primary[500] }} className="text-xs font-bold">
                  Sign in to save your data →
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Card>

        {/* Stats Grid */}
        <Card variant="outlined" className="mb-4 p-4">
          <Text 
            style={{ color: isDark ? colors.text.dark : colors.text.light }}
            className="text-sm font-bold uppercase tracking-wider mb-4"
          >
            Your Stats
          </Text>
          <View className="flex-row justify-between">
            <View className="items-center flex-1">
              <Text style={{ color: isDark ? colors.text.dark : colors.text.light }} className="text-base font-black">
                {onboardingData?.age ?? "25"}
              </Text>
              <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-[10px] font-bold uppercase tracking-wider mt-1">
                Age
              </Text>
            </View>
            
            <View className="items-center flex-1 border-x border-neutral-200 dark:border-neutral-800">
              <Text style={{ color: isDark ? colors.text.dark : colors.text.light }} className="text-base font-black">
                {onboardingData?.heightCm ? `${onboardingData.heightCm} cm` : "175 cm"}
              </Text>
              <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-[10px] font-bold uppercase tracking-wider mt-1">
                Height
              </Text>
            </View>
            
            <View className="items-center flex-1 border-r border-neutral-200 dark:border-neutral-800">
              <Text style={{ color: isDark ? colors.text.dark : colors.text.light }} className="text-base font-black">
                {onboardingData?.weightKg ? `${onboardingData.weightKg} kg` : "55 kg"}
              </Text>
              <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-[10px] font-bold uppercase tracking-wider mt-1">
                Weight
              </Text>
            </View>
            
            <View className="items-center flex-1">
              <Text style={{ color: isDark ? colors.text.dark : colors.text.light }} className="text-base font-black text-center" numberOfLines={1}>
                {activityLabel}
              </Text>
              <Text style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }} className="text-[10px] font-bold uppercase tracking-wider mt-1">
                Activity
              </Text>
            </View>
          </View>
        </Card>

        {/* Menu Items */}
        <Card variant="outlined" className="mb-6 px-4 py-1">
          <View className="gap-0">
            {MENU_ITEMS.map((item, index) => {
              const isLast = index === MENU_ITEMS.length - 1;
              return (
                <TouchableOpacity
                  key={item.title}
                  onPress={() => router.push(item.route as any)}
                  style={{
                    borderBottomWidth: isLast ? 0 : 1,
                    borderBottomColor: isDark ? colors.border.dark : "rgba(0,0,0,0.05)",
                  }}
                  className="flex-row items-center py-4"
                  activeOpacity={0.7}
                >
                  <View 
                    style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" }}
                    className="w-9 h-9 rounded-xl items-center justify-center mr-3.5"
                  >
                    <MaterialCommunityIcons 
                      name={item.icon as any} 
                      size={18} 
                      color={isDark ? colors.text.secondary : colors.neutral[600]} 
                    />
                  </View>
                  <Text 
                    style={{ color: isDark ? colors.text.dark : colors.text.light }}
                    className="text-sm font-bold flex-1"
                  >
                    {item.title}
                  </Text>
                  <MaterialCommunityIcons 
                    name="chevron-right" 
                    size={20} 
                    color={isDark ? colors.text.secondary : colors.neutral[400]} 
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Logout button */}
        <TouchableOpacity 
          style={{ borderColor: colors.error[500], borderStyle: "dashed" }} 
          className="items-center justify-center py-3.5 rounded-2xl border-2 mb-4" 
          onPress={handleLogout}
        >
          <Text style={{ color: colors.error[500] }} className="text-sm font-bold">
            Log Out Account
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
