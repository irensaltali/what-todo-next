import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, TextInput, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/data/supabase';
import { format, isAfter, startOfDay, differenceInDays, addDays, formatDistance } from 'date-fns';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { DatePicker } from '@/components/DatePicker';
import { StatusBar } from '@/components/StatusBar';
import { Task } from '@/lib/store/models/task';
import { calculatePriorityScore } from '@/lib/utils/priority';
import { useTaskEntry } from '@/contexts/TaskEntryContext';
import { getUserTasks, updateTask, hardDeleteTask } from '@/data/taskService';
import { LinearGradient } from 'expo-linear-gradient';
import type { Task as ServiceTask } from '@/data/taskService';

interface EditableFields {
  title: boolean;
  description: boolean;
  type: boolean;
  tags: boolean;
  progress: boolean;
  start_time: boolean;
  deadline: boolean;
  value_impact: boolean;
  difficulty: boolean;
}

const STATUS_COLORS = {
  ongoing: '#007AFF',
  inprogress: '#FF9F1C',
  canceled: '#FF3B30',
  completed: '#34C759',
};

const STATUS_LABELS = {
  ongoing: 'Ongoing',
  inprogress: 'In Process',
  canceled: 'Canceled',
  completed: 'Completed',
};

const STATUSES = Object.keys(STATUS_LABELS) as Task['status'][];

// Extended Task interface that includes ServiceTask properties
interface ExtendedTask extends Task {
  deadline?: string | null;
  priority?: number;
}

