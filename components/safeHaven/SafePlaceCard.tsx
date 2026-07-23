import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { SafePlace } from "@/stores/useSafeHavenStore";
import { CATEGORY_COLOR, CATEGORY_ICON, formatDistance, openDirections } from "@/lib/safeHaven";

interface Props {
  place: SafePlace;
  highlighted?: boolean;
}

// One place row/card with an icon, name, category, distance, factor chips and a
// Directions button. Reused by the AI Safety list and the active-SOS card.
export default function SafePlaceCard({ place, highlighted = false }: Props) {
  const color = CATEGORY_COLOR[place.category];

  return (
    <View
      className={`flex-row items-center rounded-2xl p-3 ${
        highlighted ? "bg-brand-50 border border-brand-200" : "bg-white border border-brand-100"
      }`}
    >
      <View
        className="w-11 h-11 rounded-xl items-center justify-center mr-3"
        style={{ backgroundColor: `${color}1a` }}
      >
        <Ionicons name={CATEGORY_ICON[place.category]} size={22} color={color} />
      </View>

      <View className="flex-1 pr-2">
        <Text className="text-[#28131a] font-semibold text-sm" numberOfLines={1}>
          {place.name}
        </Text>
        <Text className="text-[#8a6b73] text-xs mt-0.5">
          {place.categoryLabel} · {formatDistance(place.distanceMeters)}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => openDirections(place)}
        activeOpacity={0.85}
        className="flex-row items-center bg-brand-600 rounded-full px-3 py-2"
      >
        <Ionicons name="navigate" size={14} color="#ffffff" />
        <Text className="text-white text-xs font-semibold ml-1">Directions</Text>
      </TouchableOpacity>
    </View>
  );
}
