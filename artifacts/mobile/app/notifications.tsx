import React from "react";
import { StyleSheet, View, Text, FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { AtmosphericBackground } from "@/components/AtmosphericBackground";
import { PremiumCard } from "@/components/PremiumCard";
import { GlowText } from "@/components/GlowText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";
import { mockNotifications } from "@/data/mock";

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();

  const renderItem = ({ item }: { item: typeof mockNotifications[0] }) => (
    <View style={[styles.item, !item.read && { backgroundColor: colors.card }]}>
      <View style={styles.iconContainer}>
        <Feather name="bell" size={20} color={colors.primary} />
      </View>
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={[styles.title, !item.read && styles.titleUnread]}>{item.title}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <Text style={styles.body}>{item.body}</Text>
      </View>
    </View>
  );

  return (
    <AtmosphericBackground>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={28} color={colors.foreground} />
        </Pressable>
        <GlowText style={styles.headerTitle}>Notifications</GlowText>
        <View style={{ width: 44 }} />
      </View>

      <FlatList
        data={mockNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 16 }}
      />
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#252840",
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
  },
  item: {
    flexDirection: "row",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#252840",
  },
  iconContainer: {
    marginRight: 16,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  title: {
    fontFamily: "DMSans_500Medium",
    fontSize: 16,
    color: "#C8C5BE",
    flex: 1,
  },
  titleUnread: {
    color: "#F5F3EE",
    fontFamily: "DMSans_600SemiBold",
  },
  time: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: "#8A8882",
    marginLeft: 8,
  },
  body: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: "#8A8882",
    lineHeight: 20,
  },
});
