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

const MINDSCAN_QUESTIONS = [
  { id: "energy", label: "Mental energy", low: "Depleted", high: "Energised" },
  { id: "focus", label: "Focus level", low: "Scattered", high: "Sharp" },
  { id: "stress", label: "Stress level", low: "Calm", high: "Stressed" },
  { id: "overwhelm", label: "Emotional load", low: "Light", high: "Heavy" },
  { id: "sleep", label: "Sleep quality", low: "Poor", high: "Rested" },
];

const RESULT_MAP: Array<{ test: (s: Record<string, number>) => boolean; message: string }> = [
  {
    test: (s) => (s["stress"] ?? 3) >= 4,
    message: "You seem overstimulated right now.\nA short reset could help you land.",
  },
  {
    test: (s) => (s["energy"] ?? 3) <= 2,
    message: "Your energy is quiet today.\nGentle focus, not force, is what you need.",
  },
  {
    test: (s) => (s["focus"] ?? 3) <= 2,
    message: "Your mind is pulling in a few directions.\nOne small anchor will help.",
  },
  {
    test: (s) =>
      Object.values(s).reduce((a, b) => a + b, 0) / Object.values(s).length >= 3.5,
    message: "You're in a relatively grounded place.\nA little clarity can take you further.",
  },
];

const DEFAULT_RESULT = "You're carrying something today.\nLet's create a bit of space.";

