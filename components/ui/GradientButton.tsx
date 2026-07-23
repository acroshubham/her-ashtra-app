import React from "react";
import { Text, Pressable, View, ActivityIndicator, type ViewStyle, type StyleProp } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { guardian } from "@/lib/theme";

type Variant = "danger" | "guardian" | "success" | "neutral";

const GRADIENTS: Record<Variant, readonly [string, string]> = {
  danger: guardian.gradRed,
  guardian: guardian.gradBlue,
  success: guardian.gradGreen,
  neutral: ["#1F2937", "#111827"],
};

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  size?: "md" | "lg";
}

// Rounded gradient button with an optional leading icon. Presses scale slightly.
export default function GradientButton({
  label,
  onPress,
  variant = "guardian",
  icon,
  loading = false,
  disabled = false,
  style,
  size = "md",
}: Props) {
  const pad = size === "lg" ? 18 : 14;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        { borderRadius: 18, opacity: disabled ? 0.5 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
        style,
      ]}
    >
      <LinearGradient
        colors={GRADIENTS[variant]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 18,
          paddingVertical: pad,
          paddingHorizontal: 20,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            {icon ? <View style={{ marginRight: 8 }}>{icon}</View> : null}
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: size === "lg" ? 17 : 15 }}>
              {label}
            </Text>
          </>
        )}
      </LinearGradient>
    </Pressable>
  );
}
