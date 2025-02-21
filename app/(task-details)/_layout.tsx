import React from 'react';
import { Stack } from 'expo-router';
import { useAuth } from '../../lib/useAuth';
import { Redirect } from 'expo-router';

export default function TaskDetailsLayout() {
  const { session, loading } = useAuth();

  // If not authenticated, redirect to sign in
  if (!session && !loading) {
    return <Redirect href="/sign-in" />;
  }

  // While loading, show nothing
  if (loading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
