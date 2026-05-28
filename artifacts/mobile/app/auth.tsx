import React from "react";
import { StyleSheet, View, Text, Platform, Alert, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { AtmosphericBackground } from "@/components/AtmosphericBackground";
import { CalmButton } from "@/components/CalmButton";
import { GlowText } from "@/components/GlowText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInUp, FadeIn } from "react-native-reanimated";

function SocialButton({
  label,
  icon,
  onPress,
  delay,
}: {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  delay: number;
}) {
  const colors = useColors();
  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(600)}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.socialBtn,
          {
            backgroundColor: pressed ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.04)",
            borderColor: "rgba(255,255,255,0.11)",
          },
        ]}
      >
        <View style={styles.socialIcon}>{icon}</View>
        <Text style={[styles.socialLabel, { color: colors.foreground }]}>{label}</Text>
        <View style={{ width: 24 }} />
      </Pressable>
    </Animated.View>
  );
}

export default function AuthScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();

  const topPad = Platform.OS === "web" ? 80 : insets.top + 60;
  const bottomPad = Platform.OS === "web" ? 52 : insets.bottom + 44;

  const handleComingSoon = (provider: string) => {
    Alert.alert(
      `${provider} — Coming Soon`,
      "We're working on full authentication. For now, continue as a guest to explore Nervana.",
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

        <Animated.View entering={FadeInUp.delay(200).duration(700)} style={styles.buttons}>
          <SocialButton
            label="Continue with Google"
            icon={
              <Text style={styles.googleG}>G</Text>
            }
            onPress={() => handleComingSoon("Google")}
            delay={240}
          />
          <SocialButton
            label="Continue with Apple"
            icon={<Feather name="smartphone" size={16} color="rgba(255,255,255,0.75)" />}
            onPress={() => handleComingSoon("Apple")}
            delay={310}
          />
          <SocialButton
            label="Continue with Email"
            icon={<Feather name="mail" size={16} color="rgba(255,255,255,0.75)" />}
            onPress={() => handleComingSoon("Email")}
            delay={380}
          />

          <Animated.View entering={FadeInUp.delay(460).duration(600)} style={styles.separator}>
            <View style={[styles.line, { backgroundColor: "rgba(255,255,255,0.07)" }]} />
            <Text style={[styles.orText, { color: colors.mutedForeground }]}>or</Text>
            <View style={[styles.line, { backgroundColor: "rgba(255,255,255,0.07)" }]} />
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(520).duration(600)}>
            <CalmButton
              title="Continue as Guest"
              variant="secondary"
              onPress={handleGuest}
              style={styles.guestBtn}
            />
          </Animated.View>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(660).duration(700)}>
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
    paddingHorizontal: 28,
    justifyContent: "space-between",
  },
  brand: { alignItems: "center", gap: 8 },
  logo: { fontSize: 48, marginBottom: 4, letterSpacing: 0.5 },
  tagline: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    letterSpacing: 2.5,
    textTransform: "lowercase",
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 17,
    lineHeight: 27,
    textAlign: "center",
  },
  buttons: { width: "100%", gap: 10 },
  socialBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 17,
    paddingHorizontal: 22,
  },
  socialIcon: { width: 24, alignItems: "center" },
  socialLabel: {
    flex: 1,
    fontFamily: "DMSans_500Medium",
    fontSize: 16,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  googleG: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 17,
    color: "rgba(255,255,255,0.75)",
    lineHeight: 20,
  },
  separator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
    gap: 14,
  },
  line: { flex: 1, height: 1 },
  orText: { fontFamily: "DMSans_400Regular", fontSize: 13, letterSpacing: 0.3 },
  guestBtn: {},
  privacy: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    opacity: 0.65,
  },
});
