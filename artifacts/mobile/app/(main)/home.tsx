import { Redirect } from "expo-router";

export default function OldHomeRedirect() {
  return <Redirect href="/(main)/(tabs)/home" />;
}
