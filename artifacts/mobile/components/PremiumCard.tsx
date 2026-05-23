import React from "react";
import { Platform, StyleSheet, View, ViewProps } from "react-native";
import { useColors } from "@/hooks/useColors";

interface PremiumCardProps extends ViewProps {
  glow?: boolean;
}

export function PremiumCard({ children, style, glow = false, ...props }: PremiumCardProps) {
  const colors = useColors();

  const shadowStyle =
    Platform.OS === "web"
      ? ({
          boxShadow: glow
            ? `0px 6px 24px ${colors.primary}18`
            : "0px 4px 18px rgba(0,0,0,0.18)",
        } as any)
      : {
          shadowColor: glow ? colors.primary : "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: glow ? 0.12 : 0.06,
          shadowRadius: 20,
          elevation: 3,
        };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: glow ? colors.primary + "28" : colors.border,
        },
        shadowStyle,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 22,
  },
});
