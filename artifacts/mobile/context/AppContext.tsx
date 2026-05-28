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

export interface JournalEntry {
  id: string;
  prompt: string;
  content: string;
  date: string;
  createdAt: number;
}

export interface OnboardingAnswers {
  moodGoal: string | null;
  reason: string | null;
  struggle: string | null;
  preferredState: string | null;
}

export interface MindScanEntry {
  id: string;
  result: string;
  recommendation: string;
  scores: Record<string, number>;
  date: string;
  createdAt: number;
}

const GUEST_USER: NervanaUser = {
  id: "guest-user",
  name: "",
  profession: "",
  stressLevel: "",
  emotionalGoals: [],
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
  journalEntries: JournalEntry[];
  addJournalEntry: (entry: Omit<JournalEntry, "id" | "createdAt">) => void;
  onboardingAnswers: OnboardingAnswers;
  setOnboardingAnswers: (answers: Partial<OnboardingAnswers>) => void;
  mindScanHistory: MindScanEntry[];
  addMindScanEntry: (entry: Omit<MindScanEntry, "id" | "createdAt">) => void;
  referralCount: number;
  logout: () => Promise<void>;
  isReady: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  onboarding: "nervana_onboarding_complete",
  checkin: "nervana_today_checkin",
  user: "nervana_user",
  coins: "nervana_calm_coins",
  streak: "nervana_streak",
  journal: "nervana_journal_entries",
  answers: "nervana_onboarding_answers",
  mindScanHistory: "nervana_mindscan_history",
  referrals: "nervana_referral_count",
};

