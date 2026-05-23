import React, { useState } from "react";
import { StyleSheet, View, Text, Pressable, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { AtmosphericBackground } from "@/components/AtmosphericBackground";
import { PremiumCard } from "@/components/PremiumCard";
import { GlowText } from "@/components/GlowText";
import { MoodChip } from "@/components/MoodChip";
import { CalmButton } from "@/components/CalmButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAppContext } from "@/context/AppContext";
import Animated, { FadeInUp } from "react-native-reanimated";

const MOODS = [
  "overwhelmed",
  "mentally tired",
  "anxious",
  "distracted",
  "calm",
  "emotionally numb",
  "hopeful",
  "lonely",
];

const REFLECTIONS: Record<string, string> = {
  overwhelmed:
    "Overwhelm means something matters to you. That's not weakness — it's proof you care.",
  "mentally tired":
    "Mental tiredness is often invisible. You can't point to it like a bruise. But it's real.",
  anxious:
    "Anxiety is your mind trying to protect you. You don't have to fight it — just listen.",
  distracted:
    "A distracted mind is often an overloaded one. You're not broken — you're at capacity.",
  calm: "Hold onto this. Calm is a muscle. You've been building it without even realizing.",
  "emotionally numb":
    "Numbness is sometimes the nervous system's way of resting. It's allowed.",
  hopeful:
    "Something in you believes things can be better. That quiet hope is worth protecting.",
  lonely:
    "Loneliness in a connected world is its own kind of grief. You're not alone in that.",
};

const PROMPTS = [
  "What's been on your mind most today?",
  "Name one thing that felt heavy this week.",
  "What would feel like relief right now?",
  "Is there something you've been avoiding thinking about?",
];

export default function ReflectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { todayCheckin, setTodayCheckin } = useAppContext();

  const [selected, setSelected] = useState<string | null>(todayCheckin);
  const [saved, setSaved] = useState(!!todayCheckin);

  const topPad = Platform.OS === "web" ? 67 : insets.top + 24;
  const bottomPad = Platform.OS === "web" ? 60 : insets.bottom + 100;

  const handleSave = async () => {
    if (selected) {
      await setTodayCheckin(selected);
      setSaved(true);
    }
  };

  return (
    <AtmosphericBackground>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingTop: topPad,
          paddingBottom: bottomPad,
          paddingHorizontal: 22,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.delay(60).duration(500)}>
          <GlowText style={styles.title}>Daily Reflect</GlowText>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            A moment to check in with yourself.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(160).duration(500)}>
          <PremiumCard style={styles.card}>
            <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>
              How are you feeling right now?
            </Text>
            <View style={styles.chipWrap}>
              {MOODS.map((mood) => (
                <MoodChip
                  key={mood}
                  label={mood}
                  selected={selected === mood}
                  onPress={() => {
                    setSelected(mood);
                    setSaved(false);
                  }}
                />
              ))}
            </View>
          </PremiumCard>
        </Animated.View>

        {selected && !saved && (
          <Animated.View entering={FadeInUp.delay(0).duration(400)}>
            <PremiumCard
              style={[styles.responseCard, { borderColor: colors.primary + "25" }]}
            >
              <Text style={[styles.responseText, { color: colors.foreground }]}>
                {REFLECTIONS[selected] ??
                  "Whatever you're carrying today — you don't have to carry it alone."}
              </Text>
            </PremiumCard>
            <CalmButton title="Save today's check-in" onPress={handleSave} />
          </Animated.View>
        )}

        {saved && selected && (
          <Animated.View entering={FadeInUp.delay(0).duration(400)}>
            <PremiumCard
              style={[styles.responseCard, { borderColor: colors.primary + "25" }]}
            >
              <Text style={[styles.savedLabel, { color: colors.primary }]}>
                Saved
              </Text>
              <Text style={[styles.responseText, { color: colors.foreground }]}>
                {REFLECTIONS[selected] ??
                  "Whatever you're carrying today — you don't have to carry it alone."}
              </Text>
            </PremiumCard>
          </Animated.View>
        )}

        <Animated.View entering={FadeInUp.delay(260).duration(500)}>
          <Text style={[styles.sectionHeader, { color: colors.foreground }]}>
            Reflection prompts
          </Text>
          {PROMPTS.map((prompt, i) => (
            <Pressable
              key={i}
              onPress={() => router.push("/checkin")}
            >
              <PremiumCard style={styles.promptCard}>
                <Text style={[styles.promptText, { color: colors.secondaryForeground }]}>
                  {prompt}
                </Text>
              </PremiumCard>
            </Pressable>
          ))}
        </Animated.View>
      </ScrollView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  title: { fontSize: 32, marginBottom: 6 },
  subtitle: { fontFamily: "DMSans_400Regular", fontSize: 16, marginBottom: 32 },
  card: { marginBottom: 20 },
  cardLabel: { fontFamily: "DMSans_400Regular", fontSize: 15, marginBottom: 16 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  responseCard: { marginBottom: 20 },
  responseText: {
    fontFamily: "DMSerifDisplay_400Regular",
    fontSize: 19,
    lineHeight: 28,
  },
  savedLabel: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  sectionHeader: {
    fontFamily: "DMSans_500Medium",
    fontSize: 16,
    marginBottom: 14,
    marginTop: 8,
  },
  promptCard: { marginBottom: 10, paddingVertical: 18 },
  promptText: { fontFamily: "DMSans_400Regular", fontSize: 15, lineHeight: 22 },
});
