import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { ShieldCheck, Mail, Lock } from "lucide-react-native";
import { useAuth } from "@/lib/auth-context";
import { guardian } from "@/lib/theme";
import GradientButton from "@/components/ui/GradientButton";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setError(null);
    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);
    if (result.error) setError(result.error);
    // On success, AuthGate redirects to /(tabs) automatically.
  };

  return (
    <View style={{ flex: 1, backgroundColor: guardian.bg }}>
      <StatusBar style="light" />
      <LinearGradient colors={[guardian.secondary, "transparent"]} style={{ position: "absolute", top: 0, left: 0, right: 0, height: 300, opacity: 0.18 }} />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }} keyboardShouldPersistTaps="handled">
              <View style={{ alignItems: "center", marginBottom: 28 }}>
                <LinearGradient colors={guardian.gradBlue} style={{ width: 72, height: 72, borderRadius: 24, alignItems: "center", justifyContent: "center" }}>
                  <ShieldCheck color="#fff" size={38} />
                </LinearGradient>
                <Text style={{ color: "#fff", fontSize: 28, fontWeight: "900", marginTop: 16 }}>
                  Welcome back
                </Text>
                <Text style={{ color: guardian.textDim, fontSize: 14, marginTop: 6 }}>Sign in to Guardian AI</Text>
              </View>

              {error ? (
                <View style={{ backgroundColor: "rgba(239,68,68,0.12)", borderColor: "rgba(239,68,68,0.4)", borderWidth: 1, borderRadius: 14, padding: 12, marginBottom: 16 }}>
                  <Text style={{ color: guardian.primary, textAlign: "center", fontWeight: "600", fontSize: 13 }}>{error}</Text>
                </View>
              ) : null}

              <Field icon={Mail} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" editable={!loading} />
              <Field icon={Lock} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" editable={!loading} onSubmitEditing={handleLogin} />

              <GradientButton label="Log In" size="lg" loading={loading} onPress={handleLogin} style={{ marginTop: 8 }} />

              <Pressable onPress={() => Alert.alert("Google Login", "Social sign-in coming soon.")} style={{ marginTop: 14, borderRadius: 18, borderWidth: 1, borderColor: guardian.border, backgroundColor: guardian.card, paddingVertical: 15, alignItems: "center", flexDirection: "row", justifyContent: "center" }}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>Continue with Google</Text>
              </Pressable>

              <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 22 }}>
                <Text style={{ color: guardian.textDim }}>New here? </Text>
                <Link href="/(auth)/register" asChild>
                  <Pressable>
                    <Text style={{ color: guardian.secondary, fontWeight: "800" }}>Create account</Text>
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

export function Field({ icon: Icon, ...props }: { icon: typeof Mail } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: guardian.card, borderColor: guardian.border, borderWidth: 1, borderRadius: 16, paddingHorizontal: 14, marginBottom: 14 }}>
      <Icon color={guardian.textDim} size={18} />
      <TextInput
        {...props}
        placeholderTextColor={guardian.textMuted}
        style={{ flex: 1, color: "#fff", fontSize: 15, paddingVertical: 15, marginLeft: 10 }}
      />
    </View>
  );
}
