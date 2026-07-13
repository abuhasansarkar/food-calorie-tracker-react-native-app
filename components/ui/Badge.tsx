import { View, Text } from "react-native";
import { useThemeContext } from "@/context/ThemeContext";
import { radius } from "@/theme/radius";

interface BadgeProps {
  label: string;
  variant?: "primary" | "success" | "warning" | "error" | "neutral";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Badge({
  label,
  variant = "primary",
  size = "md",
  className = "",
}: BadgeProps) {
  const { isDark, colors } = useThemeContext();

  const variantStyles = {
    primary: {
      bg: isDark ? "rgba(204, 255, 0, 0.12)" : colors.primary[50],
      text: isDark ? colors.primary[400] : colors.primary[700],
    },
    success: {
      bg: isDark ? "rgba(74, 204, 116, 0.12)" : colors.success[50],
      text: isDark ? colors.success[400] : colors.success[700],
    },
    warning: {
      bg: isDark ? "rgba(249, 204, 74, 0.12)" : colors.warning[50],
      text: isDark ? colors.warning[400] : colors.warning[700],
    },
    error: {
      bg: isDark ? "rgba(247, 74, 74, 0.12)" : colors.error[50],
      text: isDark ? colors.error[400] : colors.error[700],
    },
    neutral: {
      bg: isDark ? colors.neutral[800] : colors.neutral[100],
      text: isDark ? colors.neutral[300] : colors.neutral[700],
    },
  };

  const sizeStyles = {
    sm: { px: 6, py: 2, fontSize: 10 },
    md: { px: 8, py: 3, fontSize: 12 },
    lg: { px: 10, py: 4, fontSize: 14 },
  };

  const currentVariant = variantStyles[variant];
  const currentSize = sizeStyles[size];

  return (
    <View
      className={className}
      style={{
        backgroundColor: currentVariant.bg,
        paddingHorizontal: currentSize.px,
        paddingVertical: currentSize.py,
        borderRadius: radius.full,
        alignSelf: "flex-start",
      }}
    >
      <Text
        style={{
          color: currentVariant.text,
          fontSize: currentSize.fontSize,
          fontWeight: "600",
        }}
      >
        {label}
      </Text>
    </View>
  );
}
