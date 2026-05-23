import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { mockUser } from "../data/mock";

interface AppContextType {
  onboardingComplete: boolean;
  setOnboardingComplete: (val: boolean) => void;
  currentUser: typeof mockUser;
  todayCheckin: string | null;
  setTodayCheckin: (mood: string | null) => void;
  isReady: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [onboardingComplete, setOnboardingCompleteState] = useState(false);
  const [todayCheckin, setTodayCheckinState] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const onboardStatus = await AsyncStorage.getItem("nervana_onboarding_complete");
        if (onboardStatus === "true") {
          setOnboardingCompleteState(true);
        }
        
        // Mock checkin load
        const storedCheckin = await AsyncStorage.getItem("nervana_today_checkin");
        if (storedCheckin) {
          setTodayCheckinState(storedCheckin);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsReady(true);
      }
    }
    loadData();
  }, []);

  const setOnboardingComplete = async (val: boolean) => {
    setOnboardingCompleteState(val);
    await AsyncStorage.setItem("nervana_onboarding_complete", val.toString());
  };

  const setTodayCheckin = async (mood: string | null) => {
    setTodayCheckinState(mood);
    if (mood) {
      await AsyncStorage.setItem("nervana_today_checkin", mood);
    } else {
      await AsyncStorage.removeItem("nervana_today_checkin");
    }
  };

  return (
    <AppContext.Provider
      value={{
        onboardingComplete,
        setOnboardingComplete,
        currentUser: mockUser,
        todayCheckin,
        setTodayCheckin,
        isReady
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
