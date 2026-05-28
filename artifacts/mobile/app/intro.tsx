import React, { useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Dimensions,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AtmosphericBackground } from "@/components/AtmosphericBackground";
import { GlowText } from "@/components/GlowText";
import { useColors } from "@/hooks/useColors";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  FadeIn,
  FadeInUp,
  FadeOut,
  Easing,
  runOnJS,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SLIDES = [
  {
    eyebrow: "Welcome",
    headline: "Your mind doesn't\nneed more input.",
    sub: "It needs space.",
    variant: "default" as const,
    orbColor: "rgba(148,145,240,0.12)",
    accentColor: "#9491F0",
  },
  {
    eyebrow: "The science is clear",
    headline: "Even two minutes\nof stillness changes\nyour internal weather.",
    sub: "Small pauses. Real impact.",
    variant: "warm" as const,
    orbColor: "rgba(200,168,130,0.10)",
    accentColor: "#C8A882",
  },
  {
    eyebrow: "This is yours",
    headline: "Private. Calm.\nIntentional.",
    sub: "Built for the way modern minds actually work.",
    variant: "deep" as const,
    orbColor: "rgba(109,200,200,0.10)",
    accentColor: "#6DC8C8",
  },
];

function FloatingOrb({ color }: { color: string }) {
  const float = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    opacity.value = withTiming(1, { duration: 1200, easing: Easing.out(Easing.quad) });
    float.value = withRepeat(
      withSequence(
        withTiming(18, { duration: 3800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 3800, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, []);

  const s = useAnimatedStyle(() => ({
    transform: [{ translateY: float.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.orb, { backgroundColor: color }, s]} />
  );
}

export default function IntroScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const contentOpacity = useSharedValue(1);
  const contentTranslateY = useSharedValue(0);

  const topPad = Platform.OS === "web" ? 80 : insets.top + 40;
  const bottomPad = Platform.OS === "web" ? 60 : insets.bottom + 40;

  const slide = SLIDES[currentSlide];

  const goNext = () => {
    if (transitioning) return;
    setTransitioning(true);

    contentOpacity.value = withTiming(0, { duration: 260, easing: Easing.out(Easing.quad) });
    contentTranslateY.value = withTiming(-18, { duration: 260 }, () => {
      runOnJS(advanceSlide)();
    });
  };

  const advanceSlide = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide((s) => s + 1);
      contentTranslateY.value = 22;
      contentOpacity.value = 0;
      contentOpacity.value = withDelay(40, withTiming(1, { duration: 440, easing: Easing.out(Easing.cubic) }));
      contentTranslateY.value = withDelay(40, withTiming(0, { duration: 440, easing: Easing.out(Easing.cubic) }));
      setTransitioning(false);
    } else {
      router.replace("/onboarding");
    }
  };

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const isLast = currentSlide === SLIDES.length - 1;

  return (
    <AtmosphericBackground variant={slide.variant}>
      <FloatingOrb color={slide.orbColor} />

      <View style={[styles.container, { paddingTop: topPad, paddingBottom: bottomPad }]}>
        <Animated.View style={[styles.content, contentStyle]}>
          <Text style={[styles.eyebrow, { color: slide.accentColor }]}>
            {slide.eyebrow}
          </Text>

          <GlowText
            glowColor={`${slide.accentColor}30`}
            style={styles.headline}
          >
            {slide.headline}
          </GlowText>

          <Text style={[styles.sub, { color: colors.mutedForeground }]}>
            {slide.sub}
          </Text>
        </Animated.View>

        <View style={styles.bottomSection}>
          {/* Dots */}
          <View style={styles.dots}>
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      i === currentSlide
                        ? slide.accentColor
                        : "rgba(255,255,255,0.16)",
                    width: i === currentSlide ? 24 : 6,
                  },
                ]}
              />
            ))}
          </View>

          {/* CTA */}
          <Pressable onPress={goNext} style={styles.btnWrap}>
            <LinearGradient
              colors={
                isLast
                  ? ["#A09CF2", "#7B78E0", "#6A67D0"]
                  : ["rgba(255,255,255,0.10)", "rgba(255,255,255,0.06)"]
              }
              style={[
                styles.btn,
                !isLast && {
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.12)",
                },
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text
                style={[
                  styles.btnText,
                  {
                    color: isLast ? "#F0EDE8" : "rgba(255,255,255,0.80)",
                  },
                ]}
              >
                {isLast ? "Begin" : "Next"}
              </Text>
            </LinearGradient>
          </Pressable>

          {!isLast && (
            <Animated.View entering={FadeIn.duration(400)}>
              <Pressable
                onPress={() => router.replace("/onboarding")}
                hitSlop={14}
                style={styles.skipBtn}
              >
                <Text style={[styles.skipText, { color: "rgba(255,255,255,0.30)" }]}>
                  Skip
                </Text>
              </Pressable>
            </Animated.View>
          )}
        </View>
      </View>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: "space-between",
  },
  orb: {
    position: "absolute",
    top: -80,
    right: -60,
    width: 320,
    height: 320,
    borderRadius: 160,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  eyebrow: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 24,
  },
  headline: {
    fontSize: 40,
    lineHeight: 50,
    marginBottom: 22,
  },
  sub: {
    fontFamily: "DMSans_400Regular",
    fontSize: 18,
    lineHeight: 28,
    letterSpacing: 0.1,
  },
  bottomSection: {
    alignItems: "center",
    gap: 20,
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 8,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  btnWrap: {
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
  },
  btn: {
    paddingVertical: 19,
    alignItems: "center",
    borderRadius: 20,
  },
  btnText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 17,
    letterSpacing: 0.3,
  },
  skipBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 15,
  },
});
