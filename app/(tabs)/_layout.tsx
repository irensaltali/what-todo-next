import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Pressable } from 'react-native';
import { useAuth } from '@/lib/useAuth';
import { Redirect } from 'expo-router';
import { useTaskEntry } from '@/contexts/TaskEntryContext';
import { useTranslation } from 'react-i18next';

export default function TabLayout() {
  const { session, loading } = useAuth();
  const { showTaskEntry } = useTaskEntry();
  const { t } = useTranslation();

  // If not authenticated, redirect to sign in
  if (!session && !loading) {
    return <Redirect href="/sign-in" />;
  }

  // While loading, show nothing
  if (loading) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 84,
          paddingBottom: 20,
          paddingHorizontal: 16,
        },
        tabBarActiveTintColor: '#FF9F1C',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarShowLabel: false,
        tabBarItemStyle: {
          paddingVertical: 8,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="task-list"
        options={{
          title: t('tabs.tasks'),
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add-task"
        options={{
          title: '',
          tabBarButton: (props) => (
            <Pressable
              {...props}
              style={({ pressed }) => [
                styles.addButton,
                pressed && styles.addButtonPressed,
              ]}
              onPress={() => showTaskEntry()} // Use context to show modal instead of navigation
            >
              <View style={styles.addButtonInner}>
                <Ionicons name="add" size={32} color="#fff" />
              </View>
            </Pressable>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  addButton: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
    width: 64,
    height: 64,
    alignSelf: 'center',
  },
  addButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.95 }],
  },
  addButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    backgroundColor: '#FF9F1C',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});
