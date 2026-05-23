import { Redirect } from "expo-router";
import { useAppContext } from "@/context/AppContext";
import { View } from "react-native";
import { AtmosphericBackground } from "@/components/AtmosphericBackground";

export default function IndexScreen() {
  const { onboardingComplete, isReady } = useAppContext();

  if (!isReady) {
    return <AtmosphericBackground />;
  }

  if (onboardingComplete) {
    return <Redirect href="/(main)/home" />;
  }

  return <Redirect href="/splash" />;
}
