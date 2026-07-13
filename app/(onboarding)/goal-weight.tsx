import { useState, useRef, useEffect } from "react";
import { View, Text, ScrollView, SafeAreaView, StatusBar, Dimensions, NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/ui/Header";
import { useUserContext } from "@/context/UserContext";
import { useThemeContext } from "@/context/ThemeContext";

const SCREEN_WIDTH = Dimensions.get("window").width;
const ITEM_WIDTH = 12; // space between ticks
const MIN_WEIGHT = 30;
const MAX_WEIGHT = 180;
const DEFAULT_GOAL_WEIGHT = 70; // Matches mockup center value

export default function GoalWeightScreen() {
  const router = useRouter();
  const { saveOnboardingData, onboardingData } = useUserContext();
  const { isDark, colors } = useThemeContext();
  
  const initialGoal = onboardingData?.goalWeightKg || DEFAULT_GOAL_WEIGHT;
  const [selectedGoalWeight, setSelectedGoalWeight] = useState(initialGoal);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const totalTicks = MAX_WEIGHT - MIN_WEIGHT + 1;
  const paddingHorizontal = SCREEN_WIDTH / 2 - ITEM_WIDTH / 2;

  useEffect(() => {
    const initialIndex = initialGoal - MIN_WEIGHT;
    const initialX = initialIndex * ITEM_WIDTH;
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollTo({ x: initialX, animated: false });
    }, 120);
    return () => clearTimeout(timer);
  }, []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = event.nativeEvent.contentOffset.x;
    const index = Math.round(x / ITEM_WIDTH);
    const value = Math.max(MIN_WEIGHT, Math.min(MAX_WEIGHT, MIN_WEIGHT + index));
    setSelectedGoalWeight(value);
  };

  const handleNext = () => {
    saveOnboardingData({ goalWeightKg: selectedGoalWeight });
    router.push("/(onboarding)/activity-level");
  };

  // Generate ticks
  const tickMarks = [];
  for (let i = 0; i < totalTicks; i++) {
    const currentVal = MIN_WEIGHT + i;
    const isMajor = currentVal % 10 === 0;
    const isMedium = currentVal % 5 === 0;
    
    tickMarks.push(
      <View key={i} style={{ width: ITEM_WIDTH, alignItems: "center" }}>
        {/* Tick line */}
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
        {/* Numbers on major ticks */}
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
      style={{ backgroundColor: isDark ? colors.background.dark : colors.background.light }}
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
            4 of 7
          </Text>
        }
      />

      <View className="flex-1 justify-center">
        {/* Screen Title */}
        <View className="px-6 mb-12">
          <Text 
            style={{ color: isDark ? colors.text.dark : colors.text.light }}
            className="text-3xl font-extrabold tracking-tight mb-2 text-center"
          >
            What&apos;s your goal weight?
          </Text>
          <Text 
            style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
            className="text-base font-medium text-center"
          >
            Where do you want to be?
          </Text>
        </View>

        {/* Large Metric Display */}
        <View className="items-center mb-8">
          <View className="flex-row items-baseline justify-center">
            <Text 
              style={{ color: colors.primary[500] }}
              className="text-6xl font-black tracking-tighter"
            >
              {selectedGoalWeight}
            </Text>
            <Text 
              style={{ color: isDark ? colors.text.secondary : colors.neutral[500] }}
              className="text-xl font-bold ml-1"
            >
              kg
            </Text>
          </View>
        </View>

        {/* Snap Scroll Tape Selector */}
        <View className="items-center select-none relative mb-12">
          {/* Vertical indicator needle */}
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

      {/* Footer Next */}
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
