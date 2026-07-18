import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { verifyOtp } from "../../lib/supabase";
import { StatusBar } from "expo-status-bar";

export default function OTP() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const router = useRouter();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    if (text.length > 1) return;
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    if (text && index < 5) {
      inputs.current[index + 1]?.focus?.();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus?.();
    }
  };

  const handleVerify = async () => {
    if (!email) {
      return setError("Missing email context. Please go back.");
    }

    const token = code.join("");
    if (token.length !== 6) {
      return setError("Please enter the 6-digit code.");
    }

    setLoading(true);
    setError(null);
    try {
      const { error: authError } = await verifyOtp(email as string, token);
      if (authError) {
        throw authError;
      }
      router.replace("/");
    } catch (err) {
      console.error("OTP verification failed", err);
      setError("Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-50">
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
          className="p-6"
        >
          <View className="bg-white rounded-3xl p-8 shadow-xl border border-brand-100">
            <Text className="text-[#28131a] text-3xl font-bold mb-2 text-center">Verify Email</Text>
            <Text className="text-[#8a6b73] mb-8 text-center">
              Enter the 6-digit code sent to{"\n"}
              <Text className="text-brand-600 font-medium">{email ?? "your email"}</Text>
            </Text>

            {error && (
              <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-6">
                <Text className="text-red-500 text-sm text-center font-medium">{error}</Text>
              </View>
            )}

            <View className="flex-row justify-between mb-8">
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    inputs.current[index] = ref;
                  }}
                  className="bg-brand-50 rounded-xl p-3 text-[#28131a] text-center text-2xl w-[45px] border border-brand-100"
                  value={digit}
                  onChangeText={(text) => handleChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  placeholder="-"
                  placeholderTextColor="#fecdd3"
                  selectionColor="#f43f5e"
                />
              ))}
            </View>

            <TouchableOpacity
              className={`rounded-2xl py-4 items-center ${loading ? "bg-brand-500/50" : "bg-brand-500"}`}
              onPress={handleVerify}
              disabled={loading}
              activeOpacity={0.9}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg text-center">Verify</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-6"
              onPress={() => router.back()}
              disabled={loading}
            >
              <Text className="text-[#8a6b73] text-center font-medium">Re-enter email</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
