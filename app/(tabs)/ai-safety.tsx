import React, { useCallback } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import * as Location from "expo-location";
import { LinearGradient } from "expo-linear-gradient";
import {
  ShieldCheck,
  Building2,
  Cross,
  Train,
  BedDouble,
  Fuel,
  Pill,
  Landmark,
  Store,
  Navigation as NavIcon,
  Sparkles,
  type LucideIcon,
} from "lucide-react-native";
import { useSafeHavenStore, type PlaceCategory, type SafePlace } from "@/stores/useSafeHavenStore";
import { useTheme } from "@/lib/theme-context";
import { guardian, CATEGORY_TINT } from "@/lib/theme";
import Screen from "@/components/ui/Screen";
import GlassCard from "@/components/ui/GlassCard";
import GradientButton from "@/components/ui/GradientButton";
import FadeInView from "@/components/ui/FadeInView";
import SectionTitle from "@/components/ui/SectionTitle";
import Shimmer from "@/components/ui/Shimmer";
import { formatDistance, openDirections } from "@/lib/safeHaven";

const CATEGORY_ICON: Record<PlaceCategory, LucideIcon> = {
  police: Building2,
  hospital: Cross,
  fire_station: ShieldCheck,
  petrol_pump: Fuel,
  metro: Train,
  hotel: BedDouble,
  mall: Store,
  pharmacy: Pill,
  government: Landmark,
};

function scorePct(score: number) {
  return Math.round(score * 100);
}
function scoreTint(pct: number) {
  return pct >= 75 ? guardian.success : pct >= 55 ? guardian.warning : guardian.primary;
}

export default function AISafety() {
  const { theme } = useTheme();
  const { recommendation, places, message, loading, error, findNearby } = useSafeHavenStore();

  const onFind = useCallback(async () => {
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Location needed", "Allow location access to find safe places near you.");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      await findNearby({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    } catch {
      Alert.alert("Couldn't get your location", "Please try again.");
    }
  }, [findNearby]);

  const others = recommendation ? places.filter((p) => p.id !== recommendation.id) : places;

  return (
    <Screen scroll glow={guardian.secondary} contentStyle={{ paddingBottom: 120 }}>
      <FadeInView from="top">
        <View className="flex-row items-center">
          <LinearGradient
            colors={guardian.gradBlue}
            style={{ width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" }}
          >
            <Sparkles color="#fff" size={22} />
          </LinearGradient>
          <View style={{ marginLeft: 12 }}>
            <Text style={{ color: theme.text, fontSize: 22, fontWeight: "900" }}>AI Safe Haven</Text>
            <Text style={{ color: theme.textDim, fontSize: 13 }}>The safest place to go — not just the closest.</Text>
          </View>
        </View>
      </FadeInView>

      <FadeInView delay={80} style={{ marginTop: 20 }}>
        <GradientButton
          label={loading ? "Scanning nearby…" : "Find Safe Places"}
          variant="guardian"
          size="lg"
          loading={loading}
          onPress={onFind}
          icon={<NavIcon color="#fff" size={18} />}
        />
      </FadeInView>

      {error ? (
        <Text style={{ color: guardian.primary, fontSize: 13, marginTop: 12 }}>{error}</Text>
      ) : null}

      {message && !recommendation ? (
        <GlassCard style={{ marginTop: 16 }}>
          <Text style={{ color: theme.textDim, fontSize: 13 }}>{message}</Text>
        </GlassCard>
      ) : null}

      {loading && places.length === 0 ? (
        <View style={{ marginTop: 20, gap: 12 }}>
          <GlassCard><Shimmer height={22} width="65%" /><Shimmer height={14} width="90%" style={{ marginTop: 12 }} /><Shimmer height={44} radius={14} style={{ marginTop: 16 }} /></GlassCard>
          <GlassCard><Shimmer height={18} width="55%" /></GlassCard>
        </View>
      ) : null}

      {recommendation ? (
        <FadeInView delay={60} style={{ marginTop: 22 }}>
          <SectionTitle title="Recommended Safe Place" />
          <GlassCard style={{ borderColor: `${guardian.success}55` }}>
            <View className="flex-row items-center">
              <View
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 18,
                  backgroundColor: `${CATEGORY_TINT[recommendation.category] ?? guardian.secondary}22`,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {React.createElement(CATEGORY_ICON[recommendation.category], {
                  color: CATEGORY_TINT[recommendation.category] ?? guardian.secondary,
                  size: 28,
                })}
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: theme.text, fontSize: 18, fontWeight: "800" }} numberOfLines={1}>
                  {recommendation.name}
                </Text>
                <Text style={{ color: theme.textDim, fontSize: 12, marginTop: 2 }}>
                  {recommendation.categoryLabel} · {formatDistance(recommendation.distanceMeters)}
                </Text>
              </View>
              <ScoreBadge pct={scorePct(recommendation.score)} />
            </View>

            <View
              style={{ backgroundColor: theme.cardAlt, borderRadius: 14, padding: 12, marginTop: 14, flexDirection: "row" }}
            >
              <Sparkles color={guardian.secondary} size={16} style={{ marginTop: 1 }} />
              <Text style={{ color: theme.text, fontSize: 13, lineHeight: 19, marginLeft: 8, flex: 1 }}>
                {recommendation.reason}
              </Text>
            </View>

            <GradientButton
              label="Get Directions"
              variant="success"
              onPress={() => openDirections(recommendation)}
              icon={<NavIcon color="#fff" size={16} />}
              style={{ marginTop: 14 }}
            />
          </GlassCard>
        </FadeInView>
      ) : null}

      {others.length > 0 ? (
        <FadeInView delay={120} style={{ marginTop: 24 }}>
          <SectionTitle title="Nearby Safe Places" />
          <View style={{ gap: 12 }}>
            {others.map((p) => (
              <PlaceRow key={p.id} place={p} />
            ))}
          </View>
        </FadeInView>
      ) : null}
    </Screen>
  );
}

function ScoreBadge({ pct }: { pct: number }) {
  const tint = scoreTint(pct);
  return (
    <View style={{ alignItems: "center", marginLeft: 8 }}>
      <View
        style={{
          width: 46,
          height: 46,
          borderRadius: 23,
          borderWidth: 3,
          borderColor: tint,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: tint, fontWeight: "900", fontSize: 15 }}>{pct}</Text>
      </View>
      <Text style={{ color: tint, fontSize: 9, fontWeight: "700", marginTop: 3 }}>SAFETY</Text>
    </View>
  );
}

function PlaceRow({ place }: { place: SafePlace }) {
  const { theme } = useTheme();
  const tint = CATEGORY_TINT[place.category] ?? guardian.secondary;
  const pct = scorePct(place.score);
  const Icon = CATEGORY_ICON[place.category];
  return (
    <GlassCard>
      <View className="flex-row items-center">
        <View
          style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: `${tint}22`, alignItems: "center", justifyContent: "center", marginRight: 12 }}
        >
          <Icon color={tint} size={22} strokeWidth={2.2} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.text, fontSize: 15, fontWeight: "700" }} numberOfLines={1}>
            {place.name}
          </Text>
          <Text style={{ color: theme.textDim, fontSize: 12, marginTop: 1 }}>
            {place.categoryLabel} · {formatDistance(place.distanceMeters)} · {pct} safety
          </Text>
        </View>
        <Pressable onPress={() => openDirections(place)} hitSlop={8}>
          <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: theme.cardAlt, alignItems: "center", justifyContent: "center" }}>
            <NavIcon color={theme.secondary} size={18} />
          </View>
        </Pressable>
      </View>
    </GlassCard>
  );
}
