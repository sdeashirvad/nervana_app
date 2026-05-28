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
import { GROUNDING_STEPS } from "@/data/mock";
import Animated, {
  FadeIn,
  FadeInUp,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";

const COINS_REWARD = 35;

function ProgressRing({ progress }: { progress: number }) {
  const colors = useColors();
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <Animated.View style={[ringStyles.container, pulseStyle]}>
      <View style={[ringStyles.outerRing, { borderColor: "rgba(109,200,200,0.15)" }]} />
      <View style={[ringStyles.middleRing, { borderColor: "rgba(109,200,200,0.25)" }]} />
      <View style={[ringStyles.innerCircle, { backgroundColor: "rgba(109,200,200,0.06)", borderColor: "rgba(109,200,200,0.30)" }]}>
        <Text style={[ringStyles.stepNum, { color: "#6DC8C8" }]}>
          {Math.min(Math.round(progress * GROUNDING_STEPS.length) + 1, GROUNDING_STEPS.length)}
        </Text>
        <Text style={[ringStyles.stepOf, { color: "rgba(109,200,200,0.50)" }]}>
          of {GROUNDING_STEPS.length}
        </Text>
      </View>
    </Animated.View>
  );
}

const ringStyles = StyleSheet.create({
  container: { width: 160, height: 160, alignItems: "center", justifyContent: "center" },
  outerRing: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
  },
  middleRing: {
    position: "absolute",
    width: 126,
    height: 126,
    borderRadius: 63,
    borderWidth: 1.5,
  },
  innerCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNum: { fontFamily: "DMSerifDisplay_400Regular", fontSize: 28, lineHeight: 32 },
  stepOf: { fontFamily: "DMSans_400Regular", fontSize: 11 },
});

