import React from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Pressable,
  Platform,
} from "react-native";
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
  const isUnread = !item.read;

  return (
    <Animated.View entering={FadeInUp.delay(index * 60).duration(450)}>
      <View
        style={[
          styles.item,
          {
            borderBottomColor: colors.border,
            backgroundColor: isUnread ? colors.card + "CC" : "transparent",
          },
        ]}
      >
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor: isUnread
                ? colors.primary + "18"
                : colors.secondary,
            },
          ]}
        >
          <Feather
            name="wind"
            size={16}
            color={isUnread ? colors.primary : colors.mutedForeground}
          />
        </View>
        <View style={styles.content}>
          <View style={styles.row}>
            <Text
              style={[
                styles.title,
                {
                  color: isUnread ? colors.foreground : colors.secondaryForeground,
                  fontFamily: isUnread ? "DMSans_500Medium" : "DMSans_400Regular",
                },
              ]}
            >
              {item.title}
            </Text>
            <Text style={[styles.time, { color: colors.mutedForeground }]}>
              {item.time}
            </Text>
          </View>
          <Text style={[styles.body, { color: colors.mutedForeground }]}>
            {item.body}
          </Text>
        </View>
        {isUnread && (
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

  const renderItem = ({ item, index }: { item: NotifItem; index: number }) => (
    <NotifRow item={item} index={index} />
  );

  return (
    <AtmosphericBackground>
      <Animated.View
        entering={FadeInUp.delay(40).duration(500)}
        style={[
          styles.header,
          { paddingTop: topPad, borderBottomColor: colors.border },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Feather name="chevron-left" size={26} color={colors.foreground} />
        </Pressable>
        <View style={styles.headerCenter}>
          <GlowText style={styles.headerTitle}>Pauses & reminders</GlowText>
          {unreadCount > 0 && (
            <Text style={[styles.unreadBadge, { color: colors.primary }]}>
              {unreadCount} new
            </Text>
          )}
        </View>
        <View style={{ width: 44 }} />
      </Animated.View>

      <FlatList
        data={mockNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingTop: 8,
          paddingBottom: insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
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
  headerTitle: { fontSize: 22 },
  unreadBadge: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  item: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    alignItems: "flex-start",
    position: "relative",
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    marginTop: 1,
  },
  content: { flex: 1 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 5,
  },
  title: {
    fontSize: 15,
    flex: 1,
    lineHeight: 21,
  },
  time: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    marginLeft: 10,
    marginTop: 2,
  },
  body: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    lineHeight: 21,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: "absolute",
    right: 16,
    top: 22,
  },
  emptyState: {
    paddingTop: 80,
    alignItems: "center",
  },
  emptyText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 16,
    lineHeight: 25,
    textAlign: "center",
  },
});
