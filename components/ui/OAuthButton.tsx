import { TouchableOpacity, Text, View } from "react-native";
import { useThemeContext } from "@/context/ThemeContext";
import { radius } from "@/theme/radius";

export type OAuthProvider = "google" | "apple";

interface OAuthButtonProps {
  provider: OAuthProvider;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function OAuthButton({
  provider,
  onPress,
  loading = false,
  disabled = false,
}: OAuthButtonProps) {
  const { isDark, colors } = useThemeContext();

  const providerConfig = {
    google: {
      label: "Continue with Google",
      icon: "G",
      bgColor: isDark ? colors.surface.dark : colors.white,
      textColor: isDark ? colors.text.dark : colors.neutral[800],
      borderColor: isDark ? colors.border.dark : colors.neutral[300],
      iconBg: "#4285F4",
    },
    apple: {
      label: "Continue with Apple",
      icon: "",
      bgColor: isDark ? colors.surface.dark : colors.black,
      textColor: isDark ? colors.text.dark : colors.white,
      borderColor: isDark ? colors.border.dark : colors.black,
      iconBg: isDark ? "#1A1A1A" : colors.black,
    },
  };

  const config = providerConfig[provider];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className="flex-row items-center justify-center w-full"
      style={{
        backgroundColor: config.bgColor,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: radius.lg,
        borderWidth: 1.5,
        borderColor: config.borderColor,
        opacity: disabled ? 0.5 : 1,
      }}
      activeOpacity={0.8}
    >
      <View
        className="items-center justify-center mr-3"
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: config.iconBg,
        }}
      >
        <Text
          style={{
            color: colors.white,
            fontSize: 13,
            fontWeight: "700",
          }}
        >
          {config.icon}
        </Text>
      </View>

      <Text
        style={{
          color: loading ? colors.neutral[400] : config.textColor,
          fontSize: 16,
          fontWeight: "500",
        }}
      >
        {loading ? "Signing in..." : config.label}
      </Text>
    </TouchableOpacity>
  );
}
