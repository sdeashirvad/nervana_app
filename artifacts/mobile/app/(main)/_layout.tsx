import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";

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
  const dotScale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.1 : 1, { damping: 16, stiffness: 220 });
    dotScale.value = withTiming(focused ? 1 : 0, { duration: 220 });
  }, [focused]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dotScale.value }],
    opacity: dotScale.value,
  }));

  return (
    <View style={tabStyles.wrap}>
      <Animated.View style={iconStyle}>
        <Feather name={name as any} size={20} color={color} />
      </Animated.View>
      <Animated.View
        style={[
          tabStyles.dot,
          { backgroundColor: color },
          dotStyle,
        ]}
      />
    </View>
  );
}

const tabStyles = StyleSheet.create({
  wrap: { alignItems: "center", gap: 4 },
  dot: { width: 3, height: 3, borderRadius: 1.5 },
});

export default function TabLayout() {
  const colors = useColors();
  const safeAreaInsets = useSafeAreaInsets();
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  const tabBarHeight = isWeb ? 76 : 52 + safeAreaInsets.bottom;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: "rgba(255,255,255,0.22)",
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "transparent",
          borderTopWidth: 1,
          borderTopColor: "rgba(255, 255, 255, 0.06)",
          elevation: 0,
          height: tabBarHeight,
          paddingBottom: isWeb ? 10 : safeAreaInsets.bottom,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={isIOS ? 70 : 50}
            tint="dark"
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: isIOS
                  ? "rgba(6, 7, 15, 0.55)"
                  : "rgba(6, 7, 15, 0.88)",
              },
            ]}
          />
        ),
        tabBarLabelStyle: {
          fontFamily: "DMSans_400Regular",
          fontSize: 10,
          letterSpacing: 0.3,
          marginTop: 0,
        },
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
        options={{ href: null }}
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
