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
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from "react-native-reanimated";

const TOTAL_SECONDS = 150;
const COINS_REWARD = 40;

function BreathOrb() {
  const scale = useSharedValue(0.88);
  const opacity = useSharedValue(0.5);
  const ringScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.14, { duration: 4200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    opacity.value = withRepeat(
      withTiming(0.85, { duration: 4200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    ringScale.value = withDelay(
      500,
      withRepeat(
        withTiming(1.55, { duration: 4200, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      )
    );
    ringOpacity.value = withDelay(
      500,
      withRepeat(
        withTiming(0, { duration: 4200, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      )
    );
  }, []);

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
  container: { width: 180, height: 180, alignItems: "center", justifyContent: "center" },
  ring: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1.5,
    borderColor: "rgba(109,200,200,0.30)",
  },
  orb: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(109,200,200,0.10)",
    borderWidth: 1,
    borderColor: "rgba(109,200,200,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  innerOrb: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(109,200,200,0.14)",
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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const topPad = Platform.OS === "web" ? 64 : insets.top + 24;
  const bottomPad = Platform.OS === "web" ? 56 : insets.bottom + 36;

  const startSession = () => {
    setStep("active");
    setSecondsLeft(TOTAL_SECONDS);
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
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const progress = 1 - secondsLeft / TOTAL_SECONDS;

  return (
    <AtmosphericBackground variant="deep">
      <View style={[styles.container, { paddingTop: topPad, paddingBottom: bottomPad }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            router.back();
          }} hitSlop={14}>
            <Feather name="x" size={22} color="rgba(255,255,255,0.35)" />
          </Pressable>
        </View>

        {step === "intro" && (
          <Animated.View entering={FadeIn.duration(600)} style={styles.content}>
            <View style={styles.introBadge}>
              <Feather name="wind" size={16} color="#6DC8C8" />
              <Text style={[styles.introBadgeText, { color: "#6DC8C8" }]}>Calm Reset</Text>
            </View>
            <GlowText style={styles.introTitle}>A moment{"\n"}to land.</GlowText>
            <Text style={[styles.introSub, { color: colors.mutedForeground }]}>
              Two and a half minutes of gentle guidance.{"\n"}
              Let your mind slow down and settle.{"\n"}
              Nothing to do except breathe and be here.
            </Text>

            <View style={styles.introMeta}>
              {[
                { icon: "clock", text: "2.5 minutes" },
                { icon: "wind", text: "Guided breathing" },
                { icon: "circle", text: "+40 coins" },
              ].map(({ icon, text }) => (
                <View key={text} style={[styles.metaItem, { borderColor: "rgba(255,255,255,0.07)" }]}>
                  <Feather name={icon as any} size={13} color={colors.mutedForeground} />
                  <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{text}</Text>
                </View>
              ))}
            </View>

            <Pressable onPress={startSession} style={{ marginTop: 44 }}>
              <LinearGradient
                colors={["#7DC8C8", "#4AABAB", "#3A9090"]}
                style={styles.primaryBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.primaryBtnText}>Begin Reset</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        )}

        {step === "active" && (
          <Animated.View entering={FadeIn.duration(800)} style={styles.activeContent}>
            <Text style={[styles.phaseLabel, { color: "rgba(109,200,200,0.65)" }]}>
              {progress < 0.33 ? "Settle in" : progress < 0.66 ? "Let it slow" : "Nearly there"}
            </Text>
            <BreathOrb />
            <Text style={[styles.timerText, { color: colors.foreground }]}>
              {formatTime(secondsLeft)}
            </Text>
            <Text style={[styles.breathGuide, { color: colors.mutedForeground }]}>
              {Math.floor(progress * 4) % 2 === 0 ? "Breathe in slowly" : "Breathe out gently"}
            </Text>

            <Pressable
              onPress={() => {
                if (intervalRef.current) clearInterval(intervalRef.current);
                router.back();
              }}
              style={styles.cancelBtn}
              hitSlop={10}
            >
              <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>End early</Text>
            </Pressable>
          </Animated.View>
        )}

        {step === "complete" && (
          <Animated.View entering={FadeInUp.duration(700)} style={styles.content}>
            <View style={styles.completeBadge}>
              <Feather name="check" size={26} color="#6DC8C8" />
            </View>
            <GlowText style={styles.completeTitle}>Reset complete.</GlowText>
            <Text style={[styles.completeSub, { color: colors.mutedForeground }]}>
              Your mind just got a little quieter.{"\n"}
              That pause matters more than you think.
            </Text>

            <PremiumCoinReward coins={COINS_REWARD} />

            <Pressable onPress={() => router.back()} style={{ marginTop: 40 }}>
              <LinearGradient
                colors={["#7DC8C8", "#4AABAB", "#3A9090"]}
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

function PremiumCoinReward({ coins }: { coins: number }) {
  const colors = useColors();
  return (
    <Animated.View
      entering={FadeInUp.delay(300).duration(600)}
      style={[rewardStyles.wrap, { borderColor: "rgba(148,145,240,0.20)", backgroundColor: "rgba(148,145,240,0.06)" }]}
    >
      <Feather name="circle" size={18} color={colors.primary} />
      <Text style={[rewardStyles.text, { color: colors.foreground }]}>+{coins} Focus Coins earned</Text>
    </Animated.View>
  );
}

const rewardStyles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 28,
    alignSelf: "center",
  },
  text: { fontFamily: "DMSans_500Medium", fontSize: 15 },
});

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 26 },
  header: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 8 },
  content: { flex: 1, justifyContent: "center" },
  activeContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 28,
  },
  introBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  introBadgeText: { fontFamily: "DMSans_500Medium", fontSize: 14, letterSpacing: 0.3 },
  introTitle: { fontSize: 42, lineHeight: 52, marginBottom: 22 },
  introSub: {
    fontFamily: "DMSans_400Regular",
    fontSize: 17,
    lineHeight: 28,
    marginBottom: 32,
  },
  introMeta: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  metaText: { fontFamily: "DMSans_400Regular", fontSize: 13 },
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
  phaseLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  timerText: {
    fontFamily: "DMSerifDisplay_400Regular",
    fontSize: 58,
    letterSpacing: 2,
  },
  breathGuide: {
    fontFamily: "DMSans_400Regular",
    fontSize: 16,
    letterSpacing: 0.3,
  },
  cancelBtn: { paddingTop: 10 },
  cancelText: { fontFamily: "DMSans_400Regular", fontSize: 15 },
  completeBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(109,200,200,0.10)",
    borderWidth: 1,
    borderColor: "rgba(109,200,200,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  completeTitle: { fontSize: 38, lineHeight: 48, marginBottom: 18 },
  completeSub: {
    fontFamily: "DMSans_400Regular",
    fontSize: 17,
    lineHeight: 28,
  },
});
