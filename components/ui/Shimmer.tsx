import React, { useEffect, useRef } from "react";
import { Animated, View, type DimensionValue } from "react-native";
import { useTheme } from "@/lib/theme-context";

interface Props {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: object;
}

// A single shimmering skeleton block. Compose several for loading states.
export default function Shimmer({ width = "100%", height = 16, radius = 10, style }: Props) {
  const { theme } = useTheme();
  const x = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(x, { toValue: 1, duration: 1200, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [x]);

  return (
    <View style={[{ width, height, borderRadius: radius, backgroundColor: theme.cardAlt, overflow: "hidden" }, style]}>
      <Animated.View
        style={{
          width: "60%",
          height: "100%",
          backgroundColor: theme.glass,
          opacity: 0.6,
          transform: [
            {
              translateX: x.interpolate({ inputRange: [0, 1], outputRange: [-160, 260] }),
            },
          ],
        }}
      />
    </View>
  );
}
