import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";
import { BlurView } from "expo-blur";
import { useColors } from "@/hooks/useColors";

interface PremiumCardProps extends ViewProps {
  useBlur?: boolean;
}

export function PremiumCard({ children, style, useBlur = false, ...props }: PremiumCardProps) {
  const colors = useColors();

  const content = (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: colors.accent,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );

  if (useBlur) {
    return (
      <BlurView intensity={20} tint="dark" style={[styles.blurWrapper, style]}>
        {content}
      </BlurView>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  blurWrapper: {
    borderRadius: 24,
    overflow: "hidden",
  },
});
