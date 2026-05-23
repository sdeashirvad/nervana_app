import React, { useEffect } from "react";
import { StyleSheet, View, Text, Pressable, ScrollView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { AtmosphericBackground } from "@/components/AtmosphericBackground";
import { PremiumCard } from "@/components/PremiumCard";
import { GlowText } from "@/components/GlowText";
import { MoodChip } from "@/components/MoodChip";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";
import {
  mockCheckins,
  mockJournalEntries,
  weeklyMoodData,
  calmingQuotes,
} from "@/data/mock";
import { useAppContext } from "@/context/AppContext";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  FadeInUp,
} from "react-native-reanimated";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
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

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { currentUser, todayCheckin } = useAppContext();

  const userName = currentUser?.name ?? "Alex";
  const latestCheckin = mockCheckins?.[0] ?? null;
  const latestJournal = mockJournalEntries?.[0] ?? null;
  const quote = calmingQuotes?.[0] ?? { text: "Rest is not the absence of work. It is the condition for it.", author: "Nervana" };

  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.004, { duration: 2500, easing: Easing.inOut(Easing.sine) }),
        withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.sine) })
      ),
      -1,
      true
    );
  }, []);

  const quoteAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const topPad = Platform.OS === "web" ? 67 : insets.top + 20;
  const bottomPad = Platform.OS === "web" ? 100 : insets.bottom + 120;

  return (
    <AtmosphericBackground>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingTop: topPad,
          paddingBottom: bottomPad,
          paddingHorizontal: 22,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(60).duration(500)} style={styles.header}>
          <View style={styles.headerText}>
            <GlowText style={styles.greeting}>
              {getGreeting()}, {userName}
            </GlowText>
            <Text style={[styles.date, { color: colors.mutedForeground }]}>
              {getFormattedDate()}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/notifications")}
            style={styles.bellBtn}
            hitSlop={12}
          >
            <Feather name="bell" size={22} color={colors.mutedForeground} />
          </Pressable>
        </Animated.View>

        {/* Check-in card */}
        <Animated.View entering={FadeInUp.delay(140).duration(500)}>
          <PremiumCard
            style={[styles.checkinCard, { borderColor: colors.primary + "30" }]}
          >
            <View style={styles.checkinHeader}>
              <View style={[styles.checkinDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.checkinLabel, { color: colors.mutedForeground }]}>
                {todayCheckin ? `Feeling ${todayCheckin} today` : "Check in with yourself"}
              </Text>
            </View>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>
              How are you right now?
            </Text>
            <View style={styles.chipRow}>
              {["overwhelmed", "tired", "anxious", "calm"].map((mood) => (
                <MoodChip
                  key={mood}
                  label={mood}
                  selected={todayCheckin === mood}
                  onPress={() => router.push("/checkin")}
                />
              ))}
            </View>
          </PremiumCard>
        </Animated.View>

        {/* Yesterday's reflection */}
        {latestCheckin && (
          <Animated.View entering={FadeInUp.delay(220).duration(500)}>
            <PremiumCard style={styles.sectionCard}>
              <Text style={[styles.mutedLabel, { color: colors.mutedForeground }]}>
                Yesterday you were {latestCheckin.mood}.
              </Text>
              <Text style={[styles.reflectionQuote, { color: colors.accent }]}>
                "Rest is how your mind files what the day couldn't process."
              </Text>
            </PremiumCard>
          </Animated.View>
        )}

        {/* Calming quote */}
        <Animated.View
          entering={FadeInUp.delay(300).duration(500)}
          style={quoteAnimatedStyle}
        >
          <PremiumCard style={styles.quoteCard}>
            <View style={[styles.quoteLine, { backgroundColor: colors.primary }]} />
            <GlowText style={styles.quoteText}>"{quote.text}"</GlowText>
            <Text style={[styles.quoteAuthor, { color: colors.mutedForeground }]}>
              — {quote.author}
            </Text>
          </PremiumCard>
        </Animated.View>

        {/* Continue reflection */}
        {latestJournal && (
          <Animated.View entering={FadeInUp.delay(380).duration(500)}>
            <Text style={[styles.sectionHeader, { color: colors.foreground }]}>
              Continue your reflection
            </Text>
            <PremiumCard style={styles.journalPreview}>
              <Text style={[styles.journalTitle, { color: colors.foreground }]}>
                {latestJournal.title}
              </Text>
              <Text
                style={[styles.journalContent, { color: colors.secondaryForeground }]}
                numberOfLines={2}
              >
                {latestJournal.content}
              </Text>
              <View style={styles.journalFooter}>
                <View
                  style={[styles.tag, { backgroundColor: colors.secondary }]}
                >
                  <Text style={[styles.tagText, { color: colors.mutedForeground }]}>
                    {latestJournal.mood ?? "reflective"}
                  </Text>
                </View>
                <Pressable onPress={() => router.push("/(main)/journal")} hitSlop={8}>
                  <Text style={[styles.continueText, { color: colors.primary }]}>
                    Continue →
                  </Text>
                </Pressable>
              </View>
            </PremiumCard>
          </Animated.View>
        )}

        {/* Emotional week chart */}
        <Animated.View entering={FadeInUp.delay(460).duration(500)}>
          <Text style={[styles.sectionHeader, { color: colors.foreground }]}>
            Your emotional week
          </Text>
          <PremiumCard style={styles.chartCard}>
            <View style={styles.chart}>
              {(weeklyMoodData ?? []).map((d, i) => (
                <View key={i} style={styles.barCol}>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${((d.score ?? 1) / 5) * 100}%`,
                          backgroundColor:
                            d.score >= 4
                              ? colors.primary
                              : d.score >= 3
                              ? colors.primary + "90"
                              : colors.primary + "50",
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>
                    {d.day}
                  </Text>
                </View>
              ))}
            </View>
            <Pressable
              onPress={() => router.push("/(main)/insights")}
              style={[styles.chartFooter, { borderTopColor: colors.border }]}
              hitSlop={8}
            >
              <Text style={[styles.chartFooterText, { color: colors.mutedForeground }]}>
                See full insights
              </Text>
              <Feather name="arrow-right" size={14} color={colors.mutedForeground} />
            </Pressable>
          </PremiumCard>
        </Animated.View>

        {/* Quick actions */}
        <Animated.View entering={FadeInUp.delay(540).duration(500)} style={styles.quickActions}>
          {[
            { label: "Reflect", icon: "sun" as const, route: "/(main)/reflect" },
            { label: "Companion", icon: "message-circle" as const, route: "/(main)/companion" },
            { label: "Journal", icon: "book-open" as const, route: "/(main)/journal" },
          ].map(({ label, icon, route }) => (
            <Pressable
              key={label}
              style={[
                styles.actionBtn,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => router.push(route as any)}
            >
              <Feather name={icon} size={20} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.foreground }]}>{label}</Text>
            </Pressable>
          ))}
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
  headerText: { flex: 1 },
  greeting: { fontSize: 30, marginBottom: 4, lineHeight: 36 },
  date: { fontFamily: "DMSans_400Regular", fontSize: 15 },
  bellBtn: { padding: 6, marginTop: 4 },
  checkinCard: { marginBottom: 16 },
  checkinHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  checkinDot: { width: 6, height: 6, borderRadius: 3, marginRight: 8 },
  checkinLabel: { fontFamily: "DMSans_400Regular", fontSize: 13 },
  cardTitle: { fontFamily: "DMSans_500Medium", fontSize: 17, marginBottom: 16 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  sectionCard: { marginBottom: 16 },
  mutedLabel: { fontFamily: "DMSans_400Regular", fontSize: 14, marginBottom: 10 },
  reflectionQuote: {
    fontFamily: "DMSerifDisplay_400Regular",
    fontSize: 18,
    lineHeight: 26,
    fontStyle: "italic",
  },
  quoteCard: {
    marginBottom: 32,
    backgroundColor: "rgba(16, 18, 36, 0.9)",
    paddingLeft: 28,
  },
  quoteLine: {
    position: "absolute",
    left: 20,
    top: 20,
    bottom: 20,
    width: 2,
    borderRadius: 1,
    opacity: 0.6,
  },
  quoteText: { fontSize: 20, lineHeight: 30, marginBottom: 14, fontStyle: "italic" },
  quoteAuthor: { fontFamily: "DMSans_400Regular", fontSize: 14 },
  sectionHeader: {
    fontFamily: "DMSans_500Medium",
    fontSize: 16,
    marginBottom: 14,
    letterSpacing: 0.2,
  },
  journalPreview: { marginBottom: 32 },
  journalTitle: {
    fontFamily: "DMSerifDisplay_400Regular",
    fontSize: 20,
    marginBottom: 8,
  },
  journalContent: {
    fontFamily: "DMSans_400Regular",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  journalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tag: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  tagText: { fontFamily: "DMSans_500Medium", fontSize: 12 },
  continueText: { fontFamily: "DMSans_500Medium", fontSize: 14 },
  chartCard: { marginBottom: 32 },
  chart: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 100,
    alignItems: "flex-end",
    marginBottom: 16,
  },
  barCol: { alignItems: "center", flex: 1 },
  barContainer: {
    height: 80,
    width: 7,
    backgroundColor: "rgba(37, 40, 64, 0.8)",
    borderRadius: 4,
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  bar: { width: "100%", borderRadius: 4 },
  barLabel: { fontFamily: "DMSans_400Regular", fontSize: 11 },
  chartFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  chartFooterText: { fontFamily: "DMSans_400Regular", fontSize: 13 },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionText: { fontFamily: "DMSans_500Medium", fontSize: 12 },
});
