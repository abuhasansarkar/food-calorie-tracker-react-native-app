import { Button } from "@/components/ui/Button";
import { startGuestSession } from "@/utils/guest";
import { useAuth } from "@clerk/expo";
import { useRouter } from "expo-router";
import { Text, View, StatusBar, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeContext } from "@/context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function WelcomeScreen() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { isDark, colors } = useThemeContext();

  const handleGuest = async () => {
    await startGuestSession();
    router.replace("/(onboarding)/gender");
  };

  if (isSignedIn) {
    return null;
  }

  return (
    <SafeAreaView 
      style={{ flex: 1, backgroundColor: isDark ? colors.background.dark : colors.background.light }}
      className="flex-1"
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Top Header Row for Guest Skip */}
      <View className="flex-row justify-between items-center px-6 py-4">
        <View className="flex-row items-center gap-1.5">
          <MaterialCommunityIcons name="dumbbell" size={24} color={colors.primary[500]} />
          <Text 
            style={{ color: isDark ? colors.text.dark : colors.text.light }}
            className="text-xl font-bold tracking-tight"
          >
            AceKy <Text style={{ color: colors.primary[500] }}>AI</Text>
          </Text>
        </View>

        <TouchableOpacity 
          onPress={handleGuest}
          className="px-3 py-1.5 rounded-full"
          style={{ backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)" }}
        >
          <Text 
            style={{ color: isDark ? colors.text.dark : colors.text.light }}
            className="text-xs font-semibold"
          >
            Skip
          </Text>
        </TouchableOpacity>
      </View>

      {/* Hero Visual Area with Glow Effect */}
      <View className="flex-1 justify-center items-center px-6 relative">
        {/* Decorative Radial Glows (absolute position) */}
        <View 
          style={{
            position: "absolute",
            width: 250,
            height: 250,
            borderRadius: 125,
            backgroundColor: colors.primary[500],
            opacity: isDark ? 0.08 : 0.04,
            top: "20%",
          }}
        />

        {/* Brand Icon Badge */}
        <View 
          style={{ 
            backgroundColor: isDark ? "rgba(204, 255, 0, 0.05)" : "rgba(132, 204, 22, 0.05)",
            borderColor: isDark ? "rgba(204, 255, 0, 0.15)" : "rgba(132, 204, 22, 0.15)",
          }}
          className="w-24 h-24 rounded-[28px] items-center justify-center mb-8 border-2"
        >
          <MaterialCommunityIcons 
            name="dumbbell" 
            size={52} 
            color={colors.primary[500]} 
          />
        </View>

        {/* Motivational Onboarding Slogan (Matching the reference mockup) */}
        <Text 
          style={{ color: isDark ? colors.text.dark : colors.text.light }}
          className="text-4xl font-extrabold text-center tracking-tight leading-[46px] mb-4"
        >
          Build Muscle.{"\n"}
          Gain Weight.{"\n"}
          <Text style={{ color: colors.primary[500] }}>Be Unstoppable.</Text>
        </Text>

        <Text 
          style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
          className="text-base text-center font-medium max-w-[280px] leading-6"
        >
          AI guidance. High calorie food. Real results.
        </Text>
      </View>

      {/* Buttons Area */}
      <View className="px-6 pb-8 gap-4">
        <Button
          title="Get Started"
          onPress={() => router.push("/(auth)/register")}
          variant="primary"
          size="lg"
          fullWidth
        />

        <View className="flex-row justify-center items-center py-2">
          <Text 
            style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
            className="text-sm font-medium"
          >
            Already have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text 
              style={{ color: colors.primary[500] }}
              className="text-sm font-bold"
            >
              Sign In
            </Text>
          </TouchableOpacity>
        </View>

        <Text 
          style={{ color: isDark ? colors.text.tertiary : colors.neutral[400] }}
          className="text-[11px] text-center leading-4 px-4"
        >
          By continuing, you agree to our{" "}
          <Text style={{ color: colors.primary[500] }} className="font-bold" onPress={() => {}}>
            Terms of Service
          </Text>{" "}
          and{" "}
          <Text style={{ color: colors.primary[500] }} className="font-bold" onPress={() => {}}>
            Privacy Policy
          </Text>.
        </Text>
      </View>
    </SafeAreaView>
  );
}
