import { TouchableOpacity } from "react-native";
import { colors } from "@/theme/colors";
import { shadows } from "@/theme/shadows";

interface FloatingButtonProps {
  onPress: () => void;
  icon: React.ReactNode;
  size?: number;
  color?: string;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  className?: string;
}

export function FloatingButton({
  onPress,
  icon,
  size = 56,
  color = colors.primary[500],
  position = "bottom-right",
  className = "",
}: FloatingButtonProps) {
  const positionStyles = {
    "bottom-right": { bottom: 24, right: 24 },
    "bottom-left": { bottom: 24, left: 24 },
    "top-right": { top: 24, right: 24 },
    "top-left": { top: 24, left: 24 },
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`absolute ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        justifyContent: "center",
        alignItems: "center",
        ...positionStyles[position],
        ...shadows.lg,
      }}
      activeOpacity={0.8}
    >
      {icon}
    </TouchableOpacity>
  );
}
