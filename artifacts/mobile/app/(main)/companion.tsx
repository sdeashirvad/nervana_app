import React, { useState, useEffect, useRef } from "react";
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
import { BlurView } from "expo-blur";
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
  withSpring,
  FadeInUp,
  FadeIn,
  Easing,
} from "react-native-reanimated";

const MOCK_RESPONSES = [
  "It sounds like there's a lot of pressure underneath that. What's been the heaviest part for you?",
  "What would it mean if things didn't improve right away? Would that change how you're treating yourself?",
  "That makes complete sense given what you've been carrying. You don't have to justify it.",
  "You're asking the right questions — even when the answers aren't clear yet. That itself is something.",
  "Sometimes naming the feeling is enough for today. You don't have to solve it.",
  "There's a difference between what you did and who you are. The line matters.",
  "Rest isn't a reward you earn. It's oxygen. You're allowed to just stop.",
  "Carrying too much for too long quietly reshapes you. It's okay to put some of it down.",
  "You've been showing up even when it's hard. That deserves to be acknowledged.",
  "It's okay if today was just surviving. Some days that's the whole achievement.",
];

function TypingDot({ delay }: { delay: number }) {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0.2);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 540, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      )
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(0.85, { duration: 540, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      )
    );
  }, []);

  const s = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={[typingStyles.dot, s]} />;
}

const typingStyles = StyleSheet.create({
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "rgba(255,255,255,0.45)",
  },
});

type Message = { id: string; role: string; text: string; timestamp: string };

function MessageBubble({ item }: { item: Message }) {
  const colors = useColors();
  const isUser = item.role === "user";

  if (Platform.OS === "web") {
    return (
      <Animated.View
        entering={FadeInUp.duration(380)}
        style={[
          styles.messageRow,
          isUser ? styles.messageRowUser : styles.messageRowAssistant,
        ]}
      >
        <View
          style={[
            styles.bubble,
            isUser
              ? {
                  backgroundColor: "rgba(148, 145, 240, 0.14)",
                  borderColor: "rgba(148, 145, 240, 0.25)",
                  borderWidth: 1,
                  backdropFilter: "blur(12px)",
                } as any
              : {
                  backgroundColor: "rgba(255,255,255,0.04)",
                  borderColor: "rgba(255,255,255,0.07)",
                  borderWidth: 1,
                  backdropFilter: "blur(12px)",
                } as any,
          ]}
        >
          <Text style={[styles.messageText, { color: colors.foreground }]}>
            {item.text}
          </Text>
        </View>
        <Text
          style={[
            styles.timestamp,
            { color: colors.mutedForeground, alignSelf: isUser ? "flex-end" : "flex-start" },
          ]}
        >
          {item.timestamp}
        </Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeInUp.duration(380)}
      style={[
        styles.messageRow,
        isUser ? styles.messageRowUser : styles.messageRowAssistant,
      ]}
    >
      <BlurView
        intensity={14}
        tint="dark"
        style={[styles.bubbleBlurWrap, isUser ? styles.bubbleBlurUser : styles.bubbleBlurAssistant]}
      >
        <View
          style={[
            styles.bubbleInner,
            isUser
              ? { backgroundColor: "rgba(148,145,240,0.14)", borderColor: "rgba(148,145,240,0.25)" }
              : { backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.07)" },
          ]}
        >
          <Text style={[styles.messageText, { color: colors.foreground }]}>
            {item.text}
          </Text>
        </View>
      </BlurView>
      <Text
        style={[
          styles.timestamp,
          { color: colors.mutedForeground, alignSelf: isUser ? "flex-end" : "flex-start" },
        ]}
      >
        {item.timestamp}
      </Text>
    </Animated.View>
  );
}

