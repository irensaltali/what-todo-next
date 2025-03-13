import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  ActivityIndicator,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/data/supabase';
import { router } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Task } from '@/lib/store/models/task';
import { useTaskEntry } from '@/contexts/TaskEntryContext';
import { useTranslation } from 'react-i18next';

// Group tasks by list
const groupTasksByList = (tasks: Task[], t: Function) => {
  const grouped: Record<string, Task[]> = {};
  
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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMoreData, setHasMoreData] = useState(true);
  const { isTaskEntryVisible, showTaskEntry, hideTaskEntry } = useTaskEntry();
  const { t } = useTranslation();
  const ITEMS_PER_PAGE = 15;

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async (pageToFetch = 0) => {
    try {
      if (pageToFetch === 0) setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const start = pageToFetch * ITEMS_PER_PAGE;
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        // Remove the filter for archived column since it doesn't exist
        .order('start_time', { ascending: true })
        .range(start, start + ITEMS_PER_PAGE - 1);

      if (error) throw error;
      
      if (pageToFetch === 0) {
        setTasks(data || []);
      } else {
        setTasks(prev => [...prev, ...(data || [])]);
      }
      
      setHasMoreData((data?.length || 0) === ITEMS_PER_PAGE);
      setPage(pageToFetch);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
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
      const status = isDone ? 'completed' : 'ongoing';
      const { error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', taskId);
        
      if (error) throw error;
      
      // Update local state
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status } : task
      ));
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
        
      if (error) throw error;
      
      // Remove task from local state
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const archiveTask = async (taskId: string) => {
    try {
      // Instead of using an "archived" field, mark the task as "canceled"
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'canceled' })
        .eq('id', taskId);
        
      if (error) throw error;
      
      // Update local state
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error archiving task:', error);
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
        <View style={styles.rightActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.archiveButton]}
            onPress={() => archiveTask(task.id)}
          >
            <Ionicons name="archive-outline" size={20} color="#fff" />
            <Text style={styles.actionText}>{t('task_list.archive')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => deleteTask(task.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
            <Text style={styles.actionText}>{t('task_list.delete')}</Text>
          </TouchableOpacity>
        </View>
      );
    };
    
    return (
      <GestureHandlerRootView style={styles.swipeContainer}>
        <Swipeable renderRightActions={renderRightActions}>
          <View style={styles.taskItem}>
            {/* Create a larger touch target around checkbox */}
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={handleCheckboxToggle}
              hitSlop={{left: 10, right: 10 }}
            >
              <View style={[styles.checkbox, isDone && styles.checkboxChecked]}>
                {isDone && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
            </TouchableOpacity>
            
            {/* Make the task title area a separate touchable */}
            <TouchableOpacity 
              style={styles.taskContentContainer}
              onPress={() => router.push(`/(task-details)/${task.id}`)}
            >
              <Animated.View style={{ flex: 1, opacity }}>
                <View style={styles.taskTitleContainer}>
                  <Animated.Text 
                    style={[
                      styles.taskTitle,
                      {
                        textDecorationLine: isDone ? 'line-through' : 'none',
                        textDecorationColor: '#8E8E93',
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
    <View style={styles.listHeader}>
      <Text style={styles.listTitle}>{title}</Text>
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
          <View style={styles.section}>
            <ListHeader title={listName} />
            {listTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </View>
        )}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={loadMoreTasks}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          hasMoreData ? (
            <ActivityIndicator style={styles.loader} size="small" color="#FF9F1C" />
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    );
  };

  // Handle task added event
  const handleTaskAdded = () => {
    hideTaskEntry();
    handleRefresh();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('task_list.title')}</Text>
        <Pressable style={styles.refreshButton} onPress={handleRefresh}>
          <Ionicons name="refresh" size={24} color="#1C1C1E" />
        </Pressable>
      </View>

      {loading && tasks.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF9F1C" />
        </View>
      ) : tasks.length > 0 ? (
        renderTaskList()
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="list" size={48} color="#8E8E93" />
          <Text style={styles.emptyStateText}>{t('task_list.no_tasks')}</Text>
        </View>
      )}
      
      {/* Remove the FAB button since we're using the tab button */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  refreshButton: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 16,
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(242, 242, 247, 0.8)',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  swipeContainer: {
    backgroundColor: '#F2F2F7',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderBottomColor: '#F2F2F7',
    borderBottomWidth: 2,
  },
  checkboxContainer: {
    paddingRight: 8,
  },
  taskContentContainer: {
    flex: 1,
    paddingVertical: 8,
    marginLeft: 4,
  },
  taskTitleContainer: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8E8E93',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 0, // Remove left margin as it's now on the left side
  },
  checkboxChecked: {
    backgroundColor: '#8E8E93',  // Changed from #52C1C4 to #8E8E93 to match completed task text color
    borderColor: '#8E8E93',      // Changed to match the background
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 120,
  },
  actionButton: {
    width: 60,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  archiveButton: {
    backgroundColor: '#FFC247',
  },
  deleteButton: {
    backgroundColor: '#FF3B30', // More intense red color
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  loader: {
    padding: 16,
  },
});
