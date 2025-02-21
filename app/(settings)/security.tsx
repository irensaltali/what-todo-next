import { View, Text, StyleSheet, Switch, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SecurityScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Security' }} />
      
      <View style={styles.section}>
        <Pressable style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Change Password</Text>
            <Text style={styles.settingDescription}>
              Update your account password
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6C757D" />
        </Pressable>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Two-Factor Authentication</Text>
            <Text style={styles.settingDescription}>
              Add an extra layer of security
            </Text>
          </View>
          <Switch
            value={false}
            onValueChange={() => {}}
            trackColor={{ false: '#E5E5EA', true: '#34C759' }}
          />
        </View>

        <Pressable style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Active Sessions</Text>
            <Text style={styles.settingDescription}>
              Manage devices where you're logged in
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6C757D" />
        </Pressable>
      </View>

      <View style={[styles.section, styles.dangerSection]}>
        <Pressable style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, styles.dangerText]}>Delete Account</Text>
            <Text style={styles.settingDescription}>
              Permanently delete your account and data
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6C757D" />
        </Pressable>
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
  dangerSection: {
    marginTop: 32,
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
  dangerText: {
    color: '#FF3B30',
  },
});