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
import { AtmosphericBackground } from "@/components/AtmosphericBackground";
import { GlowText } from "@/components/GlowText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { JOURNAL_PROMPTS } from "@/data/mock";
import { useAppContext } from "@/context/AppContext";
import Animated, {
  FadeInUp,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";

type TabView = "write" | "history";

export default function JournalScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { addJournalEntry, journalEntries } = useAppContext();

  const [view, setView] = useState<TabView>("write");
  const [promptIdx, setPromptIdx] = useState(() => new Date().getDate() % JOURNAL_PROMPTS.length);
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(false);

  const topPad = Platform.OS === "web" ? 64 : insets.top + 24;
  const bottomPad = Platform.OS === "web" ? 100 : insets.bottom + 100;

  const checkScale = useSharedValue(0);
  const checkStyle = useAnimatedStyle(() => ({ transform: [{ scale: checkScale.value }] }));

  const currentPrompt = JOURNAL_PROMPTS[promptIdx];

  const handleRefreshPrompt = () => {
    setPromptIdx((i) => (i + 1) % JOURNAL_PROMPTS.length);
  };

  const handleSave = () => {
    if (!content.trim()) return;
    addJournalEntry({
      prompt: currentPrompt,
      content: content.trim(),
      date: new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
    });
    setSaved(true);
    checkScale.value = withSpring(1, { damping: 12 });
  };

  const handleNew = () => {
    setContent("");
    setSaved(false);
    checkScale.value = withSpring(0, { damping: 14 });
    handleRefreshPrompt();
  };

  return (
    <AtmosphericBackground variant="warm">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: topPad, paddingBottom: bottomPad, paddingHorizontal: 24 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Animated.View entering={FadeInUp.duration(600)} style={styles.header}>
            <View>
              <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
              <GlowText
                glowColor="rgba(232,184,109,0.22)"
                style={styles.title}
              >
                Journal
              </GlowText>
            </View>
            <View style={[styles.tabToggle, { borderColor: "rgba(255,255,255,0.09)", backgroundColor: "rgba(255,255,255,0.04)" }]}>
              <Pressable
                onPress={() => setView("write")}
                style={[
                  styles.toggleBtn,
                  view === "write" && { backgroundColor: "rgba(232,184,109,0.18)" },
                ]}
              >
                <Text style={[styles.toggleLabel, { color: view === "write" ? "#E8B86D" : colors.mutedForeground }]}>
                  Write
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setView("history")}
                style={[
                  styles.toggleBtn,
                  view === "history" && { backgroundColor: "rgba(232,184,109,0.18)" },
                ]}
              >
                <Text style={[styles.toggleLabel, { color: view === "history" ? "#E8B86D" : colors.mutedForeground }]}>
                  History
                </Text>
              </Pressable>
            </View>
          </Animated.View>

          {/* WRITE VIEW */}
          {view === "write" && (
            <>
              {!saved ? (
                <>
                  {/* Prompt */}
                  <Animated.View entering={FadeInUp.delay(100).duration(600)}>
                    <View style={[styles.promptWrap, { borderColor: "rgba(232,184,109,0.20)", backgroundColor: "rgba(232,184,109,0.05)" }]}>
                      <View style={[styles.promptAccent, { backgroundColor: "#E8B86D" }]} />
                      <View style={styles.promptHeader}>
                        <Text style={[styles.promptLabel, { color: "rgba(232,184,109,0.65)" }]}>Today's prompt</Text>
                        <Pressable onPress={handleRefreshPrompt} hitSlop={12} style={styles.refreshBtn}>
                          <Feather name="refresh-cw" size={13} color="rgba(232,184,109,0.55)" />
                          <Text style={[styles.refreshLabel, { color: "rgba(232,184,109,0.55)" }]}>New</Text>
                        </Pressable>
                      </View>
                      <Text style={[styles.promptText, { color: colors.foreground }]}>{currentPrompt}</Text>
                    </View>
                  </Animated.View>

                  {/* Input */}
                  <Animated.View entering={FadeInUp.delay(200).duration(600)} style={{ marginTop: 26 }}>
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

                  {/* Word count */}
                  {content.length > 0 && (
                    <Animated.View entering={FadeIn.duration(300)}>
                      <Text style={[styles.wordCount, { color: "rgba(255,255,255,0.22)" }]}>
                        {content.trim().split(/\s+/).filter(Boolean).length} words
                      </Text>
                    </Animated.View>
                  )}

                  {/* Save */}
                  {content.trim().length > 0 && (
                    <Animated.View entering={FadeInUp.duration(400)} style={{ marginTop: 28 }}>
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
                </>
              ) : (
                <Animated.View entering={FadeIn.duration(700)} style={styles.savedState}>
                  <Animated.View
                    style={[
                      styles.savedCheck,
                      { backgroundColor: "rgba(232,184,109,0.10)", borderColor: "rgba(232,184,109,0.25)" },
                      checkStyle,
                    ]}
                  >
                    <Feather name="check" size={26} color="#E8B86D" />
                  </Animated.View>
                  <GlowText glowColor="rgba(232,184,109,0.22)" style={styles.savedTitle}>
                    Entry saved.
                  </GlowText>
                  <Text style={[styles.savedSub, { color: colors.mutedForeground }]}>
                    This is yours — private, safe, seen only by you.
                  </Text>
                  <Pressable onPress={handleNew} style={{ marginTop: 36 }}>
                    <View style={[styles.newEntryBtn, { borderColor: "rgba(232,184,109,0.25)" }]}>
                      <Text style={[styles.newEntryText, { color: "#E8B86D" }]}>Write another</Text>
                    </View>
                  </Pressable>
                  <Pressable
                    onPress={() => setView("history")}
                    style={{ marginTop: 14, alignItems: "center" }}
                  >
                    <Text style={[styles.viewHistoryLink, { color: colors.mutedForeground }]}>
                      View history →
                    </Text>
                  </Pressable>
                </Animated.View>
              )}
            </>
          )}

          {/* HISTORY VIEW */}
          {view === "history" && (
            <Animated.View entering={FadeIn.duration(500)}>
              {journalEntries.length === 0 ? (
                <View style={styles.emptyState}>
                  <Feather name="edit-2" size={28} color="rgba(255,255,255,0.15)" />
                  <Text style={[styles.emptyTitle, { color: "rgba(255,255,255,0.40)" }]}>
                    No entries yet
                  </Text>
                  <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>
                    Your saved entries will appear here.
                  </Text>
                  <Pressable onPress={() => setView("write")} style={{ marginTop: 24 }}>
                    <Text style={[styles.writeFirstLink, { color: "#E8B86D" }]}>
                      Write your first entry →
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.historyList}>
                  {journalEntries.map((entry, i) => (
                    <Animated.View
                      key={entry.id}
                      entering={FadeInUp.delay(i * 60).duration(500)}
                      style={[styles.historyCard, { borderColor: "rgba(232,184,109,0.14)", backgroundColor: "rgba(232,184,109,0.04)" }]}
                    >
                      <View style={styles.historyCardTop}>
                        <Text style={[styles.historyDate, { color: "rgba(232,184,109,0.60)" }]}>
                          {entry.date}
                        </Text>
                      </View>
                      <Text style={[styles.historyPrompt, { color: colors.mutedForeground }]}>
                        {entry.prompt}
                      </Text>
                      <Text
                        style={[styles.historyContent, { color: colors.foreground }]}
                        numberOfLines={4}
                      >
                        {entry.content}
                      </Text>
                    </Animated.View>
                  ))}
                </View>
              )}
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
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 28,
  },
  eyebrow: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    marginBottom: 6,
  },
  title: { fontSize: 30, lineHeight: 38 },
  tabToggle: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 14,
    padding: 4,
    gap: 2,
  },
  toggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  toggleLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
  },
  promptWrap: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    paddingLeft: 30,
    position: "relative",
    overflow: "hidden",
  },
  promptAccent: {
    position: "absolute",
    left: 14,
    top: 18,
    bottom: 18,
    width: 2.5,
    borderRadius: 2,
    opacity: 0.7,
  },
  promptHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  promptLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },
  refreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  refreshLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
  },
  promptText: {
    fontFamily: "DMSerifDisplay_400Regular",
    fontSize: 20,
    lineHeight: 31,
    fontStyle: "italic",
  },
  input: {
    fontFamily: "DMSans_400Regular",
    fontSize: 18,
    lineHeight: 30,
    minHeight: 180,
  },
  wordCount: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    marginTop: 8,
    textAlign: "right",
  },
  primaryBtn: { borderRadius: 20, paddingVertical: 19, alignItems: "center" },
  primaryBtnText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 17,
    color: "#F0EDE8",
    letterSpacing: 0.2,
  },
  savedState: { paddingTop: 32, alignItems: "flex-start" },
  savedCheck: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  savedTitle: { fontSize: 36, lineHeight: 46, marginBottom: 12 },
  savedSub: { fontFamily: "DMSans_400Regular", fontSize: 17, lineHeight: 27 },
  newEntryBtn: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  newEntryText: { fontFamily: "DMSans_500Medium", fontSize: 16 },
  viewHistoryLink: { fontFamily: "DMSans_400Regular", fontSize: 15 },
  emptyState: {
    paddingTop: 60,
    alignItems: "center",
    gap: 10,
  },
  emptyTitle: {
    fontFamily: "DMSans_500Medium",
    fontSize: 18,
    marginTop: 8,
  },
  emptyBody: {
    fontFamily: "DMSans_400Regular",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 23,
  },
  writeFirstLink: {
    fontFamily: "DMSans_500Medium",
    fontSize: 15,
  },
  historyList: { gap: 14 },
  historyCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    gap: 8,
  },
  historyCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  historyDate: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    letterSpacing: 0.4,
  },
  historyPrompt: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    fontStyle: "italic",
    lineHeight: 20,
  },
  historyContent: {
    fontFamily: "DMSans_400Regular",
    fontSize: 15,
    lineHeight: 23,
  },
});
