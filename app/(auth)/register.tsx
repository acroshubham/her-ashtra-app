import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { UserPlus, User, Mail, Lock } from "lucide-react-native";
import { useAuth } from "@/lib/auth-context";
import { guardian } from "@/lib/theme";
import GradientButton from "@/components/ui/GradientButton";
import { Field } from "./login";

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
    if (result.error) setError(result.error);
    // On success, AuthGate redirects to /(tabs) automatically.
  };

  return (
    <View style={{ flex: 1, backgroundColor: guardian.bg }}>
      <StatusBar style="light" />
      <LinearGradient colors={[guardian.primary, "transparent"]} style={{ position: "absolute", top: 0, left: 0, right: 0, height: 300, opacity: 0.16 }} />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }} keyboardShouldPersistTaps="handled">
              <View style={{ alignItems: "center", marginBottom: 28 }}>
                <LinearGradient colors={guardian.gradRed} style={{ width: 72, height: 72, borderRadius: 24, alignItems: "center", justifyContent: "center" }}>
                  <UserPlus color="#fff" size={36} />
                </LinearGradient>
                <Text style={{ color: "#fff", fontSize: 28, fontWeight: "900", marginTop: 16 }}>Create account</Text>
                <Text style={{ color: guardian.textDim, fontSize: 14, marginTop: 6 }}>Join the network that keeps you safe.</Text>
              </View>

              {error ? (
                <View style={{ backgroundColor: "rgba(239,68,68,0.12)", borderColor: "rgba(239,68,68,0.4)", borderWidth: 1, borderRadius: 14, padding: 12, marginBottom: 16 }}>
                  <Text style={{ color: guardian.primary, textAlign: "center", fontWeight: "600", fontSize: 13 }}>{error}</Text>
                </View>
              ) : null}

              <Field icon={User} placeholder="Full name" value={fullName} onChangeText={setFullName} editable={!loading} />
              <Field icon={Mail} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" editable={!loading} />
              <Field icon={Lock} placeholder="Password (min 8 chars)" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" editable={!loading} onSubmitEditing={handleRegister} />

              <GradientButton label="Create Account" variant="danger" size="lg" loading={loading} onPress={handleRegister} style={{ marginTop: 8 }} />

              <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 22 }}>
                <Text style={{ color: guardian.textDim }}>Already have an account? </Text>
                <Link href="/(auth)/login" asChild>
                  <Pressable>
                    <Text style={{ color: guardian.secondary, fontWeight: "800" }}>Log in</Text>
                  </Pressable>
                </Link>
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
