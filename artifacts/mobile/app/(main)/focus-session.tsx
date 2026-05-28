import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { AtmosphericBackground } from "@/components/AtmosphericBackground";
import { PremiumCard } from "@/components/PremiumCard";
import { GlowText } from "@/components/GlowText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useAppContext } from "@/context/AppContext";
import Animated, {
  FadeInUp,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

const DURATIONS = [
  { label: "5 min", seconds: 300, coins: 25, sub: "Quick clarity" },
  { label: "10 min", seconds: 600, coins: 50, sub: "Deep flow" },
  { label: "15 min", seconds: 900, coins: 80, sub: "Full session" },
];

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function AmbientRing({ progress }: { progress: number }) {
  const colors = useColors();
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.04, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  return (
    <View style={ringStyles.container}>
      <Animated.View style={[ringStyles.outerRing, { borderColor: `${colors.primary}20` }, pulseStyle]} />
      <View style={[ringStyles.middleRing, { borderColor: `${colors.primary}30` }]} />
      <View style={[ringStyles.innerCircle, { backgroundColor: `${colors.primary}08`, borderColor: `${colors.primary}25` }]}>
        <View style={[ringStyles.coreDot, { backgroundColor: `${colors.primary}60` }]} />
      </View>
    </View>
  );
}

const ringStyles = StyleSheet.create({
  container: { width: 200, height: 200, alignItems: "center", justifyContent: "center" },
  outerRing: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
  },
  middleRing: {
    position: "absolute",
    width: 158,
    height: 158,
    borderRadius: 79,
    borderWidth: 1.5,
  },
  innerCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  coreDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default function FocusSessionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { addCoins, incrementStreak } = useAppContext();

  const [step, setStep] = useState<"select" | "active" | "complete">("select");
  const [selected, setSelected] = useState<(typeof DURATIONS)[0]>(DURATIONS[1]);
  const [secondsLeft, setSecondsLeft] = useState(selected.seconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const topPad = Platform.OS === "web" ? 64 : insets.top + 24;
  const bottomPad = Platform.OS === "web" ? 56 : insets.bottom + 36;

  const startSession = () => {
    setStep("active");
    setSecondsLeft(selected.seconds);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current!);
          addCoins(selected.coins);
          incrementStreak();
          setStep("complete");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const progress = 1 - secondsLeft / selected.seconds;
  const focusScore = Math.round(68 + progress * 18);

  return (
    <AtmosphericBackground>
      <View style={[styles.container, { paddingTop: topPad, paddingBottom: bottomPad }]}>
        <View style={styles.header}>
          <Pressable onPress={() => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            router.back();
          }} hitSlop={14}>
            <Feather name="x" size={22} color="rgba(255,255,255,0.35)" />
          </Pressable>
        </View>

        {/* STEP: Select duration */}
        {step === "select" && (
          <Animated.View entering={FadeIn.duration(600)} style={styles.content}>
            <View style={styles.introBadge}>
              <Feather name="zap" size={16} color={colors.primary} />
              <Text style={[styles.introBadgeText, { color: colors.primary }]}>Focus Session</Text>
            </View>
            <GlowText style={styles.introTitle}>How long{"\n"}can you focus?</GlowText>
            <Text style={[styles.introSub, { color: colors.mutedForeground }]}>
              Choose your window. We'll hold the space.
            </Text>

            <View style={styles.durationList}>
              {DURATIONS.map((d) => (
                <Pressable
                  key={d.label}
                  onPress={() => setSelected(d)}
                  style={[
                    styles.durationCard,
                    {
                      backgroundColor:
                        selected.label === d.label
                          ? "rgba(148,145,240,0.10)"
                          : "rgba(255,255,255,0.025)",
                      borderColor:
                        selected.label === d.label
                          ? "rgba(148,145,240,0.42)"
                          : "rgba(255,255,255,0.08)",
                    },
                  ]}
                >
                  <View style={styles.durationLeft}>
                    <Text style={[styles.durationLabel, { color: selected.label === d.label ? colors.primary : colors.foreground }]}>
                      {d.label}
                    </Text>
                    <Text style={[styles.durationSub, { color: colors.mutedForeground }]}>{d.sub}</Text>
                  </View>
                  <View style={styles.durationRight}>
                    <Feather name="circle" size={12} color={colors.primary} />
                    <Text style={[styles.coinText, { color: colors.primary }]}>+{d.coins}</Text>
                  </View>
                  {selected.label === d.label && (
                    <View style={[styles.selectedDot, { backgroundColor: colors.primary }]} />
                  )}
                </Pressable>
              ))}
            </View>

            <Pressable onPress={startSession} style={{ marginTop: 36 }}>
              <LinearGradient
                colors={["#9B98F4", "#7472D8", "#5F5DC4"]}
                style={styles.primaryBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.primaryBtnText}>Begin Focus</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        )}

        {/* STEP: Active session */}
        {step === "active" && (
          <Animated.View entering={FadeIn.duration(800)} style={styles.activeContent}>
            <Text style={[styles.phaseLabel, { color: `${colors.primary}88` }]}>
              {progress < 0.33 ? "Getting into flow" : progress < 0.66 ? "Staying present" : "Finishing strong"}
            </Text>
            <AmbientRing progress={progress} />
            <View style={styles.timerBlock}>
              <Text style={[styles.timerText, { color: colors.foreground }]}>
                {formatTime(secondsLeft)}
              </Text>
              <Text style={[styles.timerSub, { color: colors.mutedForeground }]}>remaining</Text>
            </View>
            <Text style={[styles.focusNote, { color: colors.mutedForeground }]}>
              Stay with what you're working on.{"\n"}You have this window.
            </Text>
            <Pressable
              onPress={() => {
                if (intervalRef.current) clearInterval(intervalRef.current);
                router.back();
              }}
              hitSlop={10}
            >
              <Text style={[styles.cancelText, { color: "rgba(255,255,255,0.22)" }]}>End early</Text>
            </Pressable>
          </Animated.View>
        )}

        {/* STEP: Complete */}
        {step === "complete" && (
          <Animated.View entering={FadeInUp.duration(700)} style={styles.content}>
            <View style={[styles.completeBadge, { backgroundColor: "rgba(148,145,240,0.10)", borderColor: "rgba(148,145,240,0.25)" }]}>
              <Feather name="check" size={26} color={colors.primary} />
            </View>
            <GlowText style={styles.completeTitle}>Session complete.</GlowText>
            <Text style={[styles.completeSub, { color: colors.mutedForeground }]}>
              {selected.label} of focused work done.{"\n"}
              That kind of consistency adds up quietly.
            </Text>

            <View style={styles.completeStats}>
              <Animated.View
                entering={FadeInUp.delay(200).duration(500)}
                style={[styles.statCard, { borderColor: "rgba(255,255,255,0.07)", backgroundColor: "rgba(255,255,255,0.025)" }]}
              >
                <Text style={[styles.statValue, { color: colors.primary }]}>{focusScore}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Focus score</Text>
              </Animated.View>
              <Animated.View
                entering={FadeInUp.delay(300).duration(500)}
                style={[styles.statCard, { borderColor: "rgba(255,255,255,0.07)", backgroundColor: "rgba(255,255,255,0.025)" }]}
              >
                <Feather name="zap" size={20} color="#E8B86D" />
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Streak +1</Text>
              </Animated.View>
              <Animated.View
                entering={FadeInUp.delay(400).duration(500)}
                style={[styles.statCard, { borderColor: "rgba(255,255,255,0.07)", backgroundColor: "rgba(255,255,255,0.025)" }]}
              >
                <Text style={[styles.statValue, { color: colors.primary }]}>+{selected.coins}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Coins</Text>
              </Animated.View>
            </View>

            <Pressable onPress={() => router.back()} style={{ marginTop: 40 }}>
              <LinearGradient
                colors={["#9B98F4", "#7472D8", "#5F5DC4"]}
                style={styles.primaryBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.primaryBtnText}>Back to Mindspace</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        )}
      </View>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 26 },
  header: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 8 },
  content: { flex: 1, justifyContent: "center" },
  activeContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 32,
  },
  introBadge: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 18 },
  introBadgeText: { fontFamily: "DMSans_500Medium", fontSize: 14, letterSpacing: 0.3 },
  introTitle: { fontSize: 40, lineHeight: 50, marginBottom: 16 },
  introSub: { fontFamily: "DMSans_400Regular", fontSize: 17, lineHeight: 27, marginBottom: 32 },
  durationList: { gap: 10 },
  durationCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 22,
    position: "relative",
    overflow: "hidden",
  },
  durationLeft: { gap: 4 },
  durationLabel: { fontFamily: "DMSans_600SemiBold", fontSize: 20 },
  durationSub: { fontFamily: "DMSans_400Regular", fontSize: 14 },
  durationRight: { flexDirection: "row", alignItems: "center", gap: 5 },
  coinText: { fontFamily: "DMSans_500Medium", fontSize: 15 },
  selectedDot: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  primaryBtn: { borderRadius: 20, paddingVertical: 19, alignItems: "center" },
  primaryBtnText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 17,
    color: "#F0EDE8",
    letterSpacing: 0.2,
  },
  phaseLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  timerBlock: { alignItems: "center", gap: 4 },
  timerText: { fontFamily: "DMSerifDisplay_400Regular", fontSize: 64, letterSpacing: 2 },
  timerSub: { fontFamily: "DMSans_400Regular", fontSize: 14, letterSpacing: 0.3 },
  focusNote: { fontFamily: "DMSans_400Regular", fontSize: 16, lineHeight: 26, textAlign: "center" },
  cancelText: { fontFamily: "DMSans_400Regular", fontSize: 15 },
  completeBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  completeTitle: { fontSize: 38, lineHeight: 48, marginBottom: 16 },
  completeSub: { fontFamily: "DMSans_400Regular", fontSize: 17, lineHeight: 28 },
  completeStats: { flexDirection: "row", gap: 12, marginTop: 32 },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 20,
    alignItems: "center",
    gap: 6,
  },
  statValue: { fontFamily: "DMSans_600SemiBold", fontSize: 24 },
  statLabel: { fontFamily: "DMSans_400Regular", fontSize: 12 },
});
