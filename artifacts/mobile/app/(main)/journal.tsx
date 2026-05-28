import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { AtmosphericBackground } from "@/components/AtmosphericBackground";
import { GlowText } from "@/components/GlowText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { JOURNAL_PROMPTS } from "@/data/mock";
import Animated, {
  FadeInUp,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

export default function JournalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();

  const promptIdx = new Date().getDate() % JOURNAL_PROMPTS.length;
  const prompt = JOURNAL_PROMPTS[promptIdx];

  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(false);

  const topPad = Platform.OS === "web" ? 64 : insets.top + 24;
  const bottomPad = Platform.OS === "web" ? 56 : insets.bottom + 36;

  const checkScale = useSharedValue(0);
  const checkStyle = useAnimatedStyle(() => ({ transform: [{ scale: checkScale.value }] }));

  const handleSave = () => {
    if (!content.trim()) return;
    setSaved(true);
    checkScale.value = withSpring(1, { damping: 12 });
  };

  const handleNew = () => {
    setContent("");
    setSaved(false);
    checkScale.value = withSpring(0, { damping: 14 });
  };

  return (
    <AtmosphericBackground variant="warm">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: topPad, paddingBottom: bottomPad, paddingHorizontal: 26 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Animated.View entering={FadeInUp.duration(600)} style={styles.header}>
            <Pressable onPress={() => router.back()} hitSlop={14}>
              <Feather name="x" size={22} color="rgba(255,255,255,0.35)" />
            </Pressable>
            <View style={styles.headerCenter}>
              <Text style={[styles.headerDate, { color: colors.mutedForeground }]}>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </View>
            {content.trim() && !saved ? (
              <Pressable onPress={handleSave} hitSlop={10}>
                <Text style={[styles.saveBtn, { color: colors.primary }]}>Save</Text>
              </Pressable>
            ) : (
              <View style={{ width: 40 }} />
            )}
          </Animated.View>

          {!saved ? (
            <>
              {/* Prompt */}
              <Animated.View entering={FadeInUp.delay(100).duration(600)}>
                <View style={[styles.promptWrap, { borderColor: "rgba(232,184,109,0.20)", backgroundColor: "rgba(232,184,109,0.05)" }]}>
                  <View style={[styles.promptAccent, { backgroundColor: "#E8B86D" }]} />
                  <Text style={[styles.promptLabel, { color: "rgba(232,184,109,0.65)" }]}>Today's prompt</Text>
                  <Text style={[styles.promptText, { color: colors.foreground }]}>{prompt}</Text>
                </View>
              </Animated.View>

              {/* Input */}
              <Animated.View entering={FadeInUp.delay(200).duration(600)} style={{ marginTop: 28 }}>
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  placeholder="Let it out — this is just for you..."
                  placeholderTextColor="rgba(255,255,255,0.16)"
                  value={content}
                  onChangeText={setContent}
                  multiline
                  textAlignVertical="top"
                  autoFocus={false}
                />
              </Animated.View>

              {/* Save button */}
              {content.trim().length > 0 && (
                <Animated.View entering={FadeInUp.duration(400)} style={{ marginTop: 32 }}>
                  <Pressable onPress={handleSave}>
                    <LinearGradient
                      colors={["#D4A55A", "#C49048", "#B07A38"]}
                      style={styles.primaryBtn}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.primaryBtnText}>Save entry</Text>
                    </LinearGradient>
                  </Pressable>
                </Animated.View>
              )}

              {/* Skip */}
              <Animated.View entering={FadeInUp.delay(400).duration(600)} style={{ marginTop: 20, alignItems: "center" }}>
                <Pressable onPress={() => router.back()} hitSlop={10}>
                  <Text style={[styles.skipText, { color: colors.mutedForeground }]}>
                    Not today — maybe later
                  </Text>
                </Pressable>
              </Animated.View>
            </>
          ) : (
            <Animated.View entering={FadeIn.duration(700)} style={styles.savedState}>
              <Animated.View style={[styles.savedCheck, { backgroundColor: "rgba(232,184,109,0.10)", borderColor: "rgba(232,184,109,0.25)" }, checkStyle]}>
                <Feather name="check" size={26} color="#E8B86D" />
              </Animated.View>
              <GlowText style={styles.savedTitle}>Entry saved.</GlowText>
              <Text style={[styles.savedSub, { color: colors.mutedForeground }]}>
                This is yours — private, safe, and seen only by you.
              </Text>
              <Pressable onPress={handleNew} style={{ marginTop: 40 }}>
                <View style={[styles.newEntryBtn, { borderColor: "rgba(232,184,109,0.25)" }]}>
                  <Text style={[styles.newEntryText, { color: "#E8B86D" }]}>Write another</Text>
                </View>
              </Pressable>
              <Pressable onPress={() => router.back()} style={{ marginTop: 16, alignItems: "center" }}>
                <Text style={[styles.skipText, { color: colors.mutedForeground }]}>Back to Mindspace</Text>
              </Pressable>
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerDate: { fontFamily: "DMSans_400Regular", fontSize: 13 },
  saveBtn: { fontFamily: "DMSans_500Medium", fontSize: 16 },
  promptWrap: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 22,
    paddingLeft: 32,
    position: "relative",
    overflow: "hidden",
  },
  promptAccent: {
    position: "absolute",
    left: 16,
    top: 20,
    bottom: 20,
    width: 2.5,
    borderRadius: 2,
    opacity: 0.7,
  },
  promptLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    letterSpacing: 0.9,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  promptText: {
    fontFamily: "DMSerifDisplay_400Regular",
    fontSize: 22,
    lineHeight: 33,
    fontStyle: "italic",
  },
  input: {
    fontFamily: "DMSans_400Regular",
    fontSize: 18,
    lineHeight: 30,
    minHeight: 200,
  },
  primaryBtn: { borderRadius: 20, paddingVertical: 19, alignItems: "center" },
  primaryBtnText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 17,
    color: "#F0EDE8",
    letterSpacing: 0.2,
  },
  skipText: { fontFamily: "DMSans_400Regular", fontSize: 15 },
  savedState: {
    paddingTop: 40,
    alignItems: "flex-start",
  },
  savedCheck: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 26,
  },
  savedTitle: { fontSize: 38, lineHeight: 48, marginBottom: 14 },
  savedSub: { fontFamily: "DMSans_400Regular", fontSize: 17, lineHeight: 27 },
  newEntryBtn: {
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 28,
  },
  newEntryText: { fontFamily: "DMSans_500Medium", fontSize: 16 },
});
