import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Bot, Send, Mic } from "lucide-react-native";
import { useTheme } from "@/lib/theme-context";
import { guardian } from "@/lib/theme";

interface Msg {
  id: string;
  role: "user" | "guardian";
  text: string;
}

const SUGGESTIONS = ["I'm being followed", "Nearest hospital", "How do I stay safe?", "What should I do?"];

// Canned, on-device responses. (No network — the Assistant tab is a UI shell;
// wiring it to the backend LLM is a later step.)
function reply(input: string): string {
  const q = input.toLowerCase();
  if (q.includes("follow")) return "Stay calm. Head to the nearest safe place — open the Safety tab and tap Find Safe Places. If you feel in danger, press SOS to alert your Guardian Circle instantly.";
  if (q.includes("hospital")) return "Open the Safety tab and I'll rank the nearest hospitals by distance and how safe they are to reach right now.";
  if (q.includes("safe")) return "Share your live location with a guardian, stay in well-lit and crowded areas, and keep SOS one shake away. Want me to find a safe place nearby?";
  return "I'm here with you. You can trigger SOS anytime, find a safe place, or share your live location. What would you like to do?";
}

export default function Assistant() {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const send = (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    const userMsg: Msg = { id: `u${Date.now()}`, role: "user", text: clean };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { id: `g${Date.now()}`, role: "guardian", text: reply(clean) }]);
    }, 1100);
  };

  useEffect(() => {
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
    return () => clearTimeout(t);
  }, [messages, typing]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar style={theme.mode === "dark" ? "light" : "dark"} />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.border }}>
          <LinearGradient colors={guardian.gradBlue} style={{ width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" }}>
            <Bot color="#fff" size={22} />
          </LinearGradient>
          <View style={{ marginLeft: 12 }}>
            <Text style={{ color: theme.text, fontSize: 17, fontWeight: "800" }}>Guardian Assistant</Text>
            <Text style={{ color: guardian.success, fontSize: 12 }}>● Always here for you</Text>
          </View>
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
          <ScrollView ref={scrollRef} contentContainerStyle={{ padding: 20, paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
            {messages.length === 0 && (
              <View style={{ alignItems: "center", marginTop: 30 }}>
                <LinearGradient colors={guardian.gradBlue} style={{ width: 68, height: 68, borderRadius: 22, alignItems: "center", justifyContent: "center" }}>
                  <Bot color="#fff" size={34} />
                </LinearGradient>
                <Text style={{ color: theme.text, fontSize: 18, fontWeight: "800", marginTop: 14 }}>How can I help you stay safe?</Text>
                <Text style={{ color: theme.textDim, fontSize: 13, marginTop: 4, textAlign: "center" }}>Ask me anything, anytime.</Text>
              </View>
            )}

            {messages.map((m) => (
              <View key={m.id} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "84%", marginBottom: 12 }}>
                {m.role === "user" ? (
                  <LinearGradient colors={guardian.gradBlue} style={{ borderRadius: 18, borderBottomRightRadius: 4, paddingHorizontal: 14, paddingVertical: 10 }}>
                    <Text style={{ color: "#fff", fontSize: 14.5, lineHeight: 20 }}>{m.text}</Text>
                  </LinearGradient>
                ) : (
                  <View style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 18, borderBottomLeftRadius: 4, paddingHorizontal: 14, paddingVertical: 10 }}>
                    <Text style={{ color: theme.text, fontSize: 14.5, lineHeight: 20 }}>{m.text}</Text>
                  </View>
                )}
              </View>
            ))}

            {typing && <TypingBubble />}
          </ScrollView>

          {/* Suggestions + input */}
          <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingBottom: 90, paddingTop: 8, backgroundColor: theme.bg }}>
            {messages.length === 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                <View className="flex-row" style={{ gap: 8 }}>
                  {SUGGESTIONS.map((s) => (
                    <Pressable key={s} onPress={() => send(s)}>
                      <View style={{ paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}>
                        <Text style={{ color: theme.text, fontSize: 12.5, fontWeight: "600" }}>{s}</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            )}
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 22, paddingLeft: 16, paddingRight: 6, paddingVertical: 6 }}>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Message Guardian…"
                placeholderTextColor={theme.textMuted}
                style={{ flex: 1, color: theme.text, fontSize: 15, paddingVertical: 6 }}
                onSubmitEditing={() => send(input)}
                returnKeyType="send"
              />
              <Pressable style={{ padding: 8 }}>
                <Mic color={theme.textDim} size={20} />
              </Pressable>
              <Pressable onPress={() => send(input)}>
                <LinearGradient colors={guardian.gradBlue} style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" }}>
                  <Send color="#fff" size={18} />
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function TypingBubble() {
  const { theme } = useTheme();
  const dots = [useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current];
  useEffect(() => {
    const loops = dots.map((d, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 180),
          Animated.timing(d, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.timing(d, { toValue: 0.3, duration: 350, useNativeDriver: true }),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <View style={{ alignSelf: "flex-start", backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 18, borderBottomLeftRadius: 4, paddingHorizontal: 16, paddingVertical: 14, flexDirection: "row", gap: 5 }}>
      {dots.map((d, i) => (
        <Animated.View key={i} style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: theme.textDim, opacity: d }} />
      ))}
    </View>
  );
}
