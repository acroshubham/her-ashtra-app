import React, { useEffect, useRef } from "react";
import { View, Text, Animated, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ShieldCheck } from "lucide-react-native";
import { guardian } from "@/lib/theme";
import Pulse from "@/components/ui/Pulse";

// Guardian AI splash: pulsing shield emblem, wordmark, tagline, loading dots.
export default function Splash() {
  const fade = useRef(new Animated.Value(0)).current;
  const dot = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 700, useNativeDriver: true }).start();
    const loop = Animated.loop(
      Animated.timing(dot, { toValue: 1, duration: 1200, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [fade, dot]);

  return (
    <View style={{ flex: 1, backgroundColor: guardian.bg, alignItems: "center", justifyContent: "center" }}>
      <LinearGradient
        colors={[guardian.secondary, "transparent"]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: 320, opacity: 0.15 }}
      />
      <Animated.View style={{ opacity: fade, alignItems: "center" }}>
        <Pulse color={guardian.secondary} size={120}>
          <LinearGradient
            colors={guardian.gradBlue}
            style={{ width: 108, height: 108, borderRadius: 32, alignItems: "center", justifyContent: "center" }}
          >
            <ShieldCheck color="#fff" size={54} strokeWidth={2.2} />
          </LinearGradient>
        </Pulse>

        <Text style={{ color: "#fff", fontSize: 32, fontWeight: "900", marginTop: 28, letterSpacing: 0.5 }}>
          Guardian<Text style={{ color: guardian.secondary }}>AI</Text>
        </Text>
        <Text style={{ color: guardian.textDim, fontSize: 14, marginTop: 8, fontWeight: "500" }}>
          Your Intelligent Safety Companion
        </Text>

        <View style={{ flexDirection: "row", marginTop: 40, gap: 8 }}>
          {[0, 1, 2].map((i) => (
            <Animated.View
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: guardian.secondary,
                opacity: dot.interpolate({
                  inputRange: [0, 0.33, 0.66, 1],
                  outputRange: i === 0 ? [1, 0.3, 0.3, 1] : i === 1 ? [0.3, 1, 0.3, 0.3] : [0.3, 0.3, 1, 0.3],
                }),
              }}
            />
          ))}
        </View>
      </Animated.View>
    </View>
  );
}
