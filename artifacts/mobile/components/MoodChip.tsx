import React from "react";
import { Pressable, StyleSheet, Text, ViewStyle, Platform } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface MoodChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export function MoodChip({ label, selected = false, onPress, style }: MoodChipProps) {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: selected
      ? withTiming(colors.primary + "28", { duration: 250 })
      : withTiming(colors.card, { duration: 250 }),
    borderColor: selected
      ? withTiming(colors.primary + "70", { duration: 250 })
      : withTiming(colors.border, { duration: 250 }),
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.94, { damping: 20, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 14, stiffness: 200 });
  };

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
    scale.value = withSpring(1.05, { damping: 12 }, () => {
      scale.value = withSpring(1, { damping: 14 });
    });
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, animatedStyle, style]}
    >
      <Text
        style={[
          styles.text,
          {
            color: selected ? colors.primary : colors.secondaryForeground,
            fontFamily: selected ? "DMSans_500Medium" : "DMSans_400Regular",
          },
        ]}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 30,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 14,
    letterSpacing: 0.1,
  },
});
