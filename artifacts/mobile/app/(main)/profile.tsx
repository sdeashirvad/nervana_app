import React from "react";
import { StyleSheet, View, Text, ScrollView, Pressable } from "react-native";
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

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();

  return (
    <AtmosphericBackground>
      <ScrollView 
        contentContainerStyle={{ 
          paddingTop: insets.top + 32, 
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: 20
        }}
      >
        <View style={styles.profileHeader}>
          <LinearGradient
            colors={["#7B7FF0", "#5B5FD0"]}
            style={styles.avatar}
          >
            <GlowText style={styles.avatarText}>AL</GlowText>
          </LinearGradient>
          <GlowText style={styles.name}>{mockUser.name}</GlowText>
          <Text style={styles.profession}>{mockUser.profession}</Text>
        </View>

        <PremiumCard style={styles.coinsCard}>
          <View style={styles.coinsHeader}>
            <Feather name="star" size={24} color={colors.primary} />
            <Text style={styles.coinsAmount}>1,240 Calm Coins</Text>
          </View>
          <Text style={styles.coinsSubtitle}>Earned through reflection</Text>
          <CalmButton 
            title="Invite & Earn" 
            onPress={() => router.push("/referral")} 
            style={styles.inviteBtn}
          />
        </PremiumCard>

        <Text style={styles.sectionTitle}>My journey</Text>
        <PremiumCard style={styles.sectionCard}>
          <View style={styles.row}>
            <Text style={styles.rowText}>7 days of showing up</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowText}>Member since November 2025</Text>
          </View>
        </PremiumCard>

        <Text style={styles.sectionTitle}>Preferences</Text>
        <PremiumCard style={styles.sectionCard}>
          <Pressable style={styles.row}>
            <Text style={styles.rowText}>Daily reminder time</Text>
            <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.row}>
            <Text style={styles.rowText}>Emotional check-in frequency</Text>
            <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.row}>
            <Text style={styles.rowText}>Companion response style</Text>
            <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
          </Pressable>
        </PremiumCard>

        <Text style={styles.sectionTitle}>About Nervana</Text>
        <PremiumCard style={styles.sectionCard}>
          <Pressable style={styles.row}>
            <Text style={styles.rowText}>Version 1.0.0</Text>
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.row}>
            <Text style={styles.rowText}>Privacy Policy</Text>
            <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
          </Pressable>
        </PremiumCard>

      </ScrollView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    color: "#F5F3EE",
  },
  name: {
    fontSize: 28,
    marginBottom: 4,
  },
  profession: {
    fontFamily: "DMSans_400Regular",
    fontSize: 16,
    color: "#8A8882",
  },
  coinsCard: {
    marginBottom: 32,
  },
  coinsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  coinsAmount: {
    fontFamily: "DMSerifDisplay_400Regular",
    fontSize: 24,
    color: "#F5F3EE",
  },
  coinsSubtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: "#8A8882",
    marginBottom: 20,
  },
  inviteBtn: {
    marginTop: 8,
  },
  sectionTitle: {
    fontFamily: "DMSans_500Medium",
    fontSize: 16,
    color: "#8A8882",
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionCard: {
    padding: 0,
    marginBottom: 32,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  rowText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 16,
    color: "#F5F3EE",
  },
  divider: {
    height: 1,
    backgroundColor: "#252840",
    marginLeft: 20,
  },
});
