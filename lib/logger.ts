import { Platform } from 'react-native';
import { PostHog } from 'posthog-react-native';
import * as Sentry from '@sentry/react-native';
import config from './config';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Declare global namespace for the global PostHog instance
declare global {
  var posthogInstance: PostHog | undefined;
}

// Log levels in order of severity
export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  FATAL = 5
}

// Centralized event names to ensure consistency across the app
export const EventName = {
  // App lifecycle events
  APP_LAUNCHED: 'app_launched',
  APP_BACKGROUNDED: 'app_backgrounded',
  APP_FOREGROUNDED: 'app_foregrounded',
  
  // Session events
  SESSION_STARTED: 'session_started',
  SESSION_ENDED: 'session_ended',
  
  // Auth events
  USER_SIGNED_IN: 'user_signed_in',
  USER_SIGNED_OUT: 'user_signed_out',
  USER_REGISTERED: 'user_registered',
  
  // Navigation events
  SCREEN_VIEWED: 'screen_viewed',
  MODAL_OPENED: 'modal_opened',
  MODAL_CLOSED: 'modal_closed',
  
  // Task-related events
  TASK_CREATED: 'task_created',
  TASK_UPDATED: 'task_updated',
  TASK_DELETED: 'task_deleted',
  TASK_COMPLETED: 'task_completed',
  TASK_CREATION_STARTED: 'task_creation_started',
  TASK_CREATION_SUCCEEDED: 'task_creation_succeeded',
  TASK_CREATION_FAILED: 'task_creation_failed',
  
  // Reminder events
  REMINDER_ADDED: 'reminder_added',
  REMINDER_REMOVED: 'reminder_removed',
  REMINDER_TRIGGERED: 'reminder_triggered',
  
  // Feature usage events
  RICH_EDITOR_USED: 'rich_editor_used',
  PLAIN_EDITOR_USED: 'plain_editor_used',
  PRIORITY_SET: 'priority_set',
  DEADLINE_SET: 'deadline_set',
  
  // Error events
  ERROR_OCCURRED: 'error_occurred',
  API_ERROR: 'api_error',
  NETWORK_ERROR: 'network_error',
  
  // Performance events
  SLOW_RENDER: 'slow_render',
  SLOW_API_CALL: 'slow_api_call'
};

// List of sensitive keys that should never be logged
const SENSITIVE_KEYS = [
  'password', 
  'token', 
  'secret', 
  'apiKey', 
  'credit_card',
  'ssn',
  'email',
  'phone'
];

// Current global log level - can be changed at runtime
let currentLogLevel = __DEV__ ? LogLevel.DEBUG : LogLevel.INFO;

// Type for the base context
interface BaseContext {
  app: {
    name: string | undefined;
    version: string;
    environment: string;
  };
  device: {
    os: string;
    osVersion: string | number;
    deviceId: string | undefined;
    deviceName: string | undefined;
  };
}

// Type for combined context with session info
interface ContextWithSession extends BaseContext {
  sessionId: string;
  timestamp: string;
  [key: string]: any; // Index signature to allow additional properties
}

// Set up basic device and app context that will be included with all logs and events
const getBaseContext = (): BaseContext => ({
  app: {
    name: Constants.expoConfig?.name,
    version: config.appVersion,
    environment: config.env,
  },
  device: {
    os: Platform.OS,
    osVersion: Platform.Version,
    deviceId: Constants.deviceId,
    deviceName: Constants.deviceName,
  }
});

/**
 * Sets the global log level for the application
 */
export const setLogLevel = (level: LogLevel) => {
  currentLogLevel = level;
  console.log(`[Logger] Log level set to: ${LogLevel[level]}`);
};

/**
 * Sanitizes an object by removing sensitive information
 */
const sanitizeObject = (obj: Record<string, any>, path = ''): Record<string, any> => {
  if (!obj || typeof obj !== 'object') return obj;
  
  return Object.keys(obj).reduce((sanitized, key) => {
    const currentPath = path ? `${path}.${key}` : key;
    const isSensitive = SENSITIVE_KEYS.some(sensitiveKey => 
      key.toLowerCase().includes(sensitiveKey.toLowerCase())
    );
    
    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (obj[key] && typeof obj[key] === 'object') {
      sanitized[key] = sanitizeObject(obj[key], currentPath);
    } else {
      sanitized[key] = obj[key];
    }
    
    return sanitized;
  }, {} as Record<string, any>);
};

/**
 * Adds a unique session ID to the context
 */
let sessionId: string | null = null;

const getSessionId = async (): Promise<string> => {
  if (!sessionId) {
    try {
      // Try to get from storage first
      sessionId = await AsyncStorage.getItem('current_session_id');
      
      // If no existing session, create a new one
      if (!sessionId) {
        sessionId = `session_${Date.now()}`;
        await AsyncStorage.setItem('current_session_id', sessionId);
      }
    } catch (error) {
      // If storage fails, create an in-memory session ID
      sessionId = `session_${Date.now()}`;
    }
  }
  
  return sessionId;
};

/**
 * Central function to log messages at different levels
 */
