import React from "react";
import { View, ScrollView, type ViewStyle } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/lib/theme-context";

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  padded?: boolean;
  contentStyle?: ViewStyle;
  // Subtle top color glow (e.g. an accent hue) for a premium feel.
  glow?: string;
}

// The base screen surface: dark (or light) background, safe area, light status
// bar, and an optional accent glow at the top.
export default function Screen({
  children,
  scroll = false,
  edges = ["top"],
  padded = true,
  contentStyle,
  glow,
}: Props) {
  const { theme, mode } = useTheme();
  const pad = padded ? { padding: 20 } : undefined;

  const body = scroll ? (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[{ paddingBottom: 32 }, pad, contentStyle]}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1 }, pad, contentStyle]}>{children}</View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      {glow && (
        <LinearGradient
          colors={[glow, "transparent"]}
          style={{ position: "absolute", top: 0, left: 0, right: 0, height: 260, opacity: 0.18 }}
          pointerEvents="none"
        />
      )}
      <SafeAreaView style={{ flex: 1 }} edges={edges}>
        {body}
      </SafeAreaView>
    </View>
  );
}
