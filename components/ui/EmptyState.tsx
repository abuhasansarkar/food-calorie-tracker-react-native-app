import { View, Text } from "react-native";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <View
      className={`items-center justify-center py-16 px-8 ${className}`}
    >
      {icon && (
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: colors.primary[50],
            justifyContent: "center",
            alignItems: "center",
            marginBottom: spacing.xl,
          }}
        >
          {icon}
        </View>
      )}

      <Text
        style={{
          fontSize: 18,
          fontWeight: "600",
          color: colors.neutral[900],
          textAlign: "center",
          marginBottom: spacing.sm,
        }}
      >
        {title}
      </Text>

      {description && (
        <Text
          style={{
            fontSize: 14,
            color: colors.neutral[500],
            textAlign: "center",
            lineHeight: 20,
            marginBottom: spacing.xl,
          }}
        >
          {description}
        </Text>
      )}

      {action && action}
    </View>
  );
}