export default function GroundingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { addCoins } = useAppContext();

  const [phase, setPhase] = useState<"intro" | "active" | "complete">("intro");
  const [stepIdx, setStepIdx] = useState(0);
  const [stepSecondsLeft, setStepSecondsLeft] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const topPad = Platform.OS === "web" ? 64 : insets.top + 24;
  const bottomPad = Platform.OS === "web" ? 56 : insets.bottom + 36;

  const currentStep = GROUNDING_STEPS[stepIdx];
  const totalSteps = GROUNDING_STEPS.length;
  const progress = stepIdx / totalSteps;

  const startSession = () => {
    setPhase("active");
    setStepIdx(0);
    setStepSecondsLeft(GROUNDING_STEPS[0].duration);
    runStep(0);
  };

  const runStep = (idx: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const step = GROUNDING_STEPS[idx];
    setStepSecondsLeft(step.duration);

    let remaining = step.duration;
    intervalRef.current = setInterval(() => {
      remaining -= 1;
      setStepSecondsLeft(remaining);
      if (remaining <= 0) {
        clearInterval(intervalRef.current!);
        const nextIdx = idx + 1;
        if (nextIdx < GROUNDING_STEPS.length) {
          setStepIdx(nextIdx);
          runStep(nextIdx);
        } else {
          addCoins(COINS_REWARD);
          setPhase("complete");
        }
      }
    }, 1000);
  };

  const skipToNext = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const nextIdx = stepIdx + 1;
    if (nextIdx < GROUNDING_STEPS.length) {
      setStepIdx(nextIdx);
      runStep(nextIdx);
    } else {
      addCoins(COINS_REWARD);
      setPhase("complete");
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <AtmosphericBackground variant="warm">
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

        {phase === "intro" && (
          <Animated.View entering={FadeIn.duration(600)} style={styles.content}>
            <View style={styles.badge}>
              <Feather name="anchor" size={15} color="#C8A882" />
              <Text style={[styles.badgeText, { color: "#C8A882" }]}>Grounding Reset</Text>
            </View>
            <GlowText
              glowColor="rgba(200,168,130,0.22)"
              style={styles.introTitle}
            >
              Come back{"\n"}to the present.
            </GlowText>
            <Text style={[styles.introSub, { color: colors.mutedForeground }]}>
              Five gentle steps. About two minutes.{"\n"}
              No performance needed — just follow along.
            </Text>

            <View style={styles.stepPreview}>
              {GROUNDING_STEPS.map((step, i) => (
                <Animated.View
                  key={step.id}
                  entering={FadeInUp.delay(i * 60 + 200).duration(500)}
                  style={[styles.stepPreviewItem, { borderBottomColor: "rgba(255,255,255,0.06)" }]}
                >
                  <View style={[styles.stepDot, { backgroundColor: "rgba(200,168,130,0.25)", borderColor: "rgba(200,168,130,0.40)" }]}>
                    <Text style={[styles.stepDotNum, { color: "#C8A882" }]}>{i + 1}</Text>
                  </View>
                  <Text style={[styles.stepPreviewTitle, { color: colors.foreground }]}>
                    {step.title}
                  </Text>
                  <Text style={[styles.stepPreviewDur, { color: colors.mutedForeground }]}>
                    {step.duration}s
                  </Text>
                </Animated.View>
              ))}
            </View>

            <View style={styles.metaRow}>
              {[
                { icon: "clock", text: "~2 min" },
                { icon: "anchor", text: "5 steps" },
                { icon: "circle", text: `+${COINS_REWARD} coins` },
              ].map(({ icon, text }) => (
                <View key={text} style={[styles.metaChip, { borderColor: "rgba(255,255,255,0.08)" }]}>
                  <Feather name={icon as any} size={12} color={colors.mutedForeground} />
                  <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{text}</Text>
                </View>
              ))}
            </View>

            <Pressable onPress={startSession} style={styles.btnWrap}>
              <LinearGradient
                colors={["#D4B896", "#B89060", "#9A7A50"]}
                style={styles.btn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.btnText}>Begin Grounding</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        )}

        {phase === "active" && (
          <Animated.View entering={FadeIn.duration(600)} style={styles.activeContent}>
            <ProgressRing progress={progress} />

            <Animated.View key={stepIdx} entering={FadeInUp.duration(480)} style={styles.stepCard}>
              <Text style={[styles.stepTitle, { color: "#C8A882" }]}>
                {currentStep.title}
              </Text>
              <Text style={[styles.stepBody, { color: colors.foreground }]}>
                {currentStep.body}
              </Text>
              {currentStep.breathCue && (
                <Text style={[styles.breathCue, { color: "rgba(200,168,130,0.60)" }]}>
                  ◎ Breathe slowly
                </Text>
              )}
            </Animated.View>

            <View style={styles.timerRow}>
              <Text style={[styles.timerText, { color: colors.mutedForeground }]}>
                {stepSecondsLeft}s
              </Text>
              <Text style={[styles.timerSep, { color: "rgba(255,255,255,0.12)" }]}>·</Text>
              <Pressable onPress={skipToNext} hitSlop={12}>
                <Text style={[styles.skipText, { color: "rgba(255,255,255,0.30)" }]}>
                  Skip →
                </Text>
              </Pressable>
            </View>

            <View style={styles.progressTrack}>
              {GROUNDING_STEPS.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.progressSegment,
                    {
                      backgroundColor:
                        i < stepIdx
                          ? "#C8A882"
                          : i === stepIdx
                          ? "rgba(200,168,130,0.50)"
                          : "rgba(255,255,255,0.08)",
                    },
                  ]}
                />
              ))}
            </View>

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

        {phase === "complete" && (
          <Animated.View entering={FadeInUp.duration(700)} style={styles.content}>
            <View style={[styles.completeBadge, { backgroundColor: "rgba(200,168,130,0.10)", borderColor: "rgba(200,168,130,0.30)" }]}>
              <Feather name="check" size={26} color="#C8A882" />
            </View>
            <GlowText glowColor="rgba(200,168,130,0.22)" style={styles.completeTitle}>
              Grounded.
            </GlowText>
            <Text style={[styles.completeSub, { color: colors.mutedForeground }]}>
              You just gave your nervous system five full minutes of presence.{"\n"}
              That's not nothing. That's the whole practice.
            </Text>

            <Animated.View
              entering={FadeInUp.delay(300).duration(600)}
              style={[styles.rewardRow, { borderColor: "rgba(200,168,130,0.20)", backgroundColor: "rgba(200,168,130,0.06)" }]}
            >
              <Feather name="circle" size={17} color="#C8A882" />
              <Text style={[styles.rewardText, { color: colors.foreground }]}>
                +{COINS_REWARD} Focus Coins earned
              </Text>
            </Animated.View>

            <Pressable onPress={() => router.back()} style={styles.btnWrap}>
              <LinearGradient
                colors={["#D4B896", "#B89060", "#9A7A50"]}
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
  introTitle: { fontSize: 40, lineHeight: 50, marginBottom: 20 },
  introSub: {
    fontFamily: "DMSans_400Regular",
    fontSize: 16,
    lineHeight: 26,
    marginBottom: 32,
  },
  stepPreview: { marginBottom: 24 },
  stepPreviewItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotNum: { fontFamily: "DMSans_600SemiBold", fontSize: 13 },
  stepPreviewTitle: { fontFamily: "DMSans_400Regular", fontSize: 15, flex: 1 },
  stepPreviewDur: { fontFamily: "DMSans_400Regular", fontSize: 12 },
  metaRow: { flexDirection: "row", gap: 8, marginBottom: 36 },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  metaText: { fontFamily: "DMSans_400Regular", fontSize: 12 },
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
    gap: 28,
  },
  stepCard: {
    width: "100%",
    backgroundColor: "rgba(200,168,130,0.06)",
    borderColor: "rgba(200,168,130,0.18)",
    borderWidth: 1,
    borderRadius: 24,
    padding: 26,
    gap: 14,
  },
  stepTitle: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 18,
    letterSpacing: 0.2,
  },
  stepBody: {
    fontFamily: "DMSans_400Regular",
    fontSize: 16,
    lineHeight: 26,
  },
  breathCue: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    letterSpacing: 0.5,
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  timerText: {
    fontFamily: "DMSerifDisplay_400Regular",
    fontSize: 26,
    letterSpacing: 1,
  },
  timerSep: { fontFamily: "DMSans_400Regular", fontSize: 16 },
  skipText: { fontFamily: "DMSans_400Regular", fontSize: 14 },
  progressTrack: {
    flexDirection: "row",
    gap: 6,
    width: "100%",
  },
  progressSegment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  endText: { fontFamily: "DMSans_400Regular", fontSize: 15, marginTop: 4 },
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
    marginBottom: 8,
  },
  rewardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 32,
    alignSelf: "center",
  },
  rewardText: { fontFamily: "DMSans_500Medium", fontSize: 15 },
});
