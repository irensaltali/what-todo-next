import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/data/supabase';
import { router } from 'expo-router';
import { getAvatarUrl } from '@/lib/avatarUrl';
import { format } from 'date-fns';
import useProfileStore from '@/store/profileStore';
import { Profile } from '@/store/models/profile';
import { useTranslation } from 'react-i18next';
import { profileStyles } from '@/lib/styles/profile';
import { useTheme } from '@/lib/styles/useTheme';

interface TaskCounts {
  inProcess: number;
  completed: number;
}

// Create a mapping of monster images for dynamic loading
const monsterImages: Record<number, any> = {
  1: require('@/assets/images/monsters/monster_1.png'),
  2: require('@/assets/images/monsters/monster_2.png'),
  3: require('@/assets/images/monsters/monster_3.png'),
  4: require('@/assets/images/monsters/monster_4.png'),
  5: require('@/assets/images/monsters/monster_5.png'),
  6: require('@/assets/images/monsters/monster_6.png'),
  7: require('@/assets/images/monsters/monster_7.png'),
  8: require('@/assets/images/monsters/monster_8.png'),
  9: require('@/assets/images/monsters/monster_9.png'),
  10: require('@/assets/images/monsters/monster_10.png'),
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { profile, loading: profileLoading, error: profileError, loadProfile, getDefaultAvatar } = useProfileStore();
  const [taskCounts, setTaskCounts] = useState<TaskCounts>({
    inProcess: 0,
    completed: 0,
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const { t } = useTranslation();
  const theme = useTheme();

  useEffect(() => {
    initializeProfile();
    fetchTaskCounts();

    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const initializeProfile = async () => {
    try {
      // Check if we already have a profile in the store
      if (!profile.id) {
        // Get the current authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Load profile from Supabase using the store's loadProfile function
          await loadProfile(user.id);
        }
      }
    } catch (error) {
      console.error('Error initializing profile:', error);
    }
  };

  const fetchTaskCounts = async () => {
    // If task counts are already populated (not both zero), don't fetch again
    if (taskCounts.inProcess > 0 || taskCounts.completed > 0) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: inProcessTasks, error: inProcessError } = await supabase
        .from('tasks')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('status', 'inprogress');

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
    // Clear the profile from the store
    useProfileStore.getState().clearProfile();
    router.replace('/sign-in');
  };

  const MenuItem = ({ icon, label, route, translationKey }: { icon: string; label: string; route: string, translationKey?: string }) => (
    <Pressable
      style={profileStyles.menuItem}
      onPress={() => router.push(`/(settings)/${route}`)}
      android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}>
      <View style={profileStyles.menuItemContent}>
        <View style={profileStyles.menuItemLeft}>
          <Ionicons name={icon as any} size={24} color={theme.colors.text.primary} />
          <Text style={profileStyles.menuItemLabel}>{translationKey ? t(translationKey) : label}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
      </View>
    </Pressable>
  );

  return (
    <ScrollView 
      style={[profileStyles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={profileStyles.statusBar}>
        <Text style={profileStyles.timeText}>
          {format(currentTime, 'h:mm a')}
        </Text>
      </View>

      <View style={profileStyles.profileSection}>
        <View style={profileStyles.metricsRow}>
          <View style={profileStyles.metric}>
            <Text style={profileStyles.metricNumber}>{taskCounts.inProcess}</Text>
            <Text style={profileStyles.metricLabel}>{t('profile.in_process')}</Text>
          </View>
          
          <Image
            source={profile.avatar_url ? { uri: profile.avatar_url } : monsterImages[getDefaultAvatar()]}
            style={profileStyles.profileImage}
          />
          
          <View style={profileStyles.metric}>
            <Text style={profileStyles.metricNumber}>{taskCounts.completed}</Text>
            <Text style={profileStyles.metricLabel}>{t('profile.completed')}</Text>
          </View>
        </View>
        <Text style={profileStyles.userName}>{profile.name || 'User'}</Text>
      </View>

      <Pressable 
        style={profileStyles.editButton}
        onPress={() => router.push('/profile/edit')}
      >
        <Text style={profileStyles.editButtonText}>{t('profile.edit_profile')}</Text>
      </Pressable>

      <View style={profileStyles.menuSection}>
        <MenuItem icon="notifications-outline" label="Notifications" route="notifications" translationKey="profile.notifications" />
        <MenuItem icon="shield-checkmark-outline" label="Security" route="security" translationKey="profile.security" />
        <MenuItem icon="globe-outline" label="Language & Region" route="language" translationKey="profile.language_region" />
        <MenuItem icon="star-outline" label="Go Premium" route="premium" translationKey="profile.go_premium" />
        <MenuItem icon="help-circle-outline" label="Help Center" route="help" translationKey="profile.help_center" />
      </View>

      <Pressable 
        style={profileStyles.signOutButton}
        onPress={handleSignOut}
      >
        <Text style={profileStyles.signOutText}>{t('profile.sign_out')}</Text>
      </Pressable>
    </ScrollView>
  );
}
