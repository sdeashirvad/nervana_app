import React from "react";
import { StyleSheet, View, Text, Platform, Alert } from "react-native";
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
  const bottomPad = Platform.OS === "web" ? 52 : insets.bottom + 44;

  const handleComingSoon = () => {
    Alert.alert(
      "Coming Soon",
      "We're working on this. For now, continue as a guest to explore Nervana.",
      [{ text: "Got it", style: "default" }]
    );
  };

  const handleGuest = () => {
    router.push("/guest-name");
  };

  return (
    <AtmosphericBackground>
      <View style={[styles.container, { paddingTop: topPad, paddingBottom: bottomPad }]}>

        <Animated.View entering={FadeInUp.delay(60).duration(800)} style={styles.brand}>
          <GlowText style={styles.logo}>Nervana</GlowText>
          <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
            your mental exhale
          </Text>
          <Text style={[styles.subtitle, { color: colors.secondaryForeground }]}>
            A private space to decompress,{"\n"}reflect, and breathe.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(260).duration(700)} style={styles.buttons}>
          <CalmButton
            title="Continue with Google"
            onPress={handleComingSoon}
            style={styles.button}
          />
          <CalmButton
            title="Continue with Email"
            onPress={handleComingSoon}
            style={styles.button}
          />

          <View style={styles.separator}>
            <View style={[styles.line, { backgroundColor: "rgba(255,255,255,0.07)" }]} />
            <Text style={[styles.orText, { color: colors.mutedForeground }]}>or</Text>
            <View style={[styles.line, { backgroundColor: "rgba(255,255,255,0.07)" }]} />
          </View>

          <CalmButton
            title="Continue as Guest"
            variant="secondary"
            onPress={handleGuest}
            style={styles.button}
          />
        </Animated.View>

        <Animated.View entering={FadeIn.delay(520).duration(700)}>
          <Text style={[styles.privacy, { color: colors.mutedForeground }]}>
            Your reflections are private and encrypted.{"\n"}We never sell your data.
          </Text>
        </Animated.View>
      </View>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: "space-between",
  },
  brand: { alignItems: "center", gap: 8 },
  logo: { fontSize: 48, marginBottom: 4, letterSpacing: 0.5 },
  tagline: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    letterSpacing: 2.5,
    textTransform: "lowercase",
    marginBottom: 18,
  },
  subtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 17,
    lineHeight: 27,
    textAlign: "center",
  },
  buttons: { width: "100%" },
  button: { marginBottom: 12 },
  separator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    gap: 14,
  },
  line: { flex: 1, height: 1 },
  orText: { fontFamily: "DMSans_400Regular", fontSize: 13, letterSpacing: 0.3 },
  privacy: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    opacity: 0.65,
  },
});
