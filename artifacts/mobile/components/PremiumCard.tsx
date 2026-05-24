import React from "react";
import { Platform, StyleSheet, View, ViewProps } from "react-native";
import { BlurView } from "expo-blur";
import { useColors } from "@/hooks/useColors";

interface PremiumCardProps extends ViewProps {
  glow?: boolean;
  variant?: "default" | "ghost" | "elevated";
}

export function PremiumCard({
  children,
  style,
  glow = false,
  variant = "default",
  ...props
}: PremiumCardProps) {
  const colors = useColors();

  if (Platform.OS === "web") {
    const boxShadow = glow
      ? `0 8px 32px rgba(148, 145, 240, 0.12), inset 0 1px 0 rgba(255,255,255,0.06)`
      : `0 4px 24px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.04)`;

    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor:
              variant === "ghost"
                ? "rgba(255, 255, 255, 0.025)"
                : "rgba(14, 15, 30, 0.68)",
            borderColor: glow
              ? "rgba(148, 145, 240, 0.18)"
              : "rgba(255, 255, 255, 0.07)",
            boxShadow,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          } as any,
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    );
  }

  return (
    <View style={[styles.outerWrapper, style]} {...props}>
      <BlurView
        intensity={variant === "ghost" ? 8 : 16}
        tint="dark"
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          styles.innerContainer,
          {
            backgroundColor: glow
              ? "rgba(18, 18, 40, 0.55)"
              : "rgba(14, 15, 30, 0.62)",
            borderColor: glow
              ? "rgba(148, 145, 240, 0.18)"
              : "rgba(255, 255, 255, 0.07)",
          },
        ]}
      >
        {glow && (
          <View style={styles.glowInner} />
        )}
        {children}
      </View>
    </View>
  );
}

const RADIUS = 20;

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS,
    borderWidth: 1,
    padding: 22,
    overflow: "hidden",
  },
  outerWrapper: {
    borderRadius: RADIUS,
    overflow: "hidden",
  },
  innerContainer: {
    borderRadius: RADIUS,
    borderWidth: 1,
    padding: 22,
    position: "relative",
    overflow: "hidden",
  },
  glowInner: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(148, 145, 240, 0.06)",
  },
});
