import React, { useEffect, useRef } from "react";
import { Animated, Easing, View, type ViewStyle, type StyleProp } from "react-native";

interface Props {
  children: React.ReactNode;
  color: string;
  size: number; // diameter of the child hub
  // number of expanding rings
  rings?: number;
  style?: StyleProp<ViewStyle>;
  active?: boolean;
}

// A breathing/pulsing halo of expanding rings behind a circular child (SOS
// button, status hub). Uses the built-in Animated API — no extra deps.
export default function Pulse({ children, color, size, rings = 2, style, active = true }: Props) {
  const anims = useRef(Array.from({ length: rings }, () => new Animated.Value(0))).current;

  useEffect(() => {
    if (!active) return;
    const loops = anims.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay((i * 1600) / rings),
          Animated.timing(v, {
            toValue: 1,
            duration: 1600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [anims, rings, active]);

  return (
    <View style={[{ width: size * 2, height: size * 2, alignItems: "center", justifyContent: "center" }, style]}>
      {active &&
        anims.map((v, i) => (
          <Animated.View
            key={i}
            style={{
              position: "absolute",
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
              opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] }),
              transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 2] }) }],
            }}
          />
        ))}
      {children}
    </View>
  );
}
