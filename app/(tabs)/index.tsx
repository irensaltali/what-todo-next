import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ActivityIndicator,
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
import { useTaskStore, Task } from '@/store/taskStore';
import { useTranslation } from 'react-i18next';
import { homeStyles, homeResponsive, STATUS_COLORS, STATUS_ICON_COLORS } from '@/lib/styles/home';
import { useTheme } from '@/lib/styles/useTheme';

// Get responsive variables from the centralized home styles
const { sizing, statusSectionHeight } = homeResponsive;

// Calculate status counts from tasks
const calculateStatusCounts = (tasks: Task[]) => {
  const completed = tasks.filter(task => task.status === 'completed').length;
  const ongoing = tasks.filter(task => task.status === 'ongoing').length;
  
  return {
    ongoing,
    inprogress: 0,
    canceled: 0,
    completed,
  };
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
  const { tasks, isLoading: todosLoading, error: todosError, fetchTasks } = useTaskStore();
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
      if (!profile.id) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await loadProfile(user.id);
        }
      }
    } catch (error) {
      console.error('Error initializing profile:', error);
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
      collapsibleHeight.value = withTiming(0, { duration: 300 });
      summaryOpacity.value = withTiming(1, { duration: 300 });
    } else {
      collapsibleHeight.value = withTiming(statusSectionHeight, { duration: 300 });
      summaryOpacity.value = withTiming(0, { duration: 300 });
    }
  };

  // Scroll handler to track position and velocity
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const currentY = event.contentOffset.y;
      scrollVelocity.value = currentY - lastScrollY.value;
      lastScrollY.value = currentY;
      scrollY.value = currentY;
    },
    onEndDrag: (event) => {
      const currentY = event.contentOffset.y;
      const velocity = Math.abs(scrollVelocity.value);
      const animDuration = Math.max(150, Math.min(500, 300 / (velocity * 0.1 + 1)));

      if (currentY > statusSectionHeight * 0.3 || (scrollVelocity.value > 5 && currentY > statusSectionHeight * 0.1)) {
        collapsibleHeight.value = withTiming(0, { duration: animDuration });
        summaryOpacity.value = withTiming(1, { duration: animDuration });
        runOnJS(setStatusSectionCollapsed)(true);
      } else if (currentY < statusSectionHeight * 0.1 || (scrollVelocity.value < -5 && currentY < statusSectionHeight * 0.5)) {
        collapsibleHeight.value = withTiming(statusSectionHeight, { duration: animDuration });
        summaryOpacity.value = withTiming(0, { duration: animDuration });
        runOnJS(setStatusSectionCollapsed)(false);
      }
    }
  });

  // Animated styles
  const statusSectionStyle = useAnimatedStyle(() => ({
    height: collapsibleHeight.value,
    opacity: collapsibleHeight.value / statusSectionHeight,
    overflow: 'hidden',
  }));

  const statusSummaryStyle = useAnimatedStyle(() => ({
    opacity: summaryOpacity.value
  }));

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
        <Text style={[homeStyles.taskTitle, task.status === 'completed' && { textDecorationLine: 'line-through' }]}>
          {task.title}
        </Text>
        <Text style={homeStyles.taskType}>
          {new Date(task.created_at).toLocaleDateString()}
        </Text>
      </View>
      {todosLoading && (
        <View style={homeStyles.loadingIndicator}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      )}
    </Pressable>
  );

  const statusCounts = calculateStatusCounts(tasks);

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
              {Object.entries(statusCounts).map(([status, count]) => (
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
              {Object.entries(statusCounts).map(([status, count]) => (
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
          {todosError ? (
            <Text style={[homeStyles.emptyStateText, { color: theme.colors.text.error }]}>
              {todosError}
            </Text>
          ) : todosLoading ? (
            <View style={homeStyles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : tasks.length === 0 ? (
            <Text style={homeStyles.emptyStateText}>{t('home.empty_tasks')}</Text>
          ) : (
            tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))
          )}
        </View>
      </Animated.ScrollView>
    </View>
  );
}
