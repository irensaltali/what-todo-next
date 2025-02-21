import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Pressable, Dimensions } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';
import { StatusBar } from '../../components/StatusBar';
import FeaturedTaskCard from '../../components/FeaturedTaskCard';

interface Task {
  id: string;
  title: string;
  type: string;
  task_count: number;
  progress: number;
  status: 'ongoing' | 'inprocess' | 'canceled' | 'completed';
}

interface Profile {
  id: string;
  name: string | null;
  avatar_url: string | null;
}

const STATUS_COLORS = {
  ongoing: '#5593F1',
  inprocess: '#FFC247',
  canceled: '#F26E56',
  completed: '#52C1C4',
};

const STATUS_ICON_COLORS = {
  ongoing: '#4C85DB',
  inprocess: '#E5B03F',
  canceled: '#DA624D',
  completed: '#4AAFB2',
};

const STATUS_COUNTS = {
  ongoing: 24,
  inprocess: 12,
  canceled: 8,
  completed: 42,
};

const featuredTaskData = {
  taskTitle: 'Design New Landing Page',
  taskDescription: 'Create a visually appealing and user-friendly landing page for our new product launch. Focus on a clean design that converts visitors.',
  categories: ['Design', 'UI/UX', 'Web'],
  deadline: new Date(2024, 4, 30), // May 30, 2024
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    fetchProfile();
    fetchTasks();
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

      if (error) {
        if (error.message.includes('found no rows')) {
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert([
              {
                id: user.id,
                name: user.email?.split('@')[0] || 'User',
                avatar_url: null,
              },
            ])
            .select()
            .single();

          if (!insertError && newProfile) {
            setProfile(newProfile);
          }
        }
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleTaskPress = (taskId: string) => {
    router.push(`/(tabs)/${taskId}`);
  };

  const handleFocusPress = () => {
    console.log('Focus button pressed');
    // Add focus mode logic here
  };

  const StatusCard = ({ status, count, color, iconColor }: { status: string; count: number; color: string; iconColor: string }) => (
    <View style={[styles.statusCard, { backgroundColor: color }]}>
      <View style={styles.statusContent}>
        <View style={[styles.statusIcon, { backgroundColor: iconColor }]}>
          <Ionicons
            name={
              status === 'ongoing'
                ? 'time-outline'
                : status === 'inprocess'
                  ? 'reload-outline'
                  : status === 'canceled'
                    ? 'close-outline'
                    : 'checkmark-outline'
            }
            size={32}
            color="#fff"
          />
        </View>
        <View style={styles.statusTextContainer}>
          <Text style={styles.statusTitle}>{status.charAt(0).toUpperCase() + status.slice(1)}</Text>
          <Text style={styles.statusLabel}>{count} Tasks</Text>
        </View>
      </View>
    </View>
  );

  const TaskCard = ({ task }: { task: Task }) => (
    <Pressable
      style={styles.taskCard}
      onPress={() => handleTaskPress(task.id)}
    >
      <View style={styles.taskInfo}>
        <Text style={styles.taskTitle}>{task.title}</Text>
        <Text style={styles.taskType}>{task.type}</Text>
        <Text style={styles.taskCount}>{task.task_count} Tasks</Text>
      </View>
      <View style={styles.progressContainer}>
        <AnimatedCircularProgress
          size={50}
          width={5}
          fill={task.progress || 0}
          tintColor={STATUS_COLORS[task.status]}
          backgroundColor="#E2E2E2"
          rotation={0}
          lineCap="round"
        >
          {(fill) => (
            <Text style={styles.progressText}>{Math.round(fill)}%</Text>
          )}
        </AnimatedCircularProgress>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.content, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={{ uri: profile?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.greeting}>Hi, {profile?.name || 'User'} 👋</Text>
              <Text style={styles.subtitle}>Let's find What To Do Next</Text>
            </View>
          </View>
          <Pressable style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color="#1C1C1E" />
          </Pressable>
        </View>

        <FeaturedTaskCard
          taskTitle={featuredTaskData.taskTitle}
          taskDescription={featuredTaskData.taskDescription}
          categories={featuredTaskData.categories}
          deadline={featuredTaskData.deadline}
          onFocusPress={handleFocusPress}
        />

        <View style={styles.statusGrid}>
          {Object.entries(STATUS_COUNTS).map(([status, count]) => (
            <StatusCard
              key={status}
              status={status}
              count={count}
              color={STATUS_COLORS[status as keyof typeof STATUS_COLORS]}
              iconColor={STATUS_ICON_COLORS[status as keyof typeof STATUS_ICON_COLORS]}
            />
          ))}
        </View>

        <View style={styles.tasksSection}>
          <Text style={styles.sectionTitle}>Recent Tasks</Text>
          <FlashList
            data={tasks}
            renderItem={({ item }) => <TaskCard task={item} />}
            estimatedItemSize={100}
            contentContainerStyle={styles.taskList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statusCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTextContainer: {
    flex: 1,
    justifyContent: 'space-between',
    marginLeft: 12,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#080100',
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 14,
    color: '#080100',
    opacity: 0.9,
  },
  tasksSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#1C1C1E',
    marginBottom: 16,
  },
  taskList: {
    paddingBottom: 16,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#080100',
    shadowColor: '#010101',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  taskInfo: {
    flex: 1,
    marginRight: 16,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  taskType: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  taskCount: {
    fontSize: 12,
    color: '#8E8E93',
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
});
