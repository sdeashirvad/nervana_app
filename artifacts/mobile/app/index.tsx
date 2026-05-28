import { Redirect } from "expo-router";
import { View } from "react-native";

import { useAppContext } from "@/context/AppContext";

export default function IndexScreen() {
  const { onboardingComplete, isReady } = useAppContext();

  if (!isReady) {
    return <View style={{ flex: 1, backgroundColor: "#0A0B18" }} />;
  }

  if (onboardingComplete) {
    return <Redirect href="/(main)/(tabs)/home" />;
  }

  return <Redirect href="/splash" />;
}
