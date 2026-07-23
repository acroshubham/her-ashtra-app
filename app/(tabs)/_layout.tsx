import { Tabs } from "expo-router";
import ShakeArmer from "@/components/ShakeArmer";
import GuardianTabBar from "@/components/navigation/GuardianTabBar";

// Guardian AI bottom navigation: Home · Safety · Community · Assistant · Profile.
// Legacy feature routes (alerts, circle, settings, …) stay registered so they
// remain navigable via links, but the custom tab bar only surfaces the five
// primary destinations.
export default function TabsLayout() {
  return (
    <>
      <ShakeArmer />
      <Tabs
        tabBar={(props) => <GuardianTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="index" options={{ title: "Home" }} />
        <Tabs.Screen name="ai-safety" options={{ title: "Safety" }} />
        <Tabs.Screen name="community" options={{ title: "Community" }} />
        <Tabs.Screen name="assistant" options={{ title: "Assistant" }} />
        <Tabs.Screen name="profile" options={{ title: "Profile" }} />

        {/* Registered but hidden from the tab bar — reachable via links. */}
        <Tabs.Screen name="alerts" options={{ title: "Alerts" }} />
        <Tabs.Screen name="circle" options={{ title: "Guardian Circle" }} />
        <Tabs.Screen name="settings" options={{ title: "Settings" }} />
        <Tabs.Screen name="safe-trip" options={{ title: "Safe Trip" }} />
        <Tabs.Screen name="guardian-network" options={{ title: "Guardians" }} />
        <Tabs.Screen name="offline-sos" options={{ title: "Offline SOS" }} />
      </Tabs>
    </>
  );
}
