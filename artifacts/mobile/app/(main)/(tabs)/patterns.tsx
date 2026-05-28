import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Platform,
} from "react-native";
import { AtmosphericBackground } from "@/components/AtmosphericBackground";
import { PremiumCard } from "@/components/PremiumCard";
import { GlowText } from "@/components/GlowText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";
import { weeklyMoodData, PATTERN_INSIGHTS } from "@/data/mock";
import { useAppContext } from "@/context/AppContext";
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useEffect } from "react";

const MOOD_COLORS: Record<number, string> = {
  1: "#E87878",
  2: "#E8B878",
  3: "#A8A8D8",
  4: "#78C8C8",
  5: "#9491F0",
};

function MoodBar({ day, score, label, delay }: { day: string; score: number; label: string; delay: number }) {
  const colors = useColors();
  const MAX_HEIGHT = 80;
  const height = useSharedValue(0);
  const barStyle = useAnimatedStyle(() => ({ height: height.value }));

  useEffect(() => {
    height.value = withDelay(
      delay,
      withTiming((score / 5) * MAX_HEIGHT, { duration: 800, easing: Easing.out(Easing.cubic) })
    );
  }, []);

  const barColor = MOOD_COLORS[score] ?? "#9491F0";

  return (
    <View style={barStyles.col}>
      <View style={[barStyles.track, { height: MAX_HEIGHT }]}>
        <Animated.View
          style={[
            barStyles.fill,
            { backgroundColor: barColor },
            barStyle,
          ]}
        />
      </View>
      <Text style={[barStyles.day, { color: colors.mutedForeground }]}>{day}</Text>
    </View>
  );
}

const barStyles = StyleSheet.create({
  col: { flex: 1, alignItems: "center", gap: 8 },
  track: {
    width: 28,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 6,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  fill: { width: "100%", borderRadius: 6 },
  day: { fontFamily: "DMSans_400Regular", fontSize: 11 },
});

function InsightCard({ item, delay }: { item: (typeof PATTERN_INSIGHTS)[0]; delay: number }) {
  const colors = useColors();

  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(600)}>
      <View
        style={[
          insightStyles.card,
          {
            borderColor: `${item.accent}22`,
            backgroundColor: `${item.accent}07`,
          },
        ]}
      >
        <View style={[insightStyles.iconWrap, { backgroundColor: `${item.accent}18` }]}>
          <Feather name={item.icon as any} size={16} color={item.accent} />
        </View>
        <View style={insightStyles.content}>
          <Text style={[insightStyles.type, { color: item.accent }]}>
            {item.type === "trend" ? "Trend" : item.type === "pattern" ? "Pattern" : item.type === "win" ? "Win" : "Habit"}
          </Text>
          <Text style={[insightStyles.headline, { color: colors.foreground }]}>
            {item.headline}
          </Text>
          <Text style={[insightStyles.body, { color: colors.mutedForeground }]}>
            {item.body}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const insightStyles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: 16,
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 2,
  },
  content: { flex: 1, gap: 5 },
  type: {
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  headline: { fontFamily: "DMSans_600SemiBold", fontSize: 16 },
  body: { fontFamily: "DMSans_400Regular", fontSize: 14, lineHeight: 21 },
});

