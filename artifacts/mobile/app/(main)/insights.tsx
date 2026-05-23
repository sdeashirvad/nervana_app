import React, { useEffect } from "react";
import { StyleSheet, View, Text, ScrollView, Platform } from "react-native";
import { AtmosphericBackground } from "@/components/AtmosphericBackground";
import { PremiumCard } from "@/components/PremiumCard";
import { GlowText } from "@/components/GlowText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { weeklyMoodData, mockPatterns } from "@/data/mock";
import { Feather } from "@expo/vector-icons";
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

function AnimatedBar({
  score,
  index,
  colors,
}: {
  score: number;
  index: number;
  colors: any;
}) {
  const height = useSharedValue(0);

  useEffect(() => {
    height.value = withDelay(
      200 + index * 80,
      withTiming((score / 5) * 100, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, []);

  const barStyle = useAnimatedStyle(() => ({
    height: `${height.value}%` as any,
    backgroundColor:
      score >= 4
        ? colors.primary
        : score >= 3
        ? colors.primary + "80"
        : colors.primary + "45",
  }));

  return (
    <View style={styles.barContainer}>
      <Animated.View style={[styles.bar, barStyle]} />
    </View>
  );
}

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const topPad = Platform.OS === "web" ? 64 : insets.top + 20;

  const consistencyDots = Array.from({ length: 21 }).map((_, i) => ({
    filled: i % 3 !== 0,
    recent: i < 7,
  }));

  return (
    <AtmosphericBackground>
      <ScrollView
        contentContainerStyle={{
          paddingTop: topPad,
          paddingBottom: insets.bottom + 120,
          paddingHorizontal: 22,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.delay(40).duration(600)} style={styles.header}>
          <GlowText style={styles.title}>Your emotional{"\n"}landscape</GlowText>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Gentle reflection, not performance tracking
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(120).duration(600)}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
            This week
          </Text>
          <PremiumCard style={styles.chartCard}>
            <View style={styles.chart}>
              {weeklyMoodData.map((d, i) => (
                <View key={i} style={styles.barCol}>
                  <AnimatedBar score={d.score} index={i} colors={colors} />
                  <Text style={[styles.barLabel, { color: colors.foreground }]}>
                    {d.day}
                  </Text>
                  <Text
                    style={[styles.moodLabel, { color: colors.mutedForeground }]}
                    numberOfLines={1}
                  >
                    {d.label}
                  </Text>
                </View>
              ))}
            </View>
            <View style={[styles.chartLegend, { borderTopColor: colors.border }]}>
              {[
                { label: "hard", color: colors.primary + "45" },
                { label: "okay", color: colors.primary + "80" },
                { label: "good", color: colors.primary },
              ].map(({ label, color }) => (
                <View key={label} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: color }]} />
                  <Text style={[styles.legendText, { color: colors.mutedForeground }]}>
                    {label}
                  </Text>
                </View>
              ))}
            </View>
          </PremiumCard>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(220).duration(600)}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
            Patterns
          </Text>
          {mockPatterns.map((pattern, i) => (
            <Animated.View
              key={i}
              entering={FadeInUp.delay(220 + i * 60).duration(500)}
            >
              <PremiumCard style={styles.patternCard}>
                <View style={styles.patternRow}>
                  <View
                    style={[
                      styles.patternIconWrap,
                      { backgroundColor: colors.primary + "12" },
                    ]}
                  >
                    <Feather
                      name={pattern.icon as any}
                      size={14}
                      color={colors.primary + "CC"}
                    />
                  </View>
                  <Text
                    style={[styles.patternText, { color: colors.secondaryForeground }]}
                  >
                    {pattern.text}
                  </Text>
                </View>
              </PremiumCard>
            </Animated.View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(480).duration(600)}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
            Reflection streak
          </Text>
          <PremiumCard style={styles.streakCard}>
            <Text style={[styles.streakCount, { color: colors.foreground }]}>
              12 days
            </Text>
            <Text style={[styles.streakLabel, { color: colors.mutedForeground }]}>
              of showing up for yourself
            </Text>
            <View style={styles.grid}>
              {consistencyDots.map((dot, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: dot.filled
                        ? dot.recent
                          ? colors.primary
                          : colors.primary + "60"
                        : colors.secondary,
                      borderWidth: dot.filled ? 0 : 1,
                      borderColor: colors.border,
                    },
                  ]}
                />
              ))}
            </View>
            <Text style={[styles.streakNote, { color: colors.mutedForeground }]}>
              Last 3 weeks
            </Text>
          </PremiumCard>
        </Animated.View>
      </ScrollView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 28 },
  title: { fontSize: 34, lineHeight: 42, marginBottom: 8 },
  subtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 15,
    lineHeight: 22,
  },
  sectionTitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    marginBottom: 12,
    marginTop: 4,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  chartCard: { marginBottom: 28, paddingHorizontal: 16, paddingBottom: 0 },
  chart: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 160,
    alignItems: "flex-end",
    paddingTop: 8,
  },
  barCol: { alignItems: "center", width: "12%" },
  barContainer: {
    height: 120,
    width: 10,
    backgroundColor: "rgba(30, 32, 56, 0.8)",
    borderRadius: 5,
    justifyContent: "flex-end",
    marginBottom: 8,
    overflow: "hidden",
  },
  bar: { width: "100%", borderRadius: 5 },
  barLabel: { fontFamily: "DMSans_500Medium", fontSize: 11, marginBottom: 3 },
  moodLabel: { fontFamily: "DMSans_400Regular", fontSize: 9, textAlign: "center" },
  chartLegend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    paddingTop: 14,
    paddingBottom: 6,
    borderTopWidth: 1,
    marginHorizontal: -16,
    marginTop: 8,
    paddingHorizontal: 16,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontFamily: "DMSans_400Regular", fontSize: 12 },
  patternCard: { marginBottom: 10, paddingVertical: 16, paddingHorizontal: 18 },
  patternRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  patternIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  patternText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
  streakCard: { marginBottom: 16 },
  streakCount: {
    fontFamily: "DMSerifDisplay_400Regular",
    fontSize: 38,
    lineHeight: 44,
    marginBottom: 2,
  },
  streakLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    marginBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
  },
  dot: { width: 14, height: 14, borderRadius: 7 },
  streakNote: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    letterSpacing: 0.2,
  },
});
