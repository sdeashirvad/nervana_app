import React from "react";
import { StyleSheet, View, Text, Platform } from "react-native";
import { useRouter } from "expo-router";
import { AtmosphericBackground } from "@/components/AtmosphericBackground";
import { CalmButton } from "@/components/CalmButton";
import { GlowText } from "@/components/GlowText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import Animated, { FadeInUp, FadeIn } from "react-native-reanimated";

export default function AuthScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();

  const topPad = Platform.OS === "web" ? 80 : insets.top + 60;
  const bottomPad = Platform.OS === "web" ? 48 : insets.bottom + 40;

  const handleContinue = () => {
    router.push("/flow");
  };

  return (
    <AtmosphericBackground>
      <View
        style={[
          styles.container,
          { paddingTop: topPad, paddingBottom: bottomPad },
        ]}
      >
        <Animated.View
          entering={FadeInUp.delay(60).duration(700)}
          style={styles.header}
        >
          <GlowText style={styles.logo}>Nervana</GlowText>
          <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
            your mental exhale
          </Text>
          <Text style={[styles.subtitle, { color: colors.secondaryForeground }]}>
            A private space to decompress,{"\n"}reflect, and breathe.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(240).duration(600)}
          style={styles.buttons}
        >
          <CalmButton
            title="Continue with Google"
            onPress={handleContinue}
            style={styles.button}
          />
          <CalmButton
            title="Continue with Email"
            onPress={handleContinue}
            style={styles.button}
          />

          <View style={styles.separator}>
            <View style={[styles.line, { backgroundColor: colors.border }]} />
            <Text style={[styles.separatorText, { color: colors.mutedForeground }]}>
              or
            </Text>
            <View style={[styles.line, { backgroundColor: colors.border }]} />
          </View>

          <CalmButton
            title="Continue as Guest"
            variant="secondary"
            onPress={handleContinue}
            style={styles.button}
          />
        </Animated.View>

        <Animated.Text
          entering={FadeIn.delay(500).duration(600)}
          style={[styles.privacyNote, { color: colors.mutedForeground }]}
        >
          Your reflections are private and encrypted.{"\n"}We never sell your data.
        </Animated.Text>
      </View>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    gap: 8,
  },
  logo: {
    fontSize: 46,
    marginBottom: 4,
  },
  tagline: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    letterSpacing: 2,
    marginBottom: 20,
  },
  subtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 17,
    lineHeight: 26,
    textAlign: "center",
  },
  buttons: {
    width: "100%",
  },
  button: {
    marginBottom: 12,
  },
  separator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
  },
  separatorText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    paddingHorizontal: 16,
    letterSpacing: 0.3,
  },
  privacyNote: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    opacity: 0.7,
  },
});
