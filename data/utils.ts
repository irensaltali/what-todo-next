import { PostgrestError } from '@supabase/supabase-js';

// Response type for CRUD operations
export type CrudResponse<T> = {
  data: T | null;
  error: PostgrestError | Error | null;
};

// Error handler for Supabase operations with generic return type
export const handleSupabaseError = <T>(error: PostgrestError | Error): CrudResponse<T> => {
  console.error('Supabase Error:', error);
  return {
    data: null,
    error,
  };
};

// Format Supabase response
export const formatResponse = <T>(data: T | null, error: PostgrestError | Error | null): CrudResponse<T> => {
  return {
    data,
    error,
  };
};

// Type for UUID
export type UUID = string;

// Type for Timestamp
export type Timestamp = string; 
