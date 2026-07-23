import React from "react";
import { View, Pressable, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Home, ShieldCheck, Users, Bot, User, type LucideIcon } from "lucide-react-native";
import { useTheme } from "@/lib/theme-context";
import { guardian } from "@/lib/theme";

// The five primary destinations, in order. Other routes in the group (alerts,
// circle, settings, …) stay navigable via links but don't appear in the bar.
const PRIMARY: { name: string; label: string; icon: LucideIcon }[] = [
  { name: "index", label: "Home", icon: Home },
  { name: "ai-safety", label: "Safety", icon: ShieldCheck },
  { name: "community", label: "Community", icon: Users },
  { name: "assistant", label: "Assistant", icon: Bot },
  { name: "profile", label: "Profile", icon: User },
];

export default function GuardianTabBar({ state, navigation }: BottomTabBarProps) {
  const { theme, mode } = useTheme();
  const insets = useSafeAreaInsets();
  const activeName = state.routes[state.index]?.name;

  return (
    <View style={{ position: "absolute", left: 16, right: 16, bottom: insets.bottom + 8 }}>
      <View
        style={{
          flexDirection: "row",
          backgroundColor: mode === "dark" ? "rgba(17,24,39,0.92)" : "rgba(255,255,255,0.94)",
          borderColor: theme.border,
          borderWidth: 1,
          borderRadius: 26,
          paddingVertical: 10,
          paddingHorizontal: 6,
          shadowColor: "#000",
          shadowOpacity: 0.3,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 10 },
          elevation: 12,
        }}
      >
        {PRIMARY.map((tab) => {
          const focused = activeName === tab.name;
          const Icon = tab.icon;
          return (
            <Pressable
              key={tab.name}
              onPress={() => navigation.navigate(tab.name)}
              style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
            >
              {focused ? (
                <LinearGradient
                  colors={guardian.gradBlue}
                  style={{ width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center" }}
                >
                  <Icon color="#fff" size={20} strokeWidth={2.4} />
                </LinearGradient>
              ) : (
                <View style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}>
                  <Icon color={theme.textMuted} size={20} strokeWidth={2} />
                </View>
              )}
              <Text
                style={{
                  fontSize: 10,
                  marginTop: 3,
                  fontWeight: focused ? "700" : "500",
                  color: focused ? theme.text : theme.textMuted,
                }}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
