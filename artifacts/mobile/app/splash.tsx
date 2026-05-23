import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
  withSpring,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { GlowText } from "@/components/GlowText";

export default function SplashScreen() {
  const router = useRouter();
  
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.9);
  const subtitleOpacity = useSharedValue(0);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 1200, easing: Easing.out(Easing.cubic) });
    logoScale.value = withTiming(1, { duration: 1200, easing: Easing.out(Easing.cubic) });
    subtitleOpacity.value = withDelay(400, withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) }));

    const timer = setTimeout(() => {
      router.replace("/onboarding");
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/splash-bg.png")}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
      <View style={styles.content}>
        <Animated.View style={logoStyle}>
          <GlowText style={styles.logo}>Nervana</GlowText>
        </Animated.View>
        <Animated.Text style={[styles.subtitle, subtitleStyle]}>
          your mental exhale
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0F1A",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    fontSize: 48,
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 18,
    color: "#8A8882",
    letterSpacing: 2,
  },
});
