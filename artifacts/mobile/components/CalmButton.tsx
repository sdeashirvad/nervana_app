import React from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CalmButtonProps {
  onPress: () => void;
  title: string;
  variant?: "primary" | "secondary" | "ghost";
  style?: ViewStyle;
  disabled?: boolean;
}

export function CalmButton({
  onPress,
  title,
  variant = "primary",
  style,
  disabled = false,
}: CalmButtonProps) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 18, stiffness: 260 });
    opacity.value = withTiming(0.88, { duration: 80 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 220 });
    opacity.value = withTiming(1, { duration: 120 });
  };

  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  if (variant === "secondary") {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          styles.secondaryButton,
          { borderColor: colors.border },
          animatedStyle,
          style,
        ]}
      >
        <Text style={[styles.secondaryText, { color: colors.mutedForeground }]}>
          {title}
        </Text>
      </AnimatedPressable>
    );
  }

  if (variant === "ghost") {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[styles.ghostButton, animatedStyle, style]}
      >
        <Text style={[styles.ghostText, { color: colors.primary }]}>{title}</Text>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[styles.container, animatedStyle, style, disabled && { opacity: 0.5 }]}
    >
      <LinearGradient
        colors={["#8285F0", "#6063D8"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.primaryText}>{title}</Text>
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 30,
    overflow: "hidden",
  },
  gradient: {
    paddingVertical: 17,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 16,
    color: "#F5F3EE",
    letterSpacing: 0.3,
  },
  secondaryButton: {
    paddingVertical: 17,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  secondaryText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 16,
    letterSpacing: 0.2,
  },
  ghostButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  ghostText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 15,
    letterSpacing: 0.2,
  },
});
