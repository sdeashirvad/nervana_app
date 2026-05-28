import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
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
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

const MOOD_GOALS = [
  { id: "clearer", label: "Clearer", icon: "✦" },
  { id: "calmer", label: "Calmer", icon: "◎" },
  { id: "focused", label: "More focused", icon: "◈" },
  { id: "less-overwhelmed", label: "Less overwhelmed", icon: "◌" },
  { id: "present", label: "More present", icon: "◉" },
];

const REASONS = [
  { id: "burnout", label: "Burnout & exhaustion" },
  { id: "overthinking", label: "Mental noise & overthinking" },
  { id: "balance", label: "Work-life balance" },
  { id: "focus", label: "Focus & clarity" },
  { id: "emotional", label: "Emotional reset" },
];

const STRUGGLES = [
  { id: "switch-off", label: "Can't switch off after work" },
  { id: "sleep", label: "Sleep feels restless" },
  { id: "noise", label: "Mental noise is constant" },
  { id: "pressure", label: "Pressure without end" },
  { id: "disconnected", label: "Feeling disconnected" },
  { id: "identity", label: "Losing track of who I am" },
];

const PREFERRED_STATES = [
  { id: "calm-evenings", label: "Calmer evenings" },
  { id: "sharp-focus", label: "Sharper focus" },
  { id: "less-noise", label: "Less mental noise" },
  { id: "emotional-clarity", label: "More emotional clarity" },
];

const MINDSCAN_QUESTIONS = [
  { id: "energy", label: "Mental energy", low: "Depleted", high: "Energised" },
  { id: "focus", label: "Focus level", low: "Scattered", high: "Sharp" },
  { id: "stress", label: "Stress level", low: "Calm", high: "Stressed" },
  { id: "overwhelm", label: "Emotional load", low: "Light", high: "Heavy" },
  { id: "sleep", label: "Sleep quality", low: "Poor", high: "Rested" },
];

const RESULT_MAP: Array<{
  test: (s: Record<string, number>) => boolean;
  message: string;
  recommendation: string;
  recLabel: string;
  recIcon: string;
}> = [
  {
    test: (s) => (s["stress"] ?? 3) >= 4,
    message: "You seem overstimulated right now.\nA short reset could help you land.",
    recommendation: "We recommend starting with Guided Breathing to settle your nervous system.",
    recLabel: "Guided Breathing",
    recIcon: "wind",
  },
  {
    test: (s) => (s["energy"] ?? 3) <= 2,
    message: "Your energy is quiet today.\nGentle focus, not force, is what you need.",
    recommendation: "We recommend Grounding Reset to bring you back to the present.",
    recLabel: "Grounding Reset",
    recIcon: "anchor",
  },
  {
    test: (s) => (s["focus"] ?? 3) <= 2,
    message: "Your mind is pulling in a few directions.\nOne small anchor will help.",
    recommendation: "We recommend a short Focus Session to create a single point of attention.",
    recLabel: "Focus Session",
    recIcon: "zap",
  },
  {
    test: (s) =>
      Object.values(s).reduce((a, b) => a + b, 0) / Object.values(s).length >= 3.5,
    message: "You're in a relatively grounded place.\nA little clarity can take you further.",
    recommendation: "Your AI Coach can help you process what's on your mind.",
    recLabel: "AI Coach",
    recIcon: "message-circle",
  },
];

const DEFAULT_RESULT = {
  message: "You're carrying something today.\nLet's create a bit of space.",
  recommendation: "Start with what feels most accessible — breathing, journaling, or a quiet session.",
  recLabel: "Calm Reset",
  recIcon: "wind",
};

function getMindScanResult(scores: Record<string, number>) {
  for (const rule of RESULT_MAP) {
    if (rule.test(scores)) return rule;
  }
  return DEFAULT_RESULT;
}

