import React, { useState } from "react";
import { StyleSheet, View, Text, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { AtmosphericBackground } from "@/components/AtmosphericBackground";
import { GlowText } from "@/components/GlowText";
import { CalmButton } from "@/components/CalmButton";
import { MoodChip } from "@/components/MoodChip";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAppContext } from "@/context/AppContext";

const MOODS = [
  "overwhelmed", "mentally tired", "anxious", "distracted", 
  "calm", "emotionally numb", "hopeful", "lonely"
];

const RESPONSES: Record<string, string> = {
  overwhelmed: "Overwhelm means something matters to you. That's not weakness — it's proof you care. Let's give it some space.",
  "mentally tired": "Mental tiredness is often invisible. You can't point to it like a bruise. But it's real, and it matters.",
  anxious: "Anxiety is your mind trying to protect you. You don't have to fight it — just let it know you're listening.",
  calm: "Hold onto this. Calm is a muscle. You've been building it.",
  hopeful: "Something in you believes things can be better. That quiet hope is worth protecting.",
  default: "Whatever you're carrying today — you don't have to carry it alone."
};

export default function CheckinScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { setTodayCheckin } = useAppContext();
  
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const handleSave = () => {
    if (selectedMood) {
      setTodayCheckin(selectedMood);
    }
    router.back();
  };

  if (!selectedMood) {
    return (
      <AtmosphericBackground>
        <View style={[styles.container, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}>
          <GlowText style={styles.title}>How are you feeling today?</GlowText>
          <View style={styles.wrap}>
            {MOODS.map(mood => (
              <MoodChip
                key={mood}
                label={mood}
                onPress={() => setSelectedMood(mood)}
              />
            ))}
          </View>
        </View>
      </AtmosphericBackground>
    );
  }

  const responseText = RESPONSES[selectedMood] || RESPONSES.default;

  return (
    <AtmosphericBackground>
      <View style={[styles.container, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}>
        <View style={styles.content}>
          <GlowText style={styles.selectedTitle}>"{selectedMood}"</GlowText>
          <Text style={styles.responseText}>{responseText}</Text>
          
          <TextInput
            style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.input }]}
            placeholder="Add a note (optional)"
            placeholderTextColor={colors.mutedForeground}
            value={note}
            onChangeText={setNote}
            multiline
          />
        </View>
        
        <CalmButton title="Save check-in" onPress={handleSave} />
      </View>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 36,
    marginBottom: 40,
  },
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  selectedTitle: {
    fontSize: 32,
    marginBottom: 24,
    color: "#7B7FF0",
  },
  responseText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 20,
    lineHeight: 30,
    color: "#F5F3EE",
    marginBottom: 40,
  },
  input: {
    fontFamily: "DMSans_400Regular",
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    minHeight: 120,
    textAlignVertical: "top",
  },
});
