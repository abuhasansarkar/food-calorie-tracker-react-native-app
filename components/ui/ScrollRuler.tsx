import { useState, useRef, useEffect } from "react";
import { View, Text, ScrollView, Dimensions, NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { useThemeContext } from "@/context/ThemeContext";

interface ScrollRulerProps {
  minValue: number;
  maxValue: number;
  defaultValue?: number;
  unit: string;
  onValueChange: (value: number) => void;
}

const SCREEN_WIDTH = Dimensions.get("window").width;
const ITEM_WIDTH = 12;

export function ScrollRuler({ minValue, maxValue, defaultValue, unit, onValueChange }: ScrollRulerProps) {
  const { isDark, colors } = useThemeContext();
  const initialValue = defaultValue || minValue;
  const [, setSelectedValue] = useState(initialValue);
  const scrollViewRef = useRef<ScrollView>(null);

  const totalTicks = maxValue - minValue + 1;
  const paddingHorizontal = SCREEN_WIDTH / 2 - ITEM_WIDTH / 2;

  useEffect(() => {
    const initialIndex = initialValue - minValue;
    const initialX = initialIndex * ITEM_WIDTH;
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollTo({ x: initialX, animated: false });
    }, 120);
    return () => clearTimeout(timer);
  }, []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = event.nativeEvent.contentOffset.x;
    const index = Math.round(x / ITEM_WIDTH);
    const value = Math.max(minValue, Math.min(maxValue, minValue + index));
    setSelectedValue(value);
    onValueChange(value);
  };

  const tickMarks = [];
  for (let i = 0; i < totalTicks; i++) {
    const currentVal = minValue + i;
    const isMajor = currentVal % 10 === 0;
    const isMedium = currentVal % 5 === 0;

    tickMarks.push(
      <View key={i} style={{ width: ITEM_WIDTH, alignItems: "center" }}>
        <View
          style={{
            width: 2,
            height: isMajor ? 32 : (isMedium ? 20 : 12),
            backgroundColor: isMajor
              ? (isDark ? "#FAFAFA" : "#171717")
              : (isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)"),
            borderRadius: 1,
          }}
        />
        {isMajor && (
          <Text style={{ color: isDark ? colors.text.tertiary : colors.neutral[500] }} className="text-[11px] font-bold mt-2">
            {currentVal}
          </Text>
        )}
      </View>,
    );
  }

  return (
    <View className="items-center select-none relative mb-12">
      <View style={{ backgroundColor: colors.primary[500] }} className="w-1 h-10 rounded-full absolute top-[-6px] z-10" />
      <View className="w-full py-4 border-y border-neutral-200 dark:border-neutral-800">
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={ITEM_WIDTH}
          decelerationRate="fast"
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{
            paddingHorizontal: paddingHorizontal,
            alignItems: "flex-start",
          }}
        >
          {tickMarks}
        </ScrollView>
      </View>
    </View>
  );
}

export { ITEM_WIDTH };
