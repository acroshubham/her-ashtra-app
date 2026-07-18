import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth-context";

export default function Settings() {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="dark" />
      <View className="px-5 pt-4 pb-3 border-b border-brand-100">
        <Text className="text-2xl font-bold text-[#28131a]">Settings</Text>
      </View>

      <View className="p-5">
        <View className="bg-brand-50 rounded-2xl p-5 flex-row items-center mb-6 border border-brand-100">
          <View className="w-14 h-14 rounded-full bg-brand-500 items-center justify-center mr-4">
            <Ionicons name="person" size={26} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="text-[#28131a] font-bold text-base" numberOfLines={1}>
              {user?.fullName || user?.email?.split("@")[0] || "User"}
            </Text>
            <Text className="text-[#8a6b73] text-sm" numberOfLines={1}>
              {user?.email}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => logout()}
          activeOpacity={0.85}
          className="bg-red-50 border border-red-200 rounded-2xl py-4 flex-row items-center justify-center"
        >
          <Ionicons name="log-out-outline" size={18} color="#ef4444" />
          <Text className="text-red-500 font-bold text-base ml-2">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
