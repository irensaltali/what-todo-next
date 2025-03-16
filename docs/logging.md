# Centralized Logging & Analytics System

This document provides guidelines on how to use our centralized logging and analytics system in the ToDo Next app.

## Overview

Our centralized logging system provides a unified way to:

1. Log messages at different severity levels
2. Track analytics events with PostHog
3. Report errors to Sentry
4. Track performance metrics
5. Manage user identification

All of this is accessible through a single `logger` module, ensuring consistent formatting, context enrichment, and proper sanitization of sensitive data.

## Getting Started

To use the logger in your component or service:

```typescript
import logger, { EventName, LogLevel } from '@/lib/logger';

// Basic logging
logger.debug('This is a debug message');
logger.info('Operation completed successfully', { results: 42 });
logger.warn('This might be a problem', { warning: 'low disk space' });
logger.error('Something went wrong', { errorCode: 500 });

// Track analytics events
logger.trackEvent(posthog, EventName.TASK_CREATED, { 
  taskId: '123', 
  priority: 1 
});

// Log and track errors
try {
  // Your code
} catch (error) {
  logger.logError(error, { context: 'MyComponent.myMethod' });
}

// Track performance
const tracker = logger.startPerformanceTracking('api-call-users');
// ... do some work
tracker.finish('ok', { results: 42 });
```

## Log Levels

We use the following log levels:

| Level | When to use |
|-------|-------------|
| TRACE | Very detailed information, only used for intense debugging |
| DEBUG | Detailed information useful for debugging |
| INFO | General information about system operation |
| WARN | Potentially harmful situations that don't prevent the app from working |
| ERROR | Error events that might still allow the app to continue |
| FATAL | Severe error events that may cause the app to terminate |

The current log level can be changed at runtime:

```typescript
logger.setLogLevel(LogLevel.DEBUG);
```

By default, we use `DEBUG` in development and `INFO` in production.

## Event Tracking

For consistency, always use predefined event names from the `EventName` enum:

```typescript
// Good
logger.trackEvent(posthog, EventName.TASK_CREATED, { taskId: '123' });

// Bad - inconsistent naming
logger.trackEvent(posthog, 'task-created', { taskId: '123' });
```

Common event categories:

1. **App Lifecycle**: `APP_LAUNCHED`, `APP_BACKGROUNDED`, `APP_FOREGROUNDED`
2. **User Actions**: `USER_SIGNED_IN`, `USER_SIGNED_OUT`, `USER_REGISTERED`
3. **Navigation**: `SCREEN_VIEWED`, `MODAL_OPENED`, `MODAL_CLOSED`
4. **Task Events**: `TASK_CREATED`, `TASK_UPDATED`, `TASK_DELETED`, `TASK_COMPLETED`

If you need a new event name, add it to the `EventName` enum in `lib/logger.ts`.

## Context Enrichment

Every log and event automatically includes:

- App information (name, version, environment)
- Device information (OS, version)
- Session ID (for correlating events)
- Timestamp

You can add your own context:

```typescript
logger.info('Task updated', { 
  taskId: '123',
  changes: ['title', 'priority'],
  user: { id: 'user1', role: 'admin' }
});
```

## Error Tracking with Sentry

Use `logError` to report errors to Sentry with appropriate context:

```typescript
try {
  // Your code
} catch (error) {
  logger.logError(error, { 
    component: 'TaskList',
    method: 'fetchTasks',
    params: { userId: '123' }
  });
}
```

For performance issues and custom errors, use the appropriate methods:

```typescript
// Track slow operations
const tracker = logger.startPerformanceTracking('database-query');
// ... perform the operation
tracker.finish('ok', { recordsFound: 42 });

// Custom errors that should be reported to Sentry
if (invalidState) {
  logger.error('Invalid application state detected', { 
    expected: 'A', 
    actual: 'B' 
  });
}
```

## User Identification

To identify users and track their actions:

```typescript
// When a user signs in
logger.identifyUser(posthog, userId, {
  name: 'John Doe',
  email: 'john@example.com',
  role: 'premium'
});

// When a user signs out
logger.resetUser(posthog);
```

## Migrating from Old Analytics

The old `analytics.ts` functions still work but forward to the new logger system:

```typescript
// Old way - still works but deprecated
import { trackEvent } from '@/lib/analytics';
trackEvent(posthog, 'task_created', { taskId: '123' });

// New way - preferred
import logger, { EventName } from '@/lib/logger';
logger.trackEvent(posthog, EventName.TASK_CREATED, { taskId: '123' });
```

## Best Practices

1. **Consistent Event Names**: Always use the predefined `EventName` enum values.
2. **Structured Context**: Use structured objects for context rather than string concatenation.
3. **Be Concise**: Log messages should be concise but descriptive.
4. **Sanitize Data**: The logger automatically sanitizes sensitive data (passwords, emails, etc.) but be careful what you log.
5. **Log Levels**: Use the appropriate log level for different types of information.
6. **Performance**: Avoid expensive computations in log statements - the logger may skip them based on the current log level.

## Under the Hood

The logger system:

1. Filters logs based on the current log level
2. Adds standard context (app, device, session info)
3. Sanitizes sensitive data
4. Formats logs consistently
5. Sends errors to Sentry with appropriate context
6. Tracks events in PostHog with consistent formatting
7. Enables performance monitoring for slow operations

## Testing

During testing, you can mock the logger to verify it was called with the right parameters:

```typescript
// In your test
import logger from '@/lib/logger';

// Mock the logger
jest.mock('@/lib/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  trackEvent: jest.fn(),
  // ... mock other methods as needed
}));

// Test your code
expect(logger.trackEvent).toHaveBeenCalledWith(
  expect.anything(),
  EventName.TASK_CREATED,
  expect.objectContaining({ taskId: '123' })
);
``` 