export const log = async (
  level: LogLevel, 
  message: string, 
  context?: Record<string, any>
) => {
  // Only log if the level is at or above the current log level
  if (level < currentLogLevel) return;
  
  // Get current session ID
  const currentSessionId = await getSessionId();
  
  // Sanitize context to remove sensitive information
  const sanitizedContext = context ? sanitizeObject(context) : {};
  
  // Combined context with base info
  const combinedContext: ContextWithSession = {
    ...getBaseContext(),
    sessionId: currentSessionId,
    timestamp: new Date().toISOString(),
    ...sanitizedContext
  };
  
  // Format log message to include level
  const levelName = LogLevel[level];
  const formattedMessage = `[${levelName}] ${message}`;
  
  // Console logging based on level
  switch (level) {
    case LogLevel.TRACE:
    case LogLevel.DEBUG:
      console.debug(formattedMessage, combinedContext);
      break;
    case LogLevel.INFO:
      console.info(formattedMessage, combinedContext);
      break;
    case LogLevel.WARN:
      console.warn(formattedMessage, combinedContext);
      break;
    case LogLevel.ERROR:
    case LogLevel.FATAL:
      console.error(formattedMessage, combinedContext);
      
      // Report errors to Sentry
      if (config.sentry.dsn) {
        Sentry.withScope(scope => {
          // Add context to Sentry
          Object.entries(combinedContext).forEach(([key, value]) => {
            if (typeof value === 'object') {
              scope.setContext(key, value);
            } else {
              scope.setTag(key, String(value));
            }
          });
          
          // Set log level
          scope.setLevel(level === LogLevel.ERROR ? 'error' : 'fatal');
          
          // Capture message
          Sentry.captureMessage(message, level === LogLevel.ERROR ? 'error' : 'fatal');
        });
      }
      break;
  }
  
  // Return the log data (useful for chaining or testing)
  return { level, message, context: combinedContext };
};

/**
 * Shorthand logging functions
 */
export const trace = (message: string, context?: Record<string, any>) => log(LogLevel.TRACE, message, context);
export const debug = (message: string, context?: Record<string, any>) => log(LogLevel.DEBUG, message, context);
export const info = (message: string, context?: Record<string, any>) => log(LogLevel.INFO, message, context);
export const warn = (message: string, context?: Record<string, any>) => log(LogLevel.WARN, message, context);
export const error = (message: string, context?: Record<string, any>) => log(LogLevel.ERROR, message, context);
export const fatal = (message: string, context?: Record<string, any>) => log(LogLevel.FATAL, message, context);

/**
 * Log and track an error with both console, Sentry, and PostHog
 */
export const logError = async (
  err: Error | unknown, 
  context?: Record<string, any>,
  shouldTrackAnalytics = true
) => {
  const error = err instanceof Error ? err : new Error(String(err));
  const errorMessage = error.message || 'Unknown error';
  const errorName = error.name || 'Error';
  const stack = error.stack;
  
  const errorContext = {
    errorName,
    stack,
    ...context
  };
  
  // Log to console and Sentry
  await log(LogLevel.ERROR, errorMessage, errorContext);
  
  // Also track as an analytics event if requested
  if (shouldTrackAnalytics) {
    trackEvent(
      null, // posthog instance not needed with our new implementation
      EventName.ERROR_OCCURRED, 
      errorContext
    );
  }
  
  return { error, context: errorContext };
};

/**
 * Enhanced analytics tracking with standardized context
 */
export const trackEvent = async (
  posthogInstance: PostHog | null, 
  eventName: string, 
  properties?: Record<string, any>
) => {
  try {
    // Get session info
    const currentSessionId = await getSessionId();
    
    // Sanitize properties
    const sanitizedProps = properties ? sanitizeObject(properties) : {};
    
    // Build context with base info
    const contextualProperties: ContextWithSession = {
      ...getBaseContext(),
      sessionId: currentSessionId,
      timestamp: new Date().toISOString(),
      ...sanitizedProps
    };
    
    // Log the event (helps with debugging)
    debug(`Analytics event: ${eventName}`, contextualProperties);
    
    // Get an instance - either the provided one or the global one
    const posthog = posthogInstance || global.posthogInstance;
    
    if (!posthog) {
      if (config.posthog.apiKey) {
        console.warn(`[Logger] No PostHog instance available for event: ${eventName}`);
      }
      return;
    }
    
    // Send event to PostHog
    posthog.capture(eventName, contextualProperties);
    
    return { eventName, properties: contextualProperties };
  } catch (err) {
    // Don't use logError to avoid infinite loops
    console.error(`[Logger] Error tracking event ${eventName}:`, err);
    return null;
  }
};

/**
 * Identify a user with both Sentry and PostHog
 */
