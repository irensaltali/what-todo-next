import { PostHog } from 'posthog-react-native';
import config from './config';
import Constants from 'expo-constants';

/**
 * Helper function to track events with consistent environment properties
 */
export const trackEvent = (
  posthog: PostHog | null,
  eventName: string,
  properties?: Record<string, any>
) => {
  if (!posthog) {
    return;
  }

  // Always include environment context with every event
  const environmentContext = {
    environment: config.env,
    app_version: config.appVersion,
    app_name: Constants.expoConfig?.name,
  };

  // Track the event with combined properties
  posthog.capture(eventName, {
    ...environmentContext,
    ...properties,
  });
};

/**
 * Helper function to identify a user with environment context
 */
export const identifyUser = (
  posthog: PostHog | null,
  userId: string,
  traits?: Record<string, any>
) => {
  if (!posthog) {
    return;
  }

  // Set user properties with environment context
  posthog.identify(userId, {
    environment: config.env,
    app_version: config.appVersion,
    ...traits,
  });
};

/**
 * Log an error to Sentry with environment context
 */
export const logError = (error: Error, context?: Record<string, any>) => {
  if (!config.sentry.dsn) {
    // Just log to console if Sentry is not configured
    console.error('Error:', error.message, context);
    return;
  }
  
  // Import Sentry dynamically to avoid import cycles
  const Sentry = require('@sentry/react-native');
  
  // Add environment context to the error
  Sentry.captureException(error, {
    tags: {
      environment: config.env,
      version: config.appVersion,
    },
    contexts: {
      app: {
        name: Constants.expoConfig?.name,
        version: config.appVersion,
      },
      ...context,
    },
  });
}; 
