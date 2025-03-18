import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../lib/styles/useTheme';
import { useTaskStore, Task, TaskStatus } from '../../store/taskStore';
import { TaskList } from '../../components/TaskList';
import { layoutStyles } from '../../lib/styles/layout';
import { browseStyles } from '../../lib/styles/browse';

interface Tab {
  id: string;
  name: string;
  icon: string;
}

export default function BrowseScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const taskStore = useTaskStore();
  const [selectedTab, setSelectedTab] = useState('today');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const defaultTabs: Tab[] = [
    { id: 'today', name: t('browse.tabs.today'), icon: 'today-outline' },
    { id: 'all', name: t('browse.tabs.all'), icon: 'list-outline' },
    { id: 'completed', name: t('browse.tabs.completed'), icon: 'checkmark-circle-outline' },
    { id: 'tomorrow', name: t('browse.tabs.tomorrow'), icon: 'calendar-outline' },
    { id: 'week', name: t('browse.tabs.week'), icon: 'calendar-number-outline' },
  ];

  useEffect(() => {
    loadTasks();
  }, [selectedTab]);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      let loadedTasks: Task[] = [];
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      switch (selectedTab) {
        case 'today':
          loadedTasks = await taskStore.getTasksByDate(today);
          break;
        case 'all':
          await taskStore.fetchTasks();
          loadedTasks = taskStore.tasks;
          break;
        case 'completed':
          loadedTasks = await taskStore.getCompletedTasks();
          break;
        case 'tomorrow':
          loadedTasks = await taskStore.getTasksByDate(tomorrow);
          break;
        case 'week':
          loadedTasks = await taskStore.getTasksByWeek(today);
          break;
        default:
          // If it's a list ID, fetch tasks for that list
          loadedTasks = await taskStore.getTasksByList(selectedTab);
      }
      setTasks(loadedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderTabContent = () => {
    if (isLoading) {
      return (
        <View style={browseStyles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }

    return (
      <TaskList
        tasks={tasks}
        onTaskPress={(task: Task) => {
          // Handle task press
        }}
        onTaskStatusChange={(taskId: string, status: TaskStatus) => {
          taskStore.toggleTaskStatus(taskId, status);
        }}
      />
    );
  };

  return (
    <SafeAreaView style={[browseStyles.container, { backgroundColor: theme.colors.background.primary }]}>
      <View style={browseStyles.header}>
        <Text style={[browseStyles.title, { color: theme.colors.text.primary }]}>
          {t('browse.title')}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={browseStyles.tabsContainer}
        contentContainerStyle={browseStyles.tabsContent}
      >
        {defaultTabs.map((tab) => (
          <Pressable
            key={tab.id}
            style={[
              browseStyles.tab,
              selectedTab === tab.id && { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => setSelectedTab(tab.id)}
          >
            <Ionicons
              name={tab.icon as any}
              size={24}
              color={selectedTab === tab.id ? '#FFFFFF' : theme.colors.text.primary}
            />
            <Text
              style={[
                browseStyles.tabText,
                selectedTab === tab.id && { color: '#FFFFFF' },
              ]}
            >
              {tab.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={browseStyles.content}>
        {renderTabContent()}
      </View>
    </SafeAreaView>
  );
} 
