import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Pressable, Dimensions } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import Animated, { 
  useAnimatedStyle, 
  withTiming, 
  useSharedValue,
  interpolate
} from 'react-native-reanimated';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';
import { StatusBar } from '../../components/StatusBar';
import FeaturedTaskCard from '../../components/FeaturedTaskCard';

// Get screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Create a responsive design system
const size = {
  base: 8,
  font: screenWidth * 0.04,
  radius: 8,
  padding: screenWidth * 0.04,
};

// Responsive font sizes
const fontSize = {
  small: size.font * 0.75,
  medium: size.font,
  large: size.font * 1.5,
  xlarge: size.font * 2,
};

// Responsive spacing
const spacing = {
  xs: size.base * 0.5,
  sm: size.base * 1.1,
  md: size.base * 1.5,
  lg: size.base * 2,
  xl: size.base * 3,
};

// Responsive sizing
const sizing = {
  avatarSize: screenWidth * 0.12,
  iconSize: {
    small: screenWidth * 0.05,
    medium: screenWidth * 0.06,
    large: screenWidth * 0.08,
  },
  progressCircle: screenWidth * 0.12,
  progressWidth: screenWidth * 0.012,
  statusIcon: screenWidth * 0.1,
  statusDot: screenWidth * 0.02,
  settingsButton: screenWidth * 0.1,
};

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
  const [statusSectionCollapsed, setStatusSectionCollapsed] = useState(false);
  const collapsibleHeight = useSharedValue(1); // 1 for open, 0 for closed

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

  const toggleStatusSection = () => {
    setStatusSectionCollapsed(!statusSectionCollapsed);
    collapsibleHeight.value = withTiming(statusSectionCollapsed ? 1 : 0, { duration: 300 });
  };

  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(
        collapsibleHeight.value,
        [0, 1],
        [0, screenHeight * 0.17],
      ),
      opacity: collapsibleHeight.value,
    };
  });

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
            size={sizing.iconSize.medium}
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
          size={sizing.progressCircle}
          width={sizing.progressWidth}
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
            <Ionicons name="settings-outline" size={sizing.iconSize.medium} color="#1C1C1E" />
          </Pressable>
        </View>

        <FeaturedTaskCard
          taskTitle={featuredTaskData.taskTitle}
          taskDescription={featuredTaskData.taskDescription}
          categories={featuredTaskData.categories}
          deadline={featuredTaskData.deadline}
          onFocusPress={handleFocusPress}
        />

        <View style={styles.collapsibleContainer}>
          <Pressable 
            style={styles.collapsibleHeader} 
            onPress={toggleStatusSection}
          >
            {statusSectionCollapsed ? (
              <View style={styles.collapsedHeaderContent}>
                <Text style={styles.collapsibleTitle}>Status Overview</Text>
                <View style={styles.statusSummary}>
                  {Object.entries(STATUS_COUNTS).map(([status, count]) => (
                    <View key={status} style={styles.statusBadge}>
                      <View 
                        style={[
                          styles.statusDot, 
                          { backgroundColor: STATUS_COLORS[status as keyof typeof STATUS_COLORS] }
                        ]} 
                      />
                      <Text style={styles.statusCount}>{count}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <Text style={styles.collapsibleTitle}>Status Overview</Text>
            )}
            <Ionicons 
              name={statusSectionCollapsed ? "chevron-forward" : "chevron-down"} 
              size={sizing.iconSize.small} 
              color="#8E8E93" 
            />
          </Pressable>
          
          <Animated.View style={[styles.collapsibleContent, contentAnimatedStyle]}>
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
          </Animated.View>
        </View>

        <View style={styles.tasksSection}>
          <Text style={styles.sectionTitle}>Recent Tasks</Text>
          <FlashList
            data={tasks}
            renderItem={({ item }) => <TaskCard task={item} />}
            estimatedItemSize={80}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: spacing.sm }}
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: sizing.avatarSize,
    height: sizing.avatarSize,
    borderRadius: sizing.avatarSize / 2,
    marginRight: spacing.md,
  },
  greeting: {
    fontSize: fontSize.large,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  subtitle: {
    fontSize: fontSize.small,
    color: '#8E8E93',
    marginTop: spacing.xs,
  },
  settingsButton: {
    width: sizing.settingsButton,
    height: sizing.settingsButton,
    borderRadius: sizing.settingsButton / 2,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  collapsibleContainer: {
    marginBottom: spacing.sm,
    backgroundColor: 'transparent',
    marginHorizontal: spacing.md,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  collapsibleTitle: {
    fontSize: fontSize.medium,
    fontWeight: '600',
    color: '#8E8E93',
  },
  collapsibleContent: {
    overflow: 'hidden',
  },
  collapsedHeaderContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusSummary: {
    flexDirection: 'row',
    marginLeft: spacing.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  statusDot: {
    width: sizing.statusDot,
    height: sizing.statusDot,
    borderRadius: sizing.statusDot / 2,
    marginRight: spacing.xs,
  },
  statusCount: {
    fontSize: fontSize.small,
    color: '#8E8E93',
    fontWeight: '500',
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: 0,
  },
  statusCard: {
    width: '48%',
    borderRadius: size.radius * 1.5,
    padding: spacing.sm,
    marginBottom: spacing.sm,
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
    width: sizing.statusIcon,
    height: sizing.statusIcon,
    borderRadius: sizing.statusIcon / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTextContainer: {
    flex: 1,
    justifyContent: 'space-between',
    marginLeft: spacing.sm,
  },
  statusTitle: {
    fontSize: fontSize.medium,
    fontWeight: 'bold',
    color: '#080100',
    marginBottom: spacing.xs / 2,
  },
  statusLabel: {
    fontSize: fontSize.small,
    color: '#080100',
    opacity: 0.9,
  },
  tasksSection: {
    flex: 1,
    paddingHorizontal: spacing.md,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: fontSize.large,
    color: '#1C1C1E',
    marginBottom: spacing.sm,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: size.radius * 1.5,
    padding: spacing.sm,
    marginBottom: spacing.sm,
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
    marginRight: spacing.md,
  },
  taskTitle: {
    fontSize: fontSize.medium,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: spacing.xs,
  },
  taskType: {
    fontSize: fontSize.small,
    color: '#8E8E93',
    marginBottom: spacing.xs,
  },
  taskCount: {
    fontSize: fontSize.small * 0.9,
    color: '#8E8E93',
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: fontSize.small,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
});
