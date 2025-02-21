import React, { useEffect } from 'react';
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../lib/useAuth';
import { StoreProvider } from '../lib/store/StoreContext';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export default function RootLayout() {
  const { session, loading } = useAuth();

  useEffect(() => {
    window.frameworkReady?.();
  }, []);

  // While the auth state is loading, show nothing
  if (loading) {
    return null;
  }

  return (
    <StoreProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {!session ? (
          // If there's no session, only show auth screens
          <Stack.Screen name="(auth)" />
        ) : (
          // If there is a session, show protected screens
          <>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(task-details)" />
            <Stack.Screen name="(settings)" />
            <Stack.Screen name="profile" />
          </>
        )}
      </Stack>
    </StoreProvider>
  );
}