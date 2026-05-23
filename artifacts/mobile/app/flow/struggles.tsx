import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { AtmosphericBackground } from "@/components/AtmosphericBackground";
import { GlowText } from "@/components/GlowText";
import { CalmButton } from "@/components/CalmButton";
import { MoodChip } from "@/components/MoodChip";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [selected, setSelected] = useState<string[]>([]);

  const toggleStruggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <AtmosphericBackground>
      <View style={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 }]}>
        <View style={styles.header}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "75%", backgroundColor: colors.primary }]} />
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

        <View style={styles.footer}>
          {selected.length > 0 && (
            <CalmButton
              title="Continue"
              onPress={() => router.push("/flow/goals")}
            />
          )}
        </View>
      </View>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 40,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#252840",
    borderRadius: 2,
    marginBottom: 32,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
  },
  title: {
    fontSize: 32,
    lineHeight: 40,
  },
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  footer: {
    flex: 1,
    justifyContent: "flex-end",
  },
});
