import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { AtmosphericBackground } from "@/components/AtmosphericBackground";
import { GlowText } from "@/components/GlowText";

export default function ReflectScreen() {
  return (
    <AtmosphericBackground>
      <View style={styles.container}>
        <GlowText style={styles.title}>Reflect</GlowText>
        <Text style={styles.subtitle}>Daily Emotional Check-In</Text>
      </View>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
  },
  subtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 16,
    color: "#8A8882",
  },
});
