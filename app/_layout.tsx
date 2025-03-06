import React, { useEffect } from 'react';
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../lib/useAuth';
import { StoreProvider } from '../lib/store/StoreContext';
import { TaskEntryProvider, useTaskEntry } from '../contexts/TaskEntryContext';
import { TaskEntryBottomSheet } from '../components/TaskEntryBottomSheet';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

// Component to render the TaskEntryBottomSheet with context
function AppWithTaskEntry() {
  const { isTaskEntryVisible, hideTaskEntry } = useTaskEntry();
  
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(task-details)" />
        <Stack.Screen name="(settings)" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="(auth)" />
      </Stack>
      
      <TaskEntryBottomSheet
        isVisible={isTaskEntryVisible}
        onClose={hideTaskEntry}
        onTaskAdded={hideTaskEntry}
      />
    </>
  );
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
      <TaskEntryProvider>
        {!session ? (
          // If there's no session, only show auth screens
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
          </Stack>
        ) : (
          // If there is a session, show protected screens with task entry
          <AppWithTaskEntry />
        )}
      </TaskEntryProvider>
    </StoreProvider>
  );
}
