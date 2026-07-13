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
  const innerSize = size - strokeWidth * 2;

  const halfSize = size / 2;
  const rotation = (clampedProgress / 100) * 360;

  return (
    <View className="items-center justify-center">
      <View
        style={{
          width: size,
          height: size,
          borderRadius: halfSize,
          backgroundColor: ringBg,
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <View
          style={{
            position: "absolute",
            width: size,
            height: size,
            borderRadius: halfSize,
            backgroundColor: ringColor,
            opacity: clampedProgress / 100,
          }}
        />

        <View
          style={{
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
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
                fontWeight: "500",
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