export const identifyUser = async (
  posthogInstance: PostHog | null,
  userId: string,
  traits?: Record<string, any>
) => {
  try {
    // Set the user ID for Sentry
    if (config.sentry.dsn) {
      Sentry.setUser({ id: userId, ...traits });
    }
    
    // Get an instance - either the provided one or the global one
    const posthog = posthogInstance || global.posthogInstance;
    
    if (!posthog) {
      if (config.posthog.apiKey) {
        console.warn(`[Logger] No PostHog instance available for user identification: ${userId}`);
      }
      return;
    }
    
    // Set the user for PostHog
    posthog.identify(userId, {
      ...getBaseContext(),
      ...traits
    });
    
    // Log the identification
    info(`User identified: ${userId}`, { userId, ...traits });
    
    return { userId, traits };
  } catch (err) {
    console.error(`[Logger] Error identifying user ${userId}:`, err);
    return null;
  }
};

/**
 * Reset user identification
 */
export const resetUser = async (posthogInstance: PostHog | null) => {
  try {
    // Reset user for Sentry
    if (config.sentry.dsn) {
      Sentry.setUser(null);
    }
    
    // Get an instance - either the provided one or the global one
    const posthog = posthogInstance || global.posthogInstance;
    
    if (posthog) {
      // Reset user for PostHog
      posthog.reset();
    }
    
    // Create a new session ID
    sessionId = `session_${Date.now()}`;
    await AsyncStorage.setItem('current_session_id', sessionId);
    
    // Log the reset
    info('User and session reset');
    
    return true;
  } catch (err) {
    console.error('[Logger] Error resetting user:', err);
    return false;
  }
};

/**
 * Performance monitoring start
 * Creates a performance tracking point with timestamp and context
 */
export const startPerformanceTracking = (operationName: string, context?: Record<string, any>) => {
  // Create a simple tracking object instead of using Sentry's API directly
  const startTime = Date.now();
  
  // Log the start of the operation
  debug(`Performance tracking started: ${operationName}`, { 
    operation: operationName,
    startTime,
    ...context
  });
  
  // Return object that can be used to finish tracking
  return {
    operationName,
    startTime,
    context,
    // This will be called when tracking is finished
    finish: (status: 'ok' | 'error' | 'cancelled' = 'ok', additionalContext?: Record<string, any>) => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Combined context
      const finalContext = {
        operation: operationName,
        startTime,
        endTime,
        duration,
        status,
        ...context,
        ...additionalContext
      };

      // Log the performance data
      if (status === 'error') {
        warn(`Performance tracking [${status}]: ${operationName} (${duration}ms)`, finalContext);
      } else {
        debug(`Performance tracking [${status}]: ${operationName} (${duration}ms)`, finalContext);
      }
      
      // For slow operations, track as an event
      if (duration > 1000) { // Slow operation threshold (1 second)
        trackEvent(
          null,
          duration > 5000 ? EventName.SLOW_API_CALL : EventName.SLOW_RENDER,
          finalContext
        );
      }
      
      // Also report to Sentry if it's an error or very slow
      if (status === 'error' || duration > 5000) {
        try {
          Sentry.withScope(scope => {
            // Add context to scope
            scope.setTag('operation', operationName);
            scope.setTag('duration', duration.toString());
            scope.setTag('status', status);
            
            // Add detailed context
            scope.setContext('performance', finalContext);
            
            // Send as a message to Sentry
            Sentry.captureMessage(
              `Performance issue: ${operationName} (${duration}ms)`, 
              duration > 10000 ? 'error' : 'warning'
            );
          });
        } catch (err) {
          console.error('[Logger] Error reporting performance issue to Sentry:', err);
        }
      }
      
      return finalContext;
    }
  };
};

/**
 * Performance monitoring - finish tracking
 * @deprecated Use the finish() method on the object returned by startPerformanceTracking instead
 */
export const finishPerformanceTracking = (
  tracker: ReturnType<typeof startPerformanceTracking> | null,
  status: 'ok' | 'error' | 'cancelled' = 'ok',
  context?: Record<string, any>
) => {
  if (!tracker) return null;
  return tracker.finish(status, context);
};

/**
 * Set a global PostHog instance for convenience 
 */
export const setGlobalPostHogInstance = (posthog: PostHog) => {
  global.posthogInstance = posthog;
};

/**
 * Initialize logger with app-specific settings
 */
export const initializeLogger = async () => {
  // Set appropriate log level based on environment
  if (config.isDevelopment) {
    setLogLevel(LogLevel.DEBUG);
  } else if (config.isStaging) {
    setLogLevel(LogLevel.INFO);
  } else {
    setLogLevel(LogLevel.WARN); // Production - only warnings and errors
  }
  
  // Log initialization
  info('Logger initialized', { logLevel: LogLevel[currentLogLevel] });
  
  // Return the current configuration
  return {
    logLevel: currentLogLevel,
    environment: config.env,
    sentryEnabled: !!config.sentry.dsn,
    posthogEnabled: !!config.posthog.apiKey
  };
};

// Default export for easy imports
export default {
  log,
  trace,
  debug,
  info,
  warn,
  error,
  fatal,
  logError,
  trackEvent,
  identifyUser,
  resetUser,
  EventName,
  LogLevel,
  setLogLevel,
  startPerformanceTracking,
  finishPerformanceTracking,
  setGlobalPostHogInstance,
  initializeLogger
}; 
