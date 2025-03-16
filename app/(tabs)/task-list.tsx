import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  ActivityIndicator,
  Animated,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/data/supabase';
import { router } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Task as AppTask } from '@/lib/store/models/task';
import { useTaskEntry } from '@/contexts/TaskEntryContext';
import { useTranslation } from 'react-i18next';
import { getUserTasks, updateTask, hardDeleteTask } from '../../data/taskService';
import type { Task as ServiceTask } from '../../data/taskService';
import { taskListStyles } from '@/lib/styles/task-list';
import { useTheme } from '@/lib/styles/useTheme';

// Group tasks by list
const groupTasksByList = (tasks: AppTask[], t: Function) => {
  const grouped: Record<string, AppTask[]> = {};
  
  tasks.forEach(task => {
    const listName = task.list || t('task_list.uncategorized');
    if (!grouped[listName]) {
      grouped[listName] = [];
    }
    grouped[listName].push(task);
  });
  
  return grouped;
};

export default function TasksScreen() {
  const insets = useSafeAreaInsets();
  const [tasks, setTasks] = useState<AppTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMoreData, setHasMoreData] = useState(true);
  const { 
    isTaskEntryVisible, 
    showTaskEntry, 
    hideTaskEntry, 
    taskVersion, 
    onTaskUpdated, 
    onTaskDeleted 
  } = useTaskEntry();
  const { t } = useTranslation();
  const theme = useTheme();
  const ITEMS_PER_PAGE = 15;

  // Initial data load
  useEffect(() => {
    fetchTasks();
  }, []);

  // Auto-refresh when taskVersion changes (tasks added/updated/deleted)
  useEffect(() => {
    if (taskVersion > 0) { // Skip the initial render
      fetchTasks();
    }
  }, [taskVersion]);

  const fetchTasks = async (pageToFetch = 0) => {
    try {
      // If it's the first page, we're either doing an initial load or a refresh
      if (pageToFetch === 0) {
        if (!tasks.length) {
          // Only set loading to true for initial load when there are no tasks yet
          setLoading(true);
        } else {
          // For refreshes on existing data, use the refreshing indicator
          setRefreshing(true);
        }
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const { data, error } = await getUserTasks(user.id);

      if (error) throw error;
      
      const formattedTasks = data ? data.map((serviceTask: ServiceTask) => ({
        id: serviceTask.id,
        user_id: serviceTask.user_id,
        title: serviceTask.title,
        description: serviceTask.description || '',
        type: 'task',
        list: '',
        task_count: 0,
        progress: 0,
        status: serviceTask.status,
        priority: serviceTask.priority || 0,
        start_time: serviceTask.deadline || new Date().toISOString(),
        difficulty: serviceTask.difficulty || undefined,
        tags: [],
        alert_enabled: false,
        created_at: serviceTask.created_at,
        updated_at: serviceTask.updated_at
      } as AppTask)) : [];
      
      if (pageToFetch === 0) {
        setTasks(formattedTasks);
      } else {
        setTasks(prev => [...prev, ...formattedTasks]);
      }
      
      setHasMoreData((data?.length || 0) === ITEMS_PER_PAGE);
      setPage(pageToFetch);
      
      // Set loading and refreshing to false after successful fetch
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
      setRefreshing(false);
      Alert.alert('Error', 'Failed to load tasks');
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTasks(0);
  };

  const loadMoreTasks = () => {
    if (!loading && hasMoreData) {
      fetchTasks(page + 1);
    }
  };

  const markTaskAsDone = async (taskId: string, isDone: boolean) => {
    try {
      const newStatus = isDone ? 'completed' as const : 'ongoing' as const;
      
      // Update local state immediately for better UX
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
      
      // Notify other components that a task was updated
      onTaskUpdated();
      
      // Perform the backend update
      const { error } = await updateTask(taskId, { 
        status: newStatus
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error updating task status:', error);
      Alert.alert('Error', 'Failed to update task');
      
      // Refresh the tasks list to get the correct state
      fetchTasks();
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      // Update local state immediately for better UX
      setTasks(prev => prev.filter(task => task.id !== taskId));
      
      // Notify other components that a task was deleted
      onTaskDeleted();
      
      // Perform the backend update
      const { error } = await hardDeleteTask(taskId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting task:', error);
      Alert.alert('Error', 'Failed to delete task');
      
      // Refresh the tasks list to get the correct state
      fetchTasks();
    }
  };

  const archiveTask = async (taskId: string) => {
    try {
      // Update local state immediately for better UX
      setTasks(prev => prev.filter(task => task.id !== taskId));
      
      // Notify other components that a task was updated
      onTaskUpdated();
      
      // Perform the backend update
      const { error } = await updateTask(taskId, { 
        status: 'canceled' as const,
        is_deleted: true
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error archiving task:', error);
      Alert.alert('Error', 'Failed to archive task');
      
      // Refresh the tasks list to get the correct state
      fetchTasks();
    }
  };

  const TaskItem = ({ task }: { task: AppTask }) => {
    const isDone = task.status === 'completed';
    const opacity = useRef(new Animated.Value(isDone ? 0.5 : 1)).current;
    const strikeWidth = useRef(new Animated.Value(isDone ? 1 : 0)).current;
    
    const handleCheckboxToggle = () => {
      const newIsDone = !isDone;
      
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: newIsDone ? 0.5 : 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(strikeWidth, {
          toValue: newIsDone ? 1 : 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
      
      markTaskAsDone(task.id, newIsDone);
    };
    
    const renderRightActions = () => {
      return (
        <View style={taskListStyles.rightActions}>
          <TouchableOpacity
            style={[taskListStyles.actionButton, taskListStyles.archiveButton]}
            onPress={() => archiveTask(task.id)}
          >
            <Ionicons name="archive-outline" size={20} color="#fff" />
            <Text style={taskListStyles.actionText}>{t('task_list.archive')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[taskListStyles.actionButton, taskListStyles.deleteButton]}
            onPress={() => deleteTask(task.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
            <Text style={taskListStyles.actionText}>{t('task_list.delete')}</Text>
          </TouchableOpacity>
        </View>
      );
    };
    
    return (
      <GestureHandlerRootView style={taskListStyles.swipeContainer}>
        <Swipeable renderRightActions={renderRightActions}>
          <View style={taskListStyles.taskItem}>
            {/* Create a larger touch target around checkbox */}
            <TouchableOpacity
              style={taskListStyles.checkboxContainer}
              onPress={handleCheckboxToggle}
              hitSlop={{left: 10, right: 10 }}
            >
              <View style={[taskListStyles.checkbox, isDone && taskListStyles.checkboxChecked]}>
                {isDone && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
            </TouchableOpacity>
            
            {/* Make the task title area a separate touchable */}
            <TouchableOpacity 
              style={taskListStyles.taskContentContainer}
              onPress={() => router.push(`/(task-details)/${task.id}?source=task-list`)}
            >
              <Animated.View style={{ flex: 1, opacity }}>
                <View style={taskListStyles.taskTitleContainer}>
                  <Animated.Text 
                    style={[
                      taskListStyles.taskTitle,
                      {
                        textDecorationLine: isDone ? 'line-through' : 'none',
                        textDecorationColor: theme.colors.text.placeholder,
                      }
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {task.title}
                  </Animated.Text>
                </View>
              </Animated.View>
            </TouchableOpacity>
          </View>
        </Swipeable>
      </GestureHandlerRootView>
    );
  };

  const ListHeader = ({ title }: { title: string }) => (
    <View style={taskListStyles.listHeader}>
      <Text style={taskListStyles.listTitle}>{title}</Text>
    </View>
  );

  const renderTaskList = () => {
    const groupedTasks = groupTasksByList(tasks, t);
    const sections = Object.entries(groupedTasks);

    return (
      <FlatList
        data={sections}
        keyExtractor={([listName]) => listName}
        renderItem={({ item: [listName, listTasks] }) => (
          <View style={taskListStyles.section}>
            <ListHeader title={listName} />
            {listTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || loading}
            onRefresh={handleRefresh}
            colors={['#FF9F1C']}
            tintColor="#FF9F1C"
            title={t('task_list.refreshing')}
            titleColor="#8E8E93"
          />
        }
        onEndReached={loadMoreTasks}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          hasMoreData ? (
            <ActivityIndicator style={taskListStyles.loader} size="small" color="#FF9F1C" />
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <View style={[taskListStyles.container, { paddingTop: insets.top }]}>
      <View style={taskListStyles.header}>
        <Text style={taskListStyles.title}>{t('task_list.title')}</Text>
      </View>

      {tasks.length > 0 ? (
        renderTaskList()
      ) : (
        <ScrollView
          contentContainerStyle={taskListStyles.emptyListContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || loading}
              onRefresh={handleRefresh}
              colors={['#FF9F1C']}
              tintColor="#FF9F1C"
              title={t('task_list.refreshing')}
              titleColor="#8E8E93"
            />
          }
        >
          <View style={taskListStyles.emptyState}>
            <Ionicons name="list" size={48} color={theme.colors.text.placeholder} />
            <Text style={taskListStyles.emptyStateText}>{t('task_list.no_tasks')}</Text>
            <Text style={taskListStyles.emptyStateHint}>{t('task_list.pull_to_refresh')}</Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
