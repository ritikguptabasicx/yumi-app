import "../global.css";
import "@/lib/nativewind-setup";
import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import Toast from "react-native-toast-message";
import * as SplashScreen from "expo-splash-screen";

import { UserProvider } from "@/contexts/UserContext";
import i18n, { initLanguage } from "@/lib/i18n";
import SplashScreenView from "@/components/SplashScreen";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      await initLanguage();
      setAppReady(true);
      await SplashScreen.hideAsync();
    }
    prepare();
  }, []);

  if (!appReady) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SplashScreenView />
        <StatusBar style="light" />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <I18nextProvider i18n={i18n}>
            <UserProvider>
              <StatusBar style="dark" />
              <Stack screenOptions={{ headerShown: false }} />
              <Toast />
            </UserProvider>
          </I18nextProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
