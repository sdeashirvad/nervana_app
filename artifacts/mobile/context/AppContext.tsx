import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface NervanaUser {
  id: string;
  name: string;
  profession: string;
  stressLevel: string;
  emotionalGoals: string[];
  isGuest: boolean;
}

const GUEST_USER: NervanaUser = {
  id: "guest-user",
  name: "Alex",
  profession: "Software Engineer",
  stressLevel: "High",
  emotionalGoals: ["Reduce burnout", "Sleep better"],
  isGuest: true,
};

interface AppContextType {
  onboardingComplete: boolean;
  setOnboardingComplete: (val: boolean) => Promise<void>;
  currentUser: NervanaUser;
  setCurrentUser: (updates: Partial<NervanaUser>) => void;
  todayCheckin: string | null;
  setTodayCheckin: (mood: string | null) => Promise<void>;
  isReady: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [onboardingComplete, setOnboardingCompleteState] = useState(false);
  const [todayCheckin, setTodayCheckinState] = useState<string | null>(null);
  const [currentUser, setCurrentUserState] = useState<NervanaUser>(GUEST_USER);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [onboardStatus, storedCheckin, storedUser] = await Promise.all([
          AsyncStorage.getItem("nervana_onboarding_complete").catch(() => null),
          AsyncStorage.getItem("nervana_today_checkin").catch(() => null),
          AsyncStorage.getItem("nervana_user").catch(() => null),
        ]);

        if (onboardStatus === "true") {
          setOnboardingCompleteState(true);
        }
        if (storedCheckin) {
          setTodayCheckinState(storedCheckin);
        }
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            setCurrentUserState({ ...GUEST_USER, ...parsed });
          } catch {
            setCurrentUserState(GUEST_USER);
          }
        }
      } catch {
        // Storage unavailable — use defaults silently
      } finally {
        setIsReady(true);
      }
    }
    loadData();
  }, []);

  const setOnboardingComplete = useCallback(async (val: boolean) => {
    setOnboardingCompleteState(val);
    try {
      await AsyncStorage.setItem("nervana_onboarding_complete", val.toString());
    } catch {
      // Storage unavailable — state is still set in memory
    }
  }, []);

  const setCurrentUser = useCallback((updates: Partial<NervanaUser>) => {
    setCurrentUserState((prev) => {
      const next = { ...prev, ...updates };
      AsyncStorage.setItem("nervana_user", JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const setTodayCheckin = useCallback(async (mood: string | null) => {
    setTodayCheckinState(mood);
    try {
      if (mood) {
        await AsyncStorage.setItem("nervana_today_checkin", mood);
      } else {
        await AsyncStorage.removeItem("nervana_today_checkin");
      }
    } catch {
      // Storage unavailable — state is still set in memory
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        onboardingComplete,
        setOnboardingComplete,
        currentUser,
        setCurrentUser,
        todayCheckin,
        setTodayCheckin,
        isReady,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) {
    // Return safe defaults instead of throwing — prevents crashes outside provider
    return {
      onboardingComplete: false,
      setOnboardingComplete: async () => {},
      currentUser: GUEST_USER,
      setCurrentUser: () => {},
      todayCheckin: null,
      setTodayCheckin: async () => {},
      isReady: true,
    };
  }
  return ctx;
}
