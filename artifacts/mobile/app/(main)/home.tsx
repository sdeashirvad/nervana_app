import React, { useEffect, useState } from "react";
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
import { PremiumCard } from "@/components/PremiumCard";
import { GlowText } from "@/components/GlowText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";
import { DAILY_INSIGHTS, AI_INSIGHTS, FLOW_SCORE } from "@/data/mock";
import { useAppContext } from "@/context/AppContext";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from "react-native-reanimated";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Still awake";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Winding down";
}

function getFormattedDate(): string {
  try {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "Today";
  }
}

function FlowBar({ label, value, delay }: { label: string; value: number; delay: number }) {
  const colors = useColors();
  const width = useSharedValue(0);
  const barStyle = useAnimatedStyle(() => ({ width: `${width.value}%` as any }));

  useEffect(() => {
    width.value = withDelay(delay, withTiming(value, { duration: 900, easing: Easing.out(Easing.cubic) }));
  }, []);

  return (
    <View style={flowStyles.row}>
      <Text style={[flowStyles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <View style={flowStyles.track}>
        <Animated.View style={[flowStyles.fill, { backgroundColor: colors.primary }, barStyle]} />
      </View>
      <Text style={[flowStyles.val, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

const flowStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  label: { fontFamily: "DMSans_400Regular", fontSize: 13, width: 54 },
  track: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 2,
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: 2 },
  val: { fontFamily: "DMSans_500Medium", fontSize: 13, width: 28, textAlign: "right" },
});

function ActionCard({
  icon,
  label,
  sub,
  accent,
  onPress,
  delay,
}: {
  icon: string;
  label: string;
  sub: string;
  accent: string;
  onPress: () => void;
  delay: number;
}) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(600)} style={animStyle}>
      <Pressable
        onPress={() => {
          scale.value = withSpring(0.96, { damping: 16 }, () => {
            scale.value = withSpring(1, { damping: 14 });
          });
          onPress();
        }}
        style={({ pressed }) => [
          actionStyles.card,
          {
            backgroundColor: pressed ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.025)",
            borderColor: "rgba(255,255,255,0.08)",
          },
        ]}
      >
        <View style={[actionStyles.iconWrap, { backgroundColor: `${accent}18` }]}>
          <Feather name={icon as any} size={20} color={accent} />
        </View>
        <Text style={[actionStyles.label, { color: colors.foreground }]}>{label}</Text>
        <Text style={[actionStyles.sub, { color: colors.mutedForeground }]}>{sub}</Text>
        <Feather name="arrow-right" size={14} color="rgba(255,255,255,0.18)" style={actionStyles.arrow} />
      </Pressable>
    </Animated.View>
  );
}

const actionStyles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 22,
    marginBottom: 12,
    position: "relative",
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  label: { fontFamily: "DMSans_600SemiBold", fontSize: 18, marginBottom: 5 },
  sub: { fontFamily: "DMSans_400Regular", fontSize: 14, lineHeight: 21 },
  arrow: { position: "absolute", top: 22, right: 22 },
});

