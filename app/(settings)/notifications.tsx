import { View, Text, StyleSheet, Switch } from 'react-native';
import { Stack } from 'expo-router';

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Notifications' }} />
      
      <View style={styles.section}>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Push Notifications</Text>
            <Text style={styles.settingDescription}>
              Receive notifications about your tasks and updates
            </Text>
          </View>
          <Switch
            value={true}
            onValueChange={() => {}}
            trackColor={{ false: '#E5E5EA', true: '#34C759' }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Task Reminders</Text>
            <Text style={styles.settingDescription}>
              Get reminded about upcoming and due tasks
            </Text>
          </View>
          <Switch
            value={true}
            onValueChange={() => {}}
            trackColor={{ false: '#E5E5EA', true: '#34C759' }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Email Notifications</Text>
            <Text style={styles.settingDescription}>
              Receive important updates via email
            </Text>
          </View>
          <Switch
            value={false}
            onValueChange={() => {}}
            trackColor={{ false: '#E5E5EA', true: '#34C759' }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6C757D',
  },
});