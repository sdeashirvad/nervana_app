import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";

export function AtmosphericBackground({ children }: { children?: React.ReactNode }) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0D0F1A", "#1A1C2E"]}
        style={StyleSheet.absoluteFill}
      />
      <Image
        source={require("@/assets/images/glow-orb.png")}
        style={styles.orb}
        contentFit="cover"
        transition={1000}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0F1A",
  },
  orb: {
    position: "absolute",
    top: -100,
    right: -100,
    width: 400,
    height: 400,
    opacity: 0.4,
  },
});
