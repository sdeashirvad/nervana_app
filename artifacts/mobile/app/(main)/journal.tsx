import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Pressable,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { AtmosphericBackground } from "@/components/AtmosphericBackground";
import { PremiumCard } from "@/components/PremiumCard";
import { GlowText } from "@/components/GlowText";
import { CalmButton } from "@/components/CalmButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";
import { mockJournalEntries } from "@/data/mock";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInUp,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";

type JournalEntry = (typeof mockJournalEntries)[0];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function JournalCard({ item, index }: { item: JournalEntry; index: number }) {
  const colors = useColors();

  return (
    <Animated.View entering={FadeInUp.delay(index * 80).duration(500)}>
      <PremiumCard style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={[styles.date, { color: colors.mutedForeground }]}>
            {item.date}
          </Text>
          <View style={[styles.moodBadge, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.moodBadgeText, { color: colors.mutedForeground }]}>
              {item.mood}
            </Text>
          </View>
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>{item.title}</Text>
        <Text
          style={[styles.content, { color: colors.secondaryForeground }]}
          numberOfLines={3}
        >
          {item.content}
        </Text>
        <View style={styles.tags}>
          {item.tags.map((tag) => (
            <View
              key={tag}
              style={[styles.tag, { backgroundColor: "transparent", borderColor: colors.border }]}
            >
              <Text style={[styles.tagText, { color: colors.mutedForeground }]}>
                #{tag}
              </Text>
            </View>
          ))}
        </View>
      </PremiumCard>
    </Animated.View>
  );
}

export default function JournalScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [composerOpen, setComposerOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");

  const fabScale = useSharedValue(1);
  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  const topPad = Platform.OS === "web" ? 64 : insets.top + 20;

  const handleFabPress = () => {
    fabScale.value = withSpring(0.92, { damping: 14 }, () => {
      fabScale.value = withSpring(1, { damping: 12 });
    });
    setComposerOpen(true);
  };

  const handleClose = () => {
    setComposerOpen(false);
    setDraftTitle("");
    setDraftContent("");
  };

  const renderItem = ({ item, index }: { item: JournalEntry; index: number }) => (
    <JournalCard item={item} index={index} />
  );

  return (
    <AtmosphericBackground>
      <Animated.View
        entering={FadeInUp.delay(40).duration(500)}
        style={[styles.header, { paddingTop: topPad }]}
      >
        <View>
          <GlowText style={styles.headerTitle}>Journal</GlowText>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Private, sacred, yours
          </Text>
        </View>
        <Text style={[styles.entryCount, { color: colors.mutedForeground }]}>
          {mockJournalEntries.length} entries
        </Text>
      </Animated.View>

      <FlatList
        data={mockJournalEntries}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: insets.bottom + 120,
        }}
        showsVerticalScrollIndicator={false}
      />

      <Animated.View
        style={[
          styles.fab,
          { bottom: insets.bottom + 90 },
          fabStyle,
        ]}
      >
        <Pressable onPress={handleFabPress}>
          <LinearGradient
            colors={["#8285F0", "#5E62D8"]}
            style={styles.fabGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Feather name="edit-2" size={20} color="#F5F3EE" />
          </LinearGradient>
        </Pressable>
      </Animated.View>

      <Modal
        visible={composerOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={[styles.composerContainer, { backgroundColor: "#0A0B18" }]}>
            <View style={[styles.composerHeader, { borderBottomColor: colors.border }]}>
              <Pressable onPress={handleClose} hitSlop={12}>
                <Text style={[styles.composerCancel, { color: colors.mutedForeground }]}>
                  Cancel
                </Text>
              </Pressable>
              <Text style={[styles.composerTitle, { color: colors.foreground }]}>
                New entry
              </Text>
              <Pressable onPress={handleClose} hitSlop={12}>
                <Text style={[styles.composerSave, { color: colors.primary }]}>
                  Save
                </Text>
              </Pressable>
            </View>

            <View style={styles.composerBody}>
              <Text style={[styles.composerDate, { color: colors.mutedForeground }]}>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
              <TextInput
                style={[styles.titleInput, { color: colors.foreground }]}
                placeholder="What's on your mind?"
                placeholderTextColor={colors.mutedForeground + "60"}
                value={draftTitle}
                onChangeText={setDraftTitle}
                autoFocus
                returnKeyType="next"
                maxLength={80}
              />
              <TextInput
                style={[styles.contentInput, { color: colors.secondaryForeground }]}
                placeholder="Let it out — this is just for you..."
                placeholderTextColor={colors.mutedForeground + "50"}
                value={draftContent}
                onChangeText={setDraftContent}
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 22,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(37, 40, 64, 0.8)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  headerTitle: { fontSize: 32 },
  subtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    marginTop: 4,
    letterSpacing: 0.1,
  },
  entryCount: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    marginBottom: 4,
  },
  card: { marginBottom: 14 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  date: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    letterSpacing: 0.1,
  },
  moodBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  moodBadgeText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    letterSpacing: 0.1,
  },
  title: {
    fontFamily: "DMSerifDisplay_400Regular",
    fontSize: 22,
    marginBottom: 10,
    lineHeight: 28,
  },
  content: {
    fontFamily: "DMSans_400Regular",
    fontSize: 15,
    color: "#C8C5BE",
    lineHeight: 23,
    marginBottom: 14,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  tagText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
  },
  fab: {
    position: "absolute",
    right: 22,
    width: 54,
    height: 54,
    borderRadius: 27,
    elevation: 8,
  },
  fabGradient: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },
  composerContainer: {
    flex: 1,
  },
  composerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    paddingTop: 20,
  },
  composerTitle: {
    fontFamily: "DMSans_500Medium",
    fontSize: 16,
    letterSpacing: 0.2,
  },
  composerCancel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 16,
  },
  composerSave: {
    fontFamily: "DMSans_500Medium",
    fontSize: 16,
  },
  composerBody: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  composerDate: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  titleInput: {
    fontFamily: "DMSerifDisplay_400Regular",
    fontSize: 26,
    lineHeight: 34,
    marginBottom: 20,
  },
  contentInput: {
    fontFamily: "DMSans_400Regular",
    fontSize: 16,
    lineHeight: 26,
    flex: 1,
    minHeight: 200,
  },
});
