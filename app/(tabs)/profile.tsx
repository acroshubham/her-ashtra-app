import React, { useState } from "react";
import { View, Text, Pressable, Switch, Alert } from "react-native";
import { useRouter, type Href } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  Users,
  HeartPulse,
  Phone,
  Globe,
  Moon,
  Bell,
  WifiOff,
  ShieldQuestion,
  LogOut,
  ChevronRight,
  Settings as SettingsIcon,
  type LucideIcon,
} from "lucide-react-native";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { useContactStore } from "@/stores/useContactStore";
import { guardian } from "@/lib/theme";
import Screen from "@/components/ui/Screen";
import GlassCard from "@/components/ui/GlassCard";
import FadeInView from "@/components/ui/FadeInView";
import SectionTitle from "@/components/ui/SectionTitle";

export default function Profile() {
  const { user, logout } = useAuth();
  const { theme, mode, toggle } = useTheme();
  const router = useRouter();
  const contacts = useContactStore((s) => s.contacts);

  const [notifications, setNotifications] = useState(true);
  const [offline, setOffline] = useState(false);

  const name = user?.fullName || user?.email?.split("@")[0] || "Guardian";

  const onLogout = () =>
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", style: "destructive", onPress: () => logout() },
    ]);

  return (
    <Screen scroll glow={guardian.secondary} contentStyle={{ paddingBottom: 120 }}>
      <FadeInView from="top">
        <GlassCard style={{ alignItems: "center", paddingVertical: 24 }}>
          <LinearGradient
            colors={guardian.gradViolet}
            style={{ width: 76, height: 76, borderRadius: 26, alignItems: "center", justifyContent: "center" }}
          >
            <Text style={{ color: "#fff", fontSize: 30, fontWeight: "900" }}>{name.charAt(0).toUpperCase()}</Text>
          </LinearGradient>
          <Text style={{ color: theme.text, fontSize: 20, fontWeight: "800", marginTop: 12 }}>{name}</Text>
          <Text style={{ color: theme.textDim, fontSize: 13, marginTop: 2 }}>{user?.email}</Text>
        </GlassCard>
      </FadeInView>

      <FadeInView delay={80} style={{ marginTop: 22 }}>
        <SectionTitle title="Safety" />
        <GlassCard padded={false}>
          <Row icon={Users} label="Guardian Circle" value={`${contacts.length} contact${contacts.length === 1 ? "" : "s"}`} tint={guardian.secondary} onPress={() => router.push("/(tabs)/circle" as Href)} />
          <Divider />
          <Row icon={Phone} label="Emergency Contacts" tint={guardian.success} onPress={() => router.push("/(tabs)/circle" as Href)} />
          <Divider />
          <Row icon={HeartPulse} label="Medical Information" tint={guardian.primary} onPress={() => Alert.alert("Medical Info", "Add blood group, allergies and conditions shared with responders. (Coming soon)")} />
        </GlassCard>
      </FadeInView>

      <FadeInView delay={140} style={{ marginTop: 22 }}>
        <SectionTitle title="Preferences" />
        <GlassCard padded={false}>
          <ToggleRow icon={Moon} label="Dark Mode" tint="#8B5CF6" value={mode === "dark"} onValueChange={toggle} />
          <Divider />
          <ToggleRow icon={Bell} label="Notifications" tint={guardian.warning} value={notifications} onValueChange={setNotifications} />
          <Divider />
          <ToggleRow icon={WifiOff} label="Offline Mode" tint="#06B6D4" value={offline} onValueChange={setOffline} />
          <Divider />
          <Row icon={Globe} label="Language" value="English" tint={guardian.secondary} onPress={() => Alert.alert("Language", "More languages coming soon.")} />
        </GlassCard>
      </FadeInView>

      <FadeInView delay={200} style={{ marginTop: 22 }}>
        <SectionTitle title="More" />
        <GlassCard padded={false}>
          <Row icon={SettingsIcon} label="Settings" tint={theme.textDim} onPress={() => router.push("/(tabs)/settings" as Href)} />
          <Divider />
          <Row icon={ShieldQuestion} label="Privacy" tint={theme.textDim} onPress={() => Alert.alert("Privacy", "Your location is only shared during an active SOS.")} />
        </GlassCard>
      </FadeInView>

      <FadeInView delay={260} style={{ marginTop: 22 }}>
        <Pressable onPress={onLogout}>
          <GlassCard style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", borderColor: `${guardian.primary}44` }}>
            <LogOut color={guardian.primary} size={18} />
            <Text style={{ color: guardian.primary, fontWeight: "800", marginLeft: 8 }}>Log Out</Text>
          </GlassCard>
        </Pressable>
        <Text style={{ color: theme.textMuted, fontSize: 11, textAlign: "center", marginTop: 16 }}>
          Guardian AI · Your Intelligent Safety Companion
        </Text>
      </FadeInView>
    </Screen>
  );
}

function Divider() {
  const { theme } = useTheme();
  return <View style={{ height: 1, backgroundColor: theme.border, marginLeft: 60 }} />;
}

function Row({
  icon: Icon,
  label,
  value,
  tint,
  onPress,
}: {
  icon: LucideIcon;
  label: string;
  value?: string;
  tint: string;
  onPress?: () => void;
}) {
  const { theme } = useTheme();
  return (
    <Pressable onPress={onPress} style={{ flexDirection: "row", alignItems: "center", padding: 14 }}>
      <View style={{ width: 34, height: 34, borderRadius: 11, backgroundColor: `${tint}22`, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
        <Icon color={tint} size={18} strokeWidth={2.2} />
      </View>
      <Text style={{ color: theme.text, fontSize: 15, fontWeight: "600", flex: 1 }}>{label}</Text>
      {value ? <Text style={{ color: theme.textDim, fontSize: 13, marginRight: 6 }}>{value}</Text> : null}
      <ChevronRight color={theme.textMuted} size={18} />
    </Pressable>
  );
}

function ToggleRow({
  icon: Icon,
  label,
  tint,
  value,
  onValueChange,
}: {
  icon: LucideIcon;
  label: string;
  tint: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  const { theme } = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", padding: 14 }}>
      <View style={{ width: 34, height: 34, borderRadius: 11, backgroundColor: `${tint}22`, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
        <Icon color={tint} size={18} strokeWidth={2.2} />
      </View>
      <Text style={{ color: theme.text, fontSize: 15, fontWeight: "600", flex: 1 }}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: guardian.secondary, false: theme.cardAlt }}
        thumbColor="#fff"
      />
    </View>
  );
}
