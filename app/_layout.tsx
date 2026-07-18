// app/_layout.tsx
import { useURL } from 'expo-linking';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/lib/auth-context';
import { handleSupabaseUrl } from '@/lib/supabase';
import AuthGate from '@/components/auth/AuthGate';
import "./globals.css";

export default function RootLayout() {
  const url = useURL();

  useEffect(() => {
    if (url) {
      console.log('[RootLayout] Deep link received:', url);

      const isAuthCallback = url.includes('auth-callback');
      const hasAuthParams =
        url.includes('access_token=') ||
        url.includes('refresh_token=') ||
        url.includes('code=');

      if (!isAuthCallback || !hasAuthParams) {
        return;
      }
      
      // Handle the deep link - this processes magic link tokens
      handleSupabaseUrl(url)
        .then(result => {
          if (result.error) {
            console.error('[RootLayout] Error handling deep link:', result.error);
          } else {
            console.log('[RootLayout] Deep link handled successfully');
          }
        })
        .catch(err => {
          console.error('[RootLayout] Unexpected error:', err);
        });
    }
  }, [url]);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AuthGate>
          <Stack 
            screenOptions={{ 
              headerShown: false,
            }} 
          />
        </AuthGate>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
