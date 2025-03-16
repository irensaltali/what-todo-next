import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Pressable } from 'react-native';
import { useAuth } from '@/lib/useAuth';
import { Redirect } from 'expo-router';
import { useTaskEntry } from '@/contexts/TaskEntryContext';
import { useTranslation } from 'react-i18next';
import { layoutStyles } from '@/lib/styles/layout';
import { useTheme } from '@/lib/styles/useTheme';

export default function TabLayout() {
  const { session, loading } = useAuth();
  const { showTaskEntry } = useTaskEntry();
  const { t } = useTranslation();
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
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: layoutStyles.tabBarStyle,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text.placeholder,
        tabBarShowLabel: false,
        tabBarItemStyle: layoutStyles.tabBarItemStyle,
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
                layoutStyles.addButton,
                pressed && layoutStyles.addButtonPressed,
              ]}
              onPress={() => showTaskEntry()} // Use context to show modal instead of navigation
            >
              <View style={layoutStyles.addButtonInner}>
                <Ionicons name="add" size={32} color="#fff" />
              </View>
            </Pressable>
          ),
        }}
      />
    </Tabs>
  );
}
