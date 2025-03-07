import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { getAvatarUrl } from '@/lib/avatarUrl';
import { format } from 'date-fns';
import { StatusBar } from '@/components/StatusBar';

interface Profile {
  id: string;
  name: string | null;
  avatar_url: string | null;
}

interface TaskCounts {
  inProcess: number;
  completed: number;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [taskCounts, setTaskCounts] = useState<TaskCounts>({
    inProcess: 0,
    completed: 0,
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchProfile();
    fetchTaskCounts();

    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchTaskCounts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: inProcessTasks, error: inProcessError } = await supabase
        .from('tasks')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('status', 'inprocess');

      const { data: completedTasks, error: completedError } = await supabase
        .from('tasks')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('status', 'completed');

      if (inProcessError) throw inProcessError;
      if (completedError) throw completedError;

      setTaskCounts({
        inProcess: inProcessTasks?.length || 0,
        completed: completedTasks?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching task counts:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/sign-in');
  };

  const MenuItem = ({ icon, label, route }: { icon: string; label: string; route: string }) => (
    <Pressable
      style={styles.menuItem}
      onPress={() => router.push(`/(settings)/${route}`)}
      android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}>
      <View style={styles.menuItemContent}>
        <View style={styles.menuItemLeft}>
          <Ionicons name={icon as any} size={24} color="#212529" />
          <Text style={styles.menuItemLabel}>{label}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#6C757D" />
      </View>
    </Pressable>
  );

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.statusBar}>
        <Text style={styles.timeText}>
          {format(currentTime, 'h:mm a')}
        </Text>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <Text style={styles.metricNumber}>{taskCounts.inProcess}</Text>
            <Text style={styles.metricLabel}>In Process</Text>
          </View>
          
          <Image
            source={{ uri: getAvatarUrl(profile?.avatar_url) }}
            style={styles.profileImage}
          />
          
          <View style={styles.metric}>
            <Text style={styles.metricNumber}>{taskCounts.completed}</Text>
            <Text style={styles.metricLabel}>Completed</Text>
          </View>
        </View>
        <Text style={styles.userName}>{profile?.name || 'User'}</Text>
      </View>

      <Pressable 
        style={styles.editButton}
        onPress={() => router.push('/profile/edit')}
      >
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </Pressable>

      <View style={styles.menuSection}>
        <MenuItem icon="notifications-outline" label="Notifications" route="notifications" />
        <MenuItem icon="shield-checkmark-outline" label="Security" route="security" />
        <MenuItem icon="globe-outline" label="Language & Region" route="language" />
        <MenuItem icon="star-outline" label="Go Premium" route="premium" />
        <MenuItem icon="help-circle-outline" label="Help Center" route="help" />
      </View>

      <Pressable 
        style={styles.signOutButton}
        onPress={handleSignOut}
      >
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  statusBar: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  timeText: {
    fontSize: 16,
    color: '#212529',
    fontWeight: '500',
  },
  profileSection: {
    alignItems: 'center',
    padding: 16,
    marginTop: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  metric: {
    alignItems: 'center',
  },
  metricNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: '#6C757D',
  },
  editButton: {
    backgroundColor: '#FF6B00',
    marginHorizontal: 16,
    marginTop: 24,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  menuSection: {
    backgroundColor: '#fff',
    marginTop: 24,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    height: 56,
    justifyContent: 'center',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#DEE2E6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemLabel: {
    fontSize: 16,
    color: '#212529',
  },
  signOutButton: {
    marginHorizontal: 16,
    marginVertical: 24,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE5E5',
  },
  signOutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
});
