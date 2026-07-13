import { View, Text, Switch } from "react-native";
import { useThemeContext } from "@/context/ThemeContext";

interface ToggleProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function Toggle({
  label,
  value,
  onValueChange,
  description,
  disabled = false,
  className = "",
}: ToggleProps) {
  const { isDark, colors } = useThemeContext();

  return (
    <View
      className={`flex-row items-center justify-between py-3.5 ${className}`}
    >
      <View className="flex-1 mr-4">
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: disabled 
              ? (isDark ? colors.neutral[600] : colors.neutral[400]) 
              : (isDark ? colors.text.dark : colors.neutral[900]),
          }}
        >
          {label}
        </Text>
        {description && (
          <Text
            style={{
              fontSize: 13,
              color: isDark ? colors.text.secondary : colors.neutral[500],
              marginTop: 3,
              fontWeight: "500",
            }}
          >
            {description}
          </Text>
        )}
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        accessibilityLabel={label}
        trackColor={{
          false: isDark ? colors.neutral[800] : colors.neutral[300],
          true: isDark ? "rgba(204, 255, 0, 0.4)" : colors.primary[300],
        }}
        thumbColor={value ? colors.primary[500] : (isDark ? colors.neutral[600] : colors.neutral[100])}
        ios_backgroundColor={isDark ? colors.neutral[800] : colors.neutral[300]}
      />
    </View>
  );
}
