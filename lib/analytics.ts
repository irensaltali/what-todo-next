import { PostHog } from 'posthog-react-native';
import config from './config';
import Constants from 'expo-constants';
import logger, { EventName } from './logger';

/**
 * @deprecated Use logger.trackEvent instead
 * Helper function to track events with consistent environment properties
 */
export const trackEvent = (
  posthog: PostHog | null,
  eventName: string,
  properties?: Record<string, any>
) => {
  // Forward to the new logger system
  return logger.trackEvent(posthog, eventName, properties);
};

/**
 * @deprecated Use logger.identifyUser instead
 * Helper function to identify a user with environment context
 */
export const identifyUser = (
  posthog: PostHog | null,
  userId: string,
  traits?: Record<string, any>
) => {
  // Forward to the new logger system
  return logger.identifyUser(posthog, userId, traits);
};

/**
 * @deprecated Use logger.logError instead
 * Log an error to Sentry with environment context
 */
export const logError = (error: Error, context?: Record<string, any>) => {
  // Forward to the new logger system
  return logger.logError(error, context);
};

/**
 * @deprecated Use logger.resetUser instead
 * Reset the user identification
 */
export const resetUser = (posthog: PostHog | null) => {
  return logger.resetUser(posthog);
};

/**
 * @deprecated Use the event names from logger.EventName for consistency
 * Common event names for the application
 */
export const Events = {
  // Auth events
  USER_SIGNED_IN: EventName.USER_SIGNED_IN,
  USER_SIGNED_OUT: EventName.USER_SIGNED_OUT,
  USER_REGISTERED: EventName.USER_REGISTERED,
  
  // Task events
  TASK_CREATED: EventName.TASK_CREATED,
  TASK_UPDATED: EventName.TASK_UPDATED,
  TASK_DELETED: EventName.TASK_DELETED,
  TASK_COMPLETED: EventName.TASK_COMPLETED,
  
  // Navigation events
  SCREEN_VIEWED: EventName.SCREEN_VIEWED,
  
  // Error events
  ERROR_OCCURRED: EventName.ERROR_OCCURRED,
}; 
