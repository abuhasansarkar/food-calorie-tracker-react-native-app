import { createContext, useContext, ReactNode, useState, useMemo, useEffect } from "react";
import { useColorScheme, ActivityIndicator, View } from "react-native";
import { useColorScheme as useNativewindColorScheme } from "nativewind";
import { colors } from "@/theme/colors";
import * as SecureStore from "expo-secure-store";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  colors: typeof colors;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const THEME_STORE_KEY = "aceky_theme_mode";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const { setColorScheme } = useNativewindColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load persisted theme preference
    async function loadTheme() {
      try {
        const savedMode = await SecureStore.getItemAsync(THEME_STORE_KEY);
        if (savedMode === "light" || savedMode === "dark" || savedMode === "system") {
          setModeState(savedMode);
        }
      } catch (error) {
        console.error("Failed to load theme preference from SecureStore", error);
      } finally {
        setIsLoaded(true);
      }
    }
    loadTheme();
  }, []);

  const isDark = useMemo(() => {
    if (mode === "system") return systemScheme === "dark";
    return mode === "dark";
  }, [mode, systemScheme]);

  useEffect(() => {
    setColorScheme(isDark ? "dark" : "light");
  }, [isDark, setColorScheme]);

  const setMode = async (newMode: ThemeMode) => {
    try {
      setModeState(newMode);
      await SecureStore.setItemAsync(THEME_STORE_KEY, newMode);
    } catch (error) {
      console.error("Failed to save theme preference to SecureStore", error);
    }
  };

  const toggleTheme = async () => {
    const nextMode = isDark ? "light" : "dark";
    await setMode(nextMode);
  };

  // Prevent flash or layout shifts before initial theme selection is resolved
  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: "#F8F9FA" }}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  return (
    <ThemeContext.Provider
      value={{
        mode,
        isDark,
        colors,
        setMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
}
