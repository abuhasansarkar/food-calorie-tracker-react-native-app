import { View, Text, Image } from "react-native";
import { useThemeContext } from "@/context/ThemeContext";
import { getInitials } from "@/utils/helpers";

interface AvatarProps {
  name?: string;
  imageUrl?: string;
  size?: number;
  className?: string;
}

export function Avatar({
  name = "U",
  imageUrl,
  size = 48,
  className = "",
}: AvatarProps) {
  const initials = getInitials(name);
  const { isDark, colors } = useThemeContext();

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
        }}
      />
    );
  }

  return (
    <View
      className={`items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: isDark ? "rgba(204, 255, 0, 0.12)" : colors.primary[50],
        borderWidth: isDark ? 1 : 0,
        borderColor: isDark ? "rgba(204, 255, 0, 0.2)" : "transparent",
      }}
    >
      <Text
        style={{
          fontSize: size * 0.4,
          fontWeight: "700",
          color: isDark ? colors.primary[400] : colors.primary[700],
        }}
      >
        {initials}
      </Text>
    </View>
  );
}
