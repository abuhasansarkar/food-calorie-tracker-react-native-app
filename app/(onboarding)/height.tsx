import { useState, useRef, useEffect } from "react";
import { View, Text, ScrollView, StatusBar, Dimensions, NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/ui/Header";
import { useUserContext } from "@/context/UserContext";
import { useThemeContext } from "@/context/ThemeContext";

const SCREEN_WIDTH = Dimensions.get("window").width;
const ITEM_WIDTH = 12; // space between tick marks
const MIN_HEIGHT = 120;
const MAX_HEIGHT = 220;
const DEFAULT_HEIGHT = 175;

export default function HeightScreen() {
  const router = useRouter();
  const { saveOnboardingData, onboardingData } = useUserContext();
  const { isDark, colors } = useThemeContext();
  
  // Set default initial height from context if exists, else DEFAULT_HEIGHT
  const initialHeight = onboardingData?.heightCm || DEFAULT_HEIGHT;
  const [selectedHeight, setSelectedHeight] = useState(initialHeight);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const totalTicks = MAX_HEIGHT - MIN_HEIGHT + 1;
  const paddingHorizontal = SCREEN_WIDTH / 2 - ITEM_WIDTH / 2;

  useEffect(() => {
    // Scroll to the initial value on mount
    const initialIndex = initialHeight - MIN_HEIGHT;
    const initialX = initialIndex * ITEM_WIDTH;
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollTo({ x: initialX, animated: false });
    }, 120);
    return () => clearTimeout(timer);
  }, []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = event.nativeEvent.contentOffset.x;
    const index = Math.round(x / ITEM_WIDTH);
    const value = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, MIN_HEIGHT + index));
    setSelectedHeight(value);
  };

  const handleNext = () => {
    saveOnboardingData({ heightCm: selectedHeight });
    router.push("/(onboarding)/weight");
  };

  // Generate tick marks
  const tickMarks = [];
  for (let i = 0; i < totalTicks; i++) {
    const currentVal = MIN_HEIGHT + i;
    const isMajor = currentVal % 10 === 0;
    const isMedium = currentVal % 5 === 0;
    
    tickMarks.push(
      <View key={i} style={{ width: ITEM_WIDTH, alignItems: "center" }}>
        {/* Tick Line */}
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
        {/* Number labels on major ticks */}
        {isMajor && (
          <Text 
            style={{ color: isDark ? colors.text.tertiary : colors.neutral[500] }}
            className="text-[11px] font-bold mt-2"
          >
            {currentVal}
          </Text>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? colors.background.dark : colors.background.light }}
      className="flex-1"
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      <Header 
        title="" 
        onBack={() => router.back()} 
        rightAction={
          <Text 
            style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
            className="text-sm font-semibold tracking-wider"
          >
            3 of 8
          </Text>
        }
      />

      <View className="flex-1 justify-center">
        {/* Step Headers */}
        <View className="px-6 mb-12">
          <Text 
            style={{ color: isDark ? colors.text.dark : colors.text.light }}
            className="text-3xl font-extrabold tracking-tight mb-2 text-center"
          >
            What&apos;s your height?
          </Text>
          <Text 
            style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
            className="text-base font-medium text-center"
          >
            We use this to calculate your calorie needs
          </Text>
        </View>

        {/* Large Value Indicator */}
        <View className="items-center mb-8">
          <View className="flex-row items-baseline justify-center">
            <Text 
              style={{ color: colors.primary[500] }}
              className="text-6xl font-black tracking-tighter"
            >
              {selectedHeight}
            </Text>
            <Text 
              style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
              className="text-xl font-bold ml-1"
            >
              cm
            </Text>
          </View>
        </View>

        {/* Tactile Tape Ruler Selector */}
        <View className="items-center select-none relative mb-12">
          {/* Vertical Center Indicator Pointer */}
          <View 
            style={{ backgroundColor: colors.primary[500] }} 
            className="w-1 h-10 rounded-full absolute top-[-6px] z-10" 
          />

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
      </View>

      {/* Footer Navigation */}
      <View className="px-6 pb-8 mt-auto">
        <Button
          title="Next"
          onPress={handleNext}
          size="lg"
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}
