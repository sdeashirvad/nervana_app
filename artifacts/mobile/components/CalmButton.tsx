import React from "react";
import { Platform, Pressable, StyleSheet, Text, ViewStyle } from "react-native";
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
    scale.value = withSpring(0.965, { damping: 20, stiffness: 280 });
    opacity.value = withTiming(0.85, { duration: 70 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 16, stiffness: 240 });
    opacity.value = withTiming(1, { duration: 110 });
  };

  const handlePress = () => {
    if (disabled) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  if (variant === "secondary") {
    const boxShadow =
      Platform.OS === "web"
        ? ("0 2px 16px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.05)" as any)
        : undefined;

    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          styles.secondaryButton,
          {
            borderColor: "rgba(255,255,255,0.10)",
            backgroundColor:
              Platform.OS === "web"
                ? "rgba(255,255,255,0.04)"
                : "rgba(255,255,255,0.03)",
            boxShadow,
          } as any,
          animatedStyle,
          style,
        ]}
      >
        <Text style={[styles.secondaryText, { color: colors.secondaryForeground }]}>
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

  const primaryBoxShadow =
    Platform.OS === "web"
      ? ("0 4px 24px rgba(148, 145, 240, 0.28), 0 1px 0 rgba(255,255,255,0.12) inset" as any)
      : undefined;

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        styles.container,
        { opacity: disabled ? 0.45 : 1, boxShadow: primaryBoxShadow } as any,
        animatedStyle,
        style,
      ]}
    >
      <LinearGradient
        colors={["#A09CF2", "#7B78E0", "#6A67D0"]}
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
    borderRadius: 32,
    overflow: "hidden",
  },
  gradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 16,
    color: "#F0EDE8",
    letterSpacing: 0.4,
  },
  secondaryButton: {
    paddingVertical: 17,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 32,
    borderWidth: 1,
  },
  secondaryText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 16,
    letterSpacing: 0.3,
  },
  ghostButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  ghostText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 15,
    letterSpacing: 0.2,
  },
});
