import Constants from 'expo-constants';

/**
 * Environment types for the application
 */
export type Environment = 'development' | 'staging' | 'production';

/**
 * Configuration service for the application
 * Centralizes all environment variables and configuration settings
 */
interface AppConfig {
  env: Environment;
  supabaseUrl: string;
  supabaseAnonKey: string;
  apiUrl: string;
  appVersion: string;
  isProduction: boolean;
  isDevelopment: boolean;
  isStaging: boolean;
  sentry: {
    dsn: string;
    environment: string;
    tracesSampleRate: number;
    profilesSampleRate: number;
  };
  posthog: {
    apiKey: string;
    host: string;
  };
}

// Get the environment from Expo Constants
const getEnvironment = (): Environment => {
  const envFromConstants = process.env.EXPO_PUBLIC_ENV as Environment;
  
  if (envFromConstants && ['development', 'staging', 'production'].includes(envFromConstants)) {
    return envFromConstants;
  }
  
  // Default to development if not specified
  return 'development';
};

// Create and export the configuration
const env = getEnvironment();

const config: AppConfig = {
  env,
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  apiUrl: process.env.EXPO_PUBLIC_API_URL || '',
  appVersion: Constants.expoConfig?.version || '1.0.0',
  isProduction: env === 'production',
  isDevelopment: env === 'development',
  isStaging: env === 'staging',
  sentry: {
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
    environment: env,
    tracesSampleRate: env === 'production' ? 0.2 : 1.0, // Lower sample rate in production
    profilesSampleRate: env === 'production' ? 0.1 : 1.0, // Lower profile rate in production
  },
  posthog: {
    apiKey: process.env.EXPO_PUBLIC_POSTHOG_API_KEY || '',
    host: process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
  },
};

export default config; 
