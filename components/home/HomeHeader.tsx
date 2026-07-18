import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useContactStore } from "@/stores/useContactStore";
import Dropdown from "@/components/common/Dropdown";

export const HomeHeader: React.FC = () => {
  const router = useRouter();
  const { contacts, selectedContact, setSelectedContact } = useContactStore();

  return (
    <View className="px-4 py-4 bg-white border-b border-brand-100 z-10">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-[#8a6b73] text-xs font-semibold tracking-wide">
            SHARING LIVE LOCATION WITH
          </Text>
          <Dropdown
            items={contacts}
            selected={selectedContact}
            onSelect={setSelectedContact}
            getLabel={(c) => c.name}
            getSubLabel={(c) => c.relation}
            getKey={(c) => c.id}
            placeholder="Select a guardian"
          />
        </View>

        <TouchableOpacity
          onPress={() => router.push("/(tabs)/settings")}
          className="w-10 h-10 bg-brand-50 rounded-full items-center justify-center ml-3 border border-brand-100"
        >
          <Ionicons name="person" size={20} color="#e11d48" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeHeader;
