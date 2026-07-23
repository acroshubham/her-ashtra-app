import React, { useEffect, useRef } from "react";
import { Animated, View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { guardian } from "@/lib/theme";
import { useTheme } from "@/lib/theme-context";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  value: number; // 0..100
  size?: number;
  label?: string;
}

function scoreColor(v: number): string {
  if (v >= 75) return guardian.success;
  if (v >= 50) return guardian.warning;
  return guardian.primary;
}

// Circular safety-score gauge with an animated arc that fills on mount.
export default function SafetyGauge({ value, size = 120, label = "Safety" }: Props) {
  const { theme } = useTheme();
  const clamped = Math.max(0, Math.min(100, value));
  const stroke = 10;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const color = scoreColor(clamped);

  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progress, {
      toValue: clamped / 100,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [clamped, progress]);

  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={theme.cardAlt} strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </Svg>
      <Text style={{ color: theme.text, fontSize: size * 0.26, fontWeight: "800" }}>{Math.round(clamped)}</Text>
      <Text style={{ color: theme.textDim, fontSize: 11, fontWeight: "600", marginTop: 2 }}>{label}</Text>
    </View>
  );
}
