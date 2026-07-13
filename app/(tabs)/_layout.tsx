import {
  TabBarVisibilityProvider,
  useTabBarVisibility,
} from "@/context/TabBarVisibilityContext";
import { useThemeContext } from "@/context/ThemeContext";
import { isGuestSession } from "@/utils/guest";
import { useAuth } from "@clerk/expo";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Redirect, Tabs } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface CustomTabBarProps extends BottomTabBarProps {
  colors: any;
  isDark: boolean;
}

function CustomTabBar({
  state,
  descriptors,
  navigation,
  colors,
  isDark,
}: CustomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { isTabBarVisible } = useTabBarVisibility();

  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withTiming(isTabBarVisible ? 0 : 120, { duration: 250 });
  }, [isTabBarVisible]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const iconConfig: Record<string, { active: string; inactive: string }> = {
    home: { active: "home", inactive: "home-outline" },
    foods: { active: "food-apple", inactive: "food-apple-outline" },
    scan: { active: "view-finder", inactive: "view-finder" },
    progress: { active: "chart-bar", inactive: "chart-bar" },
    profile: { active: "account", inactive: "account-outline" },
  };

  const tabOrder = ["home", "foods", "scan", "progress", "profile"];

  // Sort and filter the routes to match the expected tabOrder
  const renderedRoutes = state.routes
    .filter((route) => tabOrder.includes(route.name))
    .sort((a, b) => tabOrder.indexOf(a.name) - tabOrder.indexOf(b.name));

  // Hide the tab bar completely on the scan/camera screen
  const activeRoute = state.routes[state.index];
  if (activeRoute?.name === "scan") {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.tabBarContainer,
        {
          backgroundColor: isDark ? "#111214" : "#FFFFFF",
          borderColor: isDark ? "#24262B" : "#E5E7EB",
          bottom: Platform.OS === "ios" ? Math.max(insets.bottom, 16) : 16,
        },
        animatedStyle,
      ]}
    >
      {renderedRoutes.map((route) => {
        const index = state.routes.findIndex((r) => r.key === route.key);
        const isFocused = state.index === index;
        const { options } = descriptors[route.key];

        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        const activeColor = colors.primary[500]; // "#CCFF00"
        const inactiveColor = isDark ? "#8E8E93" : "#6B7280";

        if (route.name === "scan") {
          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.scanTabButton}
              activeOpacity={0.85}
            >
              <View
                style={[styles.scanCircle, { backgroundColor: activeColor }]}
              >
                <MaterialCommunityIcons
                  name="view-finder"
                  size={28}
                  color="#000000"
                />
              </View>
              <Text
                style={[
                  styles.scanText,
                  { color: isFocused ? activeColor : inactiveColor },
                ]}
              >
                Scan
              </Text>
            </TouchableOpacity>
          );
        }

        const iconName = isFocused
          ? iconConfig[route.name]?.active
          : iconConfig[route.name]?.inactive;

        const displayIndex = tabOrder.indexOf(route.name);
        let activeBorderStyle = {};

        if (isFocused) {
          if (displayIndex === 0) {
            activeBorderStyle = {
              borderTopWidth: 2,
              borderLeftWidth: 2,
              borderTopLeftRadius: 28,
              borderColor: activeColor,
            };
          } else if (displayIndex === 1 || displayIndex === 3) {
            activeBorderStyle = {
              borderTopWidth: 2,
              borderColor: activeColor,
            };
          } else if (displayIndex === 4) {
            activeBorderStyle = {
              borderTopWidth: 2,
              borderRightWidth: 2,
              borderTopRightRadius: 28,
              borderColor: activeColor,
            };
          }
        }

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            onLongPress={onLongPress}
            style={[styles.tabButton, activeBorderStyle]}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={iconName as any}
              size={24}
              color={isFocused ? activeColor : inactiveColor}
            />
            <Text
              style={[
                styles.tabText,
                {
                  color: isFocused ? activeColor : inactiveColor,
                  fontWeight: isFocused ? "600" : "500",
                },
              ]}
            >
              {typeof label === "string" ? label : route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </Animated.View>
  );
}

export default function TabLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const [isGuest, setIsGuest] = useState<boolean | null>(null);
  const { isDark, colors } = useThemeContext();

  useEffect(() => {
    isGuestSession().then(setIsGuest);
  }, []);

  if (!isLoaded || isGuest === null) {
    return (
      <View
        style={{
          backgroundColor: isDark
            ? colors.background.dark
            : colors.background.light,
        }}
        className="flex-1 items-center justify-center"
      >
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  if (!isSignedIn && !isGuest) {
    return <Redirect href="/(auth)/splash" />;
  }

  return (
    <TabBarVisibilityProvider>
      <Tabs
        tabBar={(props) => (
          <CustomTabBar {...props} colors={colors} isDark={isDark} />
        )}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
          }}
        />
        <Tabs.Screen
          name="foods"
          options={{
            title: "Foods",
          }}
        />
        <Tabs.Screen
          name="scan"
          options={{
            title: "Scan",
          }}
        />
        <Tabs.Screen
          name="progress"
          options={{
            title: "Progress",
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
          }}
        />
      </Tabs>
    </TabBarVisibilityProvider>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: "row",
    position: "absolute",
    left: 16,
    right: 16,
    height: 72,
    borderRadius: 28,
    borderWidth: 1,
    elevation: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },
  tabButton: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
    paddingBottom: 6,
  },
  tabText: {
    fontSize: 10,
    marginTop: 4,
  },
  scanTabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  scanCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    bottom: 20,
    shadowColor: "#CCFF00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  scanText: {
    fontSize: 10,
    bottom: 12,
    fontWeight: "500",
  },
});
