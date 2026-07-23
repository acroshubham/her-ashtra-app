import { View, ActivityIndicator } from "react-native";
import { guardian } from "@/lib/theme";

export default function Index() {
  // This screen is managed by AuthGate in _layout.tsx (redirects to onboarding,
  // login, or the tabs). It only shows briefly during route resolution.
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: guardian.bg }}>
      <ActivityIndicator size="large" color={guardian.secondary} />
    </View>
  );
}
