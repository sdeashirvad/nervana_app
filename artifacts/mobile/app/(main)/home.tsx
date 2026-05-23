import React, { useEffect } from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { AtmosphericBackground } from "@/components/AtmosphericBackground";
import { PremiumCard } from "@/components/PremiumCard";
import { GlowText } from "@/components/GlowText";
import { MoodChip } from "@/components/MoodChip";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";
import { mockUser, mockCheckins, mockJournalEntries, weeklyMoodData, calmingQuotes } from "@/data/mock";
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withSequence, 
  withTiming, 
  Easing,
  FadeInUp
} from "react-native-reanimated";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();

  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.003, { duration: 2000, easing: Easing.inOut(Easing.sine) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sine) })
      ),
      -1,
      true
    );
  }, []);

  const quoteAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <AtmosphericBackground>
      <Animated.ScrollView 
        style={styles.container}
        contentContainerStyle={{ 
          paddingTop: insets.top + 24, 
          paddingBottom: insets.bottom + 120,
          paddingHorizontal: 20
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
          <View>
            <GlowText style={styles.greeting}>Good evening, {mockUser.name}</GlowText>
            <Text style={styles.date}>Thursday · May 23</Text>
          </View>
          <Pressable onPress={() => router.push("/notifications")} style={styles.bellBtn}>
            <Feather name="bell" size={24} color={colors.foreground} />
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(180)}>
          <PremiumCard style={[styles.checkinCard, { borderColor: colors.primary + "50" }]}>
            <Text style={styles.cardTitle}>How are you feeling right now?</Text>
            <View style={styles.chipRow}>
              {["overwhelmed", "tired", "anxious", "calm"].map((mood) => (
                <MoodChip
                  key={mood}
                  label={mood}
                  onPress={() => router.push("/checkin")}
                />
              ))}
            </View>
          </PremiumCard>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(260)}>
          <PremiumCard style={styles.sectionCard}>
            <Text style={styles.mutedTitle}>Yesterday you were {mockCheckins[0].mood}.</Text>
            <Text style={styles.reflectionQuote}>
              <Text style={{ color: colors.accent }}>"Rest is how your mind files what the day couldn't process."</Text>
            </Text>
          </PremiumCard>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(340)} style={quoteAnimatedStyle}>
          <PremiumCard useBlur style={styles.quoteCard}>
            <GlowText style={styles.quoteText}>"{calmingQuotes[0].text}"</GlowText>
            <Text style={styles.quoteAuthor}>— {calmingQuotes[0].author}</Text>
          </PremiumCard>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(420)}>
          <Text style={styles.sectionHeader}>Continue your reflection</Text>
          <PremiumCard style={styles.journalPreview}>
            <Text style={styles.journalTitle}>{mockJournalEntries[0].title}</Text>
            <Text style={styles.journalContent} numberOfLines={2}>
              {mockJournalEntries[0].content}
            </Text>
            <View style={styles.journalFooter}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{mockJournalEntries[0].mood}</Text>
              </View>
              <Pressable onPress={() => router.push("/(main)/journal")}>
                <Text style={[styles.continueText, { color: colors.primary }]}>Continue →</Text>
              </Pressable>
            </View>
          </PremiumCard>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(500)}>
          <Text style={styles.sectionHeader}>Your emotional week</Text>
          <PremiumCard style={styles.chartCard}>
            <View style={styles.chart}>
              {weeklyMoodData.map((d, i) => (
                <View key={i} style={styles.barCol}>
                  <View style={styles.barContainer}>
                    <View 
                      style={[
                        styles.bar, 
                        { height: `${(d.score / 5) * 100}%`, backgroundColor: colors.primary }
                      ]} 
                    />
                  </View>
                  <Text style={styles.barLabel}>{d.day}</Text>
                </View>
              ))}
            </View>
            <Pressable onPress={() => router.push("/(main)/insights")} style={styles.chartFooter}>
              <Text style={styles.chartFooterText}>Tap to see full insights</Text>
            </Pressable>
          </PremiumCard>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(580)} style={styles.quickActions}>
          <Pressable style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push("/(main)/reflect")}>
            <Feather name="circle" size={20} color={colors.foreground} />
            <Text style={styles.actionText}>Reflect</Text>
          </Pressable>
          <Pressable style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push("/(main)/companion")}>
            <Feather name="message-circle" size={20} color={colors.foreground} />
            <Text style={styles.actionText}>Companion</Text>
          </Pressable>
          <Pressable style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push("/(main)/journal")}>
            <Feather name="book-open" size={20} color={colors.foreground} />
            <Text style={styles.actionText}>Journal</Text>
          </Pressable>
        </Animated.View>

      </Animated.ScrollView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: {
    fontSize: 32,
    marginBottom: 4,
  },
  date: {
    fontFamily: "DMSans_400Regular",
    fontSize: 16,
    color: "#8A8882",
  },
  bellBtn: {
    padding: 8,
  },
  checkinCard: {
    marginBottom: 16,
  },
  cardTitle: {
    fontFamily: "DMSans_500Medium",
    fontSize: 16,
    color: "#F5F3EE",
    marginBottom: 16,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sectionCard: {
    marginBottom: 16,
  },
  mutedTitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: "#8A8882",
    marginBottom: 8,
  },
  reflectionQuote: {
    fontFamily: "DMSerifDisplay_400Regular",
    fontSize: 18,
    lineHeight: 26,
  },
  quoteCard: {
    marginBottom: 32,
    backgroundColor: "rgba(19, 21, 42, 0.6)",
  },
  quoteText: {
    fontSize: 22,
    lineHeight: 32,
    fontStyle: "italic",
    marginBottom: 12,
  },
  quoteAuthor: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: "#8A8882",
  },
  sectionHeader: {
    fontFamily: "DMSans_500Medium",
    fontSize: 18,
    color: "#F5F3EE",
    marginBottom: 16,
  },
  journalPreview: {
    marginBottom: 32,
  },
  journalTitle: {
    fontFamily: "DMSerifDisplay_400Regular",
    fontSize: 20,
    color: "#F5F3EE",
    marginBottom: 8,
  },
  journalContent: {
    fontFamily: "DMSans_400Regular",
    fontSize: 15,
    color: "#C8C5BE",
    lineHeight: 22,
    marginBottom: 16,
  },
  journalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tag: {
    backgroundColor: "#1E2038",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    color: "#8A8882",
  },
  continueText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
  },
  chartCard: {
    marginBottom: 32,
  },
  chart: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 120,
    alignItems: "flex-end",
    marginBottom: 16,
  },
  barCol: {
    alignItems: "center",
    width: "10%",
  },
  barContainer: {
    height: 90,
    width: 8,
    backgroundColor: "#1E2038",
    borderRadius: 4,
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  bar: {
    width: "100%",
    borderRadius: 4,
  },
  barLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: "#8A8882",
  },
  chartFooter: {
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#252840",
  },
  chartFooterText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: "#8A8882",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: "#F5F3EE",
    marginTop: 8,
  },
});
