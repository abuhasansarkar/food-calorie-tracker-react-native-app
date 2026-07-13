import { useThemeContext } from "@/context/ThemeContext";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "xl";
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon,
  className = "",
  fullWidth = false,
}: ButtonProps) {
  const { isDark, colors } = useThemeContext();

  const sizeStyles = {
    sm: { py: spacing.xs, px: spacing.md },
    md: { py: spacing.md, px: spacing.xl },
    lg: { py: spacing.lg, px: spacing.xxl },
    xl: { py: spacing.xl, px: spacing.xxxl },
  };

  const variantStyles = {
    primary: {
      bg: colors.primary[500],
      text: colors.black, // Dark text on bright lime-green background
      border: colors.primary[500],
    },
    secondary: {
      bg: isDark ? "rgba(204, 255, 0, 0.1)" : colors.primary[50],
      text: isDark ? colors.primary[400] : colors.primary[700],
      border: isDark ? "rgba(204, 255, 0, 0.2)" : colors.primary[100],
    },
    outline: {
      bg: "transparent",
      text: colors.primary[500],
      border: colors.primary[500],
    },
    ghost: {
      bg: "transparent",
      text: colors.primary[500],
      border: "transparent",
    },
    danger: {
      bg: colors.error[500],
      text: colors.white,
      border: colors.error[500],
    },
  };

  const currentVariant = variantStyles[variant];
  const currentSize = sizeStyles[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`items-center justify-center flex-row ${fullWidth ? "w-full" : ""} ${className}`}
      style={{
        backgroundColor: disabled
          ? isDark
            ? colors.neutral[800]
            : colors.neutral[200]
          : currentVariant.bg,
        paddingVertical: currentSize.py,
        paddingHorizontal: currentSize.px,
        borderRadius: radius.lg,
        borderWidth: variant === "outline" || variant === "secondary" ? 1.5 : 0,
        borderColor: disabled
          ? isDark
            ? colors.neutral[800]
            : colors.neutral[200]
          : currentVariant.border,
        opacity: disabled ? 0.6 : 1,
      }}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={disabled ? colors.neutral[500] : currentVariant.text}
        />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon && icon}
          <Text
            style={{
              color: disabled ? colors.neutral[500] : currentVariant.text,
              fontSize: size === "sm" ? 14 : size === "xl" ? 18 : 16,
              fontWeight: "600",
            }}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
