import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter, type Href } from "expo-router";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import {
  MapPin,
  Route,
  PhoneCall,
  Users,
  Bot,
  ShieldAlert,
  ChevronRight,
  Building2,
  Cross,
  Navigation as NavIcon,
} from "lucide-react-native";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { useContactStore } from "@/stores/useContactStore";
import { useSafeHavenStore } from "@/stores/useSafeHavenStore";
import { guardian, CATEGORY_TINT } from "@/lib/theme";
import Screen from "@/components/ui/Screen";
import GlassCard from "@/components/ui/GlassCard";
import Pulse from "@/components/ui/Pulse";
import SafetyGauge from "@/components/ui/SafetyGauge";
import FadeInView from "@/components/ui/FadeInView";
import SectionTitle from "@/components/ui/SectionTitle";
import Shimmer from "@/components/ui/Shimmer";
import { formatDistance, openDirections } from "@/lib/safeHaven";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

const QUICK_ACTIONS = [
  { label: "Find Safe Place", icon: MapPin, href: "/(tabs)/ai-safety", tint: guardian.secondary },
  { label: "Safe Route", icon: Route, href: "/safe-route", tint: "#06B6D4" },
  { label: "Fake Call", icon: PhoneCall, href: "/fake-call", tint: guardian.success },
  { label: "Community", icon: Users, href: "/(tabs)/community", tint: "#8B5CF6" },
  { label: "Assistant", icon: Bot, href: "/(tabs)/assistant", tint: guardian.warning },
] as const;

