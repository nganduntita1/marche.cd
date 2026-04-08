import '../lib/i18n';
import i18n, { syncLanguagePreference } from '../lib/i18n';
import { I18nextProvider } from 'react-i18next';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/contexts/AuthContext';
import { MessagesProvider } from '@/contexts/MessagesContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { LocationProvider } from '@/contexts/LocationContext';
import { GuidanceProvider } from '@/contexts/GuidanceContext';

export default function RootLayout() {
  useFrameworkReady();

  useEffect(() => {
    void syncLanguagePreference();
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <GuidanceProvider>
          <LocationProvider>
            <NotificationProvider>
              <MessagesProvider>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="auth/login" />
                  <Stack.Screen name="auth/register" />
                  <Stack.Screen name="auth/forgot-password" />
                  <Stack.Screen name="auth/reset-password" />
                  <Stack.Screen name="admin/dashboard" />
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="+not-found" />
                </Stack>
                <StatusBar style="auto" />
              </MessagesProvider>
            </NotificationProvider>
          </LocationProvider>
        </GuidanceProvider>
      </AuthProvider>
    </I18nextProvider>
  );
}
