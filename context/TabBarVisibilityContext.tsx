import React, { createContext, useContext, useState, useRef, useCallback } from "react";
import { NativeSyntheticEvent, NativeScrollEvent } from "react-native";

interface TabBarVisibilityContextType {
  isTabBarVisible: boolean;
  setTabBarVisible: (visible: boolean) => void;
  handleScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

const TabBarVisibilityContext = createContext<TabBarVisibilityContextType | undefined>(undefined);

export function TabBarVisibilityProvider({ children }: { children: React.ReactNode }) {
  const [isTabBarVisible, setTabBarVisible] = useState(true);
  const lastOffset = useRef(0);
  const throttleRef = useRef(false);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (throttleRef.current) return;
    throttleRef.current = true;

    requestAnimationFrame(() => {
      throttleRef.current = false;
    });

    const currentOffset = event.nativeEvent.contentOffset.y;

    if (currentOffset <= 0) {
      setTabBarVisible(true);
      return;
    }

    const contentHeight = event.nativeEvent.contentSize.height;
    const layoutHeight = event.nativeEvent.layoutMeasurement.height;

    if (currentOffset + layoutHeight >= contentHeight - 20) {
      return;
    }

    const diff = currentOffset - lastOffset.current;
    if (Math.abs(diff) > 15) {
      if (diff > 0 && currentOffset > 80) {
        setTabBarVisible(false);
      } else if (diff < 0) {
        setTabBarVisible(true);
      }
      lastOffset.current = currentOffset;
    }
  }, []);

  return (
    <TabBarVisibilityContext.Provider value={{ isTabBarVisible, setTabBarVisible, handleScroll }}>
      {children}
    </TabBarVisibilityContext.Provider>
  );
}

export function useTabBarVisibility() {
  const context = useContext(TabBarVisibilityContext);
  if (!context) {
    throw new Error("useTabBarVisibility must be used within a TabBarVisibilityProvider");
  }
  return context;
}
