import React, { useState } from "react";
import { StyleSheet, View, Text, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { useRouter } from "expo-router";
import { AtmosphericBackground } from "@/components/AtmosphericBackground";
import { CalmButton } from "@/components/CalmButton";
import { GlowText } from "@/components/GlowText";
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    title: "You carry more than most people see.",
    subtitle: "The late nights. The endless context switching. The performance of being fine.",
  },
  {
    title: "Decompression isn't weakness.",
    subtitle: "Your mind needs space to process what your calendar couldn't schedule.",
  },
  {
    title: "Meet Nervana.",
    subtitle: "An emotionally intelligent companion designed for the weight of modern knowledge work.",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

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
          <View key={index} style={styles.slide}>
            <View style={styles.textContainer}>
              <GlowText style={styles.title}>{slide.title}</GlowText>
              <Text style={styles.subtitle}>{slide.subtitle}</Text>
            </View>
            {index === SLIDES.length - 1 && (
              <View style={styles.buttonContainer}>
                <CalmButton
                  title="Begin"
                  onPress={() => router.push("/auth")}
                />
              </View>
            )}
          </View>
        ))}
      </Animated.ScrollView>

      <View style={styles.pagination}>
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
  scrollView: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 38,
    lineHeight: 48,
    marginBottom: 24,
  },
  subtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 18,
    lineHeight: 28,
    color: "#C8C5BE",
  },
  buttonContainer: {
    marginBottom: 80,
  },
  pagination: {
    flexDirection: "row",
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#7B7FF0",
    width: 24,
  },
  inactiveDot: {
    backgroundColor: "#252840",
  },
});
