import { View, Text, TouchableOpacity } from "react-native";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";

interface Tab {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
  variant?: "underline" | "pill" | "segmented";
  className?: string;
}

export function TabBar({
  tabs,
  activeTab,
  onTabChange,
  variant = "underline",
  className = "",
}: TabBarProps) {
  return (
    <View
      className={`flex-row ${className}`}
      style={{
        borderBottomWidth: variant === "underline" ? 1 : 0,
        borderBottomColor: colors.border.light,
        backgroundColor:
          variant === "segmented" ? colors.neutral[100] : "transparent",
        borderRadius: variant === "segmented" ? radius.lg : 0,
        padding: variant === "segmented" ? 4 : 0,
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;

        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onTabChange(tab.key)}
            className="flex-row items-center justify-center gap-1.5"
            style={{
              flex: 1,
              paddingVertical: variant === "segmented" ? 8 : 12,
              paddingHorizontal: 16,
              backgroundColor:
                variant === "segmented" && isActive
                  ? colors.white
                  : "transparent",
              borderRadius:
                variant === "segmented" ? radius.md : 0,
              borderBottomWidth: variant === "underline" ? 2 : 0,
              borderBottomColor:
                variant === "underline" && isActive
                  ? colors.primary[500]
                  : "transparent",
            }}
          >
            {tab.icon && tab.icon}

            <Text
              style={{
                fontSize: 14,
                fontWeight: isActive ? "600" : "400",
                color: isActive ? colors.primary[600] : colors.neutral[500],
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
