import { View, ActivityIndicator, Text } from "react-native";
import { colors } from "@/theme/colors";

interface LoaderProps {
  size?: "small" | "large";
  color?: string;
  message?: string;
  fullScreen?: boolean;
}

export function Loader({
  size = "large",
  color = colors.primary[500],
  message,
  fullScreen = false,
}: LoaderProps) {
  const containerStyle = fullScreen
    ? { flex: 1, justifyContent: "center" as const, alignItems: "center" as const }
    : { justifyContent: "center" as const, alignItems: "center" as const, padding: 20 };

  return (
    <View style={containerStyle}>
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text
          style={{
            marginTop: 12,
            fontSize: 14,
            color: colors.neutral[500],
            textAlign: "center",
          }}
        >
          {message}
        </Text>
      )}
    </View>
  );
}
