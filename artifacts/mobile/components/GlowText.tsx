import React from "react";
import { Platform, StyleSheet, Text, TextProps } from "react-native";
import { useColors } from "@/hooks/useColors";

interface GlowTextProps extends TextProps {
  glowColor?: string;
}

export function GlowText({ children, style, glowColor, ...props }: GlowTextProps) {
  const colors = useColors();
  const shadowColor = glowColor || "rgba(123, 127, 240, 0.28)";

  const shadowStyle =
    Platform.OS === "web"
      ? ({ textShadow: `0px 1px 14px ${shadowColor}` } as any)
      : {
          textShadowColor: shadowColor,
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 14,
        };

  return (
    <Text
      style={[
        styles.text,
        { color: colors.foreground },
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
  },
});
