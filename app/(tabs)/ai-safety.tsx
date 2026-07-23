import React, { useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useSafeHavenStore } from "@/stores/useSafeHavenStore";
import SafePlaceCard from "@/components/safeHaven/SafePlaceCard";
import { CATEGORY_COLOR, CATEGORY_ICON, formatDistance, openDirections } from "@/lib/safeHaven";
import colors from "@/lib/theme";

export default function AISafety() {
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

  // Other options = ranked list minus the recommended top pick.
  const others = recommendation
    ? places.filter((p) => p.id !== recommendation.id)
    : places;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="dark" />

      <View className="px-5 pt-4 pb-3 border-b border-brand-100">
        <View className="flex-row items-center">
          <Ionicons name="sparkles" size={22} color={colors.brand[600]} />
          <Text className="text-[#28131a] text-xl font-bold ml-2">AI Safe Haven Finder</Text>
        </View>
        <Text className="text-[#8a6b73] text-sm mt-1">
          Finds the safest nearby place to head to — not just the closest.
        </Text>
      </View>

      <ScrollView className="flex-1 bg-brand-50" showsVerticalScrollIndicator={false}>
        <View className="p-5">
          <TouchableOpacity
            onPress={onFind}
            disabled={loading}
            activeOpacity={0.85}
            className="flex-row items-center justify-center bg-brand-600 rounded-2xl py-4"
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Ionicons name="locate" size={18} color="#ffffff" />
                <Text className="text-white font-bold text-base ml-2">Find safe places near me</Text>
              </>
            )}
          </TouchableOpacity>

          {error && (
            <Text className="text-sos-600 text-sm mt-3">{error}</Text>
          )}

          {message && !recommendation && (
            <View className="bg-white border border-brand-100 rounded-2xl p-4 mt-4">
              <Text className="text-[#8a6b73] text-sm">{message}</Text>
            </View>
          )}

          {recommendation && (
            <View className="mt-5">
              <Text className="text-[#28131a] text-base font-bold mb-2">Safest destination</Text>

              <View className="bg-white border border-brand-200 rounded-3xl p-4">
                <View className="flex-row items-center">
                  <View
                    className="w-14 h-14 rounded-2xl items-center justify-center mr-3"
                    style={{ backgroundColor: `${CATEGORY_COLOR[recommendation.category]}1a` }}
                  >
                    <Ionicons
                      name={CATEGORY_ICON[recommendation.category]}
                      size={28}
                      color={CATEGORY_COLOR[recommendation.category]}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[#28131a] text-lg font-extrabold" numberOfLines={1}>
                      {recommendation.name}
                    </Text>
                    <Text className="text-[#8a6b73] text-xs mt-0.5">
                      {recommendation.categoryLabel} · {formatDistance(recommendation.distanceMeters)}
                    </Text>
                  </View>
                </View>

                <Text className="text-[#28131a] text-sm mt-3 leading-5">{recommendation.reason}</Text>

                <TouchableOpacity
                  onPress={() => openDirections(recommendation)}
                  activeOpacity={0.85}
                  className="flex-row items-center justify-center bg-brand-600 rounded-2xl py-3 mt-4"
                >
                  <Ionicons name="navigate" size={16} color="#ffffff" />
                  <Text className="text-white font-bold ml-2">Get directions</Text>
                </TouchableOpacity>
              </View>

              {others.length > 0 && (
                <>
                  <Text className="text-[#28131a] text-base font-bold mt-6 mb-2">Other safe options</Text>
                  <View style={{ gap: 10 }}>
                    {others.map((p) => (
                      <SafePlaceCard key={p.id} place={p} />
                    ))}
                  </View>
                </>
              )}
            </View>
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
