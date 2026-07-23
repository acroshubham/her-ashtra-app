import React from "react";
import { View, Text, Pressable } from "react-native";
import { useTheme } from "@/lib/theme-context";

interface Props {
  title: string;
  action?: string;
  onAction?: () => void;
}

export default function SectionTitle({ title, action, onAction }: Props) {
  const { theme } = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
      <Text style={{ color: theme.text, fontSize: 18, fontWeight: "800" }}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction}>
          <Text style={{ color: theme.secondary, fontSize: 13, fontWeight: "700" }}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
