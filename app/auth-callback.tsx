// app/auth-callback.tsx
import { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useAuth } from '@/lib/auth-context';

/**
 * This route is the target of the magic link deep link
 * It simply waits for the auth context to detect the session
 * Then AuthGate handles routing to the appropriate screen
 */
export default function AuthCallback() {
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      console.log('[AuthCallback] Auth state ready:', {
        hasUser: !!user,
        hasProfile: !!profile,
      });
      // AuthGate will handle the routing from here
      // If user is authenticated, it will redirect into the app
      // If not, it will redirect to login
    }
  }, [loading, user, profile]);

  return (
    <View className="flex-1 bg-white justify-center items-center">
      <ActivityIndicator size="large" color="#f43f5e" />
      <Text className="mt-4 text-center text-[#8a6b73]">
        Authenticating...
      </Text>
    </View>
  );
}