export default function CompanionScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();

  const [messages, setMessages] = useState<Message[]>([...mockConversation].reverse());
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const sendOpacity = useSharedValue(0.3);
  const inputBorderOpacity = useSharedValue(0);

  useEffect(() => {
    sendOpacity.value = withTiming(input.trim() ? 1 : 0.3, { duration: 180 });
  }, [input]);

  const sendStyle = useAnimatedStyle(() => ({ opacity: sendOpacity.value }));
  const borderStyle = useAnimatedStyle(() => ({
    opacity: inputBorderOpacity.value,
  }));

  const topPad = Platform.OS === "web" ? 64 : insets.top + 20;
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
    setMessages((p) => [userMsg, ...p]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((p) => [aiMsg, ...p]);
      setIsTyping(false);
    }, 1900 + Math.random() * 900);
  };

  return (
    <AtmosphericBackground>
      {/* Header */}
      <Animated.View
        entering={FadeInUp.delay(40).duration(600)}
        style={[styles.header, { paddingTop: topPad, borderBottomColor: "rgba(255,255,255,0.06)" }]}
      >
        <GlowText style={styles.title}>Your Companion</GlowText>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          A quiet space to process what's on your mind
        </Text>
      </Animated.View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <FlatList
          data={messages}
          inverted
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble item={item} />}
          contentContainerStyle={styles.list}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            isTyping ? (
              <Animated.View
                entering={FadeIn.duration(280)}
                style={[styles.messageRow, styles.messageRowAssistant]}
              >
                <View style={styles.typingBubble}>
                  <View style={styles.typingDots}>
                    <TypingDot delay={0} />
                    <TypingDot delay={160} />
                    <TypingDot delay={320} />
                  </View>
                </View>
              </Animated.View>
            ) : null
          }
        />

        {/* Input bar */}
        <View
          style={[
            styles.inputContainer,
            {
              paddingBottom: bottomPad,
              borderTopColor: "rgba(255,255,255,0.06)",
            },
          ]}
        >
          {Platform.OS !== "web" ? (
            <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
          ) : null}
          <View
            style={[
              styles.inputWrapper,
              {
                borderColor: isFocused
                  ? "rgba(148,145,240,0.40)"
                  : "rgba(255,255,255,0.08)",
                backgroundColor: "rgba(255,255,255,0.04)",
              },
            ]}
          >
            <TextInput
              ref={inputRef}
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Share what's on your mind..."
              placeholderTextColor={"rgba(255,255,255,0.22)"}
              value={input}
              onChangeText={setInput}
              multiline
              onFocus={() => {
                setIsFocused(true);
                inputBorderOpacity.value = withTiming(1, { duration: 200 });
              }}
              onBlur={() => {
                setIsFocused(false);
                inputBorderOpacity.value = withTiming(0, { duration: 200 });
              }}
              returnKeyType="send"
              blurOnSubmit={false}
              onSubmitEditing={handleSend}
            />
            <Pressable onPress={handleSend} style={styles.sendBtn} hitSlop={10}>
              <Animated.View style={[styles.sendInner, { backgroundColor: input.trim() ? colors.primary : "rgba(255,255,255,0.07)" }, sendStyle]}>
                <Feather
                  name="arrow-up"
                  size={15}
                  color={input.trim() ? "#F0EDE8" : "rgba(255,255,255,0.4)"}
                />
              </Animated.View>
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
    paddingHorizontal: 24,
    paddingBottom: 18,
    borderBottomWidth: 1,
  },
  title: { fontSize: 27, marginBottom: 4 },
  subtitle: { fontFamily: "DMSans_400Regular", fontSize: 14, lineHeight: 20 },
  list: { paddingHorizontal: 18, paddingBottom: 20 },
  messageRow: { marginBottom: 14, maxWidth: "83%" },
  messageRowUser: { alignSelf: "flex-end" },
  messageRowAssistant: { alignSelf: "flex-start" },
  bubble: { padding: 16, borderRadius: 20, overflow: "hidden" },
  bubbleBlurWrap: { borderRadius: 20, overflow: "hidden" },
  bubbleBlurUser: {},
  bubbleBlurAssistant: {},
  bubbleInner: { padding: 16, borderWidth: 1, borderRadius: 20 },
  messageText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 15,
    lineHeight: 23,
  },
  timestamp: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    marginTop: 5,
    paddingHorizontal: 4,
    opacity: 0.55,
  },
  typingBubble: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    padding: 14,
    borderRadius: 20,
  },
  typingDots: { flexDirection: "row", gap: 5, alignItems: "center", height: 22 },
  inputContainer: {
    paddingHorizontal: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    position: "relative",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderWidth: 1,
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  input: {
    flex: 1,
    fontFamily: "DMSans_400Regular",
    fontSize: 15,
    maxHeight: 120,
    minHeight: 36,
    paddingTop: 8,
    paddingBottom: 8,
    lineHeight: 22,
  },
  sendBtn: { marginBottom: 4, marginLeft: 6 },
  sendInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
});
