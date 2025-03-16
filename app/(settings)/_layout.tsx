import React from 'react';
import { Stack } from 'expo-router';
import { useAuth } from '@/lib/useAuth';
import { Redirect } from 'expo-router';
import { layoutStyles } from '@/lib/styles/layout';
import { useTheme } from '@/lib/styles/useTheme';
import { typography } from '@/lib/styles/theme';

export default function SettingsLayout() {
  const { session, loading } = useAuth();
  const theme = useTheme();

  // If not authenticated, redirect to sign in
  if (!session && !loading) {
    return <Redirect href="/sign-in" />;
  }

  // While loading, show nothing
  if (loading) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.background.primary
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontSize: typography.fontSize.md,
          fontWeight: '600',
          color: theme.colors.text.primary
        },
        headerTitleAlign: 'center',
        headerBackTitle: '',
      }}
    />
  );
}
