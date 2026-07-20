import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import PaginatedTabBar from "@/components/navigation/PaginatedTabBar";
import ShakeArmer from "@/components/ShakeArmer";

export default function TabsLayout() {
  return (
    <>
      <ShakeArmer />
      <Tabs
        tabBar={(props) => <PaginatedTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="safe-trip"
        options={{
          title: "Safe Trip",
          tabBarIcon: ({ color, size }) => <Ionicons name="navigate" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="guardian-network"
        options={{
          title: "Guardians",
          tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ai-safety"
        options={{
          title: "AI Safety",
          tabBarIcon: ({ color, size }) => <Ionicons name="sparkles" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: "Alerts",
          tabBarIcon: ({ color, size }) => <Ionicons name="alert-circle" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="offline-sos"
        options={{
          title: "Offline SOS",
          tabBarIcon: ({ color, size }) => <Ionicons name="cellular" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="circle"
        options={{
          title: "Circle",
          tabBarIcon: ({ color, size }) => <Ionicons name="heart" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} />,
        }}
        />
      </Tabs>
    </>
  );
}
