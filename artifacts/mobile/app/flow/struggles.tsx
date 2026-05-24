import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { GlowText } from "@/components/GlowText";
import { CalmButton } from "@/components/CalmButton";
import { MoodChip } from "@/components/MoodChip";
import { OnboardingLayout } from "@/components/OnboardingLayout";
import { useColors } from "@/hooks/useColors";

const STRUGGLES = [
  "burnout",
  "overthinking",
  "work anxiety",
  "loneliness",
  "mental exhaustion",
  "sleep issues",
  "emotionally numb",
  "imposter syndrome",
  "constant distraction",
  "isolation",
];

export default function StrugglesScreen() {
  const router = useRouter();
  const colors = useColors();
  const [selected, setSelected] = useState<string[]>([]);

  const toggleStruggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <OnboardingLayout
      footer={
        selected.length > 0 ? (
          <CalmButton
            title="Continue"
            onPress={() => router.push("/flow/goals")}
          />
        ) : null
      }
    >
      <View style={styles.header}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: "75%", backgroundColor: colors.primary },
            ]}
          />
        </View>
        <GlowText style={styles.title}>What's weighing on you most?</GlowText>
      </View>

      <View style={styles.wrap}>
        {STRUGGLES.map((struggle) => (
          <MoodChip
            key={struggle}
            label={struggle}
            selected={selected.includes(struggle)}
            onPress={() => toggleStruggle(struggle)}
          />
        ))}
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
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
});
