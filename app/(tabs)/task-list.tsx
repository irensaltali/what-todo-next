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
import { useTaskStore, Task, TaskStatus } from '../../store/taskStore';
import { TaskList } from '../../components/TaskList';
import { layoutStyles } from '../../lib/styles/layout';
import { taskListStyles } from '../../lib/styles/task-list';

interface Tab {
  id: string;
  name: string;
  icon: string;
}

export default function TasksScreen() {
  const { t } = useTranslation();
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
          loadedTasks = await taskStore.filterTasks({ date: today });
          break;
        case 'all':
          loadedTasks = await taskStore.filterTasks({ status: 'ongoing' });
          break;
        case 'completed':
          loadedTasks = await taskStore.filterTasks({ status: 'completed' });
          break;
        case 'tomorrow':
          loadedTasks = await taskStore.filterTasks({ date: tomorrow });
          break;
        case 'week':
          loadedTasks = await taskStore.filterTasks({ weekOf: today });
          break;
        default:
          // If it's a list ID, fetch tasks for that list
          loadedTasks = await taskStore.filterTasks({ listId: selectedTab });
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
        <View style={taskListStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      );
    }

    if (tasks.length === 0) {
      return (
        <View style={taskListStyles.emptyListContainer}>
          <Text style={[
            taskListStyles.emptyStateText]}>
            {t('task_list.no_tasks', 'There is no task')}
          </Text>
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
    <SafeAreaView style={[taskListStyles.container, { backgroundColor: '#FFFFFF' }]}>
      <View style={taskListStyles.header}>
        <Text style={[taskListStyles.title, { color: '#000000' }]}>
          {t('task_list.title')}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={taskListStyles.tabsContainer}
        contentContainerStyle={taskListStyles.tabsContent}
      >
        {defaultTabs.map((tab) => (
          <Pressable
            key={tab.id}
            style={[
              taskListStyles.tab,
              selectedTab === tab.id && { backgroundColor: '#007AFF' },
            ]}
            onPress={() => setSelectedTab(tab.id)}
          >
            <Ionicons
              name={tab.icon as any}
              size={24}
              color={selectedTab === tab.id ? '#FFFFFF' : '#000000'}
            />
            <Text
              style={[
                taskListStyles.tabText,
                selectedTab === tab.id && { color: '#FFFFFF' },
              ]}
            >
              {tab.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={taskListStyles.content}>
        {renderTabContent()}
      </View>
    </SafeAreaView>
  );
}
