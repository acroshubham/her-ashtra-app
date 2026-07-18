import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth-context";

export default function Register() {
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setError(null);
    setLoading(true);
    const result = await register(email.trim(), password, fullName.trim() || undefined);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    }
    // On success, AuthGate redirects to /(tabs) automatically.
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-50">
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
            keyboardShouldPersistTaps="handled"
            className="p-6"
          >
            <View className="items-center mb-8">
              <View className="w-16 h-16 rounded-2xl bg-brand-500 items-center justify-center mb-4 shadow-lg shadow-brand-500/40">
                <Ionicons name="person-add" size={32} color="#ffffff" />
              </View>
              <Text className="text-[#28131a] text-3xl font-bold text-center">Create Account</Text>
              <Text className="text-[#8a6b73] text-base mt-2 text-center">
                Join the network that keeps you safe.
              </Text>
            </View>

            <View className="bg-white rounded-3xl p-8 shadow-xl border border-brand-100">
              {error && (
                <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-6">
                  <Text className="text-red-500 text-sm text-center font-medium">{error}</Text>
                </View>
              )}

              <View className="mb-4">
                <Text className="text-[#8a6b73] text-sm font-semibold mb-2 ml-1">FULL NAME</Text>
                <TextInput
                  className="bg-brand-50 rounded-2xl p-4 text-[#28131a] border border-brand-100"
                  placeholder="Your name"
                  placeholderTextColor="#c98d9a"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>

              <View className="mb-4">
                <Text className="text-[#8a6b73] text-sm font-semibold mb-2 ml-1">EMAIL</Text>
                <TextInput
                  className="bg-brand-50 rounded-2xl p-4 text-[#28131a] border border-brand-100"
                  placeholder="Enter your email"
                  placeholderTextColor="#c98d9a"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>

              <View className="mb-6">
                <Text className="text-[#8a6b73] text-sm font-semibold mb-2 ml-1">PASSWORD</Text>
                <TextInput
                  className="bg-brand-50 rounded-2xl p-4 text-[#28131a] border border-brand-100"
                  placeholder="At least 8 characters"
                  placeholderTextColor="#c98d9a"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                  onSubmitEditing={handleRegister}
                />
              </View>

              <TouchableOpacity
                className={`rounded-2xl py-4 items-center ${loading ? "bg-brand-500/50" : "bg-brand-500"}`}
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.9}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-lg text-center">Create Account</Text>
                )}
              </TouchableOpacity>

              <View className="flex-row justify-center mt-6">
                <Text className="text-[#8a6b73]">Already have an account? </Text>
                <Link href="/(auth)/login" asChild>
                  <TouchableOpacity>
                    <Text className="text-brand-600 font-bold">Log in</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
