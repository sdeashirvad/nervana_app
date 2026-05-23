import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { AtmosphericBackground } from "@/components/AtmosphericBackground";
import { PremiumCard } from "@/components/PremiumCard";
import { GlowText } from "@/components/GlowText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";
import { mockUser } from "@/data/mock";
import { LinearGradient } from "expo-linear-gradient";
import { CalmButton } from "@/components/CalmButton";
import Animated, { FadeInUp } from "react-native-reanimated";

const STATS = [
  { label: "Days", value: "12", sub: "streak" },
  { label: "Entries", value: "6", sub: "journal" },
  { label: "Coins", value: "1,240", sub: "calm" },
];

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const topPad = Platform.OS === "web" ? 64 : insets.top + 32;

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
        {/* Avatar & Name */}
        <Animated.View entering={FadeInUp.delay(40).duration(600)} style={styles.profileHeader}>
          <LinearGradient
            colors={["#7B7FF0", "#5058C8"]}
            style={styles.avatar}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <GlowText style={styles.avatarText}>AL</GlowText>
          </LinearGradient>
          <GlowText style={styles.name}>{mockUser.name}</GlowText>
          <Text style={[styles.profession, { color: colors.mutedForeground }]}>
            {mockUser.profession}
          </Text>
          <Text style={[styles.memberSince, { color: colors.mutedForeground + "80" }]}>
            Member since November 2025
          </Text>
        </Animated.View>

        {/* Stats row */}
        <Animated.View entering={FadeInUp.delay(120).duration(600)} style={styles.statsRow}>
          {STATS.map(({ label, value, sub }) => (
            <View
              key={label}
              style={[styles.statCell, { borderColor: colors.border }]}
            >
              <Text style={[styles.statValue, { color: colors.foreground }]}>
                {value}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                {sub} {label.toLowerCase()}
              </Text>
            </View>
          ))}
        </Animated.View>

        {/* Calm Coins */}
        <Animated.View entering={FadeInUp.delay(200).duration(600)}>
          <PremiumCard style={styles.coinsCard} glow>
            <View style={styles.coinsHeader}>
              <View style={[styles.coinIcon, { backgroundColor: colors.primary + "18" }]}>
                <Feather name="star" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.coinsAmount, { color: colors.foreground }]}>
                  1,240 Calm Coins
                </Text>
                <Text style={[styles.coinsSubtitle, { color: colors.mutedForeground }]}>
                  Earned through reflection
                </Text>
              </View>
            </View>
            <CalmButton
              title="Invite a friend, earn 200 coins"
              onPress={() => router.push("/referral")}
              style={styles.inviteBtn}
            />
          </PremiumCard>
        </Animated.View>

        {/* My journey */}
        <Animated.View entering={FadeInUp.delay(280).duration(600)}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
            My journey
          </Text>
          <PremiumCard style={styles.sectionCard}>
            {[
              { icon: "calendar", text: "12 days of showing up" },
              { icon: "book-open", text: "6 journal entries written" },
              { icon: "message-circle", text: "14 conversations with Companion" },
            ].map(({ icon, text }, i) => (
              <React.Fragment key={text}>
                {i > 0 && (
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                )}
                <View style={styles.row}>
                  <Feather name={icon as any} size={16} color={colors.primary + "80"} style={styles.rowIcon} />
                  <Text style={[styles.rowText, { color: colors.foreground }]}>{text}</Text>
                </View>
              </React.Fragment>
            ))}
          </PremiumCard>
        </Animated.View>

        {/* Preferences */}
        <Animated.View entering={FadeInUp.delay(360).duration(600)}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
            Preferences
          </Text>
          <PremiumCard style={styles.sectionCard}>
            {[
              { label: "Daily reminder time", value: "9:00 AM" },
              { label: "Check-in frequency", value: "Daily" },
              { label: "Companion response style", value: "Reflective" },
            ].map(({ label, value }, i) => (
              <React.Fragment key={label}>
                {i > 0 && (
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                )}
                <Pressable style={styles.row}>
                  <Text style={[styles.rowText, { color: colors.foreground }]}>{label}</Text>
                  <View style={styles.rowRight}>
                    <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>
                      {value}
                    </Text>
                    <Feather name="chevron-right" size={16} color={colors.mutedForeground + "60"} />
                  </View>
                </Pressable>
              </React.Fragment>
            ))}
          </PremiumCard>
        </Animated.View>

        {/* About */}
        <Animated.View entering={FadeInUp.delay(440).duration(600)}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
            About Nervana
          </Text>
          <PremiumCard style={styles.sectionCard}>
            {[
              { label: "Version", value: "1.0.0", chevron: false },
              { label: "Privacy Policy", value: "", chevron: true },
              { label: "Terms of Service", value: "", chevron: true },
            ].map(({ label, value, chevron }, i) => (
              <React.Fragment key={label}>
                {i > 0 && (
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                )}
                <Pressable style={styles.row}>
                  <Text style={[styles.rowText, { color: colors.foreground }]}>{label}</Text>
                  <View style={styles.rowRight}>
                    {value ? (
                      <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>
                        {value}
                      </Text>
                    ) : null}
                    {chevron && (
                      <Feather name="chevron-right" size={16} color={colors.mutedForeground + "60"} />
                    )}
                  </View>
                </Pressable>
              </React.Fragment>
            ))}
          </PremiumCard>
        </Animated.View>

        <Text style={[styles.tagline, { color: colors.mutedForeground + "50" }]}>
          your mental exhale
        </Text>
      </ScrollView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: "center",
    marginBottom: 28,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  avatarText: { fontSize: 28, color: "#F5F3EE" },
  name: { fontSize: 26, marginBottom: 4 },
  profession: { fontFamily: "DMSans_400Regular", fontSize: 15, marginBottom: 4 },
  memberSince: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    letterSpacing: 0.2,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCell: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
    backgroundColor: "rgba(19, 21, 42, 0.8)",
  },
  statValue: {
    fontFamily: "DMSerifDisplay_400Regular",
    fontSize: 22,
    marginBottom: 3,
  },
  statLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    textAlign: "center",
    letterSpacing: 0.1,
  },
  coinsCard: { marginBottom: 28 },
  coinsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 18,
  },
  coinIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  coinsAmount: {
    fontFamily: "DMSerifDisplay_400Regular",
    fontSize: 20,
    marginBottom: 2,
  },
  coinsSubtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
  },
  inviteBtn: {},
  sectionTitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 2,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  sectionCard: {
    padding: 0,
    marginBottom: 28,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  rowIcon: { marginRight: 12 },
  rowText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 15,
    flex: 1,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rowValue: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
  },
  divider: { height: 1, marginLeft: 20 },
  tagline: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    textAlign: "center",
    letterSpacing: 2,
    marginTop: 8,
    marginBottom: 8,
  },
});
