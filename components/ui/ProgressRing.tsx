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
  const innerRadius = innerSize / 2;
  const progressHalf = clampedProgress <= 50 ? 0 : 1;

  const rightRotation = clampedProgress <= 50
    ? `${clampedProgress * 3.6}deg`
    : "180deg";
  const leftRotation = clampedProgress > 50
    ? `${(clampedProgress - 50) * 3.6}deg`
    : "0deg";

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
        {/* Right half-circle progress */}
        <View style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: size,
          height: size,
          borderRadius: halfSize,
          overflow: "hidden",
          transform: [{ rotate: rightRotation }],
        }}>
          <View style={{
            position: "absolute",
            top: 0,
            left: halfSize,
            width: halfSize,
            height: size,
            backgroundColor: ringColor,
          }} />
        </View>

        {/* Left half-circle progress */}
        <View style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: size,
          height: size,
          borderRadius: halfSize,
          overflow: "hidden",
          transform: [{ rotate: leftRotation }],
        }}>
          <View style={{
            position: "absolute",
            top: 0,
            left: halfSize,
            width: halfSize,
            height: size,
            backgroundColor: ringColor,
          }} />
        </View>

        {/* Clipping mask */}
        {progressHalf === 1 && (
          <View style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: halfSize,
            height: size,
            borderRadius: 0,
            backgroundColor: ringBg,
          }} />
        )}

        {/* Inner circle */}
        <View
          style={{
            width: innerSize,
            height: innerSize,
            borderRadius: innerRadius,
            backgroundColor: isDark ? colors.surface.dark : colors.white,
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2,
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