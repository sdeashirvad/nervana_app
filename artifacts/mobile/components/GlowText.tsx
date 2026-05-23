import React from "react";
import { StyleSheet, Text, TextProps } from "react-native";
import { useColors } from "@/hooks/useColors";

interface GlowTextProps extends TextProps {
  glowColor?: string;
}

export function GlowText({ children, style, glowColor, ...props }: GlowTextProps) {
  const colors = useColors();

  return (
    <Text
      style={[
        styles.text,
        {
          color: colors.foreground,
          textShadowColor: glowColor || colors.accent,
        },
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
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
});
