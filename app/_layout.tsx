// app/_layout.tsx
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/lib/auth-context';
import AuthGate from '@/components/auth/AuthGate';
import "./globals.css";

export default function RootLayout() {
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
