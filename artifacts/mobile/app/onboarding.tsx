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
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  FadeInUp,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    title: "You carry more than most people see.",
    subtitle:
      "The late nights. The endless context-switching. The performance of being fine when you're not.",
    number: "01",
  },
  {
    title: "Decompression isn't weakness.",
    subtitle:
      "Your mind needs space to process what your calendar never scheduled. That space is not optional.",
    number: "02",
  },
  {
    title: "Meet Nervana.",
    subtitle:
      "An emotionally intelligent companion for the weight of modern knowledge work. Quiet. Private. Yours.",
    number: "03",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const onMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const bottomPad = Platform.OS === "web" ? 48 : insets.bottom + 48;
  const topPad = Platform.OS === "web" ? 80 : insets.top + 60;

  return (
    <AtmosphericBackground>
      <Animated.ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        onMomentumScrollEnd={onMomentumScrollEnd}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {SLIDES.map((slide, index) => (
          <View key={index} style={[styles.slide, { paddingTop: topPad, paddingBottom: bottomPad }]}>
            <View style={styles.textContainer}>
              <Animated.View entering={FadeInUp.delay(100).duration(700)}>
                <Text style={styles.slideNumber}>{slide.number}</Text>
                <GlowText style={styles.title}>{slide.title}</GlowText>
                <Text style={styles.subtitle}>{slide.subtitle}</Text>
              </Animated.View>
            </View>

            {index === SLIDES.length - 1 && (
              <Animated.View
                entering={FadeInUp.delay(300).duration(600)}
                style={styles.buttonContainer}
              >
                <CalmButton
                  title="Begin"
                  onPress={() => router.push("/auth")}
                />
                <Text style={styles.hint}>Your reflections stay on your device.</Text>
              </Animated.View>
            )}
          </View>
        ))}
      </Animated.ScrollView>

      {/* Pagination */}
      <View
        style={[
          styles.pagination,
          { bottom: Platform.OS === "web" ? 24 : insets.bottom + 20 },
        ]}
      >
        {SLIDES.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentIndex === index ? styles.activeDot : styles.inactiveDot,
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
    paddingHorizontal: 32,
    justifyContent: "space-between",
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  slideNumber: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: "#7B7FF0",
    letterSpacing: 2,
    marginBottom: 24,
    opacity: 0.7,
  },
  title: {
    fontSize: 38,
    lineHeight: 50,
    marginBottom: 24,
  },
  subtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 17,
    lineHeight: 27,
    color: "#9A9890",
  },
  buttonContainer: {
    gap: 16,
    alignItems: "center",
  },
  hint: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: "#5A5858",
    letterSpacing: 0.2,
  },
  pagination: {
    flexDirection: "row",
    position: "absolute",
    alignSelf: "center",
  },
  dot: {
    height: 4,
    borderRadius: 2,
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: "#7B7FF0",
    width: 20,
  },
  inactiveDot: {
    backgroundColor: "#252840",
    width: 6,
  },
});
