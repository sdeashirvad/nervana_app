import React from "react";
import { StyleSheet, View, Text, FlatList, Pressable } from "react-native";
import { AtmosphericBackground } from "@/components/AtmosphericBackground";
import { PremiumCard } from "@/components/PremiumCard";
import { GlowText } from "@/components/GlowText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";
import { mockJournalEntries } from "@/data/mock";
import { LinearGradient } from "expo-linear-gradient";

export default function JournalScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();

  const renderItem = ({ item }: { item: typeof mockJournalEntries[0] }) => (
    <PremiumCard style={styles.card}>
      <Text style={styles.date}>{item.date}</Text>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.content} numberOfLines={3}>
        {item.content}
      </Text>
      <View style={styles.tags}>
        <View style={[styles.tag, { backgroundColor: colors.muted }]}>
          <Text style={styles.tagText}>{item.mood}</Text>
        </View>
        {item.tags.map((tag) => (
          <View key={tag} style={[styles.tag, { backgroundColor: colors.card }]}>
            <Text style={styles.tagText}>#{tag}</Text>
          </View>
        ))}
      </View>
    </PremiumCard>
  );

  return (
    <AtmosphericBackground>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <GlowText style={styles.headerTitle}>Journal</GlowText>
        <Text style={styles.subtitle}>private, sacred, yours</Text>
      </View>

      <FlatList
        data={mockJournalEntries}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 100 }}
      />

      <Pressable style={[styles.fab, { bottom: insets.bottom + 90 }]}>
        <LinearGradient
          colors={["#7B7FF0", "#5B5FD0"]}
          style={styles.fabGradient}
        >
          <Feather name="plus" size={24} color="#F5F3EE" />
        </LinearGradient>
      </Pressable>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#252840",
  },
  headerTitle: {
    fontSize: 32,
  },
  subtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 16,
    color: "#8A8882",
    marginTop: 4,
  },
  card: {
    marginBottom: 16,
  },
  date: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: "#8A8882",
    marginBottom: 8,
  },
  title: {
    fontFamily: "DMSerifDisplay_400Regular",
    fontSize: 22,
    color: "#F5F3EE",
    marginBottom: 12,
  },
  content: {
    fontFamily: "DMSans_400Regular",
    fontSize: 15,
    color: "#C8C5BE",
    lineHeight: 22,
    marginBottom: 16,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#252840",
  },
  tagText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    color: "#8A8882",
  },
  fab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  fabGradient: {
    flex: 1,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