function ScoreButton({
  value,
  selected,
  onPress,
}: {
  value: number;
  selected: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      onPress={() => {
        scale.value = withSpring(0.86, { damping: 14 }, () => {
          scale.value = withSpring(1, { damping: 12 });
        });
        onPress();
      }}
    >
      <Animated.View
        style={[
          scoreStyles.btn,
          {
            backgroundColor: selected ? "rgba(148,145,240,0.22)" : "rgba(255,255,255,0.04)",
            borderColor: selected ? "rgba(148,145,240,0.52)" : "rgba(255,255,255,0.09)",
          },
          animStyle,
        ]}
      >
        <Text style={[scoreStyles.label, { color: selected ? colors.primary : "rgba(255,255,255,0.36)" }]}>
          {value}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const scoreStyles = StyleSheet.create({
  btn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontFamily: "DMSans_500Medium", fontSize: 17 },
});

function SelectionChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={[
        chipStyles.chip,
        {
          backgroundColor: selected ? "rgba(148,145,240,0.12)" : "rgba(255,255,255,0.03)",
          borderColor: selected ? "rgba(148,145,240,0.46)" : "rgba(255,255,255,0.08)",
        },
      ]}
    >
      <Text style={[chipStyles.label, { color: selected ? colors.primary : colors.foreground }]}>
        {label}
      </Text>
      {selected && (
        <Feather name="check" size={14} color={colors.primary} />
      )}
    </Pressable>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 17,
    paddingHorizontal: 20,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 10,
  },
  label: { fontFamily: "DMSans_500Medium", fontSize: 16 },
});

