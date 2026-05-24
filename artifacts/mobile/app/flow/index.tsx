import React, { useState } from "react";
import { StyleSheet, View, Text, Pressable, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { GlowText } from "@/components/GlowText";
import { CalmButton } from "@/components/CalmButton";
import { OnboardingLayout } from "@/components/OnboardingLayout";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_SIZE = Math.min((SCREEN_WIDTH - 48 - 16) / 2, 160);

const PROFESSIONS = [
  { id: "swe", label: "Software Engineer", icon: "code" as const },
  { id: "em", label: "Engineering Manager", icon: "users" as const },
  { id: "design", label: "Designer", icon: "pen-tool" as const },
  { id: "pm", label: "Product Manager", icon: "target" as const },
  { id: "founder", label: "Founder", icon: "briefcase" as const },
  { id: "other", label: "Other", icon: "more-horizontal" as const },
];

export default function ProfessionScreen() {
  const router = useRouter();
  const colors = useColors();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <OnboardingLayout
      onBack={() => router.back()}
      footer={
        selected ? (
          <CalmButton
            title="Continue"
            onPress={() => router.push("/flow/stress")}
          />
        ) : null
      }
    >
      <View style={styles.header}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: "25%", backgroundColor: colors.primary },
            ]}
          />
        </View>
        <GlowText style={styles.title}>
          What's your professional world like?
        </GlowText>
      </View>

      <View style={styles.grid}>
        {PROFESSIONS.map((prof) => {
          const isSelected = selected === prof.id;
          return (
            <Pressable
              key={prof.id}
              style={[
                styles.card,
                { height: CARD_SIZE },
                {
                  backgroundColor: isSelected
                    ? colors.primary + "20"
                    : colors.card,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setSelected(prof.id)}
            >
              <Feather
                name={prof.icon}
                size={22}
                color={isSelected ? colors.primary : colors.mutedForeground}
                style={styles.icon}
              />
              <Text
                style={[
                  styles.cardLabel,
                  {
                    color: isSelected
                      ? colors.primaryForeground
                      : colors.foreground,
                  },
                ]}
              >
                {prof.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 28,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#252840",
    borderRadius: 2,
    marginBottom: 28,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
  },
  title: {
    fontSize: 30,
    lineHeight: 38,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  card: {
    width: "48%",
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    marginBottom: 10,
  },
  cardLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
});
