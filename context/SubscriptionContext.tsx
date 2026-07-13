import { createContext, useContext, ReactNode, useState, useCallback, useEffect, useMemo } from "react";
import { SubscriptionTier, ProductPricing, Subscription, Feature } from "@/types/subscription";
import { subscriptionService } from "@/services/subscription";

interface SubscriptionContextType {
  plans: ProductPricing[];
  currentSubscription: Subscription | null;
  currentTier: SubscriptionTier;
  hasPremium: boolean;
  isLoading: boolean;
  dailyScans: number;
  mealHistoryDays: number;
  getFeature: (key: string) => Feature | undefined;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [plans, setPlans] = useState<ProductPricing[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    refreshSubscription();
  }, []);

  const refreshSubscription = useCallback(async () => {
    setIsLoading(true);
    const [fetchedPlans, fetchedSub] = await Promise.all([
      subscriptionService.getPlans(),
      subscriptionService.getSubscription(),
    ]);
    setPlans(fetchedPlans);
    setCurrentSubscription(fetchedSub);
    setIsLoading(false);
  }, []);

  const currentTier = useMemo(() => {
    if (currentSubscription?.isActive) return currentSubscription.tier;
    return SubscriptionTier.Free;
  }, [currentSubscription]);

  const hasPremium = useMemo(() => {
    return currentTier !== SubscriptionTier.Free;
  }, [currentTier]);

  const dailyScans = useMemo(() => {
    if (currentTier === SubscriptionTier.Premium) return 50;
    if (currentTier === SubscriptionTier.PremiumPlus) return Infinity;
    return 3;
  }, [currentTier]);

  const mealHistoryDays = useMemo(() => {
    if (currentTier === SubscriptionTier.Premium) return 90;
    if (currentTier === SubscriptionTier.PremiumPlus) return Infinity;
    return 7;
  }, [currentTier]);

  const getFeature = useCallback((key: string): Feature | undefined => {
    return currentSubscription?.features?.find((f) => f.id === key);
  }, [currentSubscription]);

  const contextValue = useMemo(() => ({
    plans,
    currentSubscription,
    currentTier,
    hasPremium,
    isLoading,
    dailyScans,
    mealHistoryDays,
    getFeature,
    refreshSubscription,
  }), [plans, currentSubscription, currentTier, hasPremium, isLoading, dailyScans, mealHistoryDays, getFeature, refreshSubscription]);

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptionContext(): SubscriptionContextType {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscriptionContext must be used within a SubscriptionProvider");
  }
  return context;
}