function getMindScanResult(scores: Record<string, number>): string {
  for (const rule of RESULT_MAP) {
    if (rule.test(scores)) return rule.message;
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

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { setOnboardingComplete, setMoodGoal, setMindScanResult } = useAppContext();

  const [step, setStep] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [resultText, setResultText] = useState("");

  const topPad = Platform.OS === "web" ? 80 : insets.top + 36;
  const bottomPad = Platform.OS === "web" ? 56 : insets.bottom + 44;
  const canContinueScan = MINDSCAN_QUESTIONS.every((q) => scores[q.id] !== undefined);

  const handleGoalContinue = () => {
    if (!selectedGoal) return;
    setMoodGoal(selectedGoal);
    setStep(1);
  };

  const handleMindScanContinue = () => {
    const result = getMindScanResult(scores);
    setResultText(result);
    setMindScanResult(result);
    setStep(2);
  };

  const handleEnter = async () => {
    await setOnboardingComplete(true);
    router.replace("/(main)/home");
  };

  return (
    <AtmosphericBackground>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: topPad, paddingBottom: bottomPad, paddingHorizontal: 28 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* STEP 0: Feel goal */}
        {step === 0 && (
          <Animated.View entering={FadeInUp.duration(600)}>
            <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>Welcome to Nervana</Text>
            <GlowText style={styles.headline}>How do you want{"\n"}to feel today?</GlowText>
            <Text style={[styles.sub, { color: colors.mutedForeground }]}>
              Choose what matters most right now.
            </Text>

            <View style={styles.goalsGrid}>
              {MOOD_GOALS.map((goal, i) => (
                <Animated.View key={goal.id} entering={FadeInUp.delay(60 + i * 65).duration(500)}>
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
                  </Pressable>
                </Animated.View>
              ))}
            </View>

            <Animated.View entering={FadeInUp.delay(480).duration(500)} style={{ marginTop: 44 }}>
              <Pressable onPress={handleGoalContinue} disabled={!selectedGoal} style={{ opacity: selectedGoal ? 1 : 0.34 }}>
                <LinearGradient
                  colors={["#9B98F4", "#7472D8", "#5F5DC4"]}
                  style={styles.primaryBtn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.primaryBtnText}>Continue</Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </Animated.View>
        )}

        {/* STEP 1: MindScan */}
        {step === 1 && (
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

            <Animated.View entering={FadeInUp.delay(500).duration(500)} style={{ marginTop: 40 }}>
              <Pressable onPress={handleMindScanContinue} disabled={!canContinueScan} style={{ opacity: canContinueScan ? 1 : 0.34 }}>
                <LinearGradient
                  colors={["#9B98F4", "#7472D8", "#5F5DC4"]}
                  style={styles.primaryBtn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.primaryBtnText}>See your result</Text>
                </LinearGradient>
              </Pressable>
              <Pressable onPress={() => setStep(0)} style={styles.backBtn}>
                <Text style={[styles.backLink, { color: colors.mutedForeground }]}>← Back</Text>
              </Pressable>
            </Animated.View>
          </Animated.View>
        )}

        {/* STEP 2: Result */}
        {step === 2 && (
          <Animated.View entering={FadeInUp.duration(700)}>
            <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>Your MindScan result</Text>

            <View
              style={[
                styles.resultCard,
                { borderColor: "rgba(148,145,240,0.20)", backgroundColor: "rgba(14,15,30,0.70)" },
              ]}
            >
              <View style={[styles.resultAccent, { backgroundColor: colors.primary }]} />
              <GlowText style={styles.resultText}>{resultText}</GlowText>
            </View>

            <Text style={[styles.resultSub, { color: colors.mutedForeground }]}>
              Nervana will shape your space around this. You can always update it later.
            </Text>

            <Animated.View entering={FadeInUp.delay(300).duration(500)} style={{ marginTop: 44 }}>
              <Pressable onPress={handleEnter}>
                <LinearGradient
                  colors={["#9B98F4", "#7472D8", "#5F5DC4"]}
                  style={styles.primaryBtn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.primaryBtnText}>Enter Mindspace →</Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Step dots */}
      <View style={[styles.stepDots, { bottom: Platform.OS === "web" ? 28 : insets.bottom + 16 }]}>
        {[0, 1, 2].map((s) => (
          <View
            key={s}
            style={[
              styles.dot,
              {
                backgroundColor: s === step ? colors.primary : "rgba(255,255,255,0.15)",
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
  eyebrow: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    letterSpacing: 1.3,
    textTransform: "uppercase",
    marginBottom: 16,
  },
  headline: { fontSize: 36, lineHeight: 46, marginBottom: 14 },
  sub: {
    fontFamily: "DMSans_400Regular",
    fontSize: 16,
    lineHeight: 26,
    marginBottom: 38,
  },
  goalsGrid: { gap: 10 },
  goalChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 19,
    paddingHorizontal: 22,
    borderRadius: 20,
    borderWidth: 1,
  },
  goalIcon: { fontSize: 17, color: "rgba(255,255,255,0.52)" },
  goalLabel: { fontFamily: "DMSans_500Medium", fontSize: 18 },
  questionsWrap: { gap: 0 },
  questionRow: { paddingVertical: 24, borderBottomWidth: 1 },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  questionLabel: { fontFamily: "DMSans_500Medium", fontSize: 16 },
  scaleLegend: { flexDirection: "row", alignItems: "center", gap: 5 },
  scaleEnd: { fontFamily: "DMSans_400Regular", fontSize: 11 },
  scaleSep: { fontFamily: "DMSans_400Regular", fontSize: 11 },
  scaleRow: { flexDirection: "row", gap: 8, justifyContent: "space-between" },
  primaryBtn: {
    borderRadius: 20,
    paddingVertical: 19,
    alignItems: "center",
  },
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
    padding: 30,
    paddingLeft: 40,
    marginTop: 30,
    marginBottom: 18,
    position: "relative",
    overflow: "hidden",
  },
  resultAccent: {
    position: "absolute",
    left: 20,
    top: 26,
    bottom: 26,
    width: 2.5,
    borderRadius: 2,
    opacity: 0.65,
  },
  resultText: { fontSize: 22, lineHeight: 35 },
  resultSub: {
    fontFamily: "DMSans_400Regular",
    fontSize: 15,
    lineHeight: 24,
    marginTop: 6,
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
