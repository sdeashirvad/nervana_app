import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Text, FlatList, TextInput, Pressable } from "react-native";
import { AtmosphericBackground } from "@/components/AtmosphericBackground";
import { GlowText } from "@/components/GlowText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { mockConversation } from "@/data/mock";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withDelay } from "react-native-reanimated";

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
      <Animated.View style={[styles.dot, s1, { backgroundColor: colors.foreground }]} />
      <Animated.View style={[styles.dot, s2, { backgroundColor: colors.foreground }]} />
      <Animated.View style={[styles.dot, s3, { backgroundColor: colors.foreground }]} />
    </View>
  );
}

export default function CompanionScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [messages, setMessages] = useState(mockConversation.slice().reverse()); // inverted
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const mockResponses = [
    "It sounds like there's a lot of pressure underneath that.",
    "What would it mean for you if things didn't improve right away?",
    "That makes complete sense given what you've been carrying.",
    "You're asking the right questions — even if the answers aren't clear yet.",
    "Sometimes naming the feeling is enough for today.",
    "There's a difference between what you did and who you are.",
  ];

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      role: "user",
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [newMessage, ...prev]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: mockResponses[Math.floor(Math.random() * mockResponses.length)],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [response, ...prev]);
      setIsTyping(false);
    }, 2000);
  };

  const renderItem = ({ item }: { item: typeof mockConversation[0] }) => {
    const isUser = item.role === "user";

    return (
      <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowAssistant]}>
        <View 
          style={[
            styles.bubble, 
            isUser ? { backgroundColor: colors.primary + "33" } : { backgroundColor: colors.card }
          ]}
        >
          <Text style={styles.messageText}>{item.text}</Text>
        </View>
        <Text style={[styles.timestamp, { alignSelf: isUser ? "flex-end" : "flex-start" }]}>
          {item.timestamp}
        </Text>
      </View>
    );
  };

  return (
    <AtmosphericBackground>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <GlowText style={styles.title}>Your Companion</GlowText>
        <Text style={styles.subtitle}>A quiet space to process</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        <FlatList
          data={messages}
          inverted
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
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

        <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 100, backgroundColor: colors.background }]}>
          <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.input }]}>
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Share what's on your mind..."
              placeholderTextColor={colors.mutedForeground}
              value={input}
              onChangeText={setInput}
              multiline
            />
            <Pressable onPress={handleSend} style={styles.sendBtn}>
              <Feather name="send" size={20} color={input.trim() ? colors.primary : colors.mutedForeground} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#252840",
  },
  title: {
    fontSize: 28,
  },
  subtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: "#8A8882",
    marginTop: 4,
  },
  messageRow: {
    marginBottom: 16,
    maxWidth: "80%",
  },
  messageRowUser: {
    alignSelf: "flex-end",
  },
  messageRowAssistant: {
    alignSelf: "flex-start",
  },
  bubble: {
    padding: 16,
    borderRadius: 20,
  },
  messageText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 15,
    color: "#F5F3EE",
    lineHeight: 22,
  },
  timestamp: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: "#8A8882",
    marginTop: 4,
    paddingHorizontal: 4,
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#252840",
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
    minHeight: 32,
    paddingTop: 8,
  },
  sendBtn: {
    padding: 8,
    marginBottom: 4,
  },
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 22,
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
