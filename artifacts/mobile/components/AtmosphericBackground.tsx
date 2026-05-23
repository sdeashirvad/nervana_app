import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, View } from "react-native";

interface AtmosphericBackgroundProps {
  children?: React.ReactNode;
  variant?: "default" | "warm" | "deep";
}

export function AtmosphericBackground({
  children,
  variant = "default",
}: AtmosphericBackgroundProps) {
  const gradients: Record<string, [string, string, ...string[]]> = {
    default: ["#0A0B18", "#0F1120", "#171928"],
    warm: ["#0C0A14", "#130F20", "#1A1428"],
    deep: ["#080A16", "#0D0F1C", "#141728"],
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradients[variant]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      {/* Ambient glow top-right */}
      <View style={styles.glowTopRight} />
      {/* Ambient glow bottom-left */}
      <View style={styles.glowBottomLeft} />
      {/* Glow orb image */}
      <Image
        source={require("@/assets/images/glow-orb.png")}
        style={styles.orb}
        contentFit="cover"
        transition={800}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0B18",
  },
  glowTopRight: {
    position: "absolute",
    top: -120,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(99, 102, 220, 0.07)",
  },
  glowBottomLeft: {
    position: "absolute",
    bottom: 60,
    left: -100,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(180, 140, 110, 0.04)",
  },
  orb: {
    position: "absolute",
    top: -60,
    right: -80,
    width: 380,
    height: 380,
    opacity: 0.25,
  },
});
