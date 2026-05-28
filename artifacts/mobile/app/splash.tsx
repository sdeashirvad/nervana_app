import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
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

  const bgOpacity   = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const logoY       = useSharedValue(20);
  const taglineOp   = useSharedValue(0);
  const dotsOp      = useSharedValue(0);

  useEffect(() => {
    bgOpacity.value   = withTiming(1, { duration: 1000 });
    logoOpacity.value = withDelay(400, withTiming(1, { duration: 1100, easing: Easing.out(Easing.cubic) }));
    logoY.value       = withDelay(400, withTiming(0, { duration: 1100, easing: Easing.out(Easing.cubic) }));
    taglineOp.value   = withDelay(900, withTiming(1, { duration: 900, easing: Easing.out(Easing.quad) }));
    dotsOp.value      = withDelay(
      1200,
      withRepeat(
        withSequence(
          withTiming(0.55, { duration: 950, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.15, { duration: 950, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );

    const t = setTimeout(() => router.replace("/intro"), 3000);
    return () => clearTimeout(t);
  }, []);

  const bgStyle      = useAnimatedStyle(() => ({ opacity: bgOpacity.value }));
  const logoStyle    = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateY: logoY.value }],
  }));
  const taglineStyle = useAnimatedStyle(() => ({ opacity: taglineOp.value }));
  const dotsStyle    = useAnimatedStyle(() => ({ opacity: dotsOp.value }));

  return (
    <View style={styles.root}>
      <Animated.View style={[StyleSheet.absoluteFill, bgStyle]}>
        <LinearGradient
          colors={["#040509", "#080A18", "#0C0E24"]}
          style={StyleSheet.absoluteFill}
        />
        <Image
          source={require("@/assets/images/splash-bg.png")}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={1000}
        />
        <View style={styles.topGlow} />
        <View style={styles.bottomGlow} />
      </Animated.View>

      <View style={styles.content}>
        <Animated.View style={logoStyle}>
          <GlowText style={styles.logo}>Nervana</GlowText>
        </Animated.View>

        <Animated.Text style={[styles.tagline, taglineStyle]}>
          your mental exhale
        </Animated.Text>

        <Animated.View style={[styles.dots, dotsStyle]}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#040509" },
  topGlow: {
    position: "absolute",
    top: -80,
    alignSelf: "center",
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: "rgba(110, 107, 230, 0.07)",
  },
  bottomGlow: {
    position: "absolute",
    bottom: -60,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(180, 140, 90, 0.04)",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  logo: { fontSize: 54, letterSpacing: 1, marginBottom: 4 },
  tagline: {
    fontFamily: "DMSans_400Regular",
    fontSize: 15,
    color: "rgba(255,255,255,0.28)",
    letterSpacing: 3.5,
    textTransform: "lowercase",
  },
  dots: { flexDirection: "row", gap: 6, marginTop: 36 },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(148, 145, 240, 0.7)",
  },
});
