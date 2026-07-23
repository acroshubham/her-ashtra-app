import React from "react";
import { View, type ViewStyle, type StyleProp } from "react-native";
import { useTheme } from "@/lib/theme-context";

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  // "glass" = translucent frosted look; "solid" = elevated card.
  variant?: "glass" | "solid";
  padded?: boolean;
  radius?: number;
}

// Soft, rounded, glassmorphic card. Subtle border + shadow for depth.
export default function GlassCard({
  children,
  style,
  variant = "solid",
  padded = true,
  radius = 20,
}: Props) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: variant === "glass" ? theme.glass : theme.card,
          borderColor: theme.border,
          borderWidth: 1,
          borderRadius: radius,
          padding: padded ? 16 : 0,
          shadowColor: "#000",
          shadowOpacity: 0.25,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 6,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