export default function PatternsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { streak, calmCoins, journalEntries } = useAppContext();

  const topPad = Platform.OS === "web" ? 64 : insets.top + 24;
  const bottomPad = Platform.OS === "web" ? 100 : insets.bottom + 100;

  const avgScore =
    weeklyMoodData.reduce((a, b) => a + b.score, 0) / weeklyMoodData.length;

  return (
    <AtmosphericBackground>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: topPad, paddingBottom: bottomPad, paddingHorizontal: 22 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInUp.duration(700)} style={styles.header}>
          <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>
            Your patterns
          </Text>
          <GlowText style={styles.title}>Emotional{"\n"}landscape.</GlowText>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Patterns only emerge over time. Here's what your week reveals.
          </Text>
        </Animated.View>

        {/* Mood chart */}
        <Animated.View entering={FadeInUp.delay(100).duration(700)}>
          <PremiumCard style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <View>
                <Text style={[styles.chartEyebrow, { color: colors.mutedForeground }]}>
                  This week's mood
                </Text>
                <View style={styles.avgRow}>
                  <GlowText style={styles.avgScore}>{avgScore.toFixed(1)}</GlowText>
                  <Text style={[styles.avgUnit, { color: colors.mutedForeground }]}>/5</Text>
                </View>
              </View>
              <View style={[styles.trendBadge, { backgroundColor: "rgba(148,145,240,0.12)", borderColor: "rgba(148,145,240,0.25)" }]}>
                <Feather name="trending-up" size={13} color={colors.primary} />
                <Text style={[styles.trendText, { color: colors.primary }]}>+0.8</Text>
              </View>
            </View>
            <View style={styles.chartBars}>
              {weeklyMoodData.map((d, i) => (
                <MoodBar
                  key={d.day}
                  day={d.day}
                  score={d.score}
                  label={d.label}
                  delay={200 + i * 70}
                />
              ))}
            </View>
            <View style={styles.legendRow}>
              {[1, 2, 3, 4, 5].map((v) => (
                <View key={v} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: MOOD_COLORS[v] }]} />
                  <Text style={[styles.legendLabel, { color: colors.mutedForeground }]}>
                    {["Low", "Hard", "Mid", "Good", "Great"][v - 1]}
                  </Text>
                </View>
              ))}
            </View>
          </PremiumCard>
        </Animated.View>

        {/* Stats row */}
        <Animated.View entering={FadeInUp.delay(200).duration(700)} style={styles.statsRow}>
          {[
            { label: "Day streak", value: streak.toString(), icon: "zap", color: "#E8B86D" },
            { label: "Journal entries", value: journalEntries.length.toString(), icon: "edit-2", color: "#E8B86D" },
            { label: "Sessions", value: "0", icon: "wind", color: "#6DC8C8" },
          ].map((stat) => (
            <View
              key={stat.label}
              style={[styles.statCard, { borderColor: "rgba(255,255,255,0.07)", backgroundColor: "rgba(255,255,255,0.025)" }]}
            >
              <Feather name={stat.icon as any} size={15} color={stat.color} />
              <Text style={[styles.statValue, { color: colors.foreground }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Section label */}
        <Animated.View entering={FadeInUp.delay(280).duration(600)}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Pattern insights</Text>
        </Animated.View>

        {/* Insight cards */}
        <View style={styles.insightsList}>
          {PATTERN_INSIGHTS.map((item, i) => (
            <InsightCard key={item.id} item={item} delay={320 + i * 80} />
          ))}
        </View>

        {/* Note */}
        <Animated.View entering={FadeInUp.delay(600).duration(600)}>
          <View style={[styles.noteRow, { borderColor: "rgba(255,255,255,0.06)" }]}>
            <Feather name="lock" size={12} color={colors.mutedForeground} />
            <Text style={[styles.noteText, { color: colors.mutedForeground }]}>
              Patterns are computed locally on your device. Nothing leaves your phone.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 28 },
  eyebrow: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  title: { fontSize: 34, lineHeight: 42, marginBottom: 12 },
  subtitle: { fontFamily: "DMSans_400Regular", fontSize: 15, lineHeight: 24 },
  chartCard: { marginBottom: 18 },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  chartEyebrow: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    letterSpacing: 0.9,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  avgRow: { flexDirection: "row", alignItems: "flex-end", gap: 3 },
  avgScore: { fontSize: 40, lineHeight: 44 },
  avgUnit: { fontFamily: "DMSans_400Regular", fontSize: 14, marginBottom: 6 },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  trendText: { fontFamily: "DMSans_500Medium", fontSize: 13 },
  chartBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    marginBottom: 18,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontFamily: "DMSans_400Regular", fontSize: 10 },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    gap: 6,
  },
  statValue: { fontFamily: "DMSans_600SemiBold", fontSize: 22 },
  statLabel: { fontFamily: "DMSans_400Regular", fontSize: 11, textAlign: "center" },
  sectionLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    letterSpacing: 0.9,
    textTransform: "uppercase",
    marginBottom: 16,
  },
  insightsList: { gap: 12, marginBottom: 24 },
  noteRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  noteText: { fontFamily: "DMSans_400Regular", fontSize: 12, lineHeight: 19, flex: 1 },
});
