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
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";

const TOTAL_SECONDS = 150;
const COINS_REWARD = 40;
const INHALE_DUR = 4;
const HOLD_DUR = 4;
const EXHALE_DUR = 6;
const CYCLE_DUR = INHALE_DUR + HOLD_DUR + EXHALE_DUR;

function getBreathPhase(elapsed: number): { label: string; subLabel: string; phase: "in" | "hold" | "out" } {
  const posInCycle = elapsed % CYCLE_DUR;
  if (posInCycle < INHALE_DUR) {
    const rem = INHALE_DUR - Math.floor(posInCycle);
    return { label: "Breathe in", subLabel: `${rem}`, phase: "in" };
  } else if (posInCycle < INHALE_DUR + HOLD_DUR) {
    const rem = INHALE_DUR + HOLD_DUR - Math.floor(posInCycle);
    return { label: "Hold", subLabel: `${rem}`, phase: "hold" };
  } else {
    const rem = CYCLE_DUR - Math.floor(posInCycle);
    return { label: "Breathe out", subLabel: `${rem}`, phase: "out" };
  }
}

function BreathOrb({ phase }: { phase: "in" | "hold" | "out" }) {
  const scale = useSharedValue(0.88);
  const opacity = useSharedValue(0.5);
  const ringScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0.4);

  useEffect(() => {
    const targetScale = phase === "in" ? 1.18 : phase === "hold" ? 1.18 : 0.88;
    const targetOpacity = phase === "in" ? 0.88 : phase === "hold" ? 0.88 : 0.50;
    const dur = phase === "in" ? INHALE_DUR * 1000 : phase === "hold" ? 80 : EXHALE_DUR * 1000;

    scale.value = withTiming(targetScale, { duration: dur, easing: Easing.inOut(Easing.sin) });
    opacity.value = withTiming(targetOpacity, { duration: dur, easing: Easing.inOut(Easing.sin) });

    if (phase === "in") {
      ringScale.value = withTiming(1.6, { duration: INHALE_DUR * 1000, easing: Easing.out(Easing.quad) });
      ringOpacity.value = withTiming(0, { duration: INHALE_DUR * 1000 });
    } else if (phase === "hold") {
      ringScale.value = 1;
      ringOpacity.value = withTiming(0.35, { duration: 300 });
      ringScale.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 800, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      );
    } else {
      ringScale.value = withTiming(0.7, { duration: EXHALE_DUR * 1000, easing: Easing.in(Easing.quad) });
      ringOpacity.value = withTiming(0, { duration: EXHALE_DUR * 1000 });
    }
  }, [phase]);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  return (
    <View style={orbStyles.container}>
      <Animated.View style={[orbStyles.ring, ringStyle]} />
      <Animated.View style={[orbStyles.orb, orbStyle]}>
        <View style={orbStyles.innerOrb} />
      </Animated.View>
    </View>
  );
}

