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
import { useRouter, type Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { signInWithEmail, signInWithGoogle } from "../../lib/supabase";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const { error: authError } = await signInWithGoogle();
      if (authError) {
        throw authError;
      }
      // On successful login, the AuthGate will handle redirection
    } catch (err) {
      console.error("Google sign-in failed", err);
      setError("Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailSignIn = async () => {
    if (!email) {
      return setError("Please enter your email.");
    }

    setError(null);
    setEmailLoading(true);
    try {
      const { error: authError } = await signInWithEmail(email.trim());
      if (authError) {
        throw authError;
      }
      setEmailSent(true);
    } catch (err) {
      console.error("Magic link request failed", err);
      setError("Failed to send Magic Link. Please try again.");
    } finally {
      setEmailLoading(false);
    }
  };

  if (emailSent) {
    return (
      <SafeAreaView className="flex-1 bg-brand-50 justify-center p-6">
        <View className="bg-white rounded-3xl p-8 shadow-xl border border-brand-100">
          <Text className="text-[#28131a] text-3xl font-bold mb-4 text-center">Check your Email</Text>
          <Text className="text-[#8a6b73] text-lg mb-8 text-center">
            We&apos;ve sent a Magic Link to <Text className="text-brand-600 font-bold">{email}</Text>.
            Tap the link in your email to log in instantly.
          </Text>

          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-[1px] bg-brand-100" />
            <Text className="text-[#c98d9a] px-4 text-sm font-medium">or enter code manually</Text>
            <View className="flex-1 h-[1px] bg-brand-100" />
          </View>

          <TouchableOpacity
            className="bg-brand-500 rounded-2xl py-4 items-center mb-6"
            onPress={() => router.push({ pathname: "/(auth)/otp", params: { email } } as unknown as Href)}
          >
            <Text className="text-white font-bold text-lg">Enter 6-Digit Code</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setEmailSent(false)}
            className="items-center"
          >
            <Text className="text-[#8a6b73] font-medium">Try another email</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-50">
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            keyboardShouldPersistTaps="handled"
            className="p-6"
          >
            <View className="items-center mb-8">
              <View className="w-16 h-16 rounded-2xl bg-brand-500 items-center justify-center mb-4 shadow-lg shadow-brand-500/40">
                <Ionicons name="shield-checkmark" size={32} color="#ffffff" />
              </View>
              <Text className="text-[#28131a] text-3xl font-bold text-center">Women Safety AI</Text>
              <Text className="text-[#8a6b73] text-base mt-2 text-center">
                Your safety, always within reach.
              </Text>
            </View>

            <View className="bg-white rounded-3xl p-8 shadow-xl border border-brand-100">
              {error && (
                <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-6">
                  <Text className="text-red-500 text-sm text-center font-medium">{error}</Text>
                </View>
              )}

              {/* Google Sign In Button */}
              <TouchableOpacity
                className="bg-white rounded-2xl py-4 mb-6 flex-row justify-center items-center border border-brand-100"
                onPress={handleGoogleSignIn}
                disabled={emailLoading || googleLoading}
                activeOpacity={0.8}
              >
                <Text className="text-[#28131a] font-bold text-lg">Continue with Google</Text>
                {googleLoading && <ActivityIndicator className="ml-3" color="#28131a" />}
              </TouchableOpacity>

              <View className="flex-row items-center mb-6">
                <View className="flex-1 h-[1px] bg-brand-100" />
                <Text className="text-[#c98d9a] px-4 text-sm font-medium">or</Text>
                <View className="flex-1 h-[1px] bg-brand-100" />
              </View>

              {/* Email Login Form */}
              <View className="mb-6">
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
                />
              </View>

              <TouchableOpacity
                className={`rounded-2xl py-4 items-center ${emailLoading ? "bg-brand-500/50" : "bg-brand-500"}`}
                onPress={handleEmailSignIn}
                disabled={emailLoading || googleLoading}
                activeOpacity={0.9}
              >
                {emailLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-lg text-center">Login Via Mail</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