const DEFAULT_ANSWERS: OnboardingAnswers = {
  moodGoal: null,
  reason: null,
  struggle: null,
  preferredState: null,
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [onboardingComplete, setOnboardingCompleteState] = useState(false);
  const [todayCheckin, setTodayCheckinState] = useState<string | null>(null);
  const [currentUser, setCurrentUserState] = useState<NervanaUser>(GUEST_USER);
  const [moodGoal, setMoodGoalState] = useState<string | null>(null);
  const [mindScanResult, setMindScanResultState] = useState<string | null>(null);
  const [calmCoins, setCalmCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [onboardingAnswers, setOnboardingAnswersState] = useState<OnboardingAnswers>(DEFAULT_ANSWERS);
  const [mindScanHistory, setMindScanHistory] = useState<MindScanEntry[]>([]);
  const [referralCount] = useState(3);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [
          onboardStatus,
          storedCheckin,
          storedUser,
          storedCoins,
          storedStreak,
          storedJournal,
          storedAnswers,
          storedMindScanHistory,
        ] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.onboarding).catch(() => null),
          AsyncStorage.getItem(STORAGE_KEYS.checkin).catch(() => null),
          AsyncStorage.getItem(STORAGE_KEYS.user).catch(() => null),
          AsyncStorage.getItem(STORAGE_KEYS.coins).catch(() => null),
          AsyncStorage.getItem(STORAGE_KEYS.streak).catch(() => null),
          AsyncStorage.getItem(STORAGE_KEYS.journal).catch(() => null),
          AsyncStorage.getItem(STORAGE_KEYS.answers).catch(() => null),
          AsyncStorage.getItem(STORAGE_KEYS.mindScanHistory).catch(() => null),
        ]);

        if (onboardStatus === "true") setOnboardingCompleteState(true);
        if (storedCheckin) setTodayCheckinState(storedCheckin);
        if (storedUser) {
          try { setCurrentUserState({ ...GUEST_USER, ...JSON.parse(storedUser) }); } catch {}
        }
        if (storedCoins) setCalmCoins(parseInt(storedCoins, 10) || 0);
        if (storedStreak) setStreak(parseInt(storedStreak, 10) || 0);
        if (storedJournal) {
          try { setJournalEntries(JSON.parse(storedJournal) || []); } catch {}
        }
        if (storedAnswers) {
          try { setOnboardingAnswersState({ ...DEFAULT_ANSWERS, ...JSON.parse(storedAnswers) }); } catch {}
        }
        if (storedMindScanHistory) {
          try { setMindScanHistory(JSON.parse(storedMindScanHistory) || []); } catch {}
        }
      } catch {
      } finally {
        setIsReady(true);
      }
    }
    loadData();
  }, []);

  const setOnboardingComplete = useCallback(async (val: boolean) => {
    setOnboardingCompleteState(val);
    try { await AsyncStorage.setItem(STORAGE_KEYS.onboarding, val.toString()); } catch {}
  }, []);

  const setCurrentUser = useCallback((updates: Partial<NervanaUser>) => {
    setCurrentUserState((prev) => {
      const next = { ...prev, ...updates };
      AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const setTodayCheckin = useCallback(async (mood: string | null) => {
    setTodayCheckinState(mood);
    try {
      if (mood) await AsyncStorage.setItem(STORAGE_KEYS.checkin, mood);
      else await AsyncStorage.removeItem(STORAGE_KEYS.checkin);
    } catch {}
  }, []);

  const setMoodGoal = useCallback((goal: string) => { setMoodGoalState(goal); }, []);

  const setMindScanResult = useCallback((result: string) => { setMindScanResultState(result); }, []);

  const addCoins = useCallback((amount: number) => {
    setCalmCoins((prev) => {
      const next = prev + amount;
      AsyncStorage.setItem(STORAGE_KEYS.coins, next.toString()).catch(() => {});
      return next;
    });
  }, []);

  const incrementStreak = useCallback(() => {
    setStreak((prev) => {
      const next = prev + 1;
      AsyncStorage.setItem(STORAGE_KEYS.streak, next.toString()).catch(() => {});
      return next;
    });
  }, []);

  const addJournalEntry = useCallback((entry: Omit<JournalEntry, "id" | "createdAt">) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 6),
      createdAt: Date.now(),
    };
    setJournalEntries((prev) => {
      const next = [newEntry, ...prev];
      AsyncStorage.setItem(STORAGE_KEYS.journal, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const setOnboardingAnswers = useCallback((answers: Partial<OnboardingAnswers>) => {
    setOnboardingAnswersState((prev) => {
      const next = { ...prev, ...answers };
      AsyncStorage.setItem(STORAGE_KEYS.answers, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const addMindScanEntry = useCallback((entry: Omit<MindScanEntry, "id" | "createdAt">) => {
    const newEntry: MindScanEntry = {
      ...entry,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 6),
      createdAt: Date.now(),
    };
    setMindScanHistory((prev) => {
      const next = [newEntry, ...prev.slice(0, 29)];
      AsyncStorage.setItem(STORAGE_KEYS.mindScanHistory, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await Promise.all(Object.values(STORAGE_KEYS).map((k) => AsyncStorage.removeItem(k)));
    } catch {}
    setOnboardingCompleteState(false);
    setCurrentUserState(GUEST_USER);
    setTodayCheckinState(null);
    setCalmCoins(0);
    setStreak(0);
    setJournalEntries([]);
    setOnboardingAnswersState(DEFAULT_ANSWERS);
    setMindScanHistory([]);
    setMoodGoalState(null);
    setMindScanResultState(null);
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
        journalEntries,
        addJournalEntry,
        onboardingAnswers,
        setOnboardingAnswers,
        mindScanHistory,
        addMindScanEntry,
        referralCount,
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
      calmCoins: 0,
      addCoins: () => {},
      streak: 0,
      incrementStreak: () => {},
      journalEntries: [],
      addJournalEntry: () => {},
      onboardingAnswers: DEFAULT_ANSWERS,
      setOnboardingAnswers: () => {},
      mindScanHistory: [],
      addMindScanEntry: () => {},
      referralCount: 3,
      logout: async () => {},
      isReady: true,
    };
  }
  return ctx;
}
