import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useAnimatedScrollHandler,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { supabase } from '@/lib/supabase';
import FeaturedTaskCard from '@/components/FeaturedTaskCard';
import useProfileStore from '@/store/profileStore';
import { Profile } from '@/store/models/profile';
import { useTranslation } from 'react-i18next';

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

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [tasks, setTasks] = useState<Task[]>([]);
  const { profile, loading: profileLoading, error: profileError, loadProfile, getDefaultAvatar } = useProfileStore();
  const [statusSectionCollapsed, setStatusSectionCollapsed] = useState(false);
  const { t } = useTranslation();
  const scrollY = useSharedValue(0);
  const lastScrollY = useSharedValue(0);
  const scrollVelocity = useSharedValue(0);
  const statusSectionHeight = screenHeight * 0.16; // Height of the status section when expanded
  const collapsibleHeight = useSharedValue(statusSectionHeight);
  const summaryOpacity = useSharedValue(0);

  useEffect(() => {
    initializeProfile();
    fetchTasks();
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

  const handleProfilePress = () => {
    router.push('/(tabs)/profile');
  };

  // Toggle status section manually
  const toggleStatusSection = () => {
    const newCollapsedState = !statusSectionCollapsed;
    setStatusSectionCollapsed(newCollapsedState);

    if (newCollapsedState) {
      // Collapse
      collapsibleHeight.value = withTiming(0, { duration: 300 });
      summaryOpacity.value = withTiming(1, { duration: 300 });
    } else {
      // Expand
      collapsibleHeight.value = withTiming(statusSectionHeight, { duration: 300 });
      summaryOpacity.value = withTiming(0, { duration: 300 });
    }
  };

  // Scroll handler to track position and velocity
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      // Calculate velocity (change in position)
      const currentY = event.contentOffset.y;
      scrollVelocity.value = currentY - lastScrollY.value;
      lastScrollY.value = currentY;

      // Store current scroll position
      scrollY.value = currentY;

      // During active scrolling, we just track position but don't collapse yet
    },
    onEndDrag: (event) => {
      // When user lifts finger, decide whether to collapse based on position and velocity
      const currentY = event.contentOffset.y;
      const velocity = Math.abs(scrollVelocity.value);

      // Calculate animation duration based on velocity (faster scroll = faster animation)
      // Clamp between 150ms and 500ms for reasonable animation speed
      const animDuration = Math.max(150, Math.min(500, 300 / (velocity * 0.1 + 1)));

      if (currentY > statusSectionHeight * 0.3 || (scrollVelocity.value > 5 && currentY > statusSectionHeight * 0.1)) {
        // Collapse if scrolled past threshold OR scrolling up quickly
        collapsibleHeight.value = withTiming(0, { duration: animDuration });
        summaryOpacity.value = withTiming(1, { duration: animDuration });
        runOnJS(setStatusSectionCollapsed)(true);
      } else if (currentY < statusSectionHeight * 0.1 || (scrollVelocity.value < -5 && currentY < statusSectionHeight * 0.5)) {
        // Expand if near top OR scrolling down quickly
        collapsibleHeight.value = withTiming(statusSectionHeight, { duration: animDuration });
        summaryOpacity.value = withTiming(0, { duration: animDuration });
        runOnJS(setStatusSectionCollapsed)(false);
      }
    }
  });

  // Animated styles
  const statusSectionStyle = useAnimatedStyle(() => {
    return {
      height: collapsibleHeight.value,
      opacity: collapsibleHeight.value / statusSectionHeight,
      overflow: 'hidden',
    };
  });

  const statusSummaryStyle = useAnimatedStyle(() => {
    return {
      opacity: summaryOpacity.value
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
          <Text style={styles.statusTitle}>{t(`status.${status}`)}</Text>
          <Text style={styles.statusLabel}>{count} {t('home.tasks')}</Text>
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
        <Text style={styles.taskCount}>{task.task_count} {t('home.tasks')}</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* Fixed Header Section */}
      <View style={[styles.fixedHeaderContainer, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable onPress={handleProfilePress}>
              <Image
                source={profile.avatar_url ? { uri: profile.avatar_url } : monsterImages[getDefaultAvatar()]}
                style={styles.avatar}
              />
            </Pressable>
            <View>
              <Text style={styles.greeting}>{t('greeting', { name: profile.name || 'User' })} 👋</Text>
              <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
            </View>
          </View>
        </View>

        {/* Featured Task with consistent left alignment */}
        <FeaturedTaskCard
          taskTitle={featuredTaskData.taskTitle}
          taskDescription={featuredTaskData.taskDescription}
          categories={featuredTaskData.categories}
          deadline={featuredTaskData.deadline}
          onFocusPress={handleFocusPress}
        />

        {/* Fixed Status Overview title with consistent left alignment */}
        <Pressable
          style={styles.sectionTitleContainer}
          onPress={toggleStatusSection}
        >
          <Text style={styles.sectionTitle}>{t('home.status_overview')}</Text>

          <View style={styles.headerRightContainer}>
            <Animated.View style={[styles.statusSummary, statusSummaryStyle]}>
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
            </Animated.View>

            <Ionicons
              name={statusSectionCollapsed ? "chevron-forward" : "chevron-down"}
              size={sizing.iconSize.small}
              color="#8E8E93"
            />
          </View>
        </Pressable>
      </View>

      {/* Scrollable Content */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.collapsibleContainer}>
          {/* Status section cards */}
          <Animated.View style={[styles.collapsibleContent, statusSectionStyle]}>
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
          <Text style={styles.sectionTitle}>{t('home.upcoming')}</Text>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
          {tasks.length === 0 && (
            <Text style={styles.emptyStateText}>{t('home.empty_tasks')}</Text>
          )}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  fixedHeaderContainer: {
    backgroundColor: '#F6F6F6',
    zIndex: 10,
    paddingHorizontal: spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    // paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRightContainer: {
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
  collapsibleContainer: {
    // marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: 'transparent',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 0, // Removed padding for left alignment
  },
  sectionTitle: {
    fontSize: fontSize.medium,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: spacing.sm,
  },
  collapsibleContent: {
    overflow: 'hidden',
  },
  statusSummary: {
    flexDirection: 'row',
    marginRight: spacing.sm,
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
    paddingVertical: spacing.xs,
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
    paddingHorizontal: 0,
    marginHorizontal: spacing.md,
    marginTop: 0,
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
  emptyStateText: {
    fontSize: fontSize.medium,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
