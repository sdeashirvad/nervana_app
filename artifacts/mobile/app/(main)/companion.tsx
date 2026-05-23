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
  Easing,
} from "react-native-reanimated";

const MOCK_RESPONSES = [
  "It sounds like there's a lot of pressure underneath that. What's been the heaviest part?",
  "What would it mean for you if things didn't improve right away?",
  "That makes complete sense given what you've been carrying. You don't have to justify it.",
  "You're asking the right questions — even if the answers aren't clear yet. That takes courage.",
  "Sometimes naming the feeling is enough for today. You don't have to solve it.",
  "There's a difference between what you did and who you are. They don't have to be the same.",
  "Rest is not a reward for productivity. It's a need. You're allowed to just stop.",
  "Carrying too much for too long quietly reshapes you. It's okay to put some of it down.",
  "You've been showing up even when it's hard. That's worth acknowledging.",
  "It's okay if today was just surviving. That's a full day.",
];

function TypingDot({ delay }: { delay: number }) {
  const colors = useColors();
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 500, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      )
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(0.9, { duration: 500, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
    backgroundColor: colors.mutedForeground,
  }));

  return <Animated.View style={[typingStyles.dot, style]} />;
}

const typingStyles = StyleSheet.create({
  dot: { width: 7, height: 7, borderRadius: 3.5 },
});

function TypingIndicator() {
  return (
    <View style={styles.typingContainer}>
      <TypingDot delay={0} />
      <TypingDot delay={160} />
      <TypingDot delay={320} />
    </View>
  );
}

type Message = {
  id: string;
  role: string;
  text: string;
  timestamp: string;
};

function MessageBubble({ item, index }: { item: Message; index: number }) {
  const colors = useColors();
  const isUser = item.role === "user";

  return (
    <Animated.View
      entering={FadeInUp.delay(Math.min(index * 30, 120)).duration(400)}
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
                backgroundColor: colors.primary + "1A",
                borderColor: colors.primary + "28",
                borderWidth: 1,
              }
            : {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderWidth: 1,
              },
        ]}
      >
        <Text style={[styles.messageText, { color: colors.foreground }]}>
          {item.text ?? ""}
        </Text>
      </View>
      <Text
        style={[
          styles.timestamp,
          {
            color: colors.mutedForeground,
            alignSelf: isUser ? "flex-end" : "flex-start",
          },
        ]}
      >
        {item.timestamp ?? ""}
      </Text>
    </Animated.View>
  );
}

export default function CompanionScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();

  const [messages, setMessages] = useState<Message[]>(
    [...mockConversation].reverse()
  );
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const inputScale = useSharedValue(1);
  const sendBtnOpacity = useSharedValue(0);

  useEffect(() => {
    sendBtnOpacity.value = withTiming(input.trim() ? 1 : 0.35, { duration: 180 });
  }, [input]);

  const inputWrapperStyle = useAnimatedStyle(() => ({
    borderColor: isFocused
      ? withTiming(colors.primary + "50", { duration: 200 })
      : withTiming(colors.border, { duration: 200 }),
  }));

  const sendBtnStyle = useAnimatedStyle(() => ({
    opacity: sendBtnOpacity.value,
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
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [userMsg, ...prev]);
    setInput("");
    setIsTyping(true);

    const delay = 1800 + Math.random() * 1000;
    setTimeout(() => {
      const responseMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text:
          MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)] ??
          MOCK_RESPONSES[0],
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [responseMsg, ...prev]);
      setIsTyping(false);
    }, delay);
  };

  const renderItem = ({ item, index }: { item: Message; index: number }) => (
    <MessageBubble item={item} index={index} />
  );

  return (
    <AtmosphericBackground>
      <View
        style={[
          styles.header,
          { paddingTop: topPad, borderBottomColor: colors.border },
        ]}
      >
        <GlowText style={styles.title}>Your Companion</GlowText>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          A quiet space to process what's on your mind
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
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            isTyping ? (
              <Animated.View
                entering={FadeInUp.duration(300)}
                style={[styles.messageRow, styles.messageRowAssistant]}
              >
                <View
                  style={[
                    styles.bubble,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      borderWidth: 1,
                    },
                  ]}
                >
                  <TypingIndicator />
                </View>
              </Animated.View>
            ) : null
          }
        />

        <Animated.View
          style={[
            styles.inputContainer,
            {
              paddingBottom: bottomPad,
              backgroundColor: "rgba(8, 10, 22, 0.97)",
              borderTopColor: colors.border,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.inputWrapper,
              { backgroundColor: colors.input },
              inputWrapperStyle,
            ]}
          >
            <TextInput
              ref={inputRef}
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Share what's on your mind..."
              placeholderTextColor={colors.mutedForeground + "80"}
              value={input}
              onChangeText={setInput}
              multiline
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              returnKeyType="send"
              blurOnSubmit={false}
              onSubmitEditing={handleSend}
            />
            <Pressable onPress={handleSend} style={styles.sendBtn} hitSlop={10}>
              <Animated.View style={sendBtnStyle}>
                <View
                  style={[
                    styles.sendBtnInner,
                    { backgroundColor: input.trim() ? colors.primary : "transparent" },
                  ]}
                >
                  <Feather
                    name="arrow-up"
                    size={16}
                    color={input.trim() ? "#F5F3EE" : colors.mutedForeground}
                  />
                </View>
              </Animated.View>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    paddingHorizontal: 22,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: { fontSize: 28, marginBottom: 4 },
  subtitle: { fontFamily: "DMSans_400Regular", fontSize: 14, lineHeight: 20 },
  list: { paddingHorizontal: 18, paddingBottom: 20 },
  messageRow: { marginBottom: 12, maxWidth: "82%" },
  messageRowUser: { alignSelf: "flex-end" },
  messageRowAssistant: { alignSelf: "flex-start" },
  bubble: {
    padding: 16,
    borderRadius: 20,
  },
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
    opacity: 0.6,
  },
  inputContainer: {
    paddingHorizontal: 18,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderWidth: 1,
    borderRadius: 26,
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
  sendBtnInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 24,
    gap: 5,
    paddingHorizontal: 4,
  },
});
