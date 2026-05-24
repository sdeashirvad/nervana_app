import React from "react";
import { StyleSheet, View, Text, ScrollView, Pressable, Platform, Alert } from "react-native";
import { useRouter } from "expo-router";
import { AtmosphericBackground } from "@/components/AtmosphericBackground";
import { PremiumCard } from "@/components/PremiumCard";
import { GlowText } from "@/components/GlowText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { CalmButton } from "@/components/CalmButton";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useAppContext } from "@/context/AppContext";

const STATS = [
  { label: "day streak", value: "12" },
  { label: "journal entries", value: "6" },
  { label: "calm coins", value: "1,240" },
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { currentUser, logout } = useAppContext();
  const topPad = Platform.OS === "web" ? 64 : insets.top + 32;

  const displayName = currentUser.name || "Guest";
  const initials = getInitials(displayName);

  const handleLogout = () => {
    Alert.alert(
      "Sign out",
      "You'll be taken back to the welcome screen. Your local reflections will remain on this device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign out",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/");
          },
        },
      ]
    );
  };

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
        {/* Avatar */}
        <Animated.View entering={FadeInUp.delay(40).duration(700)} style={styles.profileHeader}>
          <LinearGradient
            colors={["#A09CF2", "#6C68D8", "#5050C0"]}
            style={styles.avatar}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <GlowText style={styles.avatarText}>{initials}</GlowText>
          </LinearGradient>
          <GlowText style={styles.name}>{displayName}</GlowText>
          <Text style={[styles.profession, { color: colors.secondaryForeground }]}>
            {currentUser.profession || "Guest"}
          </Text>
          <Text style={[styles.memberSince, { color: colors.mutedForeground }]}>
            Member since November 2025
          </Text>
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={FadeInUp.delay(120).duration(700)} style={styles.statsRow}>
          {STATS.map(({ label, value }) => (
            <View
              key={label}
              style={[
                styles.statCell,
                {
                  borderColor: "rgba(255,255,255,0.07)",
                  backgroundColor: "rgba(255,255,255,0.03)",
                },
              ]}
            >
              <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Calm Coins */}
        <Animated.View entering={FadeInUp.delay(200).duration(700)}>
          <PremiumCard style={styles.coinsCard} glow>
            <View style={styles.coinsRow}>
              <View style={[styles.coinIcon, { backgroundColor: "rgba(148,145,240,0.12)" }]}>
                <Feather name="star" size={17} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.coinsAmt, { color: colors.foreground }]}>
                  1,240 Calm Coins
                </Text>
                <Text style={[styles.coinsSub, { color: colors.mutedForeground }]}>
                  Earned through reflection
                </Text>
              </View>
            </View>
            <CalmButton
              title="Invite a friend — earn 200 coins"
              onPress={() => router.push("/referral")}
            />
          </PremiumCard>
        </Animated.View>

        {/* Journey */}
        <Animated.View entering={FadeInUp.delay(280).duration(700)}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>My journey</Text>
          <PremiumCard style={styles.sectionCard}>
            {[
              { icon: "calendar", text: "12 days of showing up" },
              { icon: "book-open", text: "6 journal entries written" },
              { icon: "message-circle", text: "14 conversations with Companion" },
            ].map(({ icon, text }, i) => (
              <React.Fragment key={text}>
                {i > 0 && <View style={[styles.divider, { backgroundColor: "rgba(255,255,255,0.06)" }]} />}
                <View style={styles.row}>
                  <Feather name={icon as any} size={15} color={"rgba(148,145,240,0.60)"} style={styles.rowIcon} />
                  <Text style={[styles.rowText, { color: colors.foreground }]}>{text}</Text>
                </View>
              </React.Fragment>
            ))}
          </PremiumCard>
        </Animated.View>

        {/* Preferences */}
        <Animated.View entering={FadeInUp.delay(360).duration(700)}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Preferences</Text>
          <PremiumCard style={styles.sectionCard}>
            {[
              { label: "Daily reminder time", value: "9:00 AM" },
              { label: "Check-in frequency", value: "Daily" },
              { label: "Companion response style", value: "Reflective" },
            ].map(({ label, value }, i) => (
              <React.Fragment key={label}>
                {i > 0 && <View style={[styles.divider, { backgroundColor: "rgba(255,255,255,0.06)" }]} />}
                <Pressable style={styles.row}>
                  <Text style={[styles.rowText, { color: colors.foreground }]}>{label}</Text>
                  <View style={styles.rowRight}>
                    <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>{value}</Text>
                    <Feather name="chevron-right" size={15} color={"rgba(255,255,255,0.18)"} />
                  </View>
                </Pressable>
              </React.Fragment>
            ))}
          </PremiumCard>
        </Animated.View>

        {/* About */}
        <Animated.View entering={FadeInUp.delay(440).duration(700)}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>About</Text>
          <PremiumCard style={styles.sectionCard}>
            {[
              { label: "Version", value: "1.0.0", chevron: false },
              { label: "Privacy Policy", value: "", chevron: true },
              { label: "Terms of Service", value: "", chevron: true },
            ].map(({ label, value, chevron }, i) => (
              <React.Fragment key={label}>
                {i > 0 && <View style={[styles.divider, { backgroundColor: "rgba(255,255,255,0.06)" }]} />}
                <Pressable style={styles.row}>
                  <Text style={[styles.rowText, { color: colors.foreground }]}>{label}</Text>
                  <View style={styles.rowRight}>
                    {!!value && <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>{value}</Text>}
                    {chevron && <Feather name="chevron-right" size={15} color={"rgba(255,255,255,0.18)"} />}
                  </View>
                </Pressable>
              </React.Fragment>
            ))}
          </PremiumCard>
        </Animated.View>

        {/* Sign out */}
        <Animated.View entering={FadeInUp.delay(520).duration(700)} style={styles.logoutWrapper}>
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.logoutBtn,
              {
                borderColor: pressed
                  ? "rgba(255,80,80,0.30)"
                  : "rgba(255,255,255,0.08)",
                backgroundColor: pressed
                  ? "rgba(255,80,80,0.06)"
                  : "transparent",
              },
            ]}
          >
            <Feather name="log-out" size={15} color="rgba(255,100,100,0.70)" />
            <Text style={styles.logoutText}>Sign out</Text>
          </Pressable>
        </Animated.View>

        <Text style={[styles.tagline, { color: "rgba(255,255,255,0.12)" }]}>
          your mental exhale
        </Text>
      </ScrollView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  profileHeader: { alignItems: "center", marginBottom: 26 },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  avatarText: { fontSize: 26, color: "#F0EDE8" },
  name: { fontSize: 26, marginBottom: 4 },
  profession: { fontFamily: "DMSans_400Regular", fontSize: 15, marginBottom: 4 },
  memberSince: { fontFamily: "DMSans_400Regular", fontSize: 12, letterSpacing: 0.2 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 22 },
  statCell: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  statValue: { fontFamily: "DMSerifDisplay_400Regular", fontSize: 20, marginBottom: 3 },
  statLabel: { fontFamily: "DMSans_400Regular", fontSize: 11, textAlign: "center" },
  coinsCard: { marginBottom: 26 },
  coinsRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 18 },
  coinIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  coinsAmt: { fontFamily: "DMSerifDisplay_400Regular", fontSize: 19, marginBottom: 2 },
  coinsSub: { fontFamily: "DMSans_400Regular", fontSize: 13 },
  sectionLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    marginBottom: 10,
    marginLeft: 2,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  sectionCard: { padding: 0, marginBottom: 26, overflow: "hidden" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 17,
  },
  rowIcon: { marginRight: 12 },
  rowText: { fontFamily: "DMSans_400Regular", fontSize: 15, flex: 1 },
  rowRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  rowValue: { fontFamily: "DMSans_400Regular", fontSize: 14 },
  divider: { height: 1, marginLeft: 20 },
  logoutWrapper: { marginBottom: 28 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  logoutText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 15,
    color: "rgba(255,100,100,0.70)",
    letterSpacing: 0.2,
  },
  tagline: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    textAlign: "center",
    letterSpacing: 2.5,
    marginTop: 8,
    marginBottom: 8,
  },
});
