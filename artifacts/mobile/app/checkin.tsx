import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { AtmosphericBackground } from "@/components/AtmosphericBackground";
import { GlowText } from "@/components/GlowText";
import { CalmButton } from "@/components/CalmButton";
import { MoodChip } from "@/components/MoodChip";
import { PremiumCard } from "@/components/PremiumCard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAppContext } from "@/context/AppContext";
import Animated, { FadeInUp, FadeIn } from "react-native-reanimated";

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

const RESPONSES: Record<string, string> = {
  overwhelmed:
    "Overwhelm means something matters to you. That's not weakness — it's proof you care. You're allowed to feel this.",
  "mentally tired":
    "Mental exhaustion is often invisible. You can't point to it like a bruise. But it's real, and it counts.",
  anxious:
    "Anxiety is your mind trying to protect you. You don't have to fight it — just notice it with some gentleness.",
  distracted:
    "A distracted mind is often an overloaded one. You're not broken — you're just at capacity right now.",
  calm:
    "Hold onto this. Calm is something you've been building. You got here.",
  "emotionally numb":
    "Numbness is sometimes the nervous system's way of resting. It's allowed. You don't have to feel more than you do right now.",
  hopeful:
    "Something in you believes things can be better. That quiet belief is worth protecting today.",
  lonely:
    "Loneliness in a connected world is its own kind of grief. You're not alone in feeling alone.",
  default:
    "Whatever you're carrying today — you don't have to carry it alone.",
};

export default function CheckinScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { setTodayCheckin } = useAppContext();

  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const topPad = Platform.OS === "web" ? 64 : insets.top + 40;
  const bottomPad = Platform.OS === "web" ? 48 : insets.bottom + 40;

  const handleSave = () => {
    if (selectedMood) {
      setTodayCheckin(selectedMood);
    }
    router.back();
  };

  if (!selectedMood) {
    return (
      <AtmosphericBackground>
        <ScrollView
          contentContainerStyle={{
            paddingTop: topPad,
            paddingBottom: bottomPad,
            paddingHorizontal: 26,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInUp.delay(40).duration(600)}>
            <GlowText style={styles.title}>How are you{"\n"}feeling today?</GlowText>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              No right answers. Just honesty.
            </Text>
          </Animated.View>
          <Animated.View
            entering={FadeInUp.delay(160).duration(600)}
            style={styles.wrap}
          >
            {MOODS.map((mood) => (
              <MoodChip
                key={mood}
                label={mood}
                onPress={() => setSelectedMood(mood)}
              />
            ))}
          </Animated.View>
        </ScrollView>
      </AtmosphericBackground>
    );
  }

  const responseText = RESPONSES[selectedMood] || RESPONSES.default;

  return (
    <AtmosphericBackground>
      <ScrollView
        contentContainerStyle={{
          paddingTop: topPad,
          paddingBottom: bottomPad,
          paddingHorizontal: 26,
          flexGrow: 1,
          justifyContent: "space-between",
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(500)}>
          <Text style={[styles.selectedLabel, { color: colors.mutedForeground }]}>
            You're feeling
          </Text>
          <GlowText style={styles.selectedMood}>{selectedMood}</GlowText>

          <PremiumCard
            style={[styles.responseCard, { borderColor: colors.primary + "25" }]}
            glow
          >
            <View style={[styles.responseAccent, { backgroundColor: colors.primary }]} />
            <Text style={[styles.responseText, { color: colors.foreground }]}>
              {responseText}
            </Text>
          </PremiumCard>

          <View style={styles.noteWrap}>
            <Text style={[styles.noteLabel, { color: colors.mutedForeground }]}>
              Add a note
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.foreground,
                  borderColor: colors.border,
                  backgroundColor: colors.input,
                },
              ]}
              placeholder="What's going on? (optional)"
              placeholderTextColor={colors.mutedForeground + "60"}
              value={note}
              onChangeText={setNote}
              multiline
              textAlignVertical="top"
            />
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(200).duration(500)}
          style={styles.actions}
        >
          <CalmButton title="Save check-in" onPress={handleSave} />
          <CalmButton
            title="Choose different feeling"
            variant="ghost"
            onPress={() => setSelectedMood(null)}
          />
        </Animated.View>
      </ScrollView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 36, lineHeight: 46, marginBottom: 12 },
  subtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 16,
    marginBottom: 32,
    lineHeight: 24,
  },
  wrap: { flexDirection: "row", flexWrap: "wrap" },
  selectedLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    letterSpacing: 0.2,
    marginBottom: 6,
  },
  selectedMood: {
    fontSize: 36,
    marginBottom: 28,
    lineHeight: 44,
  },
  responseCard: { marginBottom: 28, paddingLeft: 28 },
  responseAccent: {
    position: "absolute",
    left: 16,
    top: 22,
    bottom: 22,
    width: 2,
    borderRadius: 1,
    opacity: 0.5,
  },
  responseText: {
    fontFamily: "DMSerifDisplay_400Regular",
    fontSize: 19,
    lineHeight: 29,
  },
  noteWrap: { marginBottom: 24 },
  noteLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    letterSpacing: 0.3,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  input: {
    fontFamily: "DMSans_400Regular",
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    minHeight: 100,
    lineHeight: 24,
  },
  actions: { gap: 4 },
});
