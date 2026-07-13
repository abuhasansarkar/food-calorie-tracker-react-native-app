import { useState, useCallback, useRef, useEffect } from "react";
import { aiService } from "@/services/ai";
import { ScanResult, FoodItem } from "@/types/meal";
import { analyticsService } from "@/services/analytics";

interface UseMealScannerOptions {
  onScanComplete?: (result: ScanResult) => void;
  onScanError?: (error: Error) => void;
}

export function useMealScanner(options: UseMealScannerOptions = {}) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Use ref to avoid stale closure over options
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const scanImage = useCallback(
    async (imageUri: string) => {
      setIsScanning(true);
      setError(null);
      setScanResult(null);

      try {
        const result = await aiService.analyzeFoodImage(imageUri);
        setScanResult(result);
        analyticsService.trackScanCompleted(
          result.foods.length,
          result.confidence
        );
        optionsRef.current.onScanComplete?.(result);
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to analyze image";
        setError(message);
        optionsRef.current.onScanError?.(err instanceof Error ? err : new Error(message));
        return null;
      } finally {
        setIsScanning(false);
      }
    },
    []
  );

  const searchFood = useCallback(async (query: string): Promise<FoodItem[]> => {
    try {
      return await aiService.searchFood(query);
    } catch {
      return [];
    }
  }, []);

  const reset = useCallback(() => {
    setScanResult(null);
    setError(null);
    setIsScanning(false);
  }, []);

  return {
    isScanning,
    scanResult,
    error,
    scanImage,
    searchFood,
    reset,
  };
}
