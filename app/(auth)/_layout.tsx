import { Stack } from 'expo-router';
import { Redirect } from 'expo-router';
import { useAuth } from '../../lib/useAuth';

export default function AuthLayout() {
  const { session, loading } = useAuth();

  // If the user is authenticated, redirect to the home page
  if (session && !loading) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
    </Stack>
  );
}