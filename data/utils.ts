import { PostgrestError } from '@supabase/supabase-js';
import { logError } from '../lib/analytics';

// Response type for CRUD operations
export type CrudResponse<T> = {
  data: T | null;
  error: PostgrestError | Error | null;
};

// Error handler for Supabase operations with generic return type
export const handleSupabaseError = <T>(
  error: PostgrestError | Error, 
  context?: Record<string, any>
): CrudResponse<T> => {
  // Log the error with meaningful context
  console.error('[Database] Error:', error, context);
  
  // Send to error tracking
  logError(error, {
    context: 'database_operation',
    ...context,
  });
  
  return {
    data: null,
    error,
  };
};

// Format Supabase response
export const formatResponse = <T>(
  data: T | null, 
  error: PostgrestError | Error | null
): CrudResponse<T> => {
  return {
    data,
    error,
  };
};

// Type for UUID
export type UUID = string;

// Type for Timestamp
export type Timestamp = string; 
