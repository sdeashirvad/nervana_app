import { Redirect } from "expo-router";
import { View } from "react-native";

import { useAppContext } from "@/context/AppContext";

export default function IndexScreen() {
  const { onboardingComplete, isReady } = useAppContext();

  if (!isReady) {
    // Minimal dark view — avoids loading AtmosphericBackground before fonts are ready
    return <View style={{ flex: 1, backgroundColor: "#0A0B18" }} />;
  }

  if (onboardingComplete) {
    return <Redirect href="/(main)/home" />;
  }

  return <Redirect href="/splash" />;
}
