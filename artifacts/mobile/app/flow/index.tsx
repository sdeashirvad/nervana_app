import React, { useState } from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { AtmosphericBackground } from "@/components/AtmosphericBackground";
import { GlowText } from "@/components/GlowText";
import { CalmButton } from "@/components/CalmButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";

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
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <AtmosphericBackground>
      <View style={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 }]}>
        <View style={styles.header}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "25%", backgroundColor: colors.primary }]} />
          </View>
          <GlowText style={styles.title}>What's your professional world like?</GlowText>
        </View>

        <View style={styles.grid}>
          {PROFESSIONS.map((prof) => {
            const isSelected = selected === prof.id;
            return (
              <Pressable
                key={prof.id}
                style={[
                  styles.card,
                  {
                    backgroundColor: isSelected ? colors.primary + "20" : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelected(prof.id)}
              >
                <Feather
                  name={prof.icon}
                  size={24}
                  color={isSelected ? colors.primary : colors.mutedForeground}
                  style={styles.icon}
                />
                <Text
                  style={[
                    styles.cardLabel,
                    { color: isSelected ? colors.primaryForeground : colors.foreground },
                  ]}
                >
                  {prof.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.footer}>
          {selected && (
            <CalmButton
              title="Continue"
              onPress={() => router.push("/flow/stress")}
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    marginBottom: 12,
  },
  cardLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    textAlign: "center",
  },
  footer: {
    flex: 1,
    justifyContent: "flex-end",
  },
});
