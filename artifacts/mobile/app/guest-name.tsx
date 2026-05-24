import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { GlowText } from "@/components/GlowText";
import { CalmButton } from "@/components/CalmButton";
import { OnboardingLayout } from "@/components/OnboardingLayout";
import { useColors } from "@/hooks/useColors";
import { useAppContext } from "@/context/AppContext";

export default function GuestNameScreen() {
  const router = useRouter();
  const colors = useColors();
  const { setCurrentUser } = useAppContext();
  const [name, setName] = useState("");
  const inputRef = useRef<TextInput>(null);

  const trimmed = name.trim();

  const handleContinue = () => {
    if (!trimmed) return;
    setCurrentUser({ name: trimmed, isGuest: true });
    router.push("/flow");
  };

  return (
    <OnboardingLayout
      onBack={() => router.back()}
      footer={
        trimmed.length > 0 ? (
          <CalmButton title="Continue" onPress={handleContinue} />
        ) : null
      }
    >
      <View style={styles.content}>
        <GlowText style={styles.title}>What should we{"\n"}call you?</GlowText>
        <Text style={[styles.subtitle, { color: colors.secondaryForeground }]}>
          This is your private space. Only you will see this.
        </Text>

        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            {
              color: colors.foreground,
              borderColor: trimmed
                ? colors.primary + "60"
                : "rgba(255,255,255,0.12)",
              backgroundColor: "rgba(255,255,255,0.04)",
            },
          ]}
          placeholder="Your name"
          placeholderTextColor="rgba(255,255,255,0.22)"
          value={name}
          onChangeText={setName}
          autoFocus
          autoCorrect={false}
          autoCapitalize="words"
          returnKeyType="done"
          onSubmitEditing={handleContinue}
          maxLength={40}
          selectionColor={colors.primary}
        />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 40,
  },
  title: {
    fontSize: 38,
    lineHeight: 50,
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 16,
    lineHeight: 25,
    marginBottom: 44,
  },
  input: {
    fontFamily: "DMSans_400Regular",
    fontSize: 22,
    paddingVertical: Platform.OS === "ios" ? 18 : 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 18,
    letterSpacing: 0.3,
  },
});
