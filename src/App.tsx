import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/auth/AuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RootNavigator } from '@/navigation/RootNavigator';
import { configureNotificationHandler } from '@/notifications/notificationHandler';
import { useAppFonts } from '@/theme/typography';

SplashScreen.preventAutoHideAsync();
configureNotificationHandler();

const queryClient = new QueryClient();

export default function App() {
  const fontsLoaded = useAppFonts();

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    void Notifications.requestPermissionsAsync();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <NavigationContainer>
                <RootNavigator />
                <StatusBar style="dark" />
              </NavigationContainer>
            </AuthProvider>
          </QueryClientProvider>
        </SafeAreaProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
