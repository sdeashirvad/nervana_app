import React from "react";
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
import { Feather } from "@expo/vector-icons";
import { calmingQuotes } from "@/data/mock";
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

const ACTIVITIES = [
  {
    id: "breathing",
    title: "Guided Breathing",
    subtitle: "4-4-6 breath pattern",
    description:
      "Inhale for 4, hold for 4, exhale for 6. Let the rhythm do the calming for you.",
    icon: "wind" as const,
    duration: "2.5 min",
    coins: "+40 coins",
    accent: "#6DC8C8",
    bg: "rgba(109,200,200,0.07)",
    border: "rgba(109,200,200,0.20)",
    route: "/(main)/calm-reset",
  },
  {
    id: "grounding",
    title: "Grounding Reset",
    subtitle: "5-step presence guide",
    description:
      "Five gentle steps to bring you back to the present. Ideal for overwhelm or scattered thoughts.",
    icon: "anchor" as const,
    duration: "~2 min",
    coins: "+35 coins",
    accent: "#C8A882",
    bg: "rgba(200,168,130,0.07)",
    border: "rgba(200,168,130,0.20)",
    route: "/(main)/grounding",
  },
];

function ActivityCard({
  activity,
  delay,
}: {
  activity: (typeof ACTIVITIES)[0];
  delay: number;
}) {
  const router = useRouter();
  const colors = useColors();
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(620)} style={animStyle}>
      <Pressable
        onPress={() => {
          scale.value = withSpring(0.97, { damping: 16 }, () => {
            scale.value = withSpring(1, { damping: 14 });
          });
          router.push(activity.route as any);
        }}
        style={[
          styles.card,
          {
            backgroundColor: activity.bg,
            borderColor: activity.border,
          },
        ]}
      >
        {/* Icon + meta row */}
        <View style={styles.cardTop}>
          <View style={[styles.iconWrap, { backgroundColor: `${activity.accent}20` }]}>
            <Feather name={activity.icon} size={22} color={activity.accent} />
          </View>
          <View style={styles.metaRow}>
            {[
              { icon: "clock" as const, label: activity.duration },
              { icon: "circle" as const, label: activity.coins },
            ].map(({ icon, label }) => (
              <View key={label} style={[styles.metaBadge, { borderColor: "rgba(255,255,255,0.09)" }]}>
                <Feather name={icon} size={10} color={activity.accent} />
                <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{label}</Text>
              </View>
            ))}
          </View>
          <Feather name="arrow-right" size={16} color={`${activity.accent}80`} />
        </View>

        <Text style={[styles.cardTitle, { color: colors.foreground }]}>{activity.title}</Text>
        <Text style={[styles.cardSubtitle, { color: activity.accent }]}>{activity.subtitle}</Text>
        <Text style={[styles.cardDesc, { color: colors.mutedForeground }]}>{activity.description}</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function CalmScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();

  const topPad = Platform.OS === "web" ? 64 : insets.top + 24;
  const bottomPad = Platform.OS === "web" ? 100 : insets.bottom + 100;

  const quote = calmingQuotes[new Date().getDate() % calmingQuotes.length];

  return (
    <AtmosphericBackground variant="deep">
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: topPad,
          paddingBottom: bottomPad,
          paddingHorizontal: 22,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInUp.duration(700)} style={styles.header}>
          <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>
            Calm & Reset
          </Text>
          <GlowText style={styles.title}>Choose your{"\n"}reset.</GlowText>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Two minutes is enough to change your state.
          </Text>
        </Animated.View>

        {/* Activity cards */}
        {ACTIVITIES.map((activity, i) => (
          <ActivityCard key={activity.id} activity={activity} delay={120 + i * 120} />
        ))}

        {/* Quote */}
        <Animated.View
          entering={FadeInUp.delay(400).duration(700)}
          style={[styles.quoteCard, { borderColor: "rgba(255,255,255,0.06)", backgroundColor: "rgba(255,255,255,0.02)" }]}
        >
          <View style={[styles.quoteAccent, { backgroundColor: colors.primary }]} />
          <Text style={[styles.quoteText, { color: colors.foreground }]}>
            "{quote.text}"
          </Text>
          <Text style={[styles.quoteAuthor, { color: colors.mutedForeground }]}>
            — {quote.author}
          </Text>
        </Animated.View>

        {/* Tip */}
        <Animated.View entering={FadeInUp.delay(520).duration(600)}>
          <View style={[styles.tipRow, { borderColor: "rgba(255,255,255,0.06)" }]}>
            <Feather name="info" size={13} color={colors.mutedForeground} />
            <Text style={[styles.tipText, { color: colors.mutedForeground }]}>
              These sessions earn Focus Coins toward your weekly streak.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 32 },
  eyebrow: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  title: { fontSize: 36, lineHeight: 44, marginBottom: 12 },
  subtitle: { fontFamily: "DMSans_400Regular", fontSize: 16, lineHeight: 25 },
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    gap: 10,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  metaRow: { flex: 1, flexDirection: "row", gap: 8 },
  metaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  metaText: { fontFamily: "DMSans_400Regular", fontSize: 11 },
  cardTitle: { fontFamily: "DMSans_600SemiBold", fontSize: 20 },
  cardSubtitle: { fontFamily: "DMSans_500Medium", fontSize: 13, letterSpacing: 0.3 },
  cardDesc: { fontFamily: "DMSans_400Regular", fontSize: 15, lineHeight: 23 },
  quoteCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 24,
    paddingLeft: 32,
    position: "relative",
    overflow: "hidden",
    marginBottom: 20,
    marginTop: 4,
  },
  quoteAccent: {
    position: "absolute",
    left: 16,
    top: 20,
    bottom: 20,
    width: 2,
    borderRadius: 2,
    opacity: 0.50,
  },
  quoteText: {
    fontFamily: "DMSerifDisplay_400Regular",
    fontSize: 18,
    lineHeight: 28,
    fontStyle: "italic",
    marginBottom: 10,
  },
  quoteAuthor: { fontFamily: "DMSans_400Regular", fontSize: 13 },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  tipText: { fontFamily: "DMSans_400Regular", fontSize: 13, lineHeight: 20, flex: 1 },
});
