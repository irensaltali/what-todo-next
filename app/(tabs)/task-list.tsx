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
import { router } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { useTaskStore, Task } from '@/store/taskStore';
import { useTaskEntry } from '@/contexts/TaskEntryContext';
import { useTranslation } from 'react-i18next';
import { taskListStyles } from '@/lib/styles/task-list';
import { useTheme } from '@/lib/styles/useTheme';

// Group tasks by list
const groupTasksByList = (tasks: Task[], t: Function) => {
  const grouped: Record<string, Task[]> = {};
  
  tasks.forEach(task => {
    const listName = t('task_list.uncategorized');
    if (!grouped[listName]) {
      grouped[listName] = [];
    }
    grouped[listName].push(task);
  });
  
  return grouped;
};

export default function TasksScreen() {
  const insets = useSafeAreaInsets();
  const { tasks, isLoading, error, fetchTasks, toggleTaskStatus, deleteTask, updateTask } = useTaskStore();
  const [refreshing, setRefreshing] = useState(false);
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

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  };

  const markTaskAsDone = async (taskId: string, isDone: boolean) => {
    try {
      const newStatus = isDone ? 'completed' as const : 'ongoing' as const;
      await toggleTaskStatus(taskId, newStatus);
    } catch (error) {
      console.error('Error updating task status:', error);
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
      Alert.alert('Error', 'Failed to delete task');
    }
  };

  const handleArchiveTask = async (taskId: string) => {
    try {
      await updateTask(taskId, { 
        status: 'cancelled' as const,
        is_deleted: true
      });
    } catch (error) {
      console.error('Error archiving task:', error);
      Alert.alert('Error', 'Failed to archive task');
    }
  };

  const TaskItem = ({ task }: { task: Task }) => {
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
            onPress={() => handleArchiveTask(task.id)}
          >
            <Ionicons name="archive-outline" size={20} color="#fff" />
            <Text style={taskListStyles.actionText}>{t('task_list.archive')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[taskListStyles.actionButton, taskListStyles.deleteButton]}
            onPress={() => handleDeleteTask(task.id)}
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
            <TouchableOpacity
              style={taskListStyles.checkboxContainer}
              onPress={handleCheckboxToggle}
              hitSlop={{left: 10, right: 10 }}
            >
              <View style={[taskListStyles.checkbox, isDone && taskListStyles.checkboxChecked]}>
                {isDone && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
            </TouchableOpacity>
            
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
            refreshing={refreshing || isLoading}
            onRefresh={handleRefresh}
            colors={['#FF9F1C']}
            tintColor="#FF9F1C"
            title={t('task_list.refreshing')}
            titleColor="#8E8E93"
          />
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
              refreshing={refreshing || isLoading}
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
