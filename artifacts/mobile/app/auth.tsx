import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { useRouter } from "expo-router";
import { AtmosphericBackground } from "@/components/AtmosphericBackground";
import { CalmButton } from "@/components/CalmButton";
import { GlowText } from "@/components/GlowText";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AuthScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleContinue = () => {
    router.push("/flow");
  };

  return (
    <AtmosphericBackground>
      <View style={[styles.container, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 40 }]}>
        <View style={styles.header}>
          <GlowText style={styles.logo}>Nervana</GlowText>
          <Text style={styles.subtitle}>A private space for your mind.</Text>
        </View>

        <View style={styles.buttons}>
          <CalmButton
            title="Continue with Google"
            onPress={handleContinue}
            style={styles.button}
          />
          <CalmButton
            title="Continue with Email"
            onPress={handleContinue}
            style={styles.button}
          />
          
          <View style={styles.separator}>
            <View style={styles.line} />
            <Text style={styles.separatorText}>or</Text>
            <View style={styles.line} />
          </View>

          <CalmButton
            title="Enter as Guest"
            variant="secondary"
            onPress={handleContinue}
            style={styles.button}
          />
        </View>

        <Text style={styles.privacyNote}>
          Your reflections are yours. Always.
        </Text>
      </View>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    marginTop: 40,
  },
  logo: {
    fontSize: 42,
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 18,
    color: "#C8C5BE",
  },
  buttons: {
    width: "100%",
  },
  button: {
    marginBottom: 16,
  },
  separator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#252840",
  },
  separatorText: {
    fontFamily: "DMSans_500Medium",
    color: "#8A8882",
    paddingHorizontal: 16,
  },
  privacyNote: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: "#8A8882",
    textAlign: "center",
    marginTop: 32,
  },
});