export default function TaskDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { id, source } = useLocalSearchParams();
  const [task, setTask] = useState<ExtendedTask | null>(null);
  const [editedTask, setEditedTask] = useState<Partial<ExtendedTask>>({});
  const [editableFields, setEditableFields] = useState<EditableFields>({
    title: false,
    description: false,
    type: false,
    tags: false,
    progress: false,
    start_time: false,
    deadline: false,
    value_impact: false,
    difficulty: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { taskVersion, onTaskUpdated, onTaskDeleted } = useTaskEntry();
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Track where the user navigated from
  const navigatedFrom = source || 'unknown';

  useEffect(() => {
    fetchTask();
  }, [id, taskVersion]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Use the taskService function to get the task
      const { data, error } = await getUserTasks(user.id);

      if (error) throw error;
      if (!data || !data.length) throw new Error('Task not found');
      
      // Find the specific task by ID
      const taskData = data.find((task: ServiceTask) => task.id === id);
      if (!taskData) throw new Error('Task not found');

      setTask(taskData as unknown as ExtendedTask);
      setEditedTask(taskData as unknown as Partial<ExtendedTask>);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculatePriority = (taskData: Partial<ExtendedTask>) => {
    // Use task data or edited task data
    const valueImpact = taskData.value_impact ?? task?.value_impact ?? 50;
    const difficulty = taskData.difficulty ?? task?.difficulty ?? 5;
    const deadlineDate = taskData.deadlineHours ? new Date(taskData.deadlineHours) : 
                       (task?.deadlineHours ? new Date(task.deadlineHours) : addDays(new Date(), 7));
    
    // Calculate deadline score (higher for closer deadlines)
    const today = startOfDay(new Date());
    const daysUntilDeadline = Math.max(0, differenceInDays(deadlineDate, today));
    const maxDays = 365;
    const deadlineScore = 100 - Math.min(100, (daysUntilDeadline / maxDays) * 100);
    
    // Value impact is already on a 1-100 scale
    const valueScore = valueImpact;
    
    // Convert difficulty (1-10) to a 1-100 scale
    const difficultyScore = (difficulty / 10) * 100;
    
    // Calculate priority score (weighted average)
    const priorityScore = (deadlineScore * 0.4) + (valueScore * 0.4) + ((100 - difficultyScore) * 0.2);
    
    return Math.round(priorityScore);
  };

  const validateField = (field: keyof ExtendedTask, value: any): string | null => {
    switch (field) {
      case 'title':
        if (!value?.trim()) return 'Title is required';
        if (value.length > 100) return 'Title must be less than 100 characters';
        break;
      case 'description':
        if (value?.length > 500) return 'Description must be less than 500 characters';
        break;
      case 'progress':
        const progress = Number(value);
        if (isNaN(progress) || progress < 0 || progress > 100) {
          return 'Progress must be between 0 and 100';
        }
        break;
      case 'start_time':
        const date = new Date(value);
        if (isNaN(date.getTime())) return 'Invalid date';
        if (isAfter(startOfDay(new Date()), startOfDay(date))) {
          return 'Date cannot be in the past';
        }
        break;
      case 'deadlineHours':
        const deadlineHours = Number(value);
        if (isNaN(deadlineHours) || deadlineHours < 0) {
          return 'Deadline must be a positive number';
        }
        break;
      case 'value_impact':
        const impact = Number(value);
        if (isNaN(impact) || impact < 1 || impact > 100) {
          return 'Value impact must be between 1 and 100';
        }
        break;
      case 'difficulty':
        const difficulty = Number(value);
        if (isNaN(difficulty) || difficulty < 1 || difficulty > 10) {
          return 'Difficulty must be between 1 and 10';
        }
        break;
    }
    return null;
  };

  const handleEdit = (field: keyof EditableFields) => {
    setEditableFields(prev => ({ ...prev, [field]: true }));
  };

  const handleChange = (field: keyof ExtendedTask, value: any) => {
    setEditedTask(prev => ({ ...prev, [field]: value }));
  };

  const handleCancel = (field: keyof EditableFields) => {
    setEditableFields(prev => ({ ...prev, [field]: false }));
    if (task) {
      setEditedTask(prev => ({ ...prev, [field]: task[field as keyof ExtendedTask] }));
    }
  };

  const handleSave = async (field: keyof EditableFields) => {
    if (!task || !editedTask) return;

    const validationError = validateField(field as keyof ExtendedTask, editedTask[field as keyof ExtendedTask]);
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // If we're updating a priority-related field, recalculate the priority score
      let updates: any = { [field]: editedTask[field as keyof ExtendedTask] };
      
      if (field === 'deadline' || field === 'value_impact' || field === 'difficulty') {
        updates.priority_score = calculatePriority(editedTask);
      }

      // Use the taskService updateTask function
      const { error: updateError } = await updateTask(task.id, updates);

      if (updateError) throw updateError;

      setTask(prev => prev ? { ...prev, ...updates } : null);
      setEditableFields(prev => ({ ...prev, [field]: false }));
      
      // Notify other components about the update
      onTaskUpdated();
    } catch (err: any) {
      setError('Failed to update task: ' + err.message);
      Alert.alert('Error', 'Failed to update task. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: ExtendedTask['status']) => {
    if (!task) return;

    try {
      setSaving(true);
      setError(null);

      // Use the taskService updateTask function
      const { error: updateError } = await updateTask(task.id, { status: newStatus });

      if (updateError) throw updateError;

      setTask(prev => prev ? { ...prev, status: newStatus } : null);
      setEditedTask(prev => ({ ...prev, status: newStatus }));
      
      // Notify other components about the update
      onTaskUpdated();
    } catch (err: any) {
      setError('Failed to update status: ' + err.message);
      Alert.alert('Error', 'Failed to update status. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!task) return;
    
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000); // Reset after 3 seconds
      return;
    }
    
    try {
      setSaving(true);
      
      // Use the taskService deleteTask function
      const { error } = await hardDeleteTask(task.id);
      
      if (error) throw error;
      
      // Notify other components that a task was deleted
      onTaskDeleted();
      
      // Navigate back after deletion
      router.back();
    } catch (err: any) {
      setError('Failed to delete task: ' + err.message);
      Alert.alert('Error', 'Failed to delete task. Please try again.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#FF9F1C" />
      </View>
    );
  }

  if (error || !task) {
    return (
      <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>{error || 'Task not found'}</Text>
        <Pressable
          style={styles.button}
          onPress={() => router.back()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const isCompleted = task.status === 'completed';
  const isPastDue = task.deadline && new Date(task.deadline) < new Date();

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#1C1C1E" />
        </Pressable>
        <Text style={styles.headerTitle}>Task Details</Text>
        <Pressable
          style={styles.deleteButton}
          onPress={handleDeleteTask}>
          <Ionicons 
            name={confirmDelete ? "trash" : "trash-outline"} 
            size={20} 
            color={confirmDelete ? "#FF3B30" : "#8E8E93"} 
          />
        </Pressable>
      </View>

      <View style={styles.mainContent}>
        <View style={styles.titleSection}>
          {editableFields.title ? (
            <View style={styles.editTitleContainer}>
              <TextInput
                style={styles.titleInput}
                value={editedTask.title || ''}
                onChangeText={(value) => handleChange('title', value)}
                autoFocus
                maxLength={100}
                onBlur={() => handleCancel('title')}
              />
              <View style={styles.editButtonsRow}>
                <Pressable
                  style={[styles.editButton, styles.cancelButton]}
                  onPress={() => handleCancel('title')}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.editButton, styles.saveButton]}
                  onPress={() => handleSave('title')}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable onPress={() => handleEdit('title')} style={styles.titleContainer}>
              <Text style={styles.title}>{task.title}</Text>
              <Ionicons name="pencil-outline" size={18} color="#8E8E93" />
            </Pressable>
          )}

          <View style={styles.statusSection}>
            <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[task.status] }]}>
              <Text style={styles.statusText}>{STATUS_LABELS[task.status]}</Text>
            </View>
            <Pressable
              style={styles.statusButton}
              onPress={() => {
                Alert.alert(
                  'Update Status',
                  'Select new status:',
                  STATUSES.map(status => ({
                    text: STATUS_LABELS[status],
                    onPress: () => handleStatusChange(status),
                    style: status === task.status ? 'cancel' : 'default',
                  })),
                  { cancelable: true }
                );
              }}
            >
              <Ionicons name="chevron-down" size={20} color="#8E8E93" />
            </Pressable>
          </View>
        </View>

        {isPastDue && task.status !== 'completed' && (
          <View style={styles.pastDueAlert}>
            <Ionicons name="alert-circle" size={20} color="#fff" />
            <Text style={styles.pastDueText}>This task is past due</Text>
          </View>
        )}

        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Description</Text>
          {editableFields.description ? (
            <View style={styles.editDescriptionContainer}>
              <TextInput
                style={styles.descriptionInput}
                value={editedTask.description || ''}
                onChangeText={(value) => handleChange('description', value)}
                multiline
                maxLength={500}
                autoFocus
                onBlur={() => handleCancel('description')}
              />
              <View style={styles.editButtonsRow}>
                <Pressable
                  style={[styles.editButton, styles.cancelButton]}
                  onPress={() => handleCancel('description')}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.editButton, styles.saveButton]}
                  onPress={() => handleSave('description')}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable onPress={() => handleEdit('description')} style={styles.descriptionContainer}>
              <Text style={styles.description}>{task.description || 'No description provided'}</Text>
              <Ionicons name="pencil-outline" size={18} color="#8E8E93" />
            </Pressable>
          )}
        </View>

        <View style={styles.metadataSection}>
          <Text style={styles.sectionTitle}>Details</Text>

          <View style={styles.infoCard}>
            {task.deadline && (
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={20} color="#8E8E93" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Deadline</Text>
                  <Text style={[
                    styles.infoValue, 
                    isPastDue && !isCompleted ? styles.pastDueValue : null
                  ]}>
                    {format(new Date(task.deadline), 'MMM d, yyyy')}
                    {isPastDue && !isCompleted && ' (Overdue)'}
                  </Text>
                  {task.deadline && (
                    <Text style={styles.infoSubtext}>
                      {isPastDue 
                        ? `${formatDistance(new Date(task.deadline), new Date())} ago`
                        : `${formatDistance(new Date(), new Date(task.deadline))} left`
                      }
                    </Text>
                  )}
                </View>
              </View>
            )}

            <View style={styles.infoRow}>
              <Ionicons name="flag-outline" size={20} color="#8E8E93" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Priority</Text>
                <Text style={styles.infoValue}>
                  {task.priority === 1 ? 'High' : 
                   task.priority === 2 ? 'Medium' : 
                   task.priority === 3 ? 'Low' : 'None'}
                </Text>
              </View>
            </View>

            {calculatePriorityScore(task) !== undefined && (
              <View style={styles.infoRow}>
                <Ionicons name="star-outline" size={20} color="#8E8E93" />
                <View style={styles.priorityContainer}>
                  <Text style={styles.infoText}>
                    Priority Score: {calculatePriorityScore(task)}/100
                  </Text>
                  <View style={styles.priorityBar}>
                    <View 
                      style={[
                        styles.priorityFill, 
                        { width: `${calculatePriorityScore(task)}%` },
                        calculatePriorityScore(task) < 40 ? styles.lowPriority :
                        calculatePriorityScore(task) < 70 ? styles.mediumPriority :
                        styles.highPriority
                      ]} 
                    />
                  </View>
                </View>
              </View>
            )}

            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color="#8E8E93" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Created</Text>
                <Text style={styles.infoValue}>
                  {format(new Date(task.created_at), 'MMM d, yyyy')}
                </Text>
                <Text style={styles.infoSubtext}>
                  {formatDistance(new Date(task.created_at), new Date(), { addSuffix: true })}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[
              styles.actionButton, 
              isCompleted ? styles.disabledButton : styles.completeButton
            ]}
            onPress={() => handleStatusChange('completed')}
            disabled={isCompleted}
          >
            <Ionicons name="checkmark-circle-outline" size={22} color={isCompleted ? "#8E8E93" : "#FFF"} />
            <Text style={[
              styles.actionButtonText, 
              isCompleted ? styles.disabledButtonText : {}
            ]}>
              {isCompleted ? 'Completed' : 'Mark Complete'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={22} color="#FFF" />
            <Text style={styles.actionButtonText}>Share Task</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EBEBEB',
  },
  backButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  mainContent: {
    padding: 16,
  },
  titleSection: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1C1C1E',
    flex: 1,
  },
  editTitleContainer: {
    marginBottom: 8,
  },
  titleInput: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1C1C1E',
    padding: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    marginBottom: 8,
  },
  editButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
  },
  saveButton: {
    backgroundColor: '#FF9F1C',
  },
  cancelButtonText: {
    color: '#8E8E93',
    fontWeight: '500',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statusButton: {
    padding: 4,
  },
  pastDueAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  pastDueText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  descriptionSection: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  descriptionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  description: {
    fontSize: 16,
    color: '#3C3C43',
    lineHeight: 22,
    flex: 1,
  },
  editDescriptionContainer: {
    marginBottom: 8,
  },
  descriptionInput: {
    fontSize: 16,
    color: '#3C3C43',
    padding: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    marginBottom: 8,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  metadataSection: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  infoCard: {
    borderRadius: 8,
    backgroundColor: '#F8F8F8',
    padding: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  pastDueValue: {
    color: '#FF3B30',
  },
  infoSubtext: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  infoText: {
    fontSize: 14,
    color: '#3C3C43',
    flex: 1,
    marginLeft: 12,
    marginBottom: 4,
  },
  priorityContainer: {
    flex: 1,
    marginLeft: 12,
  },
  priorityBar: {
    height: 6,
    backgroundColor: '#E5E5EA',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
  },
  priorityFill: {
    height: '100%',
    borderRadius: 3,
  },
  lowPriority: {
    backgroundColor: '#34C759',
  },
  mediumPriority: {
    backgroundColor: '#FF9F1C',
  },
  highPriority: {
    backgroundColor: '#FF3B30',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 12,
    marginHorizontal: 6,
  },
  completeButton: {
    backgroundColor: '#34C759',
  },
  disabledButton: {
    backgroundColor: '#E5E5EA',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  disabledButtonText: {
    color: '#8E8E93',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#FF9F1C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
