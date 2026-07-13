import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  AppState,
} from "react-native";
import { useRouter } from "expo-router";
import { useThemeContext } from "@/context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CameraView, CameraType, FlashMode, useCameraPermissions } from "expo-camera";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
} from "react-native-reanimated";

const SCAN_FRAME_SIZE = 260;

export default function ScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useThemeContext();

  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<FlashMode>("off");
  const [permission, requestPermission] = useCameraPermissions();

  // Unmount the CameraView when app is backgrounded to avoid stale camera sessions
  const [isCameraActive, setIsCameraActive] = useState(true);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState) => {
      setIsCameraActive(nextState === "active");
    });
    return () => sub.remove();
  }, []);

  // Reanimated shared values
  const laserY = useSharedValue(0);
  const tag1Scale = useSharedValue(1);
  const flashOpacity = useSharedValue(0);

  useEffect(() => {
    laserY.value = withRepeat(
      withTiming(SCAN_FRAME_SIZE - 4, { duration: 2500 }),
      -1,
      true
    );

    tag1Scale.value = withRepeat(
      withDelay(
        300,
        withSequence(
          withTiming(1.05, { duration: 1200 }),
          withTiming(1, { duration: 1200 })
        )
      ),
      -1,
      true
    );
  }, []);

  const handleCapture = () => {
    flashOpacity.value = 1;
    flashOpacity.value = withTiming(0, { duration: 400 });
    setTimeout(() => {
      router.push("/meal/analyzing");
    }, 150);
  };

  const laserStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: laserY.value }],
  }));
  const tag1Style = useAnimatedStyle(() => ({
    transform: [{ scale: tag1Scale.value }],
  }));
  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  const activeColor = colors.primary[500];

  // --- Camera Permission Gate ---
  if (!permission) {
    // Permissions still loading
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

        {/* Back button */}
        <TouchableOpacity
          style={[styles.controlCircle, { position: "absolute", top: Math.max(insets.top, 24), left: 20 }]}
          onPress={() => router.replace("/(tabs)/home")}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="chevron-left" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.permissionIconWrapper}>
          <MaterialCommunityIcons name="camera-off" size={52} color="rgba(255,255,255,0.5)" />
        </View>
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionSubtitle}>
          AceKy AI needs camera access to scan and identify your meals.
        </Text>
        <TouchableOpacity
          style={[styles.permissionButton, { backgroundColor: activeColor }]}
          onPress={requestPermission}
          activeOpacity={0.85}
        >
          <Text style={[styles.permissionButtonText, { color: "#000000" }]}>
            Grant Camera Access
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- Main Camera View ---
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Live Camera — unmounted when app is backgrounded */}
      {isCameraActive && (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing={facing}
          flash={flash}
          mode="picture"
        />
      )}

      {/* Viewfinder Dark Overlay Masks */}
      <View style={styles.overlayContainer}>
        <View style={styles.maskTop} />

        <View style={styles.maskMiddleRow}>
          <View style={styles.maskSide} />

          {/* Scanning frame — transparent viewport */}
          <View style={styles.scanViewport}>
            <View style={[styles.cornerTick, styles.topLeft, { borderColor: activeColor }]} />
            <View style={[styles.cornerTick, styles.topRight, { borderColor: activeColor }]} />
            <View style={[styles.cornerTick, styles.bottomLeft, { borderColor: activeColor }]} />
            <View style={[styles.cornerTick, styles.bottomRight, { borderColor: activeColor }]} />

            {/* Sweeping Laser Line */}
            <Animated.View
              style={[
                styles.laserLine,
                laserStyle,
                { backgroundColor: activeColor, shadowColor: activeColor },
              ]}
            />

            {/* Live detection tag */}
            <Animated.View style={[styles.foodTag, styles.tag1, tag1Style]}>
              <View style={[styles.tagDot, { backgroundColor: activeColor }]} />
              <Text style={styles.tagText}>Scanning…</Text>
            </Animated.View>
          </View>

          <View style={styles.maskSide} />
        </View>

        <View style={styles.maskBottom} />
      </View>

      {/* Top Controls */}
      <View style={[styles.headerControls, { paddingTop: Math.max(insets.top, 24) }]}>
        <TouchableOpacity
          style={styles.controlCircle}
          onPress={() => router.replace("/(tabs)/home")}
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
          onPress={() => setFlash((f) => (f === "off" ? "on" : "off"))}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={flash === "on" ? "flash" : "flash-off"}
            size={22}
            color={flash === "on" ? activeColor : "#FFFFFF"}
          />
        </TouchableOpacity>
      </View>

      {/* Bottom Controls Panel */}
      <View style={[styles.bottomPanel, { paddingBottom: Math.max(insets.bottom, 24) + 12 }]}>
        {/* Flip Camera */}
        <TouchableOpacity
          style={styles.panelButton}
          onPress={() => setFacing((f) => (f === "back" ? "front" : "back"))}
          activeOpacity={0.7}
        >
          <View style={styles.panelIconCircle}>
            <MaterialCommunityIcons name="camera-flip-outline" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.panelButtonText}>Flip</Text>
        </TouchableOpacity>

        {/* Capture Shutter */}
        <TouchableOpacity
          style={[styles.shutterButtonOuter, { borderColor: activeColor }]}
          onPress={handleCapture}
          activeOpacity={0.8}
        >
          <View style={styles.shutterButtonInner} />
        </TouchableOpacity>

        {/* Manual Search */}
        <TouchableOpacity style={styles.panelButton} activeOpacity={0.7}>
          <View style={styles.panelIconCircle}>
            <MaterialCommunityIcons name="magnify" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.panelButtonText}>Manual</Text>
        </TouchableOpacity>
      </View>

      {/* Shutter Flash Overlay */}
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
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  maskTop: {
    flex: 1.2,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  maskMiddleRow: {
    height: SCAN_FRAME_SIZE,
    flexDirection: "row",
  },
  maskSide: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  scanViewport: {
    width: SCAN_FRAME_SIZE,
    height: SCAN_FRAME_SIZE,
    position: "relative",
    overflow: "hidden",
  },
  maskBottom: {
    flex: 2,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  cornerTick: {
    position: "absolute",
    width: 28,
    height: 28,
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
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 5,
  },
  foodTag: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
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
  // Permission screen styles
  permissionIconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(255,255,255,0.07)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  permissionTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 12,
  },
  permissionSubtitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 36,
  },
  permissionButton: {
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
