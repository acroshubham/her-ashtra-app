// components/auth/AuthGate.tsx
import { useAuth } from "@/lib/auth-context";
import { Redirect, useSegments } from "expo-router";
import React from "react";
import Splash from "@/components/Splash";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const segments = useSegments();

  if (loading) {
    return <Splash />;
  }

  const inAuthGroup = segments[0] === "(auth)";

  if (!user) {
    return inAuthGroup ? <>{children}</> : <Redirect href={"/(auth)/onboarding" as never} />;
  }

  const isRoot = (segments as string[]).length === 0;
  if (inAuthGroup || isRoot) {
    return <Redirect href={"/(tabs)" as never} />;
  }

  return <>{children}</>;
}
