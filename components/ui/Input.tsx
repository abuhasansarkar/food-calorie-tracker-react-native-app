import { View, TextInput, Text, TouchableOpacity } from "react-native";
import { useState } from "react";
import { useThemeContext } from "@/context/ThemeContext";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  multiline?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad" | "decimal-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  className?: string;
  disabled?: boolean;
  maxLength?: number;
  rightIcon?: React.ReactNode;
}

export function Input({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  multiline = false,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  className = "",
  disabled = false,
  maxLength,
  rightIcon,
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { isDark, colors } = useThemeContext();

  return (
    <View className={`gap-1.5 ${className}`}>
      {label && (
        <Text
          style={{
            fontSize: 14,
            fontWeight: "500",
            color: isDark ? colors.text.secondary : colors.neutral[700],
          }}
        >
          {label}
        </Text>
      )}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: isDark ? colors.surface.dark : colors.white,
          borderWidth: error ? 1.5 : isFocused ? 1.5 : 1,
          borderColor: error
            ? colors.error[500]
            : isFocused
              ? colors.primary[500]
              : isDark
                ? colors.border.dark
                : colors.border.light,
          borderRadius: radius.lg,
          paddingHorizontal: spacing.lg,
          minHeight: multiline ? 100 : 48,
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
          multiline={multiline}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={!disabled}
          maxLength={maxLength}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          accessibilityLabel={label || placeholder}
          style={{
            flex: 1,
            fontSize: 16,
            color: isDark ? colors.text.dark : colors.text.light,
            paddingVertical: multiline ? spacing.md : spacing.sm,
            textAlignVertical: multiline ? "top" : "center",
          }}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={{ padding: spacing.xs }}
          >
            <Text style={{ color: colors.neutral[500], fontSize: 12 }}>
              {showPassword ? "Hide" : "Show"}
            </Text>
          </TouchableOpacity>
        )}

        {rightIcon && !secureTextEntry && rightIcon}
      </View>

      {error && (
        <Text
          style={{
            fontSize: 12,
            color: colors.error[500],
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}
