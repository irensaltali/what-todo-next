import React, { useEffect } from 'react';
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../lib/useAuth';
import { StoreProvider } from '../lib/store/StoreContext';
import { TaskEntryProvider, useTaskEntry } from '../contexts/TaskEntryContext';
import { TaskEntryBottomSheet } from '../components/TaskEntryBottomSheet';
import { ThemeProvider } from '../contexts/ThemeContext';
import useLanguageStore from '@/store/languageStore';
import i18n from '@/i18n/i18n';
import { I18nManager } from 'react-native';

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

  const { language } = useLanguageStore();

  useEffect(() => {
    // Initialize language from store
    i18n.changeLanguage(language);

    // Handle RTL if needed (Turkish is LTR, but example for future)
    const isRTL = language === 'ar'; // Example for Arabic
    I18nManager.forceRTL(isRTL);
  }, [language]);
  
  // While the auth state is loading, show nothing
  if (loading) {
    return null;
  }

  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
}