const orbStyles = StyleSheet.create({
  container: { width: 200, height: 200, alignItems: "center", justifyContent: "center" },
  ring: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: "rgba(109,200,200,0.30)",
  },
  orb: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(109,200,200,0.10)",
    borderWidth: 1,
    borderColor: "rgba(109,200,200,0.28)",
    alignItems: "center",
    justifyContent: "center",
  },
  innerOrb: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "rgba(109,200,200,0.16)",
  },
});

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function CalmResetScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { addCoins } = useAppContext();

  const [step, setStep] = useState<"intro" | "active" | "complete">("intro");
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const topPad = Platform.OS === "web" ? 64 : insets.top + 24;
  const bottomPad = Platform.OS === "web" ? 56 : insets.bottom + 36;

  const startSession = () => {
    setStep("active");
    setSecondsLeft(TOTAL_SECONDS);
    setElapsed(0);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current!);
          addCoins(COINS_REWARD);
          setStep("complete");
          return 0;
        }
        return s - 1;
      });
      setElapsed((e) => e + 1);
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const breathInfo = getBreathPhase(elapsed);
  const phaseProgress = secondsLeft / TOTAL_SECONDS;

  return (
    <AtmosphericBackground variant="deep">
      <View style={[styles.container, { paddingTop: topPad, paddingBottom: bottomPad }]}>
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              if (intervalRef.current) clearInterval(intervalRef.current);
              router.back();
            }}
            hitSlop={14}
          >
            <Feather name="x" size={22} color="rgba(255,255,255,0.35)" />
          </Pressable>
        </View>

        {step === "intro" && (
          <Animated.View entering={FadeIn.duration(600)} style={styles.content}>
            <View style={styles.badge}>
              <Feather name="wind" size={15} color="#6DC8C8" />
              <Text style={[styles.badgeText, { color: "#6DC8C8" }]}>Guided Breathing</Text>
            </View>
            <GlowText glowColor="rgba(109,200,200,0.22)" style={styles.introTitle}>
              A moment{"\n"}to land.
            </GlowText>
            <Text style={[styles.introSub, { color: colors.mutedForeground }]}>
              Two and a half minutes of 4-4-6 breathing.{"\n"}
              Inhale for 4, hold for 4, exhale for 6.{"\n"}
              Let the rhythm do the work.
            </Text>

            <View style={styles.metaRow}>
              {[
                { icon: "clock", text: "2.5 min" },
                { icon: "wind", text: "4-4-6 pattern" },
                { icon: "circle", text: `+${COINS_REWARD} coins` },
              ].map(({ icon, text }) => (
                <View key={text} style={[styles.metaChip, { borderColor: "rgba(255,255,255,0.07)" }]}>
                  <Feather name={icon as any} size={12} color={colors.mutedForeground} />
                  <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{text}</Text>
                </View>
              ))}
            </View>

            <Pressable onPress={startSession} style={styles.btnWrap}>
              <LinearGradient
                colors={["#7DC8C8", "#4AABAB", "#3A9090"]}
                style={styles.btn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.btnText}>Begin Reset</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        )}

        {step === "active" && (
          <Animated.View entering={FadeIn.duration(800)} style={styles.activeContent}>
            <Text style={[styles.phaseEyebrow, { color: "rgba(109,200,200,0.60)" }]}>
              {phaseProgress > 0.66 ? "Settle in" : phaseProgress > 0.33 ? "Let it slow" : "Nearly there"}
            </Text>

            <BreathOrb phase={breathInfo.phase} />

            <View style={styles.breathLabelBlock}>
              <Text style={[styles.breathLabel, { color: colors.foreground }]}>
                {breathInfo.label}
              </Text>
              <Text style={[styles.breathCount, { color: "rgba(109,200,200,0.70)" }]}>
                {breathInfo.subLabel}
              </Text>
            </View>

            <Text style={[styles.timerText, { color: "rgba(255,255,255,0.35)" }]}>
              {formatTime(secondsLeft)}
            </Text>

            <Pressable
              onPress={() => {
                if (intervalRef.current) clearInterval(intervalRef.current);
                router.back();
              }}
              hitSlop={10}
            >
              <Text style={[styles.endText, { color: "rgba(255,255,255,0.22)" }]}>End early</Text>
            </Pressable>
          </Animated.View>
        )}

        {step === "complete" && (
          <Animated.View entering={FadeInUp.duration(700)} style={styles.content}>
            <View style={[styles.completeBadge, { backgroundColor: "rgba(109,200,200,0.10)", borderColor: "rgba(109,200,200,0.28)" }]}>
              <Feather name="check" size={26} color="#6DC8C8" />
            </View>
            <GlowText glowColor="rgba(109,200,200,0.22)" style={styles.completeTitle}>
              Reset complete.
            </GlowText>
            <Text style={[styles.completeSub, { color: colors.mutedForeground }]}>
              Your mind just got a little quieter.{"\n"}
              That pause matters more than you think.
            </Text>

            <Animated.View
              entering={FadeInUp.delay(300).duration(600)}
              style={[styles.rewardRow, { borderColor: "rgba(148,145,240,0.20)", backgroundColor: "rgba(148,145,240,0.06)" }]}
            >
              <Feather name="circle" size={17} color={colors.primary} />
              <Text style={[styles.rewardText, { color: colors.foreground }]}>
                +{COINS_REWARD} Focus Coins earned
              </Text>
            </Animated.View>

            <Pressable onPress={() => router.back()} style={[styles.btnWrap, { marginTop: 32 }]}>
              <LinearGradient
                colors={["#7DC8C8", "#4AABAB", "#3A9090"]}
                style={styles.btn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.btnText}>Back to Calm</Text>
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
  badge: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 22 },
  badgeText: { fontFamily: "DMSans_500Medium", fontSize: 14, letterSpacing: 0.3 },
  introTitle: { fontSize: 42, lineHeight: 52, marginBottom: 22 },
  introSub: {
    fontFamily: "DMSans_400Regular",
    fontSize: 17,
    lineHeight: 28,
    marginBottom: 32,
  },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 40 },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  metaText: { fontFamily: "DMSans_400Regular", fontSize: 13 },
  btnWrap: { borderRadius: 20, overflow: "hidden" },
  btn: { paddingVertical: 19, alignItems: "center", borderRadius: 20 },
  btnText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 17,
    color: "#F0EDE8",
    letterSpacing: 0.2,
  },
  activeContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 22,
  },
  phaseEyebrow: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  breathLabelBlock: { alignItems: "center", gap: 6 },
  breathLabel: {
    fontFamily: "DMSerifDisplay_400Regular",
    fontSize: 32,
    letterSpacing: 0.5,
  },
  breathCount: {
    fontFamily: "DMSans_400Regular",
    fontSize: 18,
    letterSpacing: 1,
  },
  timerText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  endText: { fontFamily: "DMSans_400Regular", fontSize: 15 },
  completeBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  completeTitle: { fontSize: 38, lineHeight: 48, marginBottom: 18 },
  completeSub: {
    fontFamily: "DMSans_400Regular",
    fontSize: 17,
    lineHeight: 28,
    marginBottom: 4,
  },
  rewardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 24,
    alignSelf: "center",
  },
  rewardText: { fontFamily: "DMSans_500Medium", fontSize: 15 },
});
