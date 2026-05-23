import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { AtmosphericBackground } from "@/components/AtmosphericBackground";
import { GlowText } from "@/components/GlowText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";
import { mockConversation } from "@/data/mock";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
} from "react-native-reanimated";

const MOCK_RESPONSES = [
  "It sounds like there's a lot of pressure underneath that.",
  "What would it mean for you if things didn't improve right away?",
  "That makes complete sense given what you've been carrying.",
  "You're asking the right questions — even if the answers aren't clear yet.",
  "Sometimes naming the feeling is enough for today.",
  "There's a difference between what you did and who you are.",
  "Rest is not a reward for productivity. It's a need.",
  "Carrying too much for too long quietly reshapes you. It's okay to put some of it down.",
];

function TypingIndicator() {
  const colors = useColors();
  const d1 = useSharedValue(0.3);
  const d2 = useSharedValue(0.3);
  const d3 = useSharedValue(0.3);

  useEffect(() => {
    d1.value = withRepeat(withTiming(1, { duration: 600 }), -1, true);
    d2.value = withDelay(200, withRepeat(withTiming(1, { duration: 600 }), -1, true));
    d3.value = withDelay(400, withRepeat(withTiming(1, { duration: 600 }), -1, true));
  }, []);

  const s1 = useAnimatedStyle(() => ({ opacity: d1.value }));
  const s2 = useAnimatedStyle(() => ({ opacity: d2.value }));
  const s3 = useAnimatedStyle(() => ({ opacity: d3.value }));

  return (
    <View style={styles.typingContainer}>
      <Animated.View style={[styles.typingDot, s1, { backgroundColor: colors.mutedForeground }]} />
      <Animated.View style={[styles.typingDot, s2, { backgroundColor: colors.mutedForeground }]} />
      <Animated.View style={[styles.typingDot, s3, { backgroundColor: colors.mutedForeground }]} />
    </View>
  );
}

type Message = {
  id: string;
  role: string;
  text: string;
  timestamp: string;
};

export default function CompanionScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();

  const [messages, setMessages] = useState<Message[]>(
    [...mockConversation].reverse()
  );
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top + 20;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 88;

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [userMsg, ...prev]);
    setInput("");
    setIsTyping(true);

    const delay = 1500 + Math.random() * 800;
    setTimeout(() => {
      const responseMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)] ?? MOCK_RESPONSES[0],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [responseMsg, ...prev]);
      setIsTyping(false);
    }, delay);
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";
    return (
      <View
        style={[
          styles.messageRow,
          isUser ? styles.messageRowUser : styles.messageRowAssistant,
        ]}
      >
        <View
          style={[
            styles.bubble,
            isUser
              ? { backgroundColor: colors.primary + "22", borderColor: colors.primary + "30", borderWidth: 1 }
              : { backgroundColor: colors.card },
          ]}
        >
          <Text style={[styles.messageText, { color: colors.foreground }]}>
            {item.text ?? ""}
          </Text>
        </View>
        <Text
          style={[
            styles.timestamp,
            { color: colors.mutedForeground, alignSelf: isUser ? "flex-end" : "flex-start" },
          ]}
        >
          {item.timestamp ?? ""}
        </Text>
      </View>
    );
  };

  return (
    <AtmosphericBackground>
      <View style={[styles.header, { paddingTop: topPad, borderBottomColor: colors.border }]}>
        <GlowText style={styles.title}>Your Companion</GlowText>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          A quiet space to process
        </Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <FlatList
          data={messages}
          inverted
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            isTyping ? (
              <View style={[styles.messageRow, styles.messageRowAssistant]}>
                <View style={[styles.bubble, { backgroundColor: colors.card }]}>
                  <TypingIndicator />
                </View>
              </View>
            ) : null
          }
        />

        <View
          style={[
            styles.inputContainer,
            {
              paddingBottom: bottomPad,
              backgroundColor: colors.background,
              borderTopColor: colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.inputWrapper,
              { borderColor: colors.border, backgroundColor: colors.input },
            ]}
          >
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Share what's on your mind..."
              placeholderTextColor={colors.mutedForeground}
              value={input}
              onChangeText={setInput}
              multiline
              onSubmitEditing={handleSend}
            />
            <Pressable onPress={handleSend} style={styles.sendBtn} hitSlop={8}>
              <Feather
                name="send"
                size={20}
                color={input.trim() ? colors.primary : colors.mutedForeground}
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    paddingHorizontal: 22,
    paddingBottom: 18,
    borderBottomWidth: 1,
  },
  title: { fontSize: 28 },
  subtitle: { fontFamily: "DMSans_400Regular", fontSize: 14, marginTop: 4 },
  list: { paddingHorizontal: 20, paddingBottom: 16 },
  messageRow: { marginBottom: 14, maxWidth: "80%" },
  messageRowUser: { alignSelf: "flex-end" },
  messageRowAssistant: { alignSelf: "flex-start" },
  bubble: { padding: 16, borderRadius: 20 },
  messageText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 15,
    lineHeight: 22,
  },
  timestamp: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontFamily: "DMSans_400Regular",
    fontSize: 15,
    maxHeight: 120,
    minHeight: 36,
    paddingTop: 8,
  },
  sendBtn: { padding: 8, marginBottom: 2 },
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 22,
    gap: 5,
  },
  typingDot: { width: 6, height: 6, borderRadius: 3 },
});
