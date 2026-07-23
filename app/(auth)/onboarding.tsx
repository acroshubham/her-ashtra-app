import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { ShieldCheck, BrainCircuit, BellRing, type LucideIcon } from "lucide-react-native";
import { guardian } from "@/lib/theme";

const { width } = Dimensions.get("window");
const KEY = "guardian.onboarded";

const PAGES: { icon: LucideIcon; title: string; body: string; grad: readonly [string, string] }[] = [
  { icon: ShieldCheck, title: "Stay Safe Anywhere", body: "Guardian AI watches over you 24/7 — one tap or shake away from help, wherever you are.", grad: guardian.gradBlue },
  { icon: BrainCircuit, title: "AI Detects Emergencies", body: "Intelligent sensing finds the safest place to go and guides you there — not just the closest.", grad: guardian.gradRed },
  { icon: BellRing, title: "Family Gets Alerts Instantly", body: "Your Guardian Circle is notified with your live location the moment you need them.", grad: guardian.gradGreen },
];

export default function Onboarding() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => {
      if (v === "1") router.replace("/(auth)/login");
    });
  }, [router]);

  const finish = async () => {
    await AsyncStorage.setItem(KEY, "1").catch(() => {});
    router.replace("/(auth)/login");
  };

  const next = () => {
    if (page < PAGES.length - 1) {
      scrollRef.current?.scrollTo({ x: width * (page + 1), animated: true });
      setPage(page + 1);
    } else {
      finish();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: guardian.bg }}>
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ alignItems: "flex-end", paddingHorizontal: 20, paddingTop: 8 }}>
          <Pressable onPress={finish} hitSlop={10}>
            <Text style={{ color: guardian.textDim, fontWeight: "600" }}>Skip</Text>
          </Pressable>
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
          style={{ flex: 1 }}
        >
          {PAGES.map((p, i) => {
            const Icon = p.icon;
            return (
              <View key={i} style={{ width, alignItems: "center", justifyContent: "center", paddingHorizontal: 40 }}>
                <LinearGradient colors={p.grad} style={{ width: 140, height: 140, borderRadius: 44, alignItems: "center", justifyContent: "center" }}>
                  <Icon color="#fff" size={64} strokeWidth={2} />
                </LinearGradient>
                <Text style={{ color: "#fff", fontSize: 28, fontWeight: "900", marginTop: 40, textAlign: "center" }}>{p.title}</Text>
                <Text style={{ color: guardian.textDim, fontSize: 15, lineHeight: 23, marginTop: 14, textAlign: "center" }}>{p.body}</Text>
              </View>
            );
          })}
        </ScrollView>

        {/* Dots */}
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 24 }}>
          {PAGES.map((_, i) => (
            <View
              key={i}
              style={{
                width: page === i ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: page === i ? guardian.secondary : guardian.cardAlt,
              }}
            />
          ))}
        </View>

        <View style={{ paddingHorizontal: 24, paddingBottom: 24 }}>
          <Pressable onPress={next} style={{ borderRadius: 18, overflow: "hidden" }}>
            <LinearGradient colors={guardian.gradBlue} style={{ paddingVertical: 18, alignItems: "center" }}>
              <Text style={{ color: "#fff", fontSize: 17, fontWeight: "800" }}>
                {page === PAGES.length - 1 ? "Get Started" : "Next"}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
