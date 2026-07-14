import { Component, ReactNode } from "react";
import { View, Text, TouchableOpacity, useColorScheme } from "react-native";
import { colors } from "@/theme/colors";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

function DefaultFallback({ error, onReset }: { error: Error | null; onReset: () => void }) {
  const isDark = useColorScheme() === "dark";
  const bgColor = isDark ? colors.background.dark : colors.background.light;
  const textColor = isDark ? colors.text.dark : colors.text.light;

  return (
    <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: bgColor }}>
      <Text className="text-2xl font-bold mb-2" style={{ color: textColor }}>Something went wrong</Text>
      <Text className="text-sm text-center mb-4" style={{ color: colors.neutral[500] }}>
        {error?.message || "An unexpected error occurred"}
      </Text>
      <TouchableOpacity
        onPress={onReset}
        style={{ backgroundColor: colors.primary[500] }}
        className="px-6 py-3 rounded-xl"
      >
        <Text className="font-bold text-black">Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <DefaultFallback
          error={this.state.error}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}