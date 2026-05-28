import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { Tabs, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

const TAB_CONFIG = [
  { name: "home", icon: "home" as const, label: "Mindspace" },
  { name: "calm", icon: "wind" as const, label: "Calm" },
  { name: "journal", icon: "edit-2" as const, label: "Journal" },
  { name: "patterns", icon: "bar-chart-2" as const, label: "Patterns" },
  { name: "profile", icon: "user" as const, label: "Profile" },
];

function TabItem({
  name,
  icon,
  label,
  isActive,
  onPress,
}: {
  name: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  isActive: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const dotOpacity = useSharedValue(isActive ? 1 : 0);
  const dotScale = useSharedValue(isActive ? 1 : 0);

  React.useEffect(() => {
    dotOpacity.value = withTiming(isActive ? 1 : 0, { duration: 200 });
    dotScale.value = withSpring(isActive ? 1 : 0, { damping: 18, stiffness: 260 });
  }, [isActive]);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
    transform: [{ scale: dotScale.value }],
  }));

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.88, { damping: 14, stiffness: 300 }, () => {
      scale.value = withSpring(1, { damping: 12, stiffness: 260 });
    });
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const activeColor = colors.primary;
  const inactiveColor = "rgba(255,255,255,0.32)";

  return (
    <Pressable onPress={handlePress} style={tabStyles.item} hitSlop={6}>
      <Animated.View style={[tabStyles.itemInner, scaleStyle]}>
        <Feather
          name={icon}
          size={21}
          color={isActive ? activeColor : inactiveColor}
        />
        <Text
          style={[
            tabStyles.label,
            { color: isActive ? activeColor : inactiveColor },
          ]}
        >
          {label}
        </Text>
        <Animated.View
          style={[
            tabStyles.dot,
            { backgroundColor: activeColor },
            dotStyle,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

const tabStyles = StyleSheet.create({
  item: { flex: 1, alignItems: "center" },
  itemInner: { alignItems: "center", gap: 4, paddingVertical: 8 },
  label: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    letterSpacing: 0.2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
});

function CustomTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  const colors = useColors();

  const bottomPad = Platform.OS === "web" ? 16 : insets.bottom;

  if (Platform.OS === "web") {
    return (
      <View
        style={[
          barStyles.container,
          {
            paddingBottom: bottomPad + 10,
            borderTopColor: "rgba(255,255,255,0.07)",
            backgroundColor: "rgba(6,7,15,0.88)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          } as any,
        ]}
      >
        <View style={barStyles.tabs}>
          {TAB_CONFIG.map((tab, i) => (
            <TabItem
              key={tab.name}
              name={tab.name}
              icon={tab.icon}
              label={tab.label}
              isActive={state.index === i}
              onPress={() => {
                const route = state.routes[i];
                const isFocused = state.index === i;
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
            />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={[barStyles.outerWrap, { paddingBottom: bottomPad }]}>
      <BlurView
        intensity={60}
        tint="dark"
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          barStyles.borderTop,
          { borderTopColor: "rgba(255,255,255,0.08)" },
        ]}
      />
      <View
        style={[
          barStyles.bgOverlay,
          { backgroundColor: "rgba(4,5,12,0.72)" },
        ]}
      />
      <View style={barStyles.tabs}>
        {TAB_CONFIG.map((tab, i) => (
          <TabItem
            key={tab.name}
            name={tab.name}
            icon={tab.icon}
            label={tab.label}
            isActive={state.index === i}
            onPress={() => {
              const route = state.routes[i];
              const isFocused = state.index === i;
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
          />
        ))}
      </View>
    </View>
  );
}

const barStyles = StyleSheet.create({
  outerWrap: {
    position: "relative",
    overflow: "hidden",
  },
  borderTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    borderTopWidth: 1,
  },
  bgOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    borderTopWidth: 1,
    paddingTop: 10,
  },
  tabs: {
    flexDirection: "row",
    paddingTop: 10,
    paddingHorizontal: 8,
  },
});

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="calm" />
      <Tabs.Screen name="journal" />
      <Tabs.Screen name="patterns" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
