import { apiService } from "./api";
import { storageService } from "./storage";
import { SubscriptionTier, ProductPricing, Subscription } from "@/types/subscription";
import { Config } from "@/constants/Config";

const STATIC_PLANS: ProductPricing[] = [
  {
    id: "free",
    tier: SubscriptionTier.Free,
    name: "Free",
    description: "Get started with basic tracking",
    price: 0,
    currency: "USD",
    interval: "month",
    features: [
      "3 daily AI scans",
      "7-day meal history",
      "Basic nutrition tracking",
      "Weight tracking",
    ],
  },
  {
    id: "premium",
    tier: SubscriptionTier.Premium,
    name: "Premium",
    description: "Advanced nutrition insights",
    price: 9.99,
    currency: "USD",
    interval: "month",
    features: [
      "50 daily AI scans",
      "90-day meal history",
      "Advanced nutrition insights",
      "Macro tracking",
      "Meal reminders",
      "Progress charts",
      "No ads",
    ],
  },
  {
    id: "premium_plus",
    tier: SubscriptionTier.PremiumPlus,
    name: "Premium Plus",
    description: "Personalized AI coaching",
    price: 19.99,
    currency: "USD",
    interval: "month",
    features: [
      "Unlimited AI scans",
      "Unlimited meal history",
      "Personalized meal plans",
      "Recipe suggestions",
      "AI coach chat",
      "Priority support",
      "All Premium features",
    ],
  },
];

const SUBSCRIPTION_STORAGE_KEY = "@aceky_subscription";

class SubscriptionService {
  async getPlans(): Promise<ProductPricing[]> {
    try {
      const response = await apiService.get<ProductPricing[]>("/subscription/plans");
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      if (__DEV__) console.warn("[SubscriptionService] Failed to fetch plans:", error);
    }
    return STATIC_PLANS;
  }

  async getSubscription(): Promise<Subscription | null> {
    try {
      const response = await apiService.get<Subscription>("/subscription");
      if (response.success && response.data) {
        await storageService.set(SUBSCRIPTION_STORAGE_KEY, response.data);
        return response.data;
      }
    } catch (error) {
      if (__DEV__) console.warn("[SubscriptionService] Failed to fetch subscription:", error);
    }
    return storageService.get<Subscription>(SUBSCRIPTION_STORAGE_KEY);
  }

  async getCurrentTier(): Promise<SubscriptionTier> {
    const sub = await this.getSubscription();
    if (sub?.isActive) return sub.tier;
    const cached = await storageService.get<{ tier: SubscriptionTier }>(SUBSCRIPTION_STORAGE_KEY);
    return cached?.tier || SubscriptionTier.Free;
  }

  async getLimits(): Promise<{ dailyScans: number; mealHistory: number }> {
    const tier = await this.getCurrentTier();
    switch (tier) {
      case SubscriptionTier.Premium:
      case SubscriptionTier.PremiumPlus:
        return Config.subscription.premium;
      default:
        return Config.subscription.free;
    }
  }
}

export const subscriptionService = new SubscriptionService();
