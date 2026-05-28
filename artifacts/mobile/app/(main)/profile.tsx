import { Redirect } from "expo-router";

export default function OldProfileRedirect() {
  return <Redirect href="/(main)/(tabs)/profile" />;
}
