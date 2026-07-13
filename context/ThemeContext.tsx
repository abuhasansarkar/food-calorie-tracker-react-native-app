import { createContext, useContext, ReactNode, useState, useMemo, useEffect } from "react";
import { useColorScheme } from "react-native";
import { useColorScheme as useNativewindColorScheme } from "nativewind";
import { colors } from "@/theme/colors";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  colors: typeof colors;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const { setColorScheme } = useNativewindColorScheme();
  const [mode, setMode] = useState<ThemeMode>("system");

  const isDark = useMemo(() => {
    if (mode === "system") return systemScheme === "dark";
    return mode === "dark";
  }, [mode, systemScheme]);

  useEffect(() => {
    setColorScheme(isDark ? "dark" : "light");
  }, [isDark, setColorScheme]);

  const toggleTheme = () => {
    setMode((prev) => {
      if (prev === "system") return isDark ? "light" : "dark";
      return prev === "dark" ? "light" : "dark";
    });
  };

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
