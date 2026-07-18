// components/auth/AuthGate.tsx
import { useAuth } from "@/lib/auth-context";
import { Redirect, useSegments } from "expo-router";
import { View, ActivityIndicator, Text, TouchableOpacity } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { signOut } from "@/lib/supabase";
import { colors } from "@/lib/theme";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, profileLoading, error, refreshProfile } =
    useAuth();
  const segments = useSegments();
  const [manualLogoutRequested, setManualLogoutRequested] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [showRecoveryActions, setShowRecoveryActions] = useState(false);

  const handleManualLogout = useCallback(async () => {
    if (manualLogoutRequested) return;

    try {
      setManualLogoutRequested(true);
      await signOut();
    } catch (error) {
      console.error("[AuthGate] Manual logout failed:", error);
      setManualLogoutRequested(false);
    }
  }, [manualLogoutRequested]);

  useEffect(() => {
    let showActionsTimeoutId: any;
    let forceLogoutTimeoutId: any;

    if (user && !profile && !manualLogoutRequested) {
      if (!sessionStartTime) setSessionStartTime(Date.now());

      showActionsTimeoutId = setTimeout(() => {
        setShowRecoveryActions(true);
      }, 12000);

      forceLogoutTimeoutId = setTimeout(() => {
        if (!profileLoading) {
          handleManualLogout();
        }
      }, 30000);
    } else {
      setSessionStartTime(null);
      setShowRecoveryActions(false);
    }

    return () => {
      clearTimeout(showActionsTimeoutId);
      clearTimeout(forceLogoutTimeoutId);
    };
  }, [
    user,
    profile,
    manualLogoutRequested,
    sessionStartTime,
    profileLoading,
    handleManualLogout,
  ]);

  useEffect(() => {
    if (!loading && !user && manualLogoutRequested) {
      setManualLogoutRequested(false);
    }
  }, [loading, manualLogoutRequested, user]);

  if (manualLogoutRequested) {
    if (!user) {
      return <Redirect href="/(auth)/login" />;
    }

    return (
      <View className="flex-1 bg-white justify-center items-center p-6">
        <ActivityIndicator size="large" color={colors.sos[500]} />
        <Text className="text-[#28131a] mt-4 text-base font-semibold">
          Signing you out...
        </Text>
        <Text className="text-[#8a6b73] mt-2 text-center text-sm">
          Hang tight while we safely close your session.
        </Text>
      </View>
    );
  }

  // Show loading screen while initializing auth
  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center p-6">
        <ActivityIndicator size="large" color={colors.brand[500]} />
        <Text className="text-[#28131a] mt-4 text-base">Loading...</Text>
      </View>
    );
  }

  // Not authenticated
  if (!user) {
    const inAuthGroup = segments[0] === "(auth)";
    if (inAuthGroup) {
      return <>{children}</>;
    }
    return <Redirect href="/(auth)/login" />;
  }

  // Authenticated BUT NO PROFILE yet (fetching profile)
  if (!profile) {
    const shouldShowActions = !!error || showRecoveryActions;

    return (
      <View className="flex-1 bg-white justify-center items-center p-6">
        <ActivityIndicator size="large" color={colors.brand[500]} />
        <Text className="text-[#28131a] mt-4 text-base text-center font-bold">
          Setting up your profile...
        </Text>
        <Text className="text-[#8a6b73] mt-2 text-center text-sm">
          This usually takes a few seconds. If you are stuck here, your account
          might not have a profile row in the database yet.
        </Text>

        {!!error && (
          <Text className="text-red-500 mt-3 text-center text-sm">{error}</Text>
        )}

        {shouldShowActions && (
          <>
            <TouchableOpacity
              onPress={refreshProfile}
              disabled={profileLoading}
              className="mt-8 px-8 py-4 bg-brand-50 border border-brand-200 rounded-2xl"
            >
              <Text className="text-brand-600 font-bold uppercase tracking-wider">
                {profileLoading ? "Retrying..." : "Retry Profile Load"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleManualLogout}
              className="mt-10 px-8 py-4 bg-red-50 border border-red-200 rounded-2xl"
            >
              <Text className="text-red-500 font-bold uppercase tracking-wider">
                Emergency Logout
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  }

  // Authenticated AND has profile - single app surface, no role-based routing
  const inAuthGroup = segments[0] === "(auth)";
  const isAuthCallback = segments[0] === "auth-callback";
  const isRoot = (segments as string[]).length === 0;

  if (inAuthGroup || isAuthCallback || isRoot) {
    return <Redirect href={"/(tabs)" as never} />;
  }

  return <>{children}</>;
}
