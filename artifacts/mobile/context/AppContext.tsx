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
  name: "",
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
  moodGoal: string | null;
  setMoodGoal: (goal: string) => void;
  mindScanResult: string | null;
  setMindScanResult: (result: string) => void;
  calmCoins: number;
  addCoins: (amount: number) => void;
  streak: number;
  incrementStreak: () => void;
  logout: () => Promise<void>;
  isReady: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [onboardingComplete, setOnboardingCompleteState] = useState(false);
  const [todayCheckin, setTodayCheckinState] = useState<string | null>(null);
  const [currentUser, setCurrentUserState] = useState<NervanaUser>(GUEST_USER);
  const [moodGoal, setMoodGoalState] = useState<string | null>(null);
  const [mindScanResult, setMindScanResultState] = useState<string | null>(null);
  const [calmCoins, setCalmCoins] = useState(1240);
  const [streak, setStreak] = useState(12);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [onboardStatus, storedCheckin, storedUser, storedCoins, storedStreak] = await Promise.all([
          AsyncStorage.getItem("nervana_onboarding_complete").catch(() => null),
          AsyncStorage.getItem("nervana_today_checkin").catch(() => null),
          AsyncStorage.getItem("nervana_user").catch(() => null),
          AsyncStorage.getItem("nervana_calm_coins").catch(() => null),
          AsyncStorage.getItem("nervana_streak").catch(() => null),
        ]);

        if (onboardStatus === "true") setOnboardingCompleteState(true);
        if (storedCheckin) setTodayCheckinState(storedCheckin);
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            setCurrentUserState({ ...GUEST_USER, ...parsed });
          } catch {
            setCurrentUserState(GUEST_USER);
          }
        }
        if (storedCoins) setCalmCoins(parseInt(storedCoins, 10) || 1240);
        if (storedStreak) setStreak(parseInt(storedStreak, 10) || 12);
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
    } catch {}
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
    } catch {}
  }, []);

  const setMoodGoal = useCallback((goal: string) => {
    setMoodGoalState(goal);
  }, []);

  const setMindScanResult = useCallback((result: string) => {
    setMindScanResultState(result);
  }, []);

  const addCoins = useCallback((amount: number) => {
    setCalmCoins((prev) => {
      const next = prev + amount;
      AsyncStorage.setItem("nervana_calm_coins", next.toString()).catch(() => {});
      return next;
    });
  }, []);

  const incrementStreak = useCallback(() => {
    setStreak((prev) => {
      const next = prev + 1;
      AsyncStorage.setItem("nervana_streak", next.toString()).catch(() => {});
      return next;
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem("nervana_onboarding_complete"),
        AsyncStorage.removeItem("nervana_user"),
        AsyncStorage.removeItem("nervana_today_checkin"),
        AsyncStorage.removeItem("nervana_calm_coins"),
        AsyncStorage.removeItem("nervana_streak"),
      ]);
    } catch {}
    setOnboardingCompleteState(false);
    setCurrentUserState(GUEST_USER);
    setTodayCheckinState(null);
    setCalmCoins(0);
    setStreak(0);
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
        moodGoal,
        setMoodGoal,
        mindScanResult,
        setMindScanResult,
        calmCoins,
        addCoins,
        streak,
        incrementStreak,
        logout,
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
    return {
      onboardingComplete: false,
      setOnboardingComplete: async () => {},
      currentUser: GUEST_USER,
      setCurrentUser: () => {},
      todayCheckin: null,
      setTodayCheckin: async () => {},
      moodGoal: null,
      setMoodGoal: () => {},
      mindScanResult: null,
      setMindScanResult: () => {},
      calmCoins: 1240,
      addCoins: () => {},
      streak: 12,
      incrementStreak: () => {},
      logout: async () => {},
      isReady: true,
    };
  }
  return ctx;
}
