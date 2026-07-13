import { useState, useEffect, useCallback } from "react";

interface NetworkState {
  isConnected: boolean;
  type: string | null;
}

// Lightweight network status hook using fetch to check connectivity
export function useNetworkStatus() {
  const [state, setState] = useState<NetworkState>({
    isConnected: true,
    type: null,
  });

  const checkConnectivity = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      await fetch("https://clients3.google.com/generate_204", {
        method: "HEAD",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      setState({ isConnected: true, type: "internet" });
    } catch {
      setState({ isConnected: false, type: null });
    }
  }, []);

  useEffect(() => {
    checkConnectivity();
    const interval = setInterval(checkConnectivity, 30000);
    return () => clearInterval(interval);
  }, [checkConnectivity]);

  return state;
}

export async function checkNetworkStatus(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    await fetch("https://clients3.google.com/generate_204", {
      method: "HEAD",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return true;
  } catch {
    return false;
  }
}