import { createContext, useContext, ReactNode, useState, useCallback, useEffect, useMemo } from "react";
import { useUser, useClerk } from "@clerk/expo";
import { UserProfile, OnboardingData } from "@/types/user";
import * as SecureStore from "expo-secure-store";
import { isGuestSession, endGuestSession } from "@/utils/guest";

const ONBOARDING_DATA_KEY = "aceky_onboarding_data";
const ONBOARDING_COMPLETED_KEY = "aceky_onboarding_completed";

interface UserContextType {
  user: UserProfile | null;
  isLoaded: boolean;
  isGuest: boolean;
  onboardingData: OnboardingData | null;
  saveOnboardingData: (data: Partial<OnboardingData>) => Promise<void>;
  getOnboardingData: () => Promise<OnboardingData | null>;
  completeOnboarding: () => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

function clerkUserToProfile(clerkUser: any): UserProfile {
  const primaryEmail = clerkUser.primaryEmailAddress?.emailAddress || "";
  return {
    id: clerkUser.id,
    email: primaryEmail,
    name: clerkUser.fullName || clerkUser.firstName || "",
    avatar: clerkUser.imageUrl,
    onboardingCompleted: false,
    onboardingData: {
      gender: null,
      age: null,
      heightCm: null,
      weightKg: null,
      goalWeightKg: null,
      activityLevel: null,
      gymExperience: null,
      goalType: null,
      dailyCalories: null,
    },
    createdAt: clerkUser.createdAt?.toISOString?.() || new Date().toISOString(),
    updatedAt: clerkUser.updatedAt?.toISOString?.() || new Date().toISOString(),
  };
}

export function UserProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const clerk = useClerk();
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    if (clerkLoaded) {
      isGuestSession().then(setIsGuest);
      getOnboardingData().then(setOnboardingData);
    }
  }, [clerkLoaded]);

  const user = useMemo<UserProfile | null>(() => {
    return clerkLoaded && clerkUser ? clerkUserToProfile(clerkUser) : null;
  }, [clerkLoaded, clerkUser]);

  const saveOnboardingData = useCallback(async (data: Partial<OnboardingData>) => {
    const existing = await SecureStore.getItemAsync(ONBOARDING_DATA_KEY);
    const parsed: OnboardingData | null = existing ? JSON.parse(existing) : null;
    const merged = { ...parsed, ...data } as OnboardingData;
    await SecureStore.setItemAsync(ONBOARDING_DATA_KEY, JSON.stringify(merged));
    setOnboardingData(merged);
  }, []);

  const getOnboardingData = useCallback(async (): Promise<OnboardingData | null> => {
    const data = await SecureStore.getItemAsync(ONBOARDING_DATA_KEY);
    return data ? JSON.parse(data) : null;
  }, []);

  const completeOnboarding = useCallback(async () => {
    await SecureStore.setItemAsync(ONBOARDING_COMPLETED_KEY, "true");
  }, []);

  const logout = useCallback(async () => {
    await endGuestSession();
    await SecureStore.deleteItemAsync(ONBOARDING_DATA_KEY);
    await SecureStore.deleteItemAsync(ONBOARDING_COMPLETED_KEY);
    await clerk.signOut();
  }, [clerk]);

  const contextValue = useMemo(() => ({
    user,
    isLoaded: clerkLoaded,
    isGuest,
    onboardingData,
    saveOnboardingData,
    getOnboardingData,
    completeOnboarding,
    logout,
  }), [user, clerkLoaded, isGuest, onboardingData, saveOnboardingData, getOnboardingData, completeOnboarding, logout]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext(): UserContextType {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
}
