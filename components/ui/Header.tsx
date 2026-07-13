import { View, Text, TouchableOpacity } from "react-native";
import { useThemeContext } from "@/context/ThemeContext";
import { spacing } from "@/theme/spacing";

interface HeaderProps {
  title: string;
  subtitle?: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  onBack?: () => void;
  className?: string;
}

export function Header({
  title,
  subtitle,
  leftAction,
  rightAction,
  onBack,
  className = "",
}: HeaderProps) {
  const { isDark, colors } = useThemeContext();

  return (
    <View
      className={`flex-row items-center justify-between px-4 py-3 ${className}`}
    >
      <View className="flex-row items-center gap-3 flex-1">
        {leftAction || (
          onBack && (
            <TouchableOpacity onPress={onBack} style={{ padding: spacing.xs }}>
              <Text style={{ fontSize: 24, color: isDark ? colors.text.dark : colors.neutral[700] }}>
                ←
              </Text>
            </TouchableOpacity>
          )
        )}

        <View className="flex-1">
          <Text
            numberOfLines={1}
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: isDark ? colors.text.dark : colors.text.light,
            }}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              numberOfLines={1}
              style={{
                fontSize: 13,
                color: isDark ? colors.text.secondary : colors.neutral[500],
                marginTop: 1,
              }}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {rightAction && (
        <View className="ml-auto">{rightAction}</View>
      )}
    </View>
  );
}
