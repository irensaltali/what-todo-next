import React, { useEffect } from 'react';
import { Redirect, Stack, useNavigationContainerRef } from 'expo-router';
import { useAuth } from '../lib/useAuth';
import { StoreProvider } from '../lib/store/StoreContext';
import { TaskEntryProvider, useTaskEntry } from '../contexts/TaskEntryContext';
import { TaskEntryBottomSheet } from '../components/TaskEntryBottomSheet';
import { ThemeProvider } from '../contexts/ThemeContext';
import useLanguageStore from '@/store/languageStore';
import i18n from '@/i18n/i18n';
import { I18nManager } from 'react-native';
import { PostHogProvider, usePostHog } from 'posthog-react-native';
import * as Sentry from '@sentry/react-native';
import config from '@/lib/config';
import Constants from 'expo-constants';
import logger, { EventName } from '@/lib/logger';
import { Platform, AppState } from 'react-native';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

// Create a ref for the navigation container
export const navigationRef = useNavigationContainerRef();

// Create a custom routing instrumentation for Expo Router
const routingInstrumentation = Sentry.reactNavigationIntegration();

// Initialize Sentry with environment-specific configuration
Sentry.init({
  dsn: config.sentry.dsn,
  environment: config.sentry.environment,
  sendDefaultPii: true,
  tracesSampleRate: config.sentry.tracesSampleRate,
  profilesSampleRate: config.sentry.profilesSampleRate,
  // Add app release information
  release: `${Constants.expoConfig?.name}@${config.appVersion}`,
  // Enable React Navigation instrumentation
  integrations: [
    routingInstrumentation,
  ],
});

// Component to render the TaskEntryBottomSheet with context
function AppWithTaskEntry() {
  const { isTaskEntryVisible, hideTaskEntry, onTaskAdded } = useTaskEntry();

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
        onTaskAdded={() => {
          // Call both onTaskAdded to refresh task state, and hideTaskEntry to close the form
          onTaskAdded();
          hideTaskEntry();
        }}
      />
    </>
  );
}

function RootLayoutContent() {
  const { session, loading } = useAuth();
  const posthog = usePostHog();

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

  // Register the navigation container with Sentry
  useEffect(() => {
    if (navigationRef) {
      // Register the navigation container with Sentry
      routingInstrumentation.registerNavigationContainer(navigationRef);
    }
  }, [navigationRef]);

  // Initialize our centralized logger
  useEffect(() => {
    const initializeLoggerAndTracking = async () => {
      try {
        // Initialize the logger with environment settings
        await logger.initializeLogger();
        
        // Set the PostHog instance globally for convenience
        if (posthog) {
          logger.setGlobalPostHogInstance(posthog);
          
          // Track app launch event
          logger.trackEvent(posthog, EventName.APP_LAUNCHED, {
            device: {
              platform: Platform.OS,
              version: Platform.Version,
            },
            app: {
              version: config.appVersion,
              environment: config.env,
            },
            language,
          });
        }
        
        // Set up navigation tracking for screens
        if (navigationRef) {
          navigationRef.addListener('state', () => {
            const currentRoute = navigationRef.getCurrentRoute();
            if (currentRoute) {
              // Track screen view
              logger.trackEvent(posthog, EventName.SCREEN_VIEWED, {
                screen: currentRoute.name,
                params: currentRoute.params,
              });
            }
          });
        }
        
        // Set up session tracking
        logger.trackEvent(posthog, EventName.SESSION_STARTED);
        
        // Set up app state listeners for background/foreground events
        if (AppState) {
          AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active') {
              logger.trackEvent(posthog, EventName.APP_FOREGROUNDED);
            } else if (nextAppState === 'background') {
              logger.trackEvent(posthog, EventName.APP_BACKGROUNDED);
            }
          });
        }
        
        // Log initialization success
        logger.info('App fully initialized');
        
      } catch (error) {
        console.error('Error initializing logger:', error);
      }
    };
    
    initializeLoggerAndTracking();
  }, [posthog]);

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

// Default export for easy imports
export default function RootLayout() {
  // Create a wrapped component
  const WrappedRootLayoutContent = Sentry.wrap(RootLayoutContent);
  // Return it as a JSX element
  return (
    <PostHogProvider 
      apiKey={config.posthog.apiKey} 
      options={{
        host: config.posthog.host
      }}
    >
      <WrappedRootLayoutContent />
    </PostHogProvider>
  );
}