export default function MindspaceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { currentUser, calmCoins, streak } = useAppContext();

  const userName = currentUser?.name || "Alex";
  const insightIdx = new Date().getDate() % DAILY_INSIGHTS.length;
  const insight = DAILY_INSIGHTS[insightIdx];
  const aiInsight = AI_INSIGHTS[0];

  const pulseScale = useSharedValue(1);
  useEffect(() => {
    pulseScale.value = withDelay(
      800,
      withRepeat(
        withSequence(
          withTiming(1.008, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
  }, []);
  const insightStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulseScale.value }] }));

  const topPad = Platform.OS === "web" ? 64 : insets.top + 20;
  const bottomPad = Platform.OS === "web" ? 60 : insets.bottom + 36;

  return (
    <AtmosphericBackground>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingTop: topPad, paddingBottom: bottomPad, paddingHorizontal: 22 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(0).duration(700)} style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>
              {getFormattedDate()}
            </Text>
            <GlowText style={styles.greeting}>{getGreeting()}, {userName}</GlowText>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statBadge}>
              <Feather name="zap" size={12} color="#E8B86D" />
              <Text style={[styles.statText, { color: "#E8B86D" }]}>{streak}d</Text>
            </View>
            <View style={[styles.statBadge, { marginLeft: 8 }]}>
              <Feather name="circle" size={12} color={colors.primary} />
              <Text style={[styles.statText, { color: colors.primary }]}>{calmCoins.toLocaleString()}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Flow Score */}
        <Animated.View entering={FadeInUp.delay(80).duration(700)}>
          <PremiumCard style={styles.flowCard} glow>
            <View style={styles.flowHeader}>
              <View>
                <Text style={[styles.sectionEyebrow, { color: colors.mutedForeground }]}>Flow Score</Text>
                <View style={styles.flowScoreRow}>
                  <GlowText style={styles.flowScore}>{FLOW_SCORE.combined}</GlowText>
                  <Text style={[styles.flowScoreUnit, { color: colors.mutedForeground }]}>/100</Text>
                </View>
              </View>
              <View style={[styles.flowRing, { borderColor: `${colors.primary}40` }]}>
                <Text style={[styles.flowRingText, { color: colors.primary }]}>
                  {FLOW_SCORE.combined}%
                </Text>
              </View>
            </View>
            <View style={styles.flowBars}>
              <FlowBar label="Focus" value={FLOW_SCORE.focus} delay={400} />
              <FlowBar label="Calm" value={FLOW_SCORE.calm} delay={520} />
              <FlowBar label="Energy" value={FLOW_SCORE.energy} delay={640} />
            </View>
          </PremiumCard>
        </Animated.View>

        {/* Daily Insight */}
        <Animated.View entering={FadeInUp.delay(160).duration(700)} style={insightStyle}>
          <PremiumCard style={styles.insightCard}>
            <View style={styles.insightDot} />
            <Text style={[styles.insightEyebrow, { color: colors.mutedForeground }]}>Today's insight</Text>
            <Text style={[styles.insightText, { color: colors.foreground }]}>{insight}</Text>
          </PremiumCard>
        </Animated.View>

        {/* Section label */}
        <Animated.View entering={FadeInUp.delay(240).duration(600)}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Your sessions</Text>
        </Animated.View>

        {/* Primary Actions */}
        <ActionCard
          icon="zap"
          label="Focus Session"
          sub="Deep work. Minimal distraction."
          accent="#9B98F4"
          onPress={() => router.push("/(main)/focus-session")}
          delay={300}
        />
        <ActionCard
          icon="wind"
          label="Calm Reset"
          sub="2–3 minutes to feel lighter."
          accent="#6DC8C8"
          onPress={() => router.push("/(main)/calm-reset")}
          delay={380}
        />
        <ActionCard
          icon="edit-2"
          label="Journal"
          sub="A private moment to process."
          accent="#E8B86D"
          onPress={() => router.push("/(main)/journal")}
          delay={460}
        />

        {/* AI Insight */}
        <Animated.View entering={FadeInUp.delay(560).duration(700)}>
          <Pressable onPress={() => router.push("/(main)/companion")}>
            <PremiumCard style={styles.aiCard}>
              <View style={styles.aiHeader}>
                <View style={[styles.aiAvatar, { backgroundColor: "rgba(148,145,240,0.12)", borderColor: "rgba(148,145,240,0.25)" }]}>
                  <Feather name="message-circle" size={15} color={colors.primary} />
                </View>
                <Text style={[styles.aiLabel, { color: colors.mutedForeground }]}>AI Coach insight</Text>
                <Feather name="arrow-right" size={14} color="rgba(255,255,255,0.20)" />
              </View>
              <Text style={[styles.aiInsight, { color: colors.foreground }]}>{aiInsight}</Text>
              <Text style={[styles.aiCta, { color: colors.primary }]}>Talk to your coach →</Text>
            </PremiumCard>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
  },
  headerLeft: { flex: 1 },
  eyebrow: { fontFamily: "DMSans_400Regular", fontSize: 13, marginBottom: 6 },
  greeting: { fontSize: 28, lineHeight: 36 },
  statsRow: { flexDirection: "row", alignItems: "center", paddingTop: 22 },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  statText: { fontFamily: "DMSans_500Medium", fontSize: 13 },
  flowCard: { marginBottom: 14 },
  flowHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  sectionEyebrow: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    letterSpacing: 0.9,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  flowScoreRow: { flexDirection: "row", alignItems: "flex-end", gap: 4 },
  flowScore: { fontSize: 48, lineHeight: 52 },
  flowScoreUnit: { fontFamily: "DMSans_400Regular", fontSize: 16, marginBottom: 8 },
  flowRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2.5,
    alignItems: "center",
    justifyContent: "center",
  },
  flowRingText: { fontFamily: "DMSans_600SemiBold", fontSize: 18 },
  flowBars: {},
  insightCard: {
    marginBottom: 28,
    paddingLeft: 30,
    position: "relative",
    overflow: "visible",
  },
  insightDot: {
    position: "absolute",
    left: 18,
    top: "50%",
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(148,145,240,0.5)",
    marginTop: -2,
  },
  insightEyebrow: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    letterSpacing: 0.9,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  insightText: {
    fontFamily: "DMSerifDisplay_400Regular",
    fontSize: 20,
    lineHeight: 30,
    fontStyle: "italic",
  },
  sectionLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    letterSpacing: 0.9,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  aiCard: { marginBottom: 0 },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  aiAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  aiLabel: { fontFamily: "DMSans_400Regular", fontSize: 13, flex: 1 },
  aiInsight: {
    fontFamily: "DMSans_400Regular",
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 14,
  },
  aiCta: { fontFamily: "DMSans_500Medium", fontSize: 14 },
});
