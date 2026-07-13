import { useState, useCallback } from "react";
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
        options.onScanComplete?.(result);
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to analyze image";
        setError(message);
        options.onScanError?.(err instanceof Error ? err : new Error(message));
        return null;
      } finally {
        setIsScanning(false);
      }
    },
    [options]
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
