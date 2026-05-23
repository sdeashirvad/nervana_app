import React from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
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
      ? withTiming(colors.primary, { duration: 200 })
      : withTiming(colors.card, { duration: 200 }),
    borderColor: selected
      ? withTiming(colors.primary, { duration: 200 })
      : withTiming(colors.border, { duration: 200 }),
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(selected ? 1.06 : 1);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
    scale.value = withSpring(1.06, {}, () => {
      scale.value = withSpring(1);
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
            color: selected ? colors.primaryForeground : colors.foreground,
            fontFamily: selected ? "DMSans_600SemiBold" : "DMSans_400Regular",
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
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 15,
  },
});
