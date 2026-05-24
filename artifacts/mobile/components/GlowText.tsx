import React from "react";
import { Platform, StyleSheet, Text, TextProps } from "react-native";
import { useColors } from "@/hooks/useColors";

interface GlowTextProps extends TextProps {
  glowColor?: string;
  dim?: boolean;
}

export function GlowText({
  children,
  style,
  glowColor,
  dim = false,
  ...props
}: GlowTextProps) {
  const colors = useColors();
  const shadowColor = glowColor || "rgba(148, 145, 240, 0.22)";
  const shadowIntensity = dim ? 0.6 : 1;

  const shadowStyle =
    Platform.OS === "web"
      ? ({ textShadow: `0px 2px 18px ${shadowColor}` } as any)
      : {
          textShadowColor: shadowColor,
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 18,
        };

  return (
    <Text
      style={[
        styles.text,
        { color: colors.foreground, opacity: dim ? 0.7 : 1 },
        shadowStyle,
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: "DMSerifDisplay_400Regular",
    letterSpacing: 0.2,
  },
});
