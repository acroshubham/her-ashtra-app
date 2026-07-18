// components/auth/AuthGate.tsx
import { useAuth } from "@/lib/auth-context";
import { Redirect, useSegments } from "expo-router";
import { View, ActivityIndicator, Text } from "react-native";
import React from "react";
import { colors } from "@/lib/theme";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const segments = useSegments();

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center p-6">
        <ActivityIndicator size="large" color={colors.brand[500]} />
        <Text className="text-[#28131a] mt-4 text-base">Loading...</Text>
      </View>
    );
  }

  const inAuthGroup = segments[0] === "(auth)";

  if (!user) {
    return inAuthGroup ? <>{children}</> : <Redirect href="/(auth)/login" />;
  }

  const isRoot = (segments as string[]).length === 0;
  if (inAuthGroup || isRoot) {
    return <Redirect href={"/(tabs)" as never} />;
  }

  return <>{children}</>;
}
