import { Stack } from "expo-router";

export default function MainLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="companion" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="journal" options={{ animation: "slide_from_bottom", presentation: "modal" }} />
      <Stack.Screen name="calm-reset" options={{ animation: "slide_from_bottom", presentation: "modal" }} />
      <Stack.Screen name="focus-session" options={{ animation: "slide_from_bottom", presentation: "modal" }} />
    </Stack>
  );
}
