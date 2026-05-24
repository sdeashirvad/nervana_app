import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { AtmosphericBackground } from "@/components/AtmosphericBackground";
import { CalmButton } from "@/components/CalmButton";
import { GlowText } from "@/components/GlowText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  FadeInUp,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    num: "01",
    title: "You carry more than\nmost people see.",
    subtitle:
      "The late nights. The endless context-switching. The performance of being fine when you're not.",
  },
  {
    num: "02",
    title: "Decompression\nisn't weakness.",
    subtitle:
      "Your mind needs space to process what your calendar never scheduled. That space is not optional.",
  },
  {
    num: "03",
    title: "Meet Nervana.",
    subtitle:
      "An emotionally intelligent companion for the weight of modern knowledge work. Quiet. Private. Yours.",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => { scrollX.value = e.contentOffset.x; },
  });

  const topPad = Platform.OS === "web" ? 80 : insets.top + 60;
  const bottomPad = Platform.OS === "web" ? 52 : insets.bottom + 52;

  return (
    <AtmosphericBackground>
      <Animated.ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        onMomentumScrollEnd={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
          setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {SLIDES.map((slide, index) => (
          <View
            key={index}
            style={[styles.slide, { paddingTop: topPad, paddingBottom: bottomPad }]}
          >
            <View style={styles.textContainer}>
              <Animated.View entering={FadeInUp.delay(80).duration(750)}>
                <Text style={[styles.slideNum, { color: colors.primary }]}>{slide.num}</Text>
                <GlowText style={styles.title}>{slide.title}</GlowText>
                <Text style={[styles.subtitle, { color: colors.secondaryForeground }]}>
                  {slide.subtitle}
                </Text>
              </Animated.View>
            </View>

            {index === SLIDES.length - 1 && (
              <Animated.View
                entering={FadeInUp.delay(320).duration(650)}
                style={styles.cta}
              >
                <CalmButton title="Begin" onPress={() => router.push("/auth")} />
                <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                  Your reflections stay on your device.
                </Text>
              </Animated.View>
            )}
          </View>
        ))}
      </Animated.ScrollView>

      {/* Pagination pills */}
      <View
        style={[
          styles.pagination,
          { bottom: Platform.OS === "web" ? 22 : insets.bottom + 18 },
        ]}
      >
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.pill,
              currentIndex === i
                ? { backgroundColor: colors.primary, width: 22 }
                : { backgroundColor: "rgba(255,255,255,0.18)", width: 6 },
            ]}
          />
        ))}
      </View>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  slide: {
    width,
    flex: 1,
    paddingHorizontal: 34,
    justifyContent: "space-between",
  },
  textContainer: { flex: 1, justifyContent: "center" },
  slideNum: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    letterSpacing: 2.5,
    marginBottom: 22,
    opacity: 0.7,
  },
  title: { fontSize: 40, lineHeight: 52, marginBottom: 24 },
  subtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 17,
    lineHeight: 27,
  },
  cta: { gap: 18, alignItems: "center" },
  hint: { fontFamily: "DMSans_400Regular", fontSize: 13, letterSpacing: 0.2 },
  pagination: {
    flexDirection: "row",
    position: "absolute",
    alignSelf: "center",
    gap: 6,
  },
  pill: { height: 4, borderRadius: 2 },
});
