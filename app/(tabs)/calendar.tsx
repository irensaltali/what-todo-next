import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';
import { format } from 'date-fns';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'ongoing' | 'inprocess' | 'canceled' | 'completed';
  progress: number;
  start_time: string;
  tags: string[];
}

const STATUS_COLORS = {
  ongoing: '#5593F1',
  inprocess: '#FFC247',
  canceled: '#F26E56',
  completed: '#52C1C4',
};

const STATUS_LABELS = {
  ongoing: 'Ongoing',
  inprocess: 'In Process',
  canceled: 'Canceled',
  completed: 'Completed',
};

export default function TasksScreen() {
  const insets = useSafeAreaInsets();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Task['status'] | 'all'>('all');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = filter === 'all' 
    ? tasks 
    : tasks.filter(task => task.status === filter);

  const TaskCard = ({ task }: { task: Task }) => (
    <Pressable
      style={styles.taskCard}
      onPress={() => router.push(`/(task-details)/${task.id}`)}
    >
      <View style={styles.taskHeader}>
        <View style={styles.taskTitleContainer}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[task.status] }]}>
            <Text style={styles.statusText}>{STATUS_LABELS[task.status]}</Text>
          </View>
        </View>
        <AnimatedCircularProgress
          size={40}
          width={4}
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

      {task.description && (
        <Text style={styles.taskDescription} numberOfLines={2}>
          {task.description}
        </Text>
      )}

      <View style={styles.taskFooter}>
        <View style={styles.taskDate}>
          <Ionicons name="calendar-outline" size={16} color="#8E8E93" />
          <Text style={styles.dateText}>
            {format(new Date(task.start_time), 'MMM d, yyyy')}
          </Text>
        </View>
        {task.tags && task.tags.length > 0 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.tagsContainer}
          >
            {task.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
        <Pressable style={styles.refreshButton} onPress={fetchTasks}>
          <Ionicons name="refresh" size={24} color="#1C1C1E" />
        </Pressable>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filters}
      >
        <Pressable
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </Pressable>
        {Object.keys(STATUS_LABELS).map((status) => (
          <Pressable
            key={status}
            style={[
              styles.filterButton,
              filter === status && styles.filterButtonActive,
              { backgroundColor: filter === status ? STATUS_COLORS[status as Task['status']] : undefined }
            ]}
            onPress={() => setFilter(status as Task['status'])}
          >
            <Text style={[styles.filterText, filter === status && styles.filterTextActive]}>
              {STATUS_LABELS[status as Task['status']]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF9F1C" />
        </View>
      ) : (
        <ScrollView
          style={styles.tasksList}
          contentContainerStyle={styles.tasksContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="list" size={48} color="#8E8E93" />
              <Text style={styles.emptyStateText}>
                {filter === 'all' 
                  ? 'No tasks found' 
                  : `No ${STATUS_LABELS[filter].toLowerCase()} tasks`}
              </Text>
            </View>
          )}
        </ScrollView>
      )}
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
  filtersContainer: {
    maxHeight: 44,
    marginBottom: 16,
  },
  filters: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButtonActive: {
    backgroundColor: '#FF9F1C',
  },
  filterText: {
    fontSize: 14,
    color: '#1C1C1E',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tasksList: {
    flex: 1,
  },
  tasksContent: {
    padding: 16,
    gap: 16,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskTitleContainer: {
    flex: 1,
    marginRight: 16,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  progressText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  taskDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
  },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  tagsContainer: {
    flex: 1,
    marginLeft: 12,
  },
  tag: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#8E8E93',
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
});