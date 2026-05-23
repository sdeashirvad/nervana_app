import React from "react";
import { StyleSheet, View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { AtmosphericBackground } from "@/components/AtmosphericBackground";
import { PremiumCard } from "@/components/PremiumCard";
import { GlowText } from "@/components/GlowText";
import { CalmButton } from "@/components/CalmButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";
import { mockReferrals } from "@/data/mock";

export default function ReferralScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();

  return (
    <AtmosphericBackground>
      <ScrollView 
        contentContainerStyle={{ 
          paddingTop: insets.top + 20, 
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 24 
        }}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="x" size={24} color={colors.foreground} />
        </Pressable>

        <GlowText style={styles.title}>Help someone discover calm.</GlowText>
        <Text style={styles.subtitle}>
          When a friend joins Nervana through your link, you both receive 200 Calm Coins.
        </Text>

        <PremiumCard style={styles.codeCard}>
          <View style={styles.codeRow}>
            <Text style={styles.codeText}>ALEX-CALM</Text>
            <Feather name="copy" size={20} color={colors.primary} />
          </View>
        </PremiumCard>

        <CalmButton title="Share your link" onPress={() => {}} style={styles.shareBtn} />

        <Text style={styles.sectionTitle}>Your impact</Text>
        <View style={styles.list}>
          {mockReferrals.map((ref, i) => (
            <View key={i} style={[styles.refRow, { borderBottomColor: colors.border }]}>
              <View>
                <Text style={styles.refName}>{ref.name}</Text>
                <Text style={styles.refStatus}>
                  {ref.joined ? "Joined" : "Invited"}
                </Text>
              </View>
              {ref.joined && (
                <Text style={[styles.refCoins, { color: colors.primary }]}>
                  +{ref.calmCoinsEarned}
                </Text>
              )}
            </View>
          ))}
        </View>

      </ScrollView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    alignSelf: "flex-start",
    marginBottom: 24,
    padding: 8,
    marginLeft: -8,
  },
  title: {
    fontSize: 34,
    lineHeight: 42,
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 16,
    color: "#8A8882",
    lineHeight: 24,
    marginBottom: 40,
  },
  codeCard: {
    marginBottom: 24,
  },
  codeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  codeText: {
    fontFamily: "DMSerifDisplay_400Regular",
    fontSize: 28,
    color: "#F5F3EE",
    letterSpacing: 2,
  },
  shareBtn: {
    marginBottom: 48,
  },
  sectionTitle: {
    fontFamily: "DMSans_500Medium",
    fontSize: 18,
    color: "#F5F3EE",
    marginBottom: 16,
  },
  list: {
    backgroundColor: "#13152A",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#252840",
  },
  refRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
  },
  refName: {
    fontFamily: "DMSans_500Medium",
    fontSize: 16,
    color: "#F5F3EE",
    marginBottom: 4,
  },
  refStatus: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: "#8A8882",
  },
  refCoins: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 16,
  },
});