const TOTAL_STEPS = 6;

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { setMoodGoal, setMindScanResult, setOnboardingAnswers, addMindScanEntry } = useAppContext();

  const [step, setStep] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [selectedStruggle, setSelectedStruggle] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [resultData, setResultData] = useState<typeof DEFAULT_RESULT>(DEFAULT_RESULT);

  const topPad = Platform.OS === "web" ? 80 : insets.top + 36;
  const bottomPad = Platform.OS === "web" ? 80 : insets.bottom + 80;
  const canContinueScan = MINDSCAN_QUESTIONS.every((q) => scores[q.id] !== undefined);

  const progressPct = `${Math.round(((step + 1) / TOTAL_STEPS) * 100)}%`;

  const goNext = (nextStep: number) => {
    setStep(nextStep);
  };

  const handleGoalContinue = () => {
    if (!selectedGoal) return;
    setMoodGoal(selectedGoal);
    setOnboardingAnswers({ moodGoal: selectedGoal });
    goNext(1);
  };

  const handleReasonContinue = () => {
    if (!selectedReason) return;
    setOnboardingAnswers({ reason: selectedReason });
    goNext(2);
  };

  const handleStruggleContinue = () => {
    if (!selectedStruggle) return;
    setOnboardingAnswers({ struggle: selectedStruggle });
    goNext(3);
  };

  const handleStateContinue = () => {
    if (!selectedState) return;
    setOnboardingAnswers({ preferredState: selectedState });
    goNext(4);
  };

  const handleMindScanContinue = () => {
    const result = getMindScanResult(scores);
    setResultData(result);
    setMindScanResult(result.message);
    addMindScanEntry({
      result: result.message,
      recommendation: result.recLabel,
      scores,
      date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    });
    goNext(5);
  };

  const handleEnter = () => {
    router.replace("/auth");
  };

  return (
    <AtmosphericBackground>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: topPad,
          paddingBottom: bottomPad,
          paddingHorizontal: 26,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Progress bar */}
        <View style={styles.progressWrap}>
          <View style={[styles.progressTrack, { backgroundColor: "rgba(255,255,255,0.06)" }]}>
            <View
              style={[
                styles.progressFill,
                { width: progressPct, backgroundColor: colors.primary },
              ]}
            />
          </View>
          <Text style={[styles.progressLabel, { color: "rgba(255,255,255,0.25)" }]}>
            {step + 1} / {TOTAL_STEPS}
          </Text>
        </View>

        {/* STEP 0: Feel goal */}
        {step === 0 && (
          <Animated.View entering={FadeInUp.duration(600)}>
            <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>Welcome to Nervana</Text>
            <GlowText style={styles.headline}>How do you want{"\n"}to feel today?</GlowText>
            <Text style={[styles.sub, { color: colors.mutedForeground }]}>
              Choose what matters most right now.
            </Text>
            <View style={styles.list}>
              {MOOD_GOALS.map((goal, i) => (
                <Animated.View key={goal.id} entering={FadeInUp.delay(60 + i * 55).duration(500)}>
                  <Pressable
                    onPress={() => setSelectedGoal(goal.id)}
                    style={[
                      styles.goalChip,
                      {
                        backgroundColor:
                          selectedGoal === goal.id
                            ? "rgba(148,145,240,0.12)"
                            : "rgba(255,255,255,0.03)",
                        borderColor:
                          selectedGoal === goal.id
                            ? "rgba(148,145,240,0.46)"
                            : "rgba(255,255,255,0.08)",
                      },
                    ]}
                  >
                    <Text style={styles.goalIcon}>{goal.icon}</Text>
                    <Text
                      style={[
                        styles.goalLabel,
                        { color: selectedGoal === goal.id ? colors.primary : colors.foreground },
                      ]}
                    >
                      {goal.label}
                    </Text>
                    {selectedGoal === goal.id && (
                      <Feather name="check" size={15} color={colors.primary} />
                    )}
                  </Pressable>
                </Animated.View>
              ))}
            </View>
            <Animated.View entering={FadeInUp.delay(420).duration(500)} style={styles.ctaWrap}>
              <Pressable onPress={handleGoalContinue} disabled={!selectedGoal} style={{ opacity: selectedGoal ? 1 : 0.34 }}>
                <LinearGradient colors={["#9B98F4", "#7472D8", "#5F5DC4"]} style={styles.primaryBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Text style={styles.primaryBtnText}>Continue</Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </Animated.View>
        )}

        {/* STEP 1: Reason */}
        {step === 1 && (
          <Animated.View entering={FadeInUp.duration(600)}>
            <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>Tell us more</Text>
            <GlowText style={styles.headline}>What brings you{"\n"}to Nervana?</GlowText>
            <Text style={[styles.sub, { color: colors.mutedForeground }]}>
              We'll personalise your space around this.
            </Text>
            <View style={styles.list}>
              {REASONS.map((r, i) => (
                <Animated.View key={r.id} entering={FadeInUp.delay(50 + i * 50).duration(500)}>
                  <SelectionChip
                    label={r.label}
                    selected={selectedReason === r.id}
                    onPress={() => setSelectedReason(r.id)}
                  />
                </Animated.View>
              ))}
            </View>
            <Animated.View entering={FadeInUp.delay(380).duration(500)} style={styles.ctaWrap}>
              <Pressable onPress={handleReasonContinue} disabled={!selectedReason} style={{ opacity: selectedReason ? 1 : 0.34 }}>
                <LinearGradient colors={["#9B98F4", "#7472D8", "#5F5DC4"]} style={styles.primaryBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Text style={styles.primaryBtnText}>Continue</Text>
                </LinearGradient>
              </Pressable>
              <Pressable onPress={() => goNext(0)} style={styles.backBtn}>
                <Text style={[styles.backLink, { color: colors.mutedForeground }]}>← Back</Text>
              </Pressable>
            </Animated.View>
          </Animated.View>
        )}

        {/* STEP 2: Struggle */}
        {step === 2 && (
          <Animated.View entering={FadeInUp.duration(600)}>
            <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>Getting clearer</Text>
            <GlowText style={styles.headline}>What's been{"\n"}weighing on you?</GlowText>
            <Text style={[styles.sub, { color: colors.mutedForeground }]}>
              Be honest. This stays completely private.
            </Text>
            <View style={styles.list}>
              {STRUGGLES.map((s, i) => (
                <Animated.View key={s.id} entering={FadeInUp.delay(50 + i * 45).duration(500)}>
                  <SelectionChip
                    label={s.label}
                    selected={selectedStruggle === s.id}
                    onPress={() => setSelectedStruggle(s.id)}
                  />
                </Animated.View>
              ))}
            </View>
            <Animated.View entering={FadeInUp.delay(420).duration(500)} style={styles.ctaWrap}>
              <Pressable onPress={handleStruggleContinue} disabled={!selectedStruggle} style={{ opacity: selectedStruggle ? 1 : 0.34 }}>
                <LinearGradient colors={["#9B98F4", "#7472D8", "#5F5DC4"]} style={styles.primaryBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Text style={styles.primaryBtnText}>Continue</Text>
                </LinearGradient>
              </Pressable>
              <Pressable onPress={() => goNext(1)} style={styles.backBtn}>
                <Text style={[styles.backLink, { color: colors.mutedForeground }]}>← Back</Text>
              </Pressable>
            </Animated.View>
          </Animated.View>
        )}

        {/* STEP 3: Preferred state */}
        {step === 3 && (
          <Animated.View entering={FadeInUp.duration(600)}>
            <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>Almost there</Text>
            <GlowText style={styles.headline}>What would feel{"\n"}most helpful?</GlowText>
            <Text style={[styles.sub, { color: colors.mutedForeground }]}>
              Choose your ideal outcome.
            </Text>
            <View style={styles.list}>
              {PREFERRED_STATES.map((s, i) => (
                <Animated.View key={s.id} entering={FadeInUp.delay(50 + i * 60).duration(500)}>
                  <SelectionChip
                    label={s.label}
                    selected={selectedState === s.id}
                    onPress={() => setSelectedState(s.id)}
                  />
                </Animated.View>
              ))}
            </View>
            <Animated.View entering={FadeInUp.delay(380).duration(500)} style={styles.ctaWrap}>
              <Pressable onPress={handleStateContinue} disabled={!selectedState} style={{ opacity: selectedState ? 1 : 0.34 }}>
                <LinearGradient colors={["#9B98F4", "#7472D8", "#5F5DC4"]} style={styles.primaryBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Text style={styles.primaryBtnText}>Run MindScan™</Text>
                </LinearGradient>
              </Pressable>
              <Pressable onPress={() => goNext(2)} style={styles.backBtn}>
                <Text style={[styles.backLink, { color: colors.mutedForeground }]}>← Back</Text>
              </Pressable>
            </Animated.View>
          </Animated.View>
        )}

        {/* STEP 4: MindScan */}
        {step === 4 && (
          <Animated.View entering={FadeInUp.duration(600)}>
            <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>MindScan™</Text>
            <GlowText style={styles.headline}>Quick check-in</GlowText>
            <Text style={[styles.sub, { color: colors.mutedForeground }]}>
              5 questions. 30 seconds.{"\n"}Tap honestly — there's no wrong answer.
            </Text>
            <View style={styles.questionsWrap}>
              {MINDSCAN_QUESTIONS.map((q, i) => (
                <Animated.View
                  key={q.id}
                  entering={FadeInUp.delay(60 + i * 70).duration(500)}
                  style={[styles.questionRow, { borderBottomColor: "rgba(255,255,255,0.06)" }]}
                >
                  <View style={styles.questionHeader}>
                    <Text style={[styles.questionLabel, { color: colors.foreground }]}>{q.label}</Text>
                    <View style={styles.scaleLegend}>
                      <Text style={[styles.scaleEnd, { color: colors.mutedForeground }]}>{q.low}</Text>
                      <Text style={[styles.scaleSep, { color: "rgba(255,255,255,0.12)" }]}>·</Text>
                      <Text style={[styles.scaleEnd, { color: colors.mutedForeground }]}>{q.high}</Text>
                    </View>
                  </View>
                  <View style={styles.scaleRow}>
                    {[1, 2, 3, 4, 5].map((v) => (
                      <ScoreButton
                        key={v}
                        value={v}
                        selected={scores[q.id] === v}
                        onPress={() => setScores((s) => ({ ...s, [q.id]: v }))}
                      />
                    ))}
                  </View>
                </Animated.View>
              ))}
            </View>
            <Animated.View entering={FadeInUp.delay(500).duration(500)} style={styles.ctaWrap}>
              <Pressable onPress={handleMindScanContinue} disabled={!canContinueScan} style={{ opacity: canContinueScan ? 1 : 0.34 }}>
                <LinearGradient colors={["#9B98F4", "#7472D8", "#5F5DC4"]} style={styles.primaryBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Text style={styles.primaryBtnText}>See your result</Text>
                </LinearGradient>
              </Pressable>
              <Pressable onPress={() => goNext(3)} style={styles.backBtn}>
                <Text style={[styles.backLink, { color: colors.mutedForeground }]}>← Back</Text>
              </Pressable>
            </Animated.View>
          </Animated.View>
        )}

        {/* STEP 5: Result */}
        {step === 5 && (
          <Animated.View entering={FadeInUp.duration(700)}>
            <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>Your MindScan result</Text>
            <View
              style={[
                styles.resultCard,
                { borderColor: "rgba(148,145,240,0.20)", backgroundColor: "rgba(14,15,30,0.70)" },
              ]}
            >
              <View style={[styles.resultAccent, { backgroundColor: colors.primary }]} />
              <GlowText style={styles.resultText}>{resultData.message}</GlowText>
            </View>

            <Animated.View
              entering={FadeInUp.delay(200).duration(600)}
              style={[styles.recCard, { borderColor: "rgba(255,255,255,0.07)", backgroundColor: "rgba(255,255,255,0.025)" }]}
            >
              <View style={[styles.recIconWrap, { backgroundColor: "rgba(148,145,240,0.12)" }]}>
                <Feather name={resultData.recIcon as any} size={17} color={colors.primary} />
              </View>
              <View style={styles.recContent}>
                <Text style={[styles.recLabel, { color: colors.mutedForeground }]}>Recommended for you</Text>
                <Text style={[styles.recActivity, { color: colors.foreground }]}>{resultData.recLabel}</Text>
                <Text style={[styles.recDesc, { color: colors.mutedForeground }]}>{resultData.recommendation}</Text>
              </View>
            </Animated.View>

            <Text style={[styles.resultSub, { color: colors.mutedForeground }]}>
              Nervana will shape your space around this. You can always adjust it later.
            </Text>

            <Animated.View entering={FadeInUp.delay(380).duration(500)} style={styles.ctaWrap}>
              <Pressable onPress={handleEnter}>
                <LinearGradient colors={["#9B98F4", "#7472D8", "#5F5DC4"]} style={styles.primaryBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Text style={styles.primaryBtnText}>Create my account →</Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Step dots */}
      <View style={[styles.stepDots, { bottom: Platform.OS === "web" ? 28 : insets.bottom + 16 }]}>
        {Array.from({ length: TOTAL_STEPS }, (_, s) => (
          <View
            key={s}
            style={[
              styles.dot,
              {
                backgroundColor: s === step ? colors.primary : s < step ? `${colors.primary}55` : "rgba(255,255,255,0.15)",
                width: s === step ? 22 : 6,
              },
            ]}
          />
        ))}
      </View>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  progressWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 36,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 2 },
  progressLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    letterSpacing: 0.3,
  },
  eyebrow: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    letterSpacing: 1.3,
    textTransform: "uppercase",
    marginBottom: 16,
  },
  headline: { fontSize: 34, lineHeight: 44, marginBottom: 14 },
  sub: {
    fontFamily: "DMSans_400Regular",
    fontSize: 16,
    lineHeight: 26,
    marginBottom: 32,
  },
  list: {},
  goalChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 10,
  },
  goalIcon: { fontSize: 17, color: "rgba(255,255,255,0.52)" },
  goalLabel: { fontFamily: "DMSans_500Medium", fontSize: 17, flex: 1 },
  questionsWrap: { gap: 0 },
  questionRow: { paddingVertical: 22, borderBottomWidth: 1 },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  questionLabel: { fontFamily: "DMSans_500Medium", fontSize: 16 },
  scaleLegend: { flexDirection: "row", alignItems: "center", gap: 5 },
  scaleEnd: { fontFamily: "DMSans_400Regular", fontSize: 11 },
  scaleSep: { fontFamily: "DMSans_400Regular", fontSize: 11 },
  scaleRow: { flexDirection: "row", gap: 8, justifyContent: "space-between" },
  ctaWrap: { marginTop: 40 },
  primaryBtn: { borderRadius: 20, paddingVertical: 19, alignItems: "center" },
  primaryBtnText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 17,
    color: "#F0EDE8",
    letterSpacing: 0.2,
  },
  backBtn: { alignItems: "center", marginTop: 20 },
  backLink: { fontFamily: "DMSans_400Regular", fontSize: 15 },
  resultCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 28,
    paddingLeft: 38,
    marginTop: 26,
    marginBottom: 18,
    position: "relative",
    overflow: "hidden",
  },
  resultAccent: {
    position: "absolute",
    left: 18,
    top: 24,
    bottom: 24,
    width: 2.5,
    borderRadius: 2,
    opacity: 0.65,
  },
  resultText: { fontSize: 22, lineHeight: 35 },
  recCard: {
    flexDirection: "row",
    gap: 16,
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  recIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  recContent: { flex: 1, gap: 4 },
  recLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  recActivity: { fontFamily: "DMSans_600SemiBold", fontSize: 16 },
  recDesc: { fontFamily: "DMSans_400Regular", fontSize: 14, lineHeight: 21 },
  resultSub: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 4,
    opacity: 0.8,
  },
  stepDots: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
  },
  dot: { height: 6, borderRadius: 3 },
});
