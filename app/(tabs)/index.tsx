import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, type Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth-context";
import HomeHeader from "@/components/home/HomeHeader";

const QUICK_LINKS: Array<{
  href: Href;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
}> = [
  { href: "/(tabs)/guardian-network", label: "Guardian Network", icon: "people", color: "#7c3aed", bg: "#ede9fe" },
  { href: "/(tabs)/ai-safety", label: "AI Safety", icon: "sparkles", color: "#e11d48", bg: "#ffe4e6" },
  { href: "/(tabs)/offline-sos", label: "Offline SOS", icon: "cellular", color: "#0891b2", bg: "#cffafe" },
  { href: "/(tabs)/circle", label: "Trusted Circle", icon: "heart", color: "#059669", bg: "#d1fae5" },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  const displayName = user?.fullName || user?.email?.split("@")[0] || "there";

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="dark" />
      <HomeHeader />

      <ScrollView className="flex-1 bg-brand-50" showsVerticalScrollIndicator={false}>
        <View className="p-5">
          <View className="mb-6">
            <Text className="text-[#8a6b73] text-sm font-medium">{getGreeting()}</Text>
            <Text className="text-2xl font-bold text-[#28131a] mt-1">{displayName}</Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/(tabs)/safe-trip")}
            activeOpacity={0.85}
            className="bg-sos-500 rounded-3xl py-8 items-center mb-7 shadow-lg"
          >
            <Ionicons name="alert-circle" size={40} color="#ffffff" />
            <Text className="text-white text-xl font-extrabold mt-2 tracking-wide">SOS</Text>
            <Text className="text-white/80 text-xs mt-1">Tap to start a Safe Trip</Text>
          </TouchableOpacity>

          <Text className="text-[#28131a] text-lg font-bold mb-3">Explore</Text>
          <View className="flex-row flex-wrap" style={{ gap: 12 }}>
            {QUICK_LINKS.map((link) => (
              <TouchableOpacity
                key={link.href as string}
                onPress={() => router.push(link.href)}
                style={{ width: "47%" }}
                className="bg-white border border-brand-100 rounded-2xl p-4"
              >
                <View
                  className="w-11 h-11 rounded-xl items-center justify-center mb-3"
                  style={{ backgroundColor: link.bg }}
                >
                  <Ionicons name={link.icon} size={20} color={link.color} />
                </View>
                <Text className="text-[#28131a] font-semibold text-sm">{link.label}</Text>
                <Text className="text-[#8a6b73] text-xs mt-0.5">Coming soon</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
