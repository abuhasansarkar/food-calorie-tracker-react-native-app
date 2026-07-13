import { View, Text } from "react-native";
import { useThemeContext } from "@/context/ThemeContext";

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  label?: string;
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 10,
  color,
  backgroundColor,
  showPercentage = true,
  label,
}: ProgressRingProps) {
  const { isDark, colors } = useThemeContext();
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  const ringColor = color || colors.primary[500];
  const ringBg = backgroundColor || (isDark ? colors.border.dark : colors.neutral[200]);

  return (
    <View className="items-center justify-center">
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: ringBg,
          overflow: "hidden",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Simple visual bar using segment simulation */}
        <View
          style={{
            position: "absolute",
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: ringColor,
            opacity: 0.15 + (clampedProgress / 100) * 0.85,
          }}
        />

        <View
          style={{
            position: "absolute",
            width: size - strokeWidth * 2,
            height: size - strokeWidth * 2,
            borderRadius: (size - strokeWidth * 2) / 2,
            backgroundColor: isDark ? colors.surface.dark : colors.white,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {showPercentage && (
            <Text
              style={{
                fontSize: size * 0.18,
                fontWeight: "800",
                color: isDark ? colors.text.dark : colors.neutral[900],
              }}
            >
              {Math.round(clampedProgress)}%
            </Text>
          )}
          {label && (
            <Text
              style={{
                fontSize: size * 0.09,
                color: isDark ? colors.text.secondary : colors.neutral[500],
                marginTop: 2,
                fontWeight: "500"
              }}
            >
              {label}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
