import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useContactStore } from "@/stores/useContactStore";
import colors from "@/lib/theme";

export default function Circle() {
  const { contacts, loading, loadContacts, addContact, removeContact } = useContactStore();
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const onAdd = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert("Missing info", "Name and email are required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert("Invalid email", "Enter a valid email address, e.g. mom@example.com.");
      return;
    }
    if (phone.trim() && !/^\+[1-9]\d{7,14}$/.test(phone.trim())) {
      Alert.alert("Invalid phone", "Leave phone blank or use international format, e.g. +919000000001.");
      return;
    }
    setSaving(true);
    const created = await addContact({
      name: name.trim(),
      relation: relation.trim() || undefined,
      email: email.trim(),
      phone: phone.trim() || undefined,
    });
    setSaving(false);
    if (created) {
      setName("");
      setRelation("");
      setEmail("");
      setPhone("");
    } else {
      Alert.alert("Couldn't add contact", useContactStore.getState().error || "Please try again.");
    }
  };

  const onDelete = (id: string, contactName: string) => {
    Alert.alert("Remove contact", `Remove ${contactName} from your trusted circle?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => removeContact(id) },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="dark" />
      <View className="px-5 py-4 border-b border-brand-100">
        <Text className="text-2xl font-bold text-[#28131a]">Trusted Circle</Text>
        <Text className="text-[#8a6b73] text-sm mt-1">
          These contacts get an email with your live location when you trigger an SOS.
        </Text>
      </View>

      <ScrollView className="flex-1 bg-brand-50" showsVerticalScrollIndicator={false}>
        <View className="p-5">
          {/* Add form */}
          <View className="bg-white rounded-2xl border border-brand-100 p-4 mb-5">
            <Text className="text-[#28131a] font-bold mb-3">Add a contact</Text>
            <TextInput
              placeholder="Name"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
              className="bg-brand-50 border border-brand-100 rounded-xl px-4 py-3 mb-3 text-[#28131a]"
            />
            <TextInput
              placeholder="Relation (optional)"
              placeholderTextColor={colors.textMuted}
              value={relation}
              onChangeText={setRelation}
              className="bg-brand-50 border border-brand-100 rounded-xl px-4 py-3 mb-3 text-[#28131a]"
            />
            <TextInput
              placeholder="Email e.g. mom@example.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              className="bg-brand-50 border border-brand-100 rounded-xl px-4 py-3 mb-3 text-[#28131a]"
            />
            <TextInput
              placeholder="Phone (optional) e.g. +919000000001"
              placeholderTextColor={colors.textMuted}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoCapitalize="none"
              className="bg-brand-50 border border-brand-100 rounded-xl px-4 py-3 mb-4 text-[#28131a]"
            />
            <TouchableOpacity
              onPress={onAdd}
              disabled={saving}
              activeOpacity={0.85}
              className="bg-brand-600 rounded-xl py-3 items-center flex-row justify-center"
            >
              {saving ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="person-add" size={18} color="#ffffff" />
                  <Text className="text-white font-bold ml-2">Add contact</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* List */}
          <Text className="text-[#28131a] font-bold mb-3">
            Your circle {contacts.length > 0 ? `(${contacts.length})` : ""}
          </Text>

          {loading && contacts.length === 0 ? (
            <ActivityIndicator color={colors.brand[600]} className="mt-6" />
          ) : contacts.length === 0 ? (
            <View className="bg-white rounded-2xl border border-brand-100 p-6 items-center">
              <Ionicons name="heart-outline" size={32} color={colors.textMuted} />
              <Text className="text-[#8a6b73] text-center mt-2">
                {"No contacts yet. Add someone you trust so they're alerted in an emergency."}
              </Text>
            </View>
          ) : (
            contacts.map((c) => (
              <View
                key={c.id}
                className="bg-white rounded-2xl border border-brand-100 p-4 mb-3 flex-row items-center"
              >
                <View
                  className="w-11 h-11 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: colors.brand[100] }}
                >
                  <Ionicons name="person" size={20} color={colors.brand[600]} />
                </View>
                <View className="flex-1">
                  <Text className="text-[#28131a] font-semibold">{c.name}</Text>
                  <Text className="text-[#8a6b73] text-xs">
                    {c.relation ? `${c.relation} · ` : ""}
                    {c.email ?? c.phone ?? ""}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => onDelete(c.id, c.name)} className="p-2">
                  <Ionicons name="trash-outline" size={20} color={colors.sos[500]} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
