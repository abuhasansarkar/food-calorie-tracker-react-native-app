import { View, Text } from "react-native";
import { Card } from "./Card";
import { useThemeContext } from "@/context/ThemeContext";

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface ChartCardProps {
  title: string;
  data: DataPoint[];
  maxValue?: number;
  height?: number;
  showGrid?: boolean;
  className?: string;
}

export function ChartCard({
  title,
  data,
  maxValue,
  height = 200,
  showGrid = true,
  className = "",
}: ChartCardProps) {
  const { isDark, colors } = useThemeContext();
  const calculatedMax =
    maxValue || Math.max(...data.map((d) => d.value), 1);

  return (
    <Card className={className}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          color: isDark ? colors.text.dark : colors.neutral[900],
          marginBottom: 12,
        }}
      >
        {title}
      </Text>

      <View style={{ height, justifyContent: "flex-end" }}>
        {showGrid && (
          <View style={{ position: "absolute", width: "100%", height: "100%" }}>
            {[0, 0.25, 0.5, 0.75, 1].map((fraction) => (
              <View
                key={fraction}
                style={{
                  position: "absolute",
                  bottom: fraction * height,
                  width: "100%",
                  height: 1,
                  backgroundColor: isDark ? colors.border.dark : colors.neutral[100],
                }}
              />
            ))}
          </View>
        )}

        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "space-around",
            height: "100%",
            paddingBottom: 20,
          }}
        >
          {data.map((point, index) => {
            const barHeight = (point.value / calculatedMax) * (height - 30);
            return (
              <View key={index} className="items-center gap-1">
                <View
                  style={{
                    width: data.length > 10 ? 12 : 24,
                    height: Math.max(barHeight, 4),
                    backgroundColor: point.color || colors.primary[500],
                    borderRadius: 4,
                  }}
                />
                <Text
                  style={{
                    fontSize: 10,
                    color: isDark ? colors.text.secondary : colors.neutral[500],
                    textAlign: "center",
                  }}
                >
                  {point.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </Card>
  );
}
