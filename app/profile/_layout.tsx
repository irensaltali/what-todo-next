import { Stack } from 'expo-router';
import { useAuth } from '../../lib/useAuth';
import { Redirect } from 'expo-router';

export default function ProfileLayout() {
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
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontSize: 16,
          fontWeight: '600',
          color: '#1C1C1E',
        },
        headerTitleAlign: 'center',
        headerBackTitle: '',
      }}
    >
      <Stack.Screen name="edit" />
    </Stack>
  );
}