export default function Home() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  const contacts = useContactStore((s) => s.contacts);
  const loadContacts = useContactStore((s) => s.loadContacts);
  const { places, loading: scanning, findNearby } = useSafeHavenStore();

  const [locStatus, setLocStatus] = useState<"idle" | "active" | "denied">("idle");

  const displayName = user?.fullName?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  // Time-of-day area-safety indicator (deterministic heuristic, not a live feed).
  const areaScore = useMemo(() => {
    const h = new Date().getHours();
    if (h >= 7 && h < 18) return 86;
    if (h >= 18 && h < 21) return 68;
    return 52;
  }, []);
  const risk = areaScore >= 75 ? "Low Risk" : areaScore >= 55 ? "Moderate" : "Elevated";

  useEffect(() => {
    loadContacts().catch(() => {});
    (async () => {
      try {
        const perm = await Location.requestForegroundPermissionsAsync();
        if (!perm.granted) return setLocStatus("denied");
        setLocStatus("active");
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (places.length === 0) {
          findNearby({ lat: pos.coords.latitude, lng: pos.coords.longitude }).catch(() => {});
        }
      } catch {
        setLocStatus("denied");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nearestPolice = places.find((p) => p.category === "police");
  const nearestHospital = places.find((p) => p.category === "hospital");

  const onSos = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    router.push("/(sos)/active" as Href);
  }, [router]);

  return (
    <Screen scroll glow={guardian.secondary} contentStyle={{ paddingBottom: 120 }}>
      {/* Header */}
      <FadeInView from="top">
        <View className="flex-row items-center justify-between">
          <View>
            <Text style={{ color: theme.textDim, fontSize: 14 }}>{greeting()},</Text>
            <Text style={{ color: theme.text, fontSize: 26, fontWeight: "900" }}>{displayName} 👋</Text>
          </View>
          <Pressable onPress={() => router.push("/(tabs)/profile" as Href)}>
            <LinearGradient
              colors={guardian.gradViolet}
              style={{ width: 46, height: 46, borderRadius: 16, alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 18 }}>
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </FadeInView>

      {/* SOS */}
      <FadeInView delay={80}>
        <View style={{ alignItems: "center", marginTop: 24, marginBottom: 8 }}>
          <Pulse color={guardian.primary} size={190} rings={3}>
            <Pressable onPress={onSos}>
              <LinearGradient
                colors={guardian.gradRed}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 176,
                  height: 176,
                  borderRadius: 88,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: guardian.primary,
                  shadowOpacity: 0.6,
                  shadowRadius: 30,
                  shadowOffset: { width: 0, height: 0 },
                  elevation: 12,
                }}
              >
                <ShieldAlert color="#fff" size={48} strokeWidth={2.2} />
                <Text style={{ color: "#fff", fontSize: 30, fontWeight: "900", marginTop: 6, letterSpacing: 2 }}>
                  SOS
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 11, marginTop: 2 }}>
                  Tap or shake
                </Text>
              </LinearGradient>
            </Pressable>
          </Pulse>
        </View>
      </FadeInView>

      {/* Safety score + risk */}
      <FadeInView delay={140}>
        <View className="flex-row" style={{ gap: 12, marginTop: 8 }}>
          <GlassCard style={{ flex: 1, alignItems: "center" }}>
            <SafetyGauge value={areaScore} label="Area Safety" />
          </GlassCard>
          <GlassCard style={{ flex: 1, justifyContent: "center" }}>
            <Text style={{ color: theme.textDim, fontSize: 12, fontWeight: "600" }}>RISK LEVEL</Text>
            <Text style={{ color: areaScore >= 75 ? guardian.success : areaScore >= 55 ? guardian.warning : guardian.primary, fontSize: 24, fontWeight: "900", marginTop: 6 }}>
              {risk}
            </Text>
            <View className="flex-row items-center" style={{ marginTop: 10 }}>
              <MapPin color={theme.textDim} size={14} />
              <Text style={{ color: theme.textDim, fontSize: 12, marginLeft: 5 }} numberOfLines={1}>
                {locStatus === "active" ? "Location secured" : locStatus === "denied" ? "Location off" : "Locating…"}
              </Text>
            </View>
          </GlassCard>
        </View>
      </FadeInView>

      {/* Quick actions */}
      <FadeInView delay={200} style={{ marginTop: 24 }}>
        <SectionTitle title="Quick Actions" />
        <View className="flex-row flex-wrap" style={{ gap: 12 }}>
          {QUICK_ACTIONS.map((a) => {
            const Icon = a.icon;
            return (
              <Pressable
                key={a.label}
                onPress={() => router.push(a.href as Href)}
                style={{ width: "31%" }}
              >
                <GlassCard style={{ alignItems: "center", paddingVertical: 18 }} padded={false}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      backgroundColor: `${a.tint}22`,
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Icon color={a.tint} size={22} strokeWidth={2.2} />
                  </View>
                  <Text style={{ color: theme.text, fontSize: 11.5, fontWeight: "600", textAlign: "center" }}>
                    {a.label}
                  </Text>
                </GlassCard>
              </Pressable>
            );
          })}
        </View>
      </FadeInView>

      {/* Nearby safe places */}
      <FadeInView delay={260} style={{ marginTop: 24 }}>
        <SectionTitle title="Nearby Safe Places" action="See all" onAction={() => router.push("/(tabs)/ai-safety" as Href)} />
        <View style={{ gap: 12 }}>
          {scanning && places.length === 0 ? (
            <>
              <GlassCard><Shimmer height={18} width="70%" /><Shimmer height={12} width="40%" style={{ marginTop: 10 }} /></GlassCard>
              <GlassCard><Shimmer height={18} width="60%" /><Shimmer height={12} width="45%" style={{ marginTop: 10 }} /></GlassCard>
            </>
          ) : (
            <>
              <NearbyRow label="Nearest Police" place={nearestPolice} icon={Building2} tint={CATEGORY_TINT.police} />
              <NearbyRow label="Nearest Hospital" place={nearestHospital} icon={Cross} tint={CATEGORY_TINT.hospital} />
            </>
          )}
        </View>
      </FadeInView>

      {/* Guardian circle */}
      <FadeInView delay={320} style={{ marginTop: 24 }}>
        <SectionTitle title="Guardian Circle" action="Manage" onAction={() => router.push("/(tabs)/circle" as Href)} />
        <GlassCard>
          {contacts.length === 0 ? (
            <Text style={{ color: theme.textDim, fontSize: 13 }}>
              Add trusted contacts so they’re alerted the moment you need help.
            </Text>
          ) : (
            <View className="flex-row items-center">
              {contacts.slice(0, 4).map((c, i) => (
                <View
                  key={c.id}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    backgroundColor: guardian.cardAlt,
                    borderWidth: 2,
                    borderColor: theme.card,
                    alignItems: "center",
                    justifyContent: "center",
                    marginLeft: i === 0 ? 0 : -10,
                  }}
                >
                  <Text style={{ color: theme.text, fontWeight: "700" }}>{c.name.charAt(0).toUpperCase()}</Text>
                </View>
              ))}
              <Text style={{ color: theme.textDim, marginLeft: 12, fontSize: 13 }}>
                {contacts.length} guardian{contacts.length > 1 ? "s" : ""} protecting you
              </Text>
            </View>
          )}
        </GlassCard>
      </FadeInView>
    </Screen>
  );
}

function NearbyRow({
  label,
  place,
  icon: Icon,
  tint,
}: {
  label: string;
  place: ReturnType<typeof useSafeHavenStore.getState>["places"][number] | undefined;
  icon: typeof Building2;
  tint: string;
}) {
  const { theme } = useTheme();
  return (
    <GlassCard>
      <View className="flex-row items-center">
        <View
          style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: `${tint}22`, alignItems: "center", justifyContent: "center", marginRight: 12 }}
        >
          <Icon color={tint} size={22} strokeWidth={2.2} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.textDim, fontSize: 11, fontWeight: "600" }}>{label}</Text>
          <Text style={{ color: theme.text, fontSize: 15, fontWeight: "700" }} numberOfLines={1}>
            {place ? place.name : "Scan to discover"}
          </Text>
          {place ? (
            <Text style={{ color: theme.textDim, fontSize: 12, marginTop: 1 }}>
              {formatDistance(place.distanceMeters)} away
            </Text>
          ) : null}
        </View>
        {place ? (
          <Pressable onPress={() => openDirections(place)} hitSlop={8}>
            <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: theme.cardAlt, alignItems: "center", justifyContent: "center" }}>
              <NavIcon color={theme.secondary} size={18} />
            </View>
          </Pressable>
        ) : (
          <ChevronRight color={theme.textMuted} size={20} />
        )}
      </View>
    </GlassCard>
  );
}
