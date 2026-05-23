import { BlurView } from "expo-blur";
import { Tabs, usePathname } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { Platform, StyleSheet, View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";

type TabName = "home" | "reflect" | "companion" | "journal" | "profile";

const TABS: { name: TabName; icon: string; label: string }[] = [
  { name: "home", icon: "home", label: "Home" },
  { name: "reflect", icon: "sun", label: "Reflect" },
  { name: "companion", icon: "message-circle", label: "Companion" },
  { name: "journal", icon: "book-open", label: "Journal" },
  { name: "profile", icon: "user", label: "Me" },
];

function TabIcon({
  name,
  focused,
  color,
}: {
  name: string;
  focused: boolean;
  color: string;
}) {
  const scale = useSharedValue(1);
  const dotOpacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.12 : 1, { damping: 14, stiffness: 200 });
    dotOpacity.value = withTiming(focused ? 1 : 0, { duration: 200 });
  }, [focused]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const dotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
  }));

  return (
    <View style={tabIconStyles.wrapper}>
      <Animated.View style={iconStyle}>
        <Feather name={name as any} size={21} color={color} />
      </Animated.View>
      <Animated.View style={[tabIconStyles.dot, { backgroundColor: color }, dotStyle]} />
    </View>
  );
}

const tabIconStyles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
});

export default function TabLayout() {
  const colors = useColors();
  const safeAreaInsets = useSafeAreaInsets();
  const isIOS = Platform.OS === "ios";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: "#3A3858",
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : "rgba(8, 10, 22, 0.96)",
          borderTopWidth: 1,
          borderTopColor: "rgba(123, 127, 240, 0.10)",
          elevation: 0,
          paddingBottom: safeAreaInsets.bottom,
          height: 56 + safeAreaInsets.bottom,
          ...(Platform.OS === "web" ? { height: 80, paddingBottom: 8 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={90}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: "rgba(8, 10, 22, 0.97)" },
              ]}
            />
          ),
        tabBarLabelStyle: {
          fontFamily: "DMSans_400Regular",
          fontSize: 10,
          letterSpacing: 0.3,
          marginTop: 0,
        },
        tabBarIcon: ({ color, focused, name }: any) => (
          <TabIcon name={name} focused={focused} color={color} />
        ),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reflect"
        options={{
          title: "Reflect",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="sun" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="companion"
        options={{
          title: "Companion",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="message-circle" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: "Journal",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="book-open" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Me",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="user" focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
