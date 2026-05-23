import React from "react";
import { StyleSheet, View, Text, ScrollView } from "react-native";
import { AtmosphericBackground } from "@/components/AtmosphericBackground";
import { PremiumCard } from "@/components/PremiumCard";
import { GlowText } from "@/components/GlowText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { weeklyMoodData } from "@/data/mock";

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();

  return (
    <AtmosphericBackground>
      <ScrollView 
        contentContainerStyle={{ 
          paddingTop: insets.top + 20, 
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: 20
        }}
      >
        <View style={styles.header}>
          <GlowText style={styles.title}>Your emotional landscape</GlowText>
          <Text style={styles.subtitle}>gentle reflection, not performance tracking</Text>
        </View>

        <Text style={styles.sectionTitle}>This week</Text>
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
                <Text style={styles.moodLabel} numberOfLines={1}>{d.label}</Text>
              </View>
            ))}
          </View>
        </PremiumCard>

        <Text style={styles.sectionTitle}>Patterns</Text>
        <PremiumCard style={styles.patternCard}>
          <Text style={styles.patternText}>You tend to feel calmer on weekends.</Text>
        </PremiumCard>
        <PremiumCard style={styles.patternCard}>
          <Text style={styles.patternText}>Late meeting days often affect your Thursday evenings.</Text>
        </PremiumCard>
        <PremiumCard style={styles.patternCard}>
          <Text style={styles.patternText}>You've been more hopeful this week than last.</Text>
        </PremiumCard>

        <Text style={styles.sectionTitle}>Reflection consistency</Text>
        <PremiumCard>
          <View style={styles.grid}>
            {Array.from({ length: 14 }).map((_, i) => (
              <View 
                key={i} 
                style={[
                  styles.dot, 
                  { 
                    backgroundColor: i % 3 !== 0 ? colors.primary : "transparent",
                    borderColor: colors.primary,
                    borderWidth: 1
                  }
                ]} 
              />
            ))}
          </View>
        </PremiumCard>
      </ScrollView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    lineHeight: 40,
  },
  subtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 16,
    color: "#8A8882",
    marginTop: 8,
  },
  sectionTitle: {
    fontFamily: "DMSerifDisplay_400Regular",
    fontSize: 22,
    color: "#F5F3EE",
    marginBottom: 16,
    marginTop: 16,
  },
  chartCard: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  chart: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 180,
    alignItems: "flex-end",
  },
  barCol: {
    alignItems: "center",
    width: "12%",
  },
  barContainer: {
    height: 130,
    width: 12,
    backgroundColor: "#1E2038",
    borderRadius: 6,
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  bar: {
    width: "100%",
    borderRadius: 6,
  },
  barLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    color: "#F5F3EE",
    marginBottom: 4,
  },
  moodLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 9,
    color: "#8A8882",
    textAlign: "center",
  },
  patternCard: {
    marginBottom: 12,
    padding: 20,
  },
  patternText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 15,
    color: "#F5F3EE",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
});
