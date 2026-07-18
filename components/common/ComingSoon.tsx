// components/common/ComingSoon.tsx
// Generic placeholder screen for features not yet built during the hackathon.
import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

interface ComingSoonProps {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export default function ComingSoon({ title, description, icon }: ComingSoonProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="dark" />
      <View className="flex-1 items-center justify-center px-8">
        <View className="w-20 h-20 rounded-3xl bg-brand-50 items-center justify-center mb-6 border border-brand-100">
          <Ionicons name={icon} size={36} color="#e11d48" />
        </View>
        <Text className="text-[#28131a] text-2xl font-bold text-center">{title}</Text>
        <Text className="text-[#8a6b73] text-base mt-3 text-center leading-6">
          {description}
        </Text>
        <View className="mt-8 px-5 py-2 bg-accent-100 rounded-full">
          <Text className="text-accent-600 font-semibold text-xs tracking-wider">
            COMING SOON
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
