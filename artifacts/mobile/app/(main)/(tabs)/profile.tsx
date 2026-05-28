import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { AtmosphericBackground } from "@/components/AtmosphericBackground";
import { PremiumCard } from "@/components/PremiumCard";
import { GlowText } from "@/components/GlowText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";
import { useAppContext } from "@/context/AppContext";
import Animated, { FadeInUp } from "react-native-reanimated";

const REASON_LABELS: Record<string, string> = {
  burnout: "Burnout & exhaustion",
  overthinking: "Mental noise & overthinking",
  balance: "Work-life balance",
  focus: "Focus & clarity",
  emotional: "Emotional reset",
};

const STRUGGLE_LABELS: Record<string, string> = {
  "switch-off": "Can't switch off after work",
  sleep: "Sleep feels restless",
  noise: "Mental noise is constant",
  pressure: "Pressure without end",
  disconnected: "Feeling disconnected",
  identity: "Losing track of who I am",
};

const GOAL_LABELS: Record<string, string> = {
  clearer: "Feel clearer",
  calmer: "Feel calmer",
  focused: "Be more focused",
  "less-overwhelmed": "Feel less overwhelmed",
  present: "Be more present",
};

const STATE_LABELS: Record<string, string> = {
  "calm-evenings": "Calmer evenings",
  "sharp-focus": "Sharper focus",
  "less-noise": "Less mental noise",
  "emotional-clarity": "More emotional clarity",
};

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value: string;
}) {
  const colors = useColors();
  return (
    <View style={rowStyles.row}>
      <View style={[rowStyles.iconWrap, { backgroundColor: "rgba(148,145,240,0.10)" }]}>
        <Feather name={icon} size={14} color={colors.primary} />
      </View>
      <View style={rowStyles.content}>
        <Text style={[rowStyles.label, { color: colors.mutedForeground }]}>{label}</Text>
        <Text style={[rowStyles.value, { color: colors.foreground }]}>{value}</Text>
      </View>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: { flexDirection: "row", gap: 14, paddingVertical: 14 },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  content: { flex: 1, justifyContent: "center", gap: 3 },
  label: { fontFamily: "DMSans_400Regular", fontSize: 12 },
  value: { fontFamily: "DMSans_500Medium", fontSize: 15 },
});

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { currentUser, calmCoins, streak, referralCount, onboardingAnswers, logout, journalEntries } = useAppContext();

  const topPad = Platform.OS === "web" ? 64 : insets.top + 24;
  const bottomPad = Platform.OS === "web" ? 100 : insets.bottom + 100;

  const displayName = currentUser.name || "Guest";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Your entries and progress are saved locally. Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/splash");
          },
        },
      ]
    );
  };

  return (
    <AtmosphericBackground>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: topPad, paddingBottom: bottomPad, paddingHorizontal: 22 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInUp.duration(700)} style={styles.header}>
          <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>Profile</Text>
        </Animated.View>

        {/* User card */}
        <Animated.View entering={FadeInUp.delay(60).duration(700)}>
          <PremiumCard style={styles.userCard} glow>
            <View style={styles.userCardInner}>
              <View style={[styles.avatar, { backgroundColor: "rgba(148,145,240,0.18)", borderColor: "rgba(148,145,240,0.35)" }]}>
                <Text style={[styles.avatarText, { color: colors.primary }]}>{initials}</Text>
              </View>
              <View style={styles.userInfo}>
                <GlowText style={styles.userName}>{displayName}</GlowText>
                <View style={[styles.guestBadge, { backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.10)" }]}>
                  <Feather name="user" size={10} color={colors.mutedForeground} />
                  <Text style={[styles.guestText, { color: colors.mutedForeground }]}>
                    {currentUser.isGuest ? "Guest account" : "Member"}
                  </Text>
                </View>
              </View>
              <View style={[styles.planBadge, { backgroundColor: "rgba(148,145,240,0.12)", borderColor: "rgba(148,145,240,0.28)" }]}>
                <Text style={[styles.planText, { color: colors.primary }]}>Early Access</Text>
              </View>
            </View>
          </PremiumCard>
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={FadeInUp.delay(120).duration(700)} style={styles.statsRow}>
          {[
            { label: "Focus Coins", value: calmCoins.toLocaleString(), icon: "circle" as const, color: colors.primary },
            { label: "Day Streak", value: `${streak}d`, icon: "zap" as const, color: "#E8B86D" },
            { label: "Journal Entries", value: journalEntries.length.toString(), icon: "edit-2" as const, color: "#E8B86D" },
            { label: "Referrals", value: referralCount.toString(), icon: "users" as const, color: "#6DC8C8" },
          ].map((stat) => (
            <View
              key={stat.label}
              style={[styles.statCard, { borderColor: "rgba(255,255,255,0.07)", backgroundColor: "rgba(255,255,255,0.025)" }]}
            >
              <Feather name={stat.icon} size={14} color={stat.color} />
              <Text style={[styles.statValue, { color: colors.foreground }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Preferences */}
        {(onboardingAnswers.moodGoal || onboardingAnswers.reason || onboardingAnswers.struggle || onboardingAnswers.preferredState) && (
          <Animated.View entering={FadeInUp.delay(200).duration(700)}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Your preferences</Text>
            <PremiumCard style={styles.prefsCard}>
              {onboardingAnswers.moodGoal && (
                <View style={[styles.prefDivider, { borderBottomColor: "rgba(255,255,255,0.06)" }]}>
                  <InfoRow
                    icon="target"
                    label="Mood goal"
                    value={GOAL_LABELS[onboardingAnswers.moodGoal] ?? onboardingAnswers.moodGoal}
                  />
                </View>
              )}
              {onboardingAnswers.reason && (
                <View style={[styles.prefDivider, { borderBottomColor: "rgba(255,255,255,0.06)" }]}>
                  <InfoRow
                    icon="compass"
                    label="What brings you here"
                    value={REASON_LABELS[onboardingAnswers.reason] ?? onboardingAnswers.reason}
                  />
                </View>
              )}
              {onboardingAnswers.struggle && (
                <View style={[styles.prefDivider, { borderBottomColor: "rgba(255,255,255,0.06)" }]}>
                  <InfoRow
                    icon="cloud"
                    label="Weighing on you"
                    value={STRUGGLE_LABELS[onboardingAnswers.struggle] ?? onboardingAnswers.struggle}
                  />
                </View>
              )}
              {onboardingAnswers.preferredState && (
                <InfoRow
                  icon="heart"
                  label="Ideal outcome"
                  value={STATE_LABELS[onboardingAnswers.preferredState] ?? onboardingAnswers.preferredState}
                />
              )}
            </PremiumCard>
          </Animated.View>
        )}

        {/* About section */}
        <Animated.View entering={FadeInUp.delay(280).duration(700)}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>About</Text>
          <PremiumCard style={styles.aboutCard}>
            {[
              { icon: "lock" as const, label: "Privacy Policy", sub: "How we protect your data" },
              { icon: "file-text" as const, label: "Terms of Service", sub: "Usage guidelines" },
              { icon: "info" as const, label: "Nervana", sub: "Version 1.0.0 · Early Access" },
            ].map((item, i, arr) => (
              <View
                key={item.label}
                style={[
                  styles.aboutRow,
                  i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
                ]}
              >
                <Feather name={item.icon} size={15} color={colors.mutedForeground} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.aboutLabel, { color: colors.foreground }]}>{item.label}</Text>
                  <Text style={[styles.aboutSub, { color: colors.mutedForeground }]}>{item.sub}</Text>
                </View>
                <Feather name="chevron-right" size={15} color="rgba(255,255,255,0.18)" />
              </View>
            ))}
          </PremiumCard>
        </Animated.View>

        {/* Sign out */}
        <Animated.View entering={FadeInUp.delay(360).duration(700)}>
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.signOutBtn,
              {
                backgroundColor: pressed ? "rgba(232,100,100,0.08)" : "rgba(232,100,100,0.05)",
                borderColor: "rgba(232,100,100,0.20)",
              },
            ]}
          >
            <Feather name="log-out" size={16} color="rgba(232,100,100,0.80)" />
            <Text style={[styles.signOutText, { color: "rgba(232,100,100,0.80)" }]}>Sign out</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 24 },
  eyebrow: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  userCard: { marginBottom: 18 },
  userCardInner: { flexDirection: "row", alignItems: "center", gap: 16 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    fontFamily: "DMSerifDisplay_400Regular",
    fontSize: 22,
    letterSpacing: 1,
  },
  userInfo: { flex: 1, gap: 8 },
  userName: { fontSize: 24, lineHeight: 28 },
  guestBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  guestText: { fontFamily: "DMSans_400Regular", fontSize: 11 },
  planBadge: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  planText: { fontFamily: "DMSans_500Medium", fontSize: 12 },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    width: "47%",
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    gap: 6,
    alignItems: "center",
  },
  statValue: { fontFamily: "DMSans_600SemiBold", fontSize: 22 },
  statLabel: { fontFamily: "DMSans_400Regular", fontSize: 11, textAlign: "center" },
  sectionLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    letterSpacing: 0.9,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  prefsCard: { marginBottom: 28, paddingVertical: 4 },
  prefDivider: { borderBottomWidth: 1 },
  aboutCard: { marginBottom: 24, paddingVertical: 0 },
  aboutRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 16,
  },
  aboutLabel: { fontFamily: "DMSans_500Medium", fontSize: 15 },
  aboutSub: { fontFamily: "DMSans_400Regular", fontSize: 12, marginTop: 2 },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 18,
    marginBottom: 16,
  },
  signOutText: { fontFamily: "DMSans_500Medium", fontSize: 16 },
});
