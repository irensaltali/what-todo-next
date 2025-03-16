import React from 'react';
import { View, Text, Switch } from 'react-native';
import { Stack } from 'expo-router';
import { contentStyles } from '@/lib/styles/content';
import { useTheme } from '@/lib/styles/useTheme';

export default function NotificationsScreen() {
  const theme = useTheme();

  return (
    <View style={contentStyles.container}>
      <Stack.Screen options={{ title: 'Notifications' }} />
      
      <View style={contentStyles.section}>
        <View style={contentStyles.settingItem}>
          <View style={contentStyles.settingInfo}>
            <Text style={contentStyles.settingTitle}>Push Notifications</Text>
            <Text style={contentStyles.settingDescription}>
              Receive notifications about your tasks and updates
            </Text>
          </View>
          <Switch
            value={true}
            onValueChange={() => {}}
            trackColor={{ false: theme.colors.border.medium, true: theme.colors.text.success }}
          />
        </View>

        <View style={contentStyles.settingItem}>
          <View style={contentStyles.settingInfo}>
            <Text style={contentStyles.settingTitle}>Task Reminders</Text>
            <Text style={contentStyles.settingDescription}>
              Get reminded about upcoming and due tasks
            </Text>
          </View>
          <Switch
            value={true}
            onValueChange={() => {}}
            trackColor={{ false: theme.colors.border.medium, true: theme.colors.text.success }}
          />
        </View>

        <View style={[contentStyles.settingItem, { borderBottomWidth: 0 }]}>
          <View style={contentStyles.settingInfo}>
            <Text style={contentStyles.settingTitle}>Email Notifications</Text>
            <Text style={contentStyles.settingDescription}>
              Receive important updates via email
            </Text>
          </View>
          <Switch
            value={false}
            onValueChange={() => {}}
            trackColor={{ false: theme.colors.border.medium, true: theme.colors.text.success }}
          />
        </View>
      </View>
    </View>
  );
}
