import React, { useEffect } from "react";
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
  withDelay,
  Easing,
  FadeInUp,
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

function ambientLine(): string {
  const h = new Date().getHours();
  if (h < 12) return "A quieter moment before the day begins.";
  if (h < 17) return "You've made it through most of today.";
  return "You don't have to carry the whole day into the night.";
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { currentUser, todayCheckin } = useAppContext();

  const userName = currentUser?.name ?? "Alex";
  const latestCheckin = mockCheckins?.[0] ?? null;
  const latestJournal = mockJournalEntries?.[0] ?? null;
  const quote = calmingQuotes?.[0] ?? { text: "You don't have to earn stillness.", author: "Nervana" };

  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withDelay(
      1000,
      withRepeat(
        withSequence(
          withTiming(1.007, { duration: 3500, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 3500, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
  }, []);

  const quoteStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const topPad = Platform.OS === "web" ? 64 : insets.top + 20;
  const bottomPad = Platform.OS === "web" ? 100 : insets.bottom + 120;

  return (
    <AtmosphericBackground>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingTop: topPad,
          paddingBottom: bottomPad,
          paddingHorizontal: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(40).duration(700)} style={styles.header}>
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
            hitSlop={14}
            style={styles.bellBtn}
          >
            <Feather name="bell" size={19} color={"rgba(255,255,255,0.28)"} />
          </Pressable>
        </Animated.View>

        {/* Ambient subtitle */}
        <Animated.Text
          entering={FadeInUp.delay(100).duration(700)}
          style={[styles.ambientSub, { color: colors.mutedForeground }]}
        >
          {ambientLine()}
        </Animated.Text>

        {/* Check-in card */}
        <Animated.View entering={FadeInUp.delay(180).duration(700)}>
          <PremiumCard style={styles.checkinCard} glow>
            <View style={styles.checkinHeader}>
              <View style={[styles.checkinPip, { backgroundColor: colors.primary }]} />
              <Text style={[styles.checkinLabel, { color: colors.mutedForeground }]}>
                {todayCheckin
                  ? `Feeling ${todayCheckin} today`
                  : "How are you arriving today?"}
              </Text>
            </View>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>
              {todayCheckin ? "You showed up." : "Check in with yourself"}
            </Text>
            {!todayCheckin ? (
              <View style={styles.chipRow}>
                {["overwhelmed", "tired", "anxious", "calm", "hopeful"].map((mood) => (
                  <MoodChip
                    key={mood}
                    label={mood}
                    selected={todayCheckin === mood}
                    onPress={() => router.push("/checkin")}
                  />
                ))}
              </View>
            ) : (
              <Pressable onPress={() => router.push("/(main)/reflect")} hitSlop={8}>
                <Text style={[styles.ctaLink, { color: colors.primary }]}>
                  Open today's reflection →
                </Text>
              </Pressable>
            )}
          </PremiumCard>
        </Animated.View>

        {/* Yesterday reflection */}
        {latestCheckin && (
          <Animated.View entering={FadeInUp.delay(260).duration(700)}>
            <PremiumCard style={styles.sectionCard}>
              <Text style={[styles.mutedLabel, { color: colors.mutedForeground }]}>
                Yesterday you were {latestCheckin.mood}.
              </Text>
              <Text style={[styles.italicQuote, { color: colors.accent }]}>
                "Rest is how your mind files what the day couldn't process."
              </Text>
            </PremiumCard>
          </Animated.View>
        )}

        {/* Daily quote — breathing, animated */}
        <Animated.View
          entering={FadeInUp.delay(340).duration(700)}
          style={quoteStyle}
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
          <Animated.View entering={FadeInUp.delay(420).duration(700)}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
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
                <View style={[styles.moodTag, { backgroundColor: "rgba(255,255,255,0.05)" }]}>
                  <Text style={[styles.moodTagText, { color: colors.mutedForeground }]}>
                    {latestJournal.mood}
                  </Text>
                </View>
                <Pressable onPress={() => router.push("/(main)/journal")} hitSlop={10}>
                  <Text style={[styles.ctaLink, { color: colors.primary }]}>
                    Continue →
                  </Text>
                </Pressable>
              </View>
            </PremiumCard>
          </Animated.View>
        )}

        {/* Emotional week */}
        <Animated.View entering={FadeInUp.delay(500).duration(700)}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            Your emotional week
          </Text>
          <PremiumCard style={styles.chartCard}>
            <View style={styles.chart}>
              {weeklyMoodData.map((d, i) => (
                <View key={i} style={styles.barCol}>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${((d.score ?? 1) / 5) * 100}%` as any,
                          backgroundColor:
                            d.score >= 4
                              ? colors.primary
                              : d.score >= 3
                              ? colors.primary + "88"
                              : colors.primary + "40",
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
              style={[styles.chartFooter, { borderTopColor: "rgba(255,255,255,0.06)" }]}
              hitSlop={8}
            >
              <Text style={[styles.chartFooterText, { color: colors.mutedForeground }]}>
                Full insights
              </Text>
              <Feather name="arrow-right" size={12} color={colors.mutedForeground} />
            </Pressable>
          </PremiumCard>
        </Animated.View>

        {/* Quick actions */}
        <Animated.View
          entering={FadeInUp.delay(580).duration(700)}
          style={styles.quickActions}
        >
          {[
            { label: "Reflect", icon: "sun" as const, route: "/(main)/reflect" },
            { label: "Companion", icon: "message-circle" as const, route: "/(main)/companion" },
            { label: "Journal", icon: "book-open" as const, route: "/(main)/journal" },
          ].map(({ label, icon, route }) => (
            <Pressable
              key={label}
              style={({ pressed }) => [
                styles.actionBtn,
                {
                  backgroundColor: pressed
                    ? "rgba(148,145,240,0.08)"
                    : "rgba(255,255,255,0.03)",
                  borderColor: "rgba(255,255,255,0.07)",
                },
              ]}
              onPress={() => router.push(route as any)}
            >
              <Feather name={icon} size={18} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.secondaryForeground }]}>
                {label}
              </Text>
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
    marginBottom: 6,
  },
  headerText: { flex: 1 },
  greeting: { fontSize: 30, lineHeight: 38, marginBottom: 4 },
  date: { fontFamily: "DMSans_400Regular", fontSize: 14, letterSpacing: 0.1 },
  bellBtn: { paddingTop: 6 },
  ambientSub: {
    fontFamily: "DMSans_400Regular",
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 30,
    marginTop: 2,
  },
  checkinCard: { marginBottom: 14 },
  checkinHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  checkinPip: { width: 5, height: 5, borderRadius: 2.5, marginRight: 8 },
  checkinLabel: { fontFamily: "DMSans_400Regular", fontSize: 13 },
  cardTitle: { fontFamily: "DMSans_500Medium", fontSize: 18, marginBottom: 16, lineHeight: 26 },
  chipRow: { flexDirection: "row", flexWrap: "wrap" },
  ctaLink: { fontFamily: "DMSans_500Medium", fontSize: 14, letterSpacing: 0.1 },
  sectionCard: { marginBottom: 14 },
  mutedLabel: { fontFamily: "DMSans_400Regular", fontSize: 13, marginBottom: 10 },
  italicQuote: {
    fontFamily: "DMSerifDisplay_400Regular",
    fontSize: 18,
    lineHeight: 27,
    fontStyle: "italic",
  },
  quoteCard: {
    marginBottom: 32,
    paddingLeft: 30,
  },
  quoteLine: {
    position: "absolute",
    left: 18,
    top: 22,
    bottom: 22,
    width: 2,
    borderRadius: 1,
    opacity: 0.45,
  },
  quoteText: { fontSize: 19, lineHeight: 30, marginBottom: 12, fontStyle: "italic" },
  quoteAuthor: { fontFamily: "DMSans_400Regular", fontSize: 13, letterSpacing: 0.2 },
  sectionLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    marginBottom: 12,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  journalPreview: { marginBottom: 32 },
  journalTitle: {
    fontFamily: "DMSerifDisplay_400Regular",
    fontSize: 21,
    marginBottom: 8,
    lineHeight: 28,
  },
  journalContent: {
    fontFamily: "DMSans_400Regular",
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 16,
  },
  journalFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  moodTag: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  moodTagText: { fontFamily: "DMSans_400Regular", fontSize: 12 },
  chartCard: { marginBottom: 32, paddingBottom: 0 },
  chart: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 86,
    alignItems: "flex-end",
    marginBottom: 14,
  },
  barCol: { alignItems: "center", flex: 1 },
  barTrack: {
    height: 66,
    width: 6,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 3,
    justifyContent: "flex-end",
    marginBottom: 7,
    overflow: "hidden",
  },
  bar: { width: "100%", borderRadius: 3 },
  barLabel: { fontFamily: "DMSans_400Regular", fontSize: 10 },
  chartFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingTop: 12,
    paddingBottom: 6,
    borderTopWidth: 1,
    marginHorizontal: -22,
    paddingHorizontal: 22,
  },
  chartFooterText: { fontFamily: "DMSans_400Regular", fontSize: 13 },
  quickActions: { flexDirection: "row", gap: 10 },
  actionBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionText: { fontFamily: "DMSans_400Regular", fontSize: 12, letterSpacing: 0.1 },
});
