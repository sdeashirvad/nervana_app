import React, { useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import { Image } from "expo-image";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { GlowText } from "@/components/GlowText";
import { LinearGradient } from "expo-linear-gradient";

export default function SplashScreen() {
  const router = useRouter();

  const logoOpacity = useSharedValue(0);
  const logoY = useSharedValue(16);
  const subtitleOpacity = useSharedValue(0);
  const dotOpacity = useSharedValue(0);
  const bgOpacity = useSharedValue(0);

  useEffect(() => {
    bgOpacity.value = withTiming(1, { duration: 800 });
    logoOpacity.value = withDelay(
      300,
      withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) })
    );
    logoY.value = withDelay(
      300,
      withTiming(0, { duration: 1000, easing: Easing.out(Easing.cubic) })
    );
    subtitleOpacity.value = withDelay(
      700,
      withTiming(1, { duration: 900, easing: Easing.out(Easing.quad) })
    );
    dotOpacity.value = withDelay(
      1100,
      withRepeat(
        withSequence(
          withTiming(0.6, { duration: 900, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.2, { duration: 900, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );

    const timer = setTimeout(() => {
      router.replace("/onboarding");
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  const bgStyle = useAnimatedStyle(() => ({ opacity: bgOpacity.value }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateY: logoY.value }],
  }));
  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));
  const dotStyle = useAnimatedStyle(() => ({ opacity: dotOpacity.value }));

  return (
    <View style={styles.container}>
      <Animated.View style={[StyleSheet.absoluteFill, bgStyle]}>
        <LinearGradient
          colors={["#070813", "#0D0F1C", "#101428"]}
          style={StyleSheet.absoluteFill}
        />
        <Image
          source={require("@/assets/images/splash-bg.png")}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={800}
        />
        {/* Ambient top glow */}
        <View style={styles.topGlow} />
      </Animated.View>

      <View style={styles.content}>
        <Animated.View style={logoStyle}>
          <GlowText style={styles.logo}>Nervana</GlowText>
        </Animated.View>
        <Animated.Text style={[styles.subtitle, subtitleStyle]}>
          your mental exhale
        </Animated.Text>
        <Animated.View style={[styles.loadingDots, dotStyle]}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#070813",
  },
  topGlow: {
    position: "absolute",
    top: -100,
    alignSelf: "center",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(99, 102, 220, 0.08)",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  logo: {
    fontSize: 52,
    letterSpacing: 1,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 16,
    color: "#6A6860",
    letterSpacing: 3,
    textTransform: "lowercase",
  },
  loadingDots: {
    flexDirection: "row",
    gap: 6,
    marginTop: 32,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#7B7FF0",
    opacity: 0.5,
  },
});
