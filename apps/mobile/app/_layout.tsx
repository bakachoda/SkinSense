import "../global.css";
import { Slot, useRouter, useSegments } from "expo-router";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useEffect } from "react";
import * as Sentry from "@sentry/react-native";
import { useAuthStore } from "../stores/auth";
import { mmkvPersister } from "../lib/query-persister";
import { setupAuthListener } from "../lib/auth-listener";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { OfflineBanner } from "../components/OfflineBanner";

// Initialize Sentry
Sentry.init({
  dsn: process.env["EXPO_PUBLIC_SENTRY_DSN"] ?? "",
  tracesSampleRate: __DEV__ ? 1.0 : 0.2,
  environment: __DEV__ ? "development" : "production",
  enableAutoSessionTracking: true,
  attachScreenshot: true,
  enableNativeFramesTracking: true,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60, // 1 hour
      retry: 2,
    },
  },
});

function AuthGate() {
  const segments = useSegments();
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup && process.env["EXPO_PUBLIC_REQUIRE_AUTH"] === "true") {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)/home");
    }
  }, [isAuthenticated, segments, router]);

  return <Slot />;
}

function RootLayout() {
  useEffect(() => {
    setupAuthListener();
    void useAuthStore.getState().loadTokens();
  }, []);

  return (
    <SafeAreaProvider>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister: mmkvPersister }}
      >
        <OfflineBanner />
        <AuthGate />
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  );
}

export default (process.env["EXPO_PUBLIC_SENTRY_DSN"] ? Sentry.wrap(RootLayout) : RootLayout);
