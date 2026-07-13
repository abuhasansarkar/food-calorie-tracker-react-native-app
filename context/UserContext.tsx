import { createContext, useContext, ReactNode, useState, useCallback, useEffect } from "react";
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
  const { user: clerkUser, isLoaded } = useUser();
  const clerk = useClerk();
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      isGuestSession().then(setIsGuest);
      getOnboardingData().then(setOnboardingData);
    }
  }, [isLoaded]);

  const user: UserProfile | null = isLoaded && clerkUser ? clerkUserToProfile(clerkUser) : null;

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

  return (
    <UserContext.Provider
      value={{
        user,
        isLoaded,
        isGuest,
        onboardingData,
        saveOnboardingData,
        getOnboardingData,
        completeOnboarding,
        logout,
      }}
    >
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