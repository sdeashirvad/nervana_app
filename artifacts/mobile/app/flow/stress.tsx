import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { AtmosphericBackground } from "@/components/AtmosphericBackground";
import { GlowText } from "@/components/GlowText";
import { CalmButton } from "@/components/CalmButton";
import { MoodChip } from "@/components/MoodChip";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const STRESS_LEVELS = [
  { id: "1", label: "A little — light weight" },
  { id: "2", label: "Moderate — steady pressure" },
  { id: "3", label: "High — running on empty" },
  { id: "4", label: "Very high — barely holding" },
  { id: "5", label: "Critical — I need this now" },
];

export default function StressScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <AtmosphericBackground>
      <View style={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 }]}>
        <View style={styles.header}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "50%", backgroundColor: colors.primary }]} />
          </View>
          <GlowText style={styles.title}>How much pressure are you carrying right now?</GlowText>
        </View>

        <View style={styles.list}>
          {STRESS_LEVELS.map((level) => (
            <MoodChip
              key={level.id}
              label={level.label}
              selected={selected === level.id}
              onPress={() => setSelected(level.id)}
              style={styles.chip}
            />
          ))}
        </View>

        <View style={styles.footer}>
          {selected && (
            <CalmButton
              title="Continue"
              onPress={() => router.push("/flow/struggles")}
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
  list: {
    gap: 12,
    alignItems: "flex-start",
  },
  chip: {
    alignSelf: "stretch",
  },
  footer: {
    flex: 1,
    justifyContent: "flex-end",
  },
});
