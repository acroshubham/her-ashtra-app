import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Phone, PhoneOff, ChevronLeft, Clock, User, type LucideIcon } from "lucide-react-native";
import { useTheme } from "@/lib/theme-context";
import { guardian } from "@/lib/theme";
import Screen from "@/components/ui/Screen";
import GlassCard from "@/components/ui/GlassCard";
import SectionTitle from "@/components/ui/SectionTitle";
import Pulse from "@/components/ui/Pulse";

const CALLERS = ["Dad", "Mom", "Office", "Police", "Friend", "Custom"];
const DELAYS = [
  { label: "Now", secs: 0 },
  { label: "5s", secs: 5 },
  { label: "10s", secs: 10 },
  { label: "30s", secs: 30 },
];

type Phase = "select" | "ringing" | "connected";

export default function FakeCall() {
  const { theme } = useTheme();
  const router = useRouter();
  const [caller, setCaller] = useState("Dad");
  const [phase, setPhase] = useState<Phase>("select");
  const [connSecs, setConnSecs] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startRinging = (secs: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setPhase("ringing"), secs * 1000);
  };

  // ring haptics
  useEffect(() => {
    if (phase !== "ringing") return;
    const iv = setInterval(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {}), 1500);
    return () => clearInterval(iv);
  }, [phase]);

  // connected timer
  useEffect(() => {
    if (phase !== "connected") return;
    const iv = setInterval(() => setConnSecs((s) => s + 1), 1000);
    return () => clearInterval(iv);
  }, [phase]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  if (phase === "ringing" || phase === "connected") {
    return (
      <View style={{ flex: 1, backgroundColor: "#05070D" }}>
        <StatusBar style="light" />
        <LinearGradient colors={["#111827", "#05070D"]} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
        <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "space-between", paddingVertical: 60 }}>
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginBottom: 24 }}>
              {phase === "ringing" ? "Guardian AI · Incoming call" : "Call connected"}
            </Text>
            <Pulse color={guardian.secondary} size={160} active={phase === "ringing"}>
              <View style={{ width: 148, height: 148, borderRadius: 74, backgroundColor: guardian.cardAlt, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "rgba(255,255,255,0.15)" }}>
                <Text style={{ color: "#fff", fontSize: 56, fontWeight: "800" }}>{caller.charAt(0)}</Text>
              </View>
            </Pulse>
            <Text style={{ color: "#fff", fontSize: 30, fontWeight: "800", marginTop: 28 }}>{caller}</Text>
            <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 15, marginTop: 6 }}>
              {phase === "ringing" ? "mobile" : `${Math.floor(connSecs / 60).toString().padStart(2, "0")}:${(connSecs % 60).toString().padStart(2, "0")}`}
            </Text>
          </View>

          <View className="flex-row" style={{ gap: 80 }}>
            {phase === "ringing" ? (
              <>
                <CallBtn color={guardian.primary} icon={PhoneOff} label="Decline" onPress={() => router.back()} />
                <CallBtn color={guardian.success} icon={Phone} label="Accept" onPress={() => setPhase("connected")} />
              </>
            ) : (
              <CallBtn color={guardian.primary} icon={PhoneOff} label="End" onPress={() => router.back()} />
            )}
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <Screen scroll glow={guardian.success} edges={["top"]}>
      <View className="flex-row items-center" style={{ marginBottom: 8 }}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={{ marginRight: 8 }}>
          <ChevronLeft color={theme.text} size={26} />
        </Pressable>
        <Text style={{ color: theme.text, fontSize: 24, fontWeight: "900" }}>Fake Call</Text>
      </View>
      <Text style={{ color: theme.textDim, fontSize: 13, marginBottom: 20 }}>
        Trigger a realistic incoming call to exit an uncomfortable situation.
      </Text>

      <SectionTitle title="Select Caller" />
      <View className="flex-row flex-wrap" style={{ gap: 12 }}>
        {CALLERS.map((c) => {
          const on = caller === c;
          return (
            <Pressable key={c} onPress={() => setCaller(c)} style={{ width: "31%" }}>
              <GlassCard padded={false} style={{ alignItems: "center", paddingVertical: 16, borderColor: on ? guardian.success : theme.border, borderWidth: on ? 2 : 1 }}>
                <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: on ? `${guardian.success}22` : theme.cardAlt, alignItems: "center", justifyContent: "center" }}>
                  <User color={on ? guardian.success : theme.textDim} size={22} />
                </View>
                <Text style={{ color: theme.text, fontWeight: "600", fontSize: 13, marginTop: 8 }}>{c}</Text>
              </GlassCard>
            </Pressable>
          );
        })}
      </View>

      <View style={{ marginTop: 24 }}>
        <SectionTitle title="When" />
        <View className="flex-row" style={{ gap: 10 }}>
          {DELAYS.map((d) => (
            <Pressable key={d.label} onPress={() => startRinging(d.secs)} style={{ flex: 1 }}>
              <GlassCard padded={false} style={{ alignItems: "center", paddingVertical: 16 }}>
                <Clock color={guardian.secondary} size={18} />
                <Text style={{ color: theme.text, fontWeight: "700", fontSize: 13, marginTop: 6 }}>{d.label}</Text>
              </GlassCard>
            </Pressable>
          ))}
        </View>
        <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 12, textAlign: "center" }}>
          Tap a time to schedule your fake call from {caller}.
        </Text>
      </View>
    </Screen>
  );
}

function CallBtn({ color, icon: Icon, label, onPress }: { color: string; icon: LucideIcon; label: string; onPress: () => void }) {
  return (
    <View style={{ alignItems: "center" }}>
      <Pressable onPress={onPress}>
        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: color, alignItems: "center", justifyContent: "center", shadowColor: color, shadowOpacity: 0.5, shadowRadius: 16, elevation: 8 }}>
          <Icon color="#fff" size={30} />
        </View>
      </Pressable>
      <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 10 }}>{label}</Text>
    </View>
  );
}
