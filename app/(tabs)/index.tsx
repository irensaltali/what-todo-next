import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
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
import { supabase } from '@/data/supabase';
import FeaturedTaskCard from '@/components/FeaturedTaskCard';
import useProfileStore from '@/store/profileStore';
import { Profile } from '@/store/models/profile';
import { useTranslation } from 'react-i18next';
import { homeStyles, homeResponsive, STATUS_COLORS, STATUS_ICON_COLORS } from '@/lib/styles/home';
import { useTheme } from '@/lib/styles/useTheme';

// Get responsive variables from the centralized home styles
const { sizing, statusSectionHeight } = homeResponsive;

const STATUS_COUNTS = {
  ongoing: 24,
  inprogress: 12,
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
  const theme = useTheme();
  const scrollY = useSharedValue(0);
  const lastScrollY = useSharedValue(0);
  const scrollVelocity = useSharedValue(0);
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
    router.push(`/(task-details)/${taskId}?source=home`);
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
    <View style={[homeStyles.statusCard, { backgroundColor: color }]}>
      <View style={homeStyles.statusContent}>
        <View style={[homeStyles.statusIcon, { backgroundColor: iconColor }]}>
          <Ionicons
            name={
              status === 'ongoing'
                ? 'time-outline'
                : status === 'inprogress'
                  ? 'reload-outline'
                  : status === 'canceled'
                    ? 'close-outline'
                    : 'checkmark-outline'
            }
            size={sizing.iconSize.medium}
            color="#fff"
          />
        </View>
        <View style={homeStyles.statusTextContainer}>
          <Text style={homeStyles.statusTitle}>{t(`status.${status}`)}</Text>
          <Text style={homeStyles.statusLabel}>{count} {t('home.tasks')}</Text>
        </View>
      </View>
    </View>
  );

  const TaskCard = ({ task }: { task: Task }) => (
    <Pressable
      style={homeStyles.taskCard}
      onPress={() => handleTaskPress(task.id)}
    >
      <View style={homeStyles.taskInfo}>
        <Text style={homeStyles.taskTitle}>{task.title}</Text>
        <Text style={homeStyles.taskType}>{task.type}</Text>
        <Text style={homeStyles.taskCount}>{task.task_count} {t('home.tasks')}</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={homeStyles.container}>
      {/* Fixed Header Section */}
      <View style={[homeStyles.fixedHeaderContainer, { paddingTop: insets.top }]}>
        <View style={homeStyles.header}>
          <View style={homeStyles.headerLeft}>
            <Pressable onPress={handleProfilePress}>
              <Image
                source={profile.avatar_url ? { uri: profile.avatar_url } : monsterImages[getDefaultAvatar()]}
                style={homeStyles.avatar}
              />
            </Pressable>
            <View>
              <Text style={homeStyles.greeting}>{t('greeting', { name: profile.name || 'User' })} 👋</Text>
              <Text style={homeStyles.subtitle}>{t('home.subtitle')}</Text>
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
          style={homeStyles.sectionTitleContainer}
          onPress={toggleStatusSection}
        >
          <Text style={homeStyles.sectionTitle}>{t('home.status_overview')}</Text>

          <View style={homeStyles.headerRightContainer}>
            <Animated.View style={[homeStyles.statusSummary, statusSummaryStyle]}>
              {Object.entries(STATUS_COUNTS).map(([status, count]) => (
                <View key={status} style={homeStyles.statusBadge}>
                  <View
                    style={[
                      homeStyles.statusDot,
                      { backgroundColor: STATUS_COLORS[status as keyof typeof STATUS_COLORS] }
                    ]}
                  />
                  <Text style={homeStyles.statusCount}>{count}</Text>
                </View>
              ))}
            </Animated.View>

            <Ionicons
              name={statusSectionCollapsed ? "chevron-forward" : "chevron-down"}
              size={sizing.iconSize.small}
              color={theme.colors.text.placeholder}
            />
          </View>
        </Pressable>
      </View>

      {/* Scrollable Content */}
      <Animated.ScrollView
        style={homeStyles.scrollView}
        contentContainerStyle={homeStyles.scrollContent}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <View style={homeStyles.collapsibleContainer}>
          {/* Status section cards */}
          <Animated.View style={[homeStyles.collapsibleContent, statusSectionStyle]}>
            <View style={homeStyles.statusGrid}>
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

        <View style={homeStyles.tasksSection}>
          <Text style={homeStyles.sectionTitle}>{t('home.upcoming')}</Text>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
          {tasks.length === 0 && (
            <Text style={homeStyles.emptyStateText}>{t('home.empty_tasks')}</Text>
          )}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

interface Task {
  id: string;
  title: string;
  type: string;
  task_count: number;
  progress: number;
  status: 'ongoing' | 'inprogress' | 'canceled' | 'completed';
}
