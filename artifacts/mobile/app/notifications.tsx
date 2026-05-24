import React from "react";
import { StyleSheet, View, Text, FlatList, Pressable, Platform } from "react-native";
import { useRouter } from "expo-router";
import { AtmosphericBackground } from "@/components/AtmosphericBackground";
import { GlowText } from "@/components/GlowText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";
import { mockNotifications } from "@/data/mock";
import Animated, { FadeInUp } from "react-native-reanimated";

type NotifItem = (typeof mockNotifications)[0];

function NotifRow({ item, index }: { item: NotifItem; index: number }) {
  const colors = useColors();
  const unread = !item.read;

  return (
    <Animated.View entering={FadeInUp.delay(index * 55).duration(480)}>
      <View
        style={[
          styles.item,
          {
            borderBottomColor: "rgba(255,255,255,0.06)",
            backgroundColor: unread ? "rgba(148,145,240,0.05)" : "transparent",
          },
        ]}
      >
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor: unread
                ? "rgba(148,145,240,0.12)"
                : "rgba(255,255,255,0.04)",
            },
          ]}
        >
          <Feather
            name="wind"
            size={15}
            color={unread ? colors.primary : "rgba(255,255,255,0.30)"}
          />
        </View>
        <View style={styles.itemContent}>
          <View style={styles.itemRow}>
            <Text
              style={[
                styles.itemTitle,
                {
                  color: unread ? colors.foreground : colors.secondaryForeground,
                  fontFamily: unread ? "DMSans_500Medium" : "DMSans_400Regular",
                },
              ]}
            >
              {item.title}
            </Text>
            <Text style={[styles.itemTime, { color: colors.mutedForeground }]}>
              {item.time}
            </Text>
          </View>
          <Text style={[styles.itemBody, { color: colors.mutedForeground }]}>
            {item.body}
          </Text>
        </View>
        {unread && (
          <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
        )}
      </View>
    </Animated.View>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const topPad = Platform.OS === "web" ? 64 : insets.top + 20;
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  return (
    <AtmosphericBackground>
      <Animated.View
        entering={FadeInUp.delay(40).duration(600)}
        style={[styles.header, { paddingTop: topPad, borderBottomColor: "rgba(255,255,255,0.06)" }]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={14}>
          <Feather name="chevron-left" size={25} color={"rgba(255,255,255,0.55)"} />
        </Pressable>
        <View style={styles.headerCenter}>
          <GlowText style={styles.headerTitle}>Pauses & reminders</GlowText>
          {unreadCount > 0 && (
            <Text style={[styles.unreadCount, { color: colors.primary }]}>
              {unreadCount} new
            </Text>
          )}
        </View>
        <View style={{ width: 44 }} />
      </Animated.View>

      <FlatList
        data={mockNotifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <NotifRow item={item} index={index} />}
        contentContainerStyle={{ paddingTop: 4, paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              You're all caught up.{"\n"}We'll reach out gently.
            </Text>
          </View>
        }
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
    paddingBottom: 18,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 8 },
  headerCenter: { alignItems: "center" },
  headerTitle: { fontSize: 21 },
  unreadCount: { fontFamily: "DMSans_400Regular", fontSize: 12, marginTop: 2 },
  item: {
    flexDirection: "row",
    paddingHorizontal: 22,
    paddingVertical: 18,
    borderBottomWidth: 1,
    alignItems: "flex-start",
    position: "relative",
  },
  iconWrap: {
    width: 33,
    height: 33,
    borderRadius: 16.5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    marginTop: 1,
  },
  itemContent: { flex: 1 },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 5,
  },
  itemTitle: { fontSize: 15, flex: 1, lineHeight: 21 },
  itemTime: { fontFamily: "DMSans_400Regular", fontSize: 12, marginLeft: 10, marginTop: 2 },
  itemBody: { fontFamily: "DMSans_400Regular", fontSize: 14, lineHeight: 21 },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: "absolute",
    right: 16,
    top: 22,
  },
  empty: { paddingTop: 80, alignItems: "center" },
  emptyText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 16,
    lineHeight: 25,
    textAlign: "center",
  },
});
