import React, { useEffect, useRef } from "react";
import { Animated, type ViewStyle, type StyleProp } from "react-native";

interface Props {
  children: React.ReactNode;
  delay?: number;
  from?: "bottom" | "top" | "none";
  distance?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}

// Mount entrance animation: fade + slide. Used to stagger dashboard cards.
export default function FadeInView({
  children,
  delay = 0,
  from = "bottom",
  distance = 16,
  duration = 420,
  style,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(from === "none" ? 0 : from === "top" ? -distance : distance)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration, delay, useNativeDriver: true }),
      Animated.timing(translate, { toValue: 0, duration, delay, useNativeDriver: true }),
    ]).start();
  }, [opacity, translate, delay, duration]);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY: translate }] }, style]}>
      {children}
    </Animated.View>
  );
}
