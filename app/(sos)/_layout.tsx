import { Stack } from "expo-router";

export default function SosLayout() {
  // Full-screen SOS flow, presented above the tab bar. Gesture-dismiss is
  // disabled so a panicking user can't accidentally swipe the alert away.
  return (
    <Stack screenOptions={{ headerShown: false, gestureEnabled: false }} />
  );
}
