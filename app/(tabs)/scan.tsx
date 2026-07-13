import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { useThemeContext } from "@/context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SCAN_FRAME_SIZE = 260;

export default function ScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useThemeContext();
  const [flashOn, setFlashOn] = useState(false);

  // Reanimated shared values
  const laserY = useSharedValue(0);
  const tag1Scale = useSharedValue(1);
  const tag2Scale = useSharedValue(1);
  const flashOpacity = useSharedValue(0);

  useEffect(() => {
    // Laser line scanning loop
    laserY.value = withRepeat(
      withTiming(SCAN_FRAME_SIZE - 4, { duration: 2500 }),
      -1,
      true
    );

    // Dynamic hover effects for the bounding boxes/labels
    tag1Scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1200 }),
        withTiming(1, { duration: 1200 })
      ),
      -1,
      true
    );

    tag2Scale.value = withRepeat(
      withDelay(
        500,
        withSequence(
          withTiming(1.06, { duration: 1400 }),
          withTiming(1, { duration: 1400 })
        )
      ),
      -1,
      true
    );
  }, []);

  const handleCapture = () => {
    // Shutter flash effect
    flashOpacity.value = 1;
    flashOpacity.value = withTiming(0, { duration: 400 });

    setTimeout(() => {
      router.push("/meal/analyzing");
    }, 150);
  };

  // Animated styles
  const laserStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: laserY.value }],
  }));

  const tag1Style = useAnimatedStyle(() => ({
    transform: [{ scale: tag1Scale.value }],
  }));

  const tag2Style = useAnimatedStyle(() => ({
    transform: [{ scale: tag2Scale.value }],
  }));

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  const activeColor = colors.primary[500];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Mock Food Background Image */}
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1000&q=80",
        }}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
      />

      {/* Camera Viewfinder Dark Overlay Masks */}
      <View style={styles.overlayContainer}>
        {/* Top mask */}
        <View style={styles.maskTop} />
        
        {/* Middle row containing left mask, scan frame, and right mask */}
        <View style={styles.maskMiddleRow}>
          <View style={styles.maskSide} />
          
          {/* Scanning frame area (fully clear viewport) */}
          <View style={styles.scanViewport}>
            {/* Corner Ticks */}
            <View style={[styles.cornerTick, styles.topLeft, { borderColor: activeColor }]} />
            <View style={[styles.cornerTick, styles.topRight, { borderColor: activeColor }]} />
            <View style={[styles.cornerTick, styles.bottomLeft, { borderColor: activeColor }]} />
            <View style={[styles.cornerTick, styles.bottomRight, { borderColor: activeColor }]} />

            {/* Sweeping Laser Line */}
            <Animated.View style={[styles.laserLine, laserStyle, { backgroundColor: activeColor, shadowColor: activeColor }]} />

            {/* Simulated Live Object Tags inside the viewfinder */}
            <Animated.View style={[styles.foodTag, styles.tag1, tag1Style]}>
              <View style={styles.tagDot} />
              <Text style={styles.tagText}>Salad Bowl 🥗</Text>
            </Animated.View>

            <Animated.View style={[styles.foodTag, styles.tag2, tag2Style]}>
              <View style={styles.tagDot} />
              <Text style={styles.tagText}>Healthy Egg 🍳</Text>
            </Animated.View>
          </View>
          
          <View style={styles.maskSide} />
        </View>

        {/* Bottom mask */}
        <View style={styles.maskBottom} />
      </View>

      {/* Top Header Controls Bar */}
      <View style={[styles.headerControls, { paddingTop: Math.max(insets.top, 24) }]}>
        <TouchableOpacity
          style={styles.controlCircle}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="chevron-left" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>AI Scanner</Text>
          <Text style={styles.headerSubtitle}>Center your meal in the frame</Text>
        </View>

        <TouchableOpacity
          style={styles.controlCircle}
          onPress={() => setFlashOn(!flashOn)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={flashOn ? "flash" : "flash-off"}
            size={22}
            color={flashOn ? activeColor : "#FFFFFF"}
          />
        </TouchableOpacity>
      </View>

      {/* Bottom Main Controls Panel */}
      <View style={[styles.bottomPanel, { paddingBottom: Math.max(insets.bottom, 24) + 12 }]}>
        <TouchableOpacity style={styles.panelButton} activeOpacity={0.7}>
          <View style={styles.panelIconCircle}>
            <MaterialCommunityIcons name="image-multiple-outline" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.panelButtonText}>Gallery</Text>
        </TouchableOpacity>

        {/* Capture Shutter Button */}
        <TouchableOpacity
          style={[styles.shutterButtonOuter, { borderColor: activeColor }]}
          onPress={handleCapture}
          activeOpacity={0.8}
        >
          <View style={styles.shutterButtonInner} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.panelButton} activeOpacity={0.7}>
          <View style={styles.panelIconCircle}>
            <MaterialCommunityIcons name="magnify" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.panelButtonText}>Manual</Text>
        </TouchableOpacity>
      </View>

      {/* Camera Shutter Flash Overlay */}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFillObject, styles.shutterFlash, flashStyle]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  maskTop: {
    flex: 1.2,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  maskMiddleRow: {
    height: SCAN_FRAME_SIZE,
    flexDirection: "row",
  },
  maskSide: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  scanViewport: {
    width: SCAN_FRAME_SIZE,
    height: SCAN_FRAME_SIZE,
    position: "relative",
    overflow: "hidden",
  },
  maskBottom: {
    flex: 2,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  cornerTick: {
    position: "absolute",
    width: 24,
    height: 24,
    borderWidth: 4,
    zIndex: 10,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 12,
  },
  laserLine: {
    position: "absolute",
    left: 4,
    right: 4,
    height: 2.5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 5,
  },
  foodTag: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    zIndex: 8,
  },
  tagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#CCFF00",
    marginRight: 6,
  },
  tagText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  tag1: {
    top: 40,
    left: 20,
  },
  tag2: {
    bottom: 50,
    right: 25,
  },
  headerControls: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    zIndex: 20,
  },
  controlCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleContainer: {
    alignItems: "center",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bottomPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingTop: 20,
    zIndex: 20,
  },
  panelButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  panelIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  panelButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 6,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  shutterButtonOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  shutterButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
  },
  shutterFlash: {
    backgroundColor: "#FFFFFF",
    zIndex: 99,
  },
});
