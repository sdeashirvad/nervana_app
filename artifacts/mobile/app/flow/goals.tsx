import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { AtmosphericBackground } from "@/components/AtmosphericBackground";
import { GlowText } from "@/components/GlowText";
import { CalmButton } from "@/components/CalmButton";
import { MoodChip } from "@/components/MoodChip";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAppContext } from "@/context/AppContext";

const GOALS = [
  "Emotional clarity",
  "Better sleep",
  "Process work stress",
  "Feel less alone",
  "Reduce overthinking",
  "Daily grounding",
];

export default function GoalsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { setOnboardingComplete } = useAppContext();
  const [selected, setSelected] = useState<string[]>([]);

  const toggleGoal = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleFinish = async () => {
    await setOnboardingComplete(true);
    router.replace("/(main)/home");
  };

  return (
    <AtmosphericBackground>
      <View style={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 }]}>
        <View style={styles.header}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "100%", backgroundColor: colors.primary }]} />
          </View>
          <GlowText style={styles.title}>What do you want from Nervana?</GlowText>
        </View>

        <View style={styles.wrap}>
          {GOALS.map((goal) => (
            <MoodChip
              key={goal}
              label={goal}
              selected={selected.includes(goal)}
              onPress={() => toggleGoal(goal)}
            />
          ))}
        </View>

        <View style={styles.footer}>
          {selected.length > 0 && (
            <CalmButton
              title="Enter Nervana"
              onPress={handleFinish}
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
