import { View, ActivityIndicator } from "react-native";

export default function Index() {
  // This screen is managed by AuthGate in _layout.tsx.
  // When the user lands here, AuthGate will either:
  // 1. Redirect to /(auth)/login if not authenticated.
  // 2. Redirect to their role-based dashboard if authenticated.
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="#f43f5e" />
    </View>
  );
}
