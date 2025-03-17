import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format, isAfter, startOfDay } from 'date-fns';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { DatePicker } from '@/components/DatePicker';
import { useTaskStore, Task, TaskStatus } from '@/store/taskStore';

interface EditableFields {
  title: boolean;
  description: boolean;
  deadline: boolean;
  priority: boolean;
  outcome_value: boolean;
  difficulty: boolean;
}

const STATUS_COLORS = {
  ongoing: '#007AFF',
  inprogress: '#FF9F1C',
  cancelled: '#FF3B30',
  completed: '#34C759',
};

const STATUS_LABELS = {
  ongoing: 'Ongoing',
  inprogress: 'In Process',
  cancelled: 'Cancelled',
  completed: 'Completed',
};

const STATUSES = Object.keys(STATUS_LABELS) as TaskStatus[];

export default function TaskDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const { tasks, isLoading, error, fetchTasks, updateTask } = useTaskStore();
  const [editedTask, setEditedTask] = useState<Partial<Task>>({});
  const [editableFields, setEditableFields] = useState<EditableFields>({
    title: false,
    description: false,
    deadline: false,
    priority: false,
    outcome_value: false,
    difficulty: false,
  });
  const [saving, setSaving] = useState(false);

  const task = tasks.find(t => t.id === id);

  useEffect(() => {
    fetchTasks();
  }, [id]);

  const validateField = (field: keyof Task, value: any): string | null => {
    switch (field) {
      case 'title':
        if (!value?.trim()) return 'Title is required';
        if (value.length > 100) return 'Title must be less than 100 characters';
        break;
      case 'description':
        if (value?.length > 500) return 'Description must be less than 500 characters';
        break;
      case 'priority':
      case 'difficulty':
        const num = Number(value);
        if (isNaN(num) || num < 0 || num > 5) {
          return 'Value must be between 0 and 5';
        }
        break;
      case 'deadline':
        const date = new Date(value);
        if (isNaN(date.getTime())) return 'Invalid date';
        if (isAfter(startOfDay(new Date()), startOfDay(date))) {
          return 'Date cannot be in the past';
        }
        break;
    }
    return null;
  };

  const handleEdit = (field: keyof EditableFields) => {
    setEditableFields(prev => ({ ...prev, [field]: true }));
  };

  const handleChange = (field: keyof Task, value: any) => {
    setEditedTask(prev => ({ ...prev, [field]: value }));
  };

  const handleCancel = (field: keyof EditableFields) => {
    setEditableFields(prev => ({ ...prev, [field]: false }));
    if (task) {
      setEditedTask(prev => ({ ...prev, [field]: task[field] }));
    }
  };

  const handleSave = async (field: keyof EditableFields) => {
    if (!task || !editedTask) return;

    const validationError = validateField(field, editedTask[field]);
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    try {
      setSaving(true);
      await updateTask(task.id, { [field]: editedTask[field] });
      setEditableFields(prev => ({ ...prev, [field]: false }));
    } catch (err: any) {
      Alert.alert('Error', 'Failed to update task. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!task) return;

    try {
      setSaving(true);
      await updateTask(task.id, { status: newStatus });
    } catch (err: any) {
      Alert.alert('Error', 'Failed to update status. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
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
        <View style={styles.backButton} />
      </View>

      <View style={styles.content}>
        <View style={styles.titleSection}>
          {editableFields.title ? (
            <View style={styles.editableField}>
              <TextInput
                style={styles.input}
                value={editedTask.title}
                onChangeText={(value) => handleChange('title', value)}
                placeholder="Task Title"
                maxLength={100}
              />
              <View style={styles.editActions}>
                <Pressable
                  style={[styles.editButton, styles.cancelButton]}
                  onPress={() => handleCancel('title')}
                  disabled={saving}
                >
                  <Ionicons name="close" size={20} color="#FF3B30" />
                </Pressable>
                <Pressable
                  style={[styles.editButton, styles.saveButton]}
                  onPress={() => handleSave('title')}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="checkmark" size={20} color="#fff" />
                  )}
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              style={styles.editableText}
              onPress={() => handleEdit('title')}
            >
              <Text style={styles.title}>{task.title}</Text>
              <Ionicons name="pencil" size={20} color="#8E8E93" />
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

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#8E8E93" />
            {editableFields.deadline ? (
              <View style={styles.editableDate}>
                <DatePicker
                  date={new Date(editedTask.deadline || task.deadline || new Date())}
                  onDateChange={(date) => handleChange('deadline', date.toISOString())}
                />
                <View style={styles.editActions}>
                  <Pressable
                    style={[styles.editButton, styles.cancelButton]}
                    onPress={() => handleCancel('deadline')}
                    disabled={saving}
                  >
                    <Ionicons name="close" size={20} color="#FF3B30" />
                  </Pressable>
                  <Pressable
                    style={[styles.editButton, styles.saveButton]}
                    onPress={() => handleSave('deadline')}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Ionicons name="checkmark" size={20} color="#fff" />
                    )}
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                style={styles.editableText}
                onPress={() => handleEdit('deadline')}
              >
                <Text style={styles.infoText}>
                  {task.deadline ? format(new Date(task.deadline), 'MMMM d, yyyy') : 'Set deadline'}
                </Text>
                <Ionicons name="pencil" size={20} color="#8E8E93" />
              </Pressable>
            )}
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="flag-outline" size={20} color="#8E8E93" />
            {editableFields.priority ? (
              <View style={styles.editableField}>
                <TextInput
                  style={styles.input}
                  value={String(editedTask.priority || '')}
                  onChangeText={(value) => handleChange('priority', Number(value))}
                  placeholder="Priority (0-5)"
                  keyboardType="numeric"
                />
                <View style={styles.editActions}>
                  <Pressable
                    style={[styles.editButton, styles.cancelButton]}
                    onPress={() => handleCancel('priority')}
                    disabled={saving}
                  >
                    <Ionicons name="close" size={20} color="#FF3B30" />
                  </Pressable>
                  <Pressable
                    style={[styles.editButton, styles.saveButton]}
                    onPress={() => handleSave('priority')}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Ionicons name="checkmark" size={20} color="#fff" />
                    )}
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                style={styles.editableText}
                onPress={() => handleEdit('priority')}
              >
                <Text style={styles.infoText}>
                  Priority: {task.priority !== null ? task.priority : 'Not set'}
                </Text>
                <Ionicons name="pencil" size={20} color="#8E8E93" />
              </Pressable>
            )}
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="trending-up-outline" size={20} color="#8E8E93" />
            {editableFields.difficulty ? (
              <View style={styles.editableField}>
                <TextInput
                  style={styles.input}
                  value={String(editedTask.difficulty || '')}
                  onChangeText={(value) => handleChange('difficulty', Number(value))}
                  placeholder="Difficulty (0-5)"
                  keyboardType="numeric"
                />
                <View style={styles.editActions}>
                  <Pressable
                    style={[styles.editButton, styles.cancelButton]}
                    onPress={() => handleCancel('difficulty')}
                    disabled={saving}
                  >
                    <Ionicons name="close" size={20} color="#FF3B30" />
                  </Pressable>
                  <Pressable
                    style={[styles.editButton, styles.saveButton]}
                    onPress={() => handleSave('difficulty')}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Ionicons name="checkmark" size={20} color="#fff" />
                    )}
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                style={styles.editableText}
                onPress={() => handleEdit('difficulty')}
              >
                <Text style={styles.infoText}>
                  Difficulty: {task.difficulty !== null ? task.difficulty : 'Not set'}
                </Text>
                <Ionicons name="pencil" size={20} color="#8E8E93" />
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Description</Text>
          {editableFields.description ? (
            <View style={styles.editableField}>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editedTask.description || ''}
                onChangeText={(value) => handleChange('description', value)}
                placeholder="Add description"
                multiline
                numberOfLines={4}
                maxLength={500}
              />
              <View style={styles.editActions}>
                <Pressable
                  style={[styles.editButton, styles.cancelButton]}
                  onPress={() => handleCancel('description')}
                  disabled={saving}
                >
                  <Ionicons name="close" size={20} color="#FF3B30" />
                </Pressable>
                <Pressable
                  style={[styles.editButton, styles.saveButton]}
                  onPress={() => handleSave('description')}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="checkmark" size={20} color="#fff" />
                  )}
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              style={styles.editableText}
              onPress={() => handleEdit('description')}
            >
              {task.description ? (
                <Text style={styles.description}>{task.description}</Text>
              ) : (
                <Text style={styles.placeholderText}>Add description</Text>
              )}
              <Ionicons name="pencil" size={20} color="#8E8E93" />
            </Pressable>
          )}
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
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  backButton: {
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
  content: {
    padding: 16,
  },
  titleSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statusButton: {
    padding: 8,
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
    marginLeft: 12,
  },
  editableText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 12,
  },
  editableField: {
    flex: 1,
    marginLeft: 12,
  },
  input: {
    fontSize: 16,
    color: '#1C1C1E',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: '#34C759',
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
  },
  editableDate: {
    flex: 1,
    marginLeft: 12,
  },
  descriptionSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  description: {
    fontSize: 16,
    color: '#1C1C1E',
    lineHeight: 24,
  },
  placeholderText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#FF9F1C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
});
