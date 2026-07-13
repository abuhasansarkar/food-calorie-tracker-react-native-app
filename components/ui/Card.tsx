import { useThemeContext } from "@/context/ThemeContext";
import { radius } from "@/theme/radius";
import { shadows } from "@/theme/shadows";
import { spacing } from "@/theme/spacing";
import React from "react";
import { View } from "react-native";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "elevated" | "outlined" | "filled";
  padding?: keyof typeof spacing;
  style?: Record<string, unknown>;
}

export function Card({
  children,
  className = "",
  variant = "elevated",
  padding = "lg",
}: CardProps) {
  const { isDark, colors } = useThemeContext();

  const variantStyles = {
    elevated: {
      backgroundColor: isDark ? colors.surface.dark : colors.white,
      borderWidth: isDark ? 1 : 0,
      borderColor: isDark ? colors.border.dark : "transparent",
      ...(isDark ? {} : shadows.md),
    },
    outlined: {
      backgroundColor: isDark ? colors.surface.dark : colors.white,
      borderWidth: 1,
      borderColor: isDark ? colors.border.dark : colors.border.light,
    },
    filled: {
      backgroundColor: isDark ? colors.surface.dark : colors.surface.light,
      borderWidth: isDark ? 1 : 0,
      borderColor: isDark ? colors.border.dark : "transparent",
    },
  };

  return (
    <View
      className={className}
      style={{
        ...variantStyles[variant],
        borderRadius: radius.xl,
        padding: spacing[padding],
      }}
    >
      {children}
    </View>
  );
}
