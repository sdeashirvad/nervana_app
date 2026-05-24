import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { AtmosphericBackground } from "@/components/AtmosphericBackground";
import { PremiumCard } from "@/components/PremiumCard";
import { GlowText } from "@/components/GlowText";
import { MoodChip } from "@/components/MoodChip";
import { CalmButton } from "@/components/CalmButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAppContext } from "@/context/AppContext";
import Animated, { FadeInUp, FadeIn } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

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
  overwhelmed: "Overwhelm means something matters to you. That's not weakness — it's proof you care deeply.",
  "mentally tired": "Mental exhaustion is often invisible. You can't point to it like a bruise. But it's real, and it counts.",
  anxious: "Anxiety is your mind trying to protect you. You don't have to fight it — just notice it with gentleness.",
  distracted: "A distracted mind is often an overloaded one. You're not broken — you're at capacity.",
  calm: "Hold onto this. Calm is something you've been building without even realizing it.",
  "emotionally numb": "Numbness is sometimes the nervous system's way of resting. It's allowed. You don't have to feel more than you do.",
  hopeful: "Something in you believes things can be better. That quiet belief is worth protecting.",
  lonely: "Loneliness in a connected world is its own kind of grief. You're not alone in feeling alone.",
};

const PROMPTS = [
  { text: "What's been on your mind most today?", icon: "cloud" },
  { text: "Name one thing that felt heavy this week.", icon: "anchor" },
  { text: "What would feel like relief right now?", icon: "wind" },
  { text: "Is there something you've been avoiding thinking about?", icon: "eye-off" },
  { text: "What do you need that you haven't asked for?", icon: "heart" },
];

export default function ReflectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { todayCheckin, setTodayCheckin } = useAppContext();

  const [selected, setSelected] = useState<string | null>(todayCheckin);
  const [saved, setSaved] = useState(!!todayCheckin);

  const topPad = Platform.OS === "web" ? 64 : insets.top + 24;
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
          paddingHorizontal: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.delay(40).duration(700)}>
          <GlowText style={styles.title}>Daily Reflect</GlowText>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            A moment to check in — no performance required.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(140).duration(700)}>
          <PremiumCard style={styles.moodCard}>
            <Text style={[styles.moodCardLabel, { color: colors.mutedForeground }]}>
              How are you feeling right now?
            </Text>
            <View style={styles.chipWrap}>
              {MOODS.map((mood) => (
                <MoodChip
                  key={mood}
                  label={mood}
                  selected={selected === mood}
                  onPress={() => { setSelected(mood); setSaved(false); }}
                />
              ))}
            </View>
          </PremiumCard>
        </Animated.View>

        {selected && !saved && (
          <Animated.View entering={FadeIn.duration(500)}>
            <PremiumCard style={styles.responseCard} glow>
              <View style={[styles.responseAccent, { backgroundColor: colors.primary }]} />
              <Text style={[styles.responseText, { color: colors.foreground }]}>
                {REFLECTIONS[selected] ?? "Whatever you're carrying today — you don't have to carry it alone."}
              </Text>
            </PremiumCard>
            <CalmButton title="Save today's check-in" onPress={handleSave} />
          </Animated.View>
        )}

        {saved && selected && (
          <Animated.View entering={FadeIn.duration(500)}>
            <PremiumCard style={styles.responseCard} glow>
              <View style={[styles.responseAccent, { backgroundColor: colors.primary }]} />
              <Text style={[styles.savedLabel, { color: colors.primary }]}>✓ Saved</Text>
              <Text style={[styles.responseText, { color: colors.foreground }]}>
                {REFLECTIONS[selected] ?? "Whatever you're carrying today — you don't have to carry it alone."}
              </Text>
            </PremiumCard>
          </Animated.View>
        )}

        <Animated.View entering={FadeInUp.delay(240).duration(700)}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            Reflection prompts
          </Text>
          {PROMPTS.map((prompt, i) => (
            <Animated.View key={i} entering={FadeInUp.delay(240 + i * 55).duration(550)}>
              <Pressable onPress={() => router.push("/checkin")} hitSlop={4}>
                {({ pressed }) => (
                  <PremiumCard style={[styles.promptCard, pressed && { opacity: 0.72 }]}>
                    <View style={styles.promptRow}>
                      <Feather
                        name={prompt.icon as any}
                        size={14}
                        color={"rgba(148,145,240,0.55)"}
                        style={styles.promptIcon}
                      />
                      <Text style={[styles.promptText, { color: colors.secondaryForeground }]}>
                        {prompt.text}
                      </Text>
                      <Feather name="chevron-right" size={14} color={"rgba(255,255,255,0.18)"} />
                    </View>
                  </PremiumCard>
                )}
              </Pressable>
            </Animated.View>
          ))}
        </Animated.View>
      </ScrollView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  title: { fontSize: 32, marginBottom: 6 },
  subtitle: { fontFamily: "DMSans_400Regular", fontSize: 15, marginBottom: 28, lineHeight: 23 },
  moodCard: { marginBottom: 20 },
  moodCardLabel: { fontFamily: "DMSans_400Regular", fontSize: 15, marginBottom: 16, lineHeight: 22 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap" },
  responseCard: { marginBottom: 20, paddingLeft: 30 },
  responseAccent: {
    position: "absolute",
    left: 18,
    top: 22,
    bottom: 22,
    width: 2,
    borderRadius: 1,
    opacity: 0.45,
  },
  responseText: { fontFamily: "DMSerifDisplay_400Regular", fontSize: 19, lineHeight: 30 },
  savedLabel: { fontFamily: "DMSans_500Medium", fontSize: 12, letterSpacing: 0.5, marginBottom: 10 },
  sectionLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    marginBottom: 12,
    marginTop: 8,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  promptCard: { marginBottom: 8, paddingVertical: 15, paddingHorizontal: 18 },
  promptRow: { flexDirection: "row", alignItems: "center" },
  promptIcon: { marginRight: 12 },
  promptText: { fontFamily: "DMSans_400Regular", fontSize: 15, lineHeight: 22, flex: 1 },
});
