export enum SubscriptionTier {
  Free = "free",
  Premium = "premium",
  PremiumPlus = "premium_plus",
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  included: boolean;
  tier: SubscriptionTier;
}

export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  startDate: string;
  endDate?: string;
  autoRenew: boolean;
  isActive: boolean;
  features: Feature[];
  paymentProvider?: string;
  paymentId?: string;
}

export interface ProductPricing {
  id: string;
  tier: SubscriptionTier;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: "month" | "year";
  features: string[];
}

export interface PremiumFeature {
  id: string;
  key: string;
  name: string;
  description: string;
  isPremium: boolean;
}
