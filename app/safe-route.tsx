import React from "react";
import { View, Text, Pressable, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path, Circle, Line } from "react-native-svg";
import { ChevronLeft, Clock, Ruler, ShieldCheck, Navigation as NavIcon, TriangleAlert } from "lucide-react-native";
import { useTheme } from "@/lib/theme-context";
import { guardian } from "@/lib/theme";
import GlassCard from "@/components/ui/GlassCard";
import GradientButton from "@/components/ui/GradientButton";

const { width } = Dimensions.get("window");

// A stylized map canvas (SVG) rather than a native MapView — always renders
// without a Google Maps key, ideal for the demo. Swap in react-native-maps
// later if a keyed dev build is available.
export default function SafeRoute() {
  const { theme } = useTheme();
  const router = useRouter();
  const W = width;
  const H = 460;

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      {/* Map canvas */}
      <LinearGradient colors={["#0F1B2E", "#0B1220"]} style={{ width: W, height: H }}>
        <Svg width={W} height={H}>
          {/* grid */}
          {Array.from({ length: 8 }).map((_, i) => (
            <Line key={`h${i}`} x1={0} y1={(H / 8) * i} x2={W} y2={(H / 8) * i} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <Line key={`v${i}`} x1={(W / 6) * i} y1={0} x2={(W / 6) * i} y2={H} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
          ))}

          {/* unsafe zones (red) */}
          <Circle cx={W * 0.7} cy={H * 0.35} r={46} fill="rgba(239,68,68,0.18)" />
          <Circle cx={W * 0.3} cy={H * 0.6} r={34} fill="rgba(245,158,11,0.16)" />

          {/* safe route (blue → cyan) */}
          <Path
            d={`M ${W * 0.2} ${H * 0.82} C ${W * 0.35} ${H * 0.6}, ${W * 0.25} ${H * 0.45}, ${W * 0.5} ${H * 0.4} S ${W * 0.78} ${H * 0.28}, ${W * 0.8} ${H * 0.16}`}
            stroke={guardian.secondary}
            strokeWidth={5}
            fill="none"
            strokeLinecap="round"
          />
          {/* start */}
          <Circle cx={W * 0.2} cy={H * 0.82} r={9} fill={guardian.success} />
          <Circle cx={W * 0.2} cy={H * 0.82} r={16} fill="rgba(34,197,94,0.25)" />
          {/* destination */}
          <Circle cx={W * 0.8} cy={H * 0.16} r={9} fill={guardian.primary} />
          <Circle cx={W * 0.8} cy={H * 0.16} r={16} fill="rgba(229,57,53,0.25)" />
        </Svg>

        {/* Back + labels */}
        <Pressable onPress={() => router.back()} style={{ position: "absolute", top: 56, left: 20, width: 42, height: 42, borderRadius: 14, backgroundColor: "rgba(17,24,39,0.85)", alignItems: "center", justifyContent: "center" }}>
          <ChevronLeft color="#fff" size={24} />
        </Pressable>
        <View style={{ position: "absolute", top: 56, right: 20, backgroundColor: "rgba(17,24,39,0.85)", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, flexDirection: "row", alignItems: "center" }}>
          <TriangleAlert color={guardian.warning} size={14} />
          <Text style={{ color: "#fff", fontSize: 12, marginLeft: 6 }}>2 zones avoided</Text>
        </View>
      </LinearGradient>

      {/* Bottom card */}
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ color: theme.text, fontSize: 22, fontWeight: "900" }}>AI Safe Route</Text>
        <Text style={{ color: theme.textDim, fontSize: 13, marginTop: 2 }}>Routed around reported unsafe areas.</Text>

        <GlassCard style={{ marginTop: 16 }}>
          <View className="flex-row" style={{ justifyContent: "space-between" }}>
            <Stat icon={Clock} label="Est. Time" value="14 min" tint={guardian.secondary} />
            <Stat icon={Ruler} label="Distance" value="1.2 km" tint="#06B6D4" />
            <Stat icon={ShieldCheck} label="Safety" value="High" tint={guardian.success} />
          </View>
        </GlassCard>

        <View style={{ flex: 1 }} />
        <GradientButton label="Start Navigation" variant="guardian" size="lg" icon={<NavIcon color="#fff" size={18} />} onPress={() => {}} />
      </View>
    </View>
  );
}

function Stat({ icon: Icon, label, value, tint }: { icon: typeof Clock; label: string; value: string; tint: string }) {
  const { theme } = useTheme();
  return (
    <View style={{ alignItems: "center", flex: 1 }}>
      <Icon color={tint} size={20} />
      <Text style={{ color: theme.text, fontSize: 16, fontWeight: "800", marginTop: 6 }}>{value}</Text>
      <Text style={{ color: theme.textDim, fontSize: 11, marginTop: 2 }}>{label}</Text>
    </View>
  );
}
