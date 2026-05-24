import React from "react";
import { View, StyleSheet, Platform, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AtmosphericBackground } from "@/components/AtmosphericBackground";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { Feather } from "@expo/vector-icons";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
  onBack?: () => void;
}

/**
 * Reusable wrapper for all onboarding / questionnaire screens.
 *
 * Layout contract:
 *   - Optional back chevron in the top-left (outside scroll, always tappable)
 *   - Header + content live inside a KeyboardAwareScrollView
 *   - CTA (footer prop) is pinned below the scroll area — always visible
 */
export function OnboardingLayout({ children, footer, onBack }: OnboardingLayoutProps) {
  const insets = useSafeAreaInsets();

  const topPad = Platform.OS === "web" ? 48 : insets.top + 20;
  const bottomInset = Platform.OS === "web" ? 16 : insets.bottom;

  return (
    <AtmosphericBackground>
      <View style={styles.root}>
        {onBack && (
          <Pressable
            onPress={onBack}
            hitSlop={16}
            style={[styles.backBtn, { top: topPad - 4 }]}
          >
            <Feather name="chevron-left" size={26} color="rgba(255,255,255,0.55)" />
          </Pressable>
        )}

        <KeyboardAwareScrollViewCompat
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: onBack ? topPad + 36 : topPad, paddingBottom: 20 },
          ]}
          showsVerticalScrollIndicator={false}
          bounces
          alwaysBounceVertical={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </KeyboardAwareScrollViewCompat>

        {footer != null && (
          <View style={[styles.footer, { paddingBottom: bottomInset + 16 }]}>
            {footer}
          </View>
        )}
      </View>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backBtn: {
    position: "absolute",
    left: 20,
    zIndex: 10,
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 24,
    flexGrow: 1,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
});
