import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AtmosphericBackground } from "@/components/AtmosphericBackground";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * Reusable wrapper for all onboarding / questionnaire screens.
 *
 * Layout contract:
 *   - AtmosphericBackground fills the screen
 *   - Header + content live inside a KeyboardAwareScrollView so they are
 *     always reachable on short devices or when the keyboard is open
 *   - The CTA (footer prop) is rendered OUTSIDE the scroll area and pinned
 *     above the home-indicator / navigation bar so it is always visible
 *
 * This eliminates the "Continue button off-screen" bug caused by
 * `flex: 1, justifyContent: "flex-end"` collapsing on small viewports.
 */
export function OnboardingLayout({ children, footer }: OnboardingLayoutProps) {
  const insets = useSafeAreaInsets();

  const topPad = Platform.OS === "web" ? 48 : insets.top + 20;
  const bottomInset = Platform.OS === "web" ? 16 : insets.bottom;

  return (
    <AtmosphericBackground>
      <View style={styles.root}>
        <KeyboardAwareScrollViewCompat
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: topPad, paddingBottom: 20 },
          ]}
          showsVerticalScrollIndicator={false}
          bounces
          alwaysBounceVertical={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </KeyboardAwareScrollViewCompat>

        {footer != null && (
          <View
            style={[
              styles.footer,
              { paddingBottom: bottomInset + 16 },
            ]}
          >
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
  scrollContent: {
    paddingHorizontal: 24,
    flexGrow: 1,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
});
