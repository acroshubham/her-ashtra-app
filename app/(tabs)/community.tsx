import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  TriangleAlert,
  Construction,
  Waves,
  Lightbulb,
  Eye,
  Plus,
  MapPinned,
  type LucideIcon,
} from "lucide-react-native";
import { useTheme } from "@/lib/theme-context";
import { guardian } from "@/lib/theme";
import Screen from "@/components/ui/Screen";
import GlassCard from "@/components/ui/GlassCard";
import GradientButton from "@/components/ui/GradientButton";
import FadeInView from "@/components/ui/FadeInView";
import SectionTitle from "@/components/ui/SectionTitle";

const FILTERS = ["All", "Harassment", "Road Block", "Flood", "Lighting", "Suspicious"];

type Report = { icon: LucideIcon; type: string; where: string; when: string; tint: string; severity: "High" | "Medium" | "Low" };
const REPORTS: Report[] = [
  { icon: Eye, type: "Suspicious Activity", where: "MG Road · 400m", when: "12 min ago", tint: guardian.primary, severity: "High" },
  { icon: Lightbulb, type: "Broken Street Light", where: "Sector 14 · 1.1km", when: "1 hr ago", tint: guardian.warning, severity: "Medium" },
  { icon: Construction, type: "Road Block", where: "Ring Road · 2.3km", when: "2 hrs ago", tint: "#F97316", severity: "Low" },
  { icon: Waves, type: "Flooding", where: "Riverside · 3km", when: "5 hrs ago", tint: guardian.secondary, severity: "Medium" },
  { icon: TriangleAlert, type: "Harassment", where: "Market St · 800m", when: "Yesterday", tint: "#DC2626", severity: "High" },
];

export default function Community() {
  const { theme } = useTheme();
  const [active, setActive] = useState("All");

  const filtered = active === "All" ? REPORTS : REPORTS.filter((r) => r.type.toLowerCase().includes(active.toLowerCase().split(" ")[0]));

  return (
    <Screen scroll glow="#8B5CF6" contentStyle={{ paddingBottom: 120 }}>
      <FadeInView from="top">
        <Text style={{ color: theme.text, fontSize: 24, fontWeight: "900" }}>Community</Text>
        <Text style={{ color: theme.textDim, fontSize: 13, marginTop: 2 }}>Real-time safety, powered by people nearby.</Text>
      </FadeInView>

      {/* Heatmap placeholder */}
      <FadeInView delay={60} style={{ marginTop: 18 }}>
        <GlassCard padded={false} style={{ overflow: "hidden" }}>
          <LinearGradient colors={["#1E293B", "#0F172A"]} style={{ height: 180, alignItems: "center", justifyContent: "center" }}>
            <MapPinned color={guardian.secondary} size={30} />
            <Text style={{ color: theme.text, fontWeight: "700", marginTop: 8 }}>Safety Heatmap</Text>
            <Text style={{ color: theme.textDim, fontSize: 12, marginTop: 2 }}>Live incident density near you</Text>
            {/* faux heat blobs */}
            <View style={{ position: "absolute", top: 30, left: 40, width: 60, height: 60, borderRadius: 30, backgroundColor: "rgba(239,68,68,0.35)" }} />
            <View style={{ position: "absolute", bottom: 24, right: 50, width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(245,158,11,0.35)" }} />
            <View style={{ position: "absolute", top: 70, right: 90, width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(34,197,94,0.3)" }} />
          </LinearGradient>
        </GlassCard>
      </FadeInView>

      {/* Filters */}
      <FadeInView delay={120} style={{ marginTop: 18 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row" style={{ gap: 8 }}>
            {FILTERS.map((f) => {
              const on = active === f;
              return (
                <Pressable key={f} onPress={() => setActive(f)}>
                  <View
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 999,
                      backgroundColor: on ? guardian.secondary : theme.card,
                      borderWidth: 1,
                      borderColor: on ? guardian.secondary : theme.border,
                    }}
                  >
                    <Text style={{ color: on ? "#fff" : theme.textDim, fontWeight: "700", fontSize: 12.5 }}>{f}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </FadeInView>

      {/* Reports */}
      <FadeInView delay={180} style={{ marginTop: 20 }}>
        <SectionTitle title="Recent Incidents" />
        <View style={{ gap: 12 }}>
          {filtered.map((r, i) => {
            const Icon = r.icon;
            return (
              <GlassCard key={i}>
                <View className="flex-row items-center">
                  <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: `${r.tint}22`, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                    <Icon color={r.tint} size={22} strokeWidth={2.2} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.text, fontSize: 15, fontWeight: "700" }}>{r.type}</Text>
                    <Text style={{ color: theme.textDim, fontSize: 12, marginTop: 1 }}>{r.where} · {r.when}</Text>
                  </View>
                  <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: `${r.tint}22` }}>
                    <Text style={{ color: r.tint, fontSize: 10.5, fontWeight: "800" }}>{r.severity}</Text>
                  </View>
                </View>
              </GlassCard>
            );
          })}
        </View>
      </FadeInView>

      <FadeInView delay={240} style={{ marginTop: 20 }}>
        <GradientButton label="Report an Incident" variant="danger" icon={<Plus color="#fff" size={18} />} onPress={() => {}} />
      </FadeInView>
    </Screen>
  );
}
