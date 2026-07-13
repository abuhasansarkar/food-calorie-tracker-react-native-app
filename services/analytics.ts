import { Config } from "@/constants/Config";

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp?: string;
}

export interface UserProperties {
  userId?: string;
  tier?: string;
  age?: number;
  gender?: string;
  goalType?: string;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private userProperties: UserProperties = {};
  private flushInterval: ReturnType<typeof setInterval> | null = null;
  private isFlushing = false;

  startAutoFlush(intervalMs = 30000): void {
    if (this.flushInterval) return;
    this.flushInterval = setInterval(() => {
      this.flush();
    }, intervalMs);
  }

  setUserProperties(properties: UserProperties): void {
    this.userProperties = { ...this.userProperties, ...properties };
  }

  trackEvent(name: string, properties?: Record<string, unknown>): void {
    const event: AnalyticsEvent = {
      name,
      properties: {
        ...properties,
        ...this.userProperties,
      },
      timestamp: new Date().toISOString(),
    };

    this.events.push(event);

    if (__DEV__) {
      console.log("[Analytics]", name, properties);
    }
  }

  trackScreen(screenName: string): void {
    this.trackEvent("screen_view", { screen: screenName });
  }

  trackLogin(method: string): void {
    this.trackEvent("login", { method });
  }

  trackSignUp(method: string): void {
    this.trackEvent("sign_up", { method });
  }

  trackMealLogged(foodCount: number, totalCalories: number): void {
    this.trackEvent("meal_logged", {
      food_count: foodCount,
      total_calories: totalCalories,
    });
  }

  trackScanCompleted(foodCount: number, confidence: number): void {
    this.trackEvent("scan_completed", {
      food_count: foodCount,
      confidence,
    });
  }

  trackWeightLogged(weightKg: number): void {
    this.trackEvent("weight_logged", { weight_kg: weightKg });
  }

  trackSubscriptionChanged(tier: string): void {
    this.trackEvent("subscription_changed", { tier });
  }

  trackOnboardingCompleted(goalType: string): void {
    this.trackEvent("onboarding_completed", { goal_type: goalType });
  }

  getEvents(): AnalyticsEvent[] {
    return this.events;
  }

  async flush(): Promise<void> {
    if (this.events.length === 0 || this.isFlushing) return;

    this.isFlushing = true;
    const batch = [...this.events];
    this.events = [];

    try {
      const response = await fetch(`${Config.api.baseUrl}/analytics/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: batch }),
      });

      if (!response.ok) {
        if (__DEV__) {
          console.warn("[Analytics] Failed to flush events:", response.status);
        }
        this.events = [...batch, ...this.events];
      }
    } catch (error) {
      if (__DEV__) {
        console.warn("[Analytics] Flush failed, re-queuing events:", error);
      }
      this.events = [...batch, ...this.events];
    } finally {
      this.isFlushing = false;
    }
  }

  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    this.events = [];
    this.userProperties = {};
    this.isFlushing = false;
  }
}

export const analyticsService = new AnalyticsService();
