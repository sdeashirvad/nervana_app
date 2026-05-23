import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

interface AtmosphericBackgroundProps {
  children?: React.ReactNode;
  variant?: "default" | "warm" | "deep";
}

function FloatingOrb({
  style,
  delay = 0,
  duration = 8000,
  driftY = 18,
  driftX = 0,
}: {
  style: object;
  delay?: number;
  duration?: number;
  driftY?: number;
  driftX?: number;
}) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 2000, easing: Easing.out(Easing.quad) })
    );
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(driftY, { duration, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      )
    );
    if (driftX !== 0) {
      translateX.value = withDelay(
        delay + 400,
        withRepeat(
          withTiming(driftX, { duration: duration * 1.3, easing: Easing.inOut(Easing.sin) }),
          -1,
          true
        )
      );
    }
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
    ],
    opacity: opacity.value,
  }));

  return <Animated.View style={[style, animStyle]} />;
}

export function AtmosphericBackground({
  children,
  variant = "default",
}: AtmosphericBackgroundProps) {
  const gradients: Record<string, [string, string, ...string[]]> = {
    default: ["#080A16", "#0D0F1C", "#13162A"],
    warm: ["#0A0812", "#11091C", "#190F28"],
    deep: ["#060810", "#0A0C18", "#101320"],
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradients[variant]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      <FloatingOrb
        style={styles.glowTopRight}
        delay={0}
        duration={9000}
        driftY={20}
        driftX={-10}
      />
      <FloatingOrb
        style={styles.glowBottomLeft}
        delay={1500}
        duration={11000}
        driftY={-16}
        driftX={12}
      />
      <FloatingOrb
        style={styles.glowAccent}
        delay={800}
        duration={13000}
        driftY={14}
        driftX={-8}
      />

      <Image
        source={require("@/assets/images/glow-orb.png")}
        style={styles.orb}
        contentFit="cover"
        transition={1200}
      />

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080A16",
  },
  glowTopRight: {
    position: "absolute",
    top: -100,
    right: -60,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: "rgba(99, 102, 220, 0.08)",
  },
  glowBottomLeft: {
    position: "absolute",
    bottom: 80,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(180, 140, 110, 0.05)",
  },
  glowAccent: {
    position: "absolute",
    top: "40%",
    right: -120,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(120, 90, 180, 0.04)",
  },
  orb: {
    position: "absolute",
    top: -80,
    right: -100,
    width: 420,
    height: 420,
    opacity: 0.18,
  },
});
