import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, RefreshControl, Linking, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { apiFetch } from "@/lib/api";
import colors from "@/lib/theme";

interface SosEvent {
  id: string;
  status: "active" | "resolved" | "cancelled";
  initialLat: number | null;
  initialLng: number | null;
  mediaUrl: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

const STATUS_META: Record<SosEvent["status"], { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  active: { label: "Active", color: colors.sos[500], icon: "radio" },
  resolved: { label: "Resolved", color: colors.success[500], icon: "checkmark-circle" },
  cancelled: { label: "Cancelled", color: colors.textMuted, icon: "close-circle" },
};

export default function Alerts() {
  const [events, setEvents] = useState<SosEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<SosEvent[]>("/api/sos");
      setEvents(data);
    } catch {
      // leave whatever we have
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="dark" />
      <View className="px-5 py-4 border-b border-brand-100">
        <Text className="text-2xl font-bold text-[#28131a]">SOS Alerts</Text>
        <Text className="text-[#8a6b73] text-sm mt-1">
          {"Every SOS you've triggered, with location and outcome."}
        </Text>
      </View>

      <ScrollView
        className="flex-1 bg-brand-50"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.brand[600]} />}
      >
        <View className="p-5">
          {events.length === 0 && !loading ? (
            <View className="bg-white rounded-2xl border border-brand-100 p-6 items-center mt-4">
              <Ionicons name="shield-checkmark-outline" size={32} color={colors.textMuted} />
              <Text className="text-[#8a6b73] text-center mt-2">
                No SOS alerts yet. Shake your phone or tap the SOS button to send one.
              </Text>
            </View>
          ) : (
            events.map((e) => {
              const meta = STATUS_META[e.status];
              const hasCoords = e.initialLat != null && e.initialLng != null;
              return (
                <View key={e.id} className="bg-white rounded-2xl border border-brand-100 p-4 mb-3">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Ionicons name={meta.icon} size={18} color={meta.color} />
                      <Text className="font-bold ml-2" style={{ color: meta.color }}>
                        {meta.label}
                      </Text>
                    </View>
                    <Text className="text-[#8a6b73] text-xs">
                      {new Date(e.createdAt).toLocaleString()}
                    </Text>
                  </View>

                  <View className="flex-row items-center flex-wrap mt-3" style={{ gap: 8 }}>
                    {hasCoords && (
                      <TouchableOpacity
                        onPress={() =>
                          Linking.openURL(`https://maps.google.com/?q=${e.initialLat},${e.initialLng}`)
                        }
                        className="flex-row items-center bg-brand-50 rounded-full px-3 py-1.5"
                      >
                        <Ionicons name="location" size={14} color={colors.brand[600]} />
                        <Text className="text-brand-600 text-xs font-semibold ml-1">Map</Text>
                      </TouchableOpacity>
                    )}
                    {e.mediaUrl && (
                      <TouchableOpacity
                        onPress={() => Linking.openURL(e.mediaUrl!)}
                        className="flex-row items-center bg-brand-50 rounded-full px-3 py-1.5"
                      >
                        <Ionicons name="videocam" size={14} color={colors.brand[600]} />
                        <Text className="text-brand-600 text-xs font-semibold ml-1">Video</Text>
                      </TouchableOpacity>
                    )}
                    {e.resolvedAt && (
                      <Text className="text-[#8a6b73] text-xs">
                        Resolved {new Date(e.resolvedAt).toLocaleTimeString()}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
