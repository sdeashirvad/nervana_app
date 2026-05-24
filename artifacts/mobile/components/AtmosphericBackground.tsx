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
  duration = 10000,
  driftY = 20,
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
      withTiming(1, { duration: 2400, easing: Easing.out(Easing.quad) })
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
        delay + 600,
        withRepeat(
          withTiming(driftX, {
            duration: duration * 1.4,
            easing: Easing.inOut(Easing.sin),
          }),
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
    default: ["#04050C", "#08091A", "#0C0E22"],
    warm:    ["#060410", "#0C0818", "#160C24"],
    deep:    ["#030408", "#070815", "#0A0B1E"],
  };

  return (
    <View style={styles.container}>
      {/* Base gradient */}
      <LinearGradient
        colors={gradients[variant]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Primary lavender glow — top right */}
      <FloatingOrb
        style={styles.glowPrimary}
        delay={0}
        duration={11000}
        driftY={22}
        driftX={-12}
      />

      {/* Secondary warm amber glow — mid left */}
      <FloatingOrb
        style={styles.glowWarm}
        delay={1800}
        duration={14000}
        driftY={-18}
        driftX={10}
      />

      {/* Tertiary deep violet glow — bottom right */}
      <FloatingOrb
        style={styles.glowViolet}
        delay={900}
        duration={12000}
        driftY={16}
        driftX={-8}
      />

      {/* Subtle center haze */}
      <View style={styles.centerHaze} />

      {/* Glow orb asset */}
      <Image
        source={require("@/assets/images/glow-orb.png")}
        style={styles.orb}
        contentFit="cover"
        transition={1400}
      />

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#04050C",
  },
  glowPrimary: {
    position: "absolute",
    top: -140,
    right: -80,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: "rgba(110, 107, 230, 0.09)",
  },
  glowWarm: {
    position: "absolute",
    top: "35%",
    left: -120,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(180, 140, 90, 0.055)",
  },
  glowViolet: {
    position: "absolute",
    bottom: 60,
    right: -100,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(90, 70, 180, 0.05)",
  },
  centerHaze: {
    position: "absolute",
    top: "45%",
    alignSelf: "center",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(100, 96, 210, 0.025)",
  },
  orb: {
    position: "absolute",
    top: -100,
    right: -110,
    width: 450,
    height: 450,
    opacity: 0.16,
  },
});
