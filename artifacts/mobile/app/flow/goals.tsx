import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { GlowText } from "@/components/GlowText";
import { CalmButton } from "@/components/CalmButton";
import { MoodChip } from "@/components/MoodChip";
import { OnboardingLayout } from "@/components/OnboardingLayout";
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
    <OnboardingLayout
      onBack={() => router.back()}
      footer={
        selected.length > 0 ? (
          <CalmButton title="Enter Nervana" onPress={handleFinish} />
        ) : null
      }
    >
      <View style={styles.header}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: "100%", backgroundColor: colors.primary },
            ]}
          />
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
