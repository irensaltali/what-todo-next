import React,{ useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { format, isAfter, startOfDay } from 'date-fns';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { DatePicker } from '@/components/DatePicker';

interface Task {
  id: string;
  title: string;
  description: string;
  type: string;
  task_count: number;
  progress: number;
  status: 'ongoing' | 'inprocess' | 'canceled' | 'completed';
  start_time: string;
  tags: string[];
  alert_enabled: boolean;
}

interface EditableFields {
  title: boolean;
  description: boolean;
  type: boolean;
  tags: boolean;
  progress: boolean;
  start_time: boolean;
}

const STATUS_COLORS = {
  ongoing: '#007AFF',
  inprocess: '#FF9F1C',
  canceled: '#FF3B30',
  completed: '#34C759',
};

const STATUS_LABELS = {
  ongoing: 'Ongoing',
  inprocess: 'In Process',
  canceled: 'Canceled',
  completed: 'Completed',
};

const STATUSES = Object.keys(STATUS_LABELS) as Task['status'][];

export default function TaskDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const [task, setTask] = useState<Task | null>(null);
  const [editedTask, setEditedTask] = useState<Partial<Task>>({});
  const [editableFields, setEditableFields] = useState<EditableFields>({
    title: false,
    description: false,
    type: false,
    tags: false,
    progress: false,
    start_time: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Task not found');

      setTask(data);
      setEditedTask(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const validateField = (field: keyof Task, value: any): string | null => {
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
      setError(null);

      const { error: updateError } = await supabase
        .from('tasks')
        .update({ [field]: editedTask[field] })
        .eq('id', task.id);

      if (updateError) throw updateError;

      setTask(prev => prev ? { ...prev, [field]: editedTask[field] } : null);
      setEditableFields(prev => ({ ...prev, [field]: false }));
    } catch (err: any) {
      setError('Failed to update task: ' + err.message);
      Alert.alert('Error', 'Failed to update task. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: Task['status']) => {
    if (!task) return;

    try {
      setSaving(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', task.id);

      if (updateError) throw updateError;

      setTask(prev => prev ? { ...prev, status: newStatus } : null);
      setEditedTask(prev => ({ ...prev, status: newStatus }));
    } catch (err: any) {
      setError('Failed to update status: ' + err.message);
      Alert.alert('Error', 'Failed to update status. Please try again.');
    } finally {
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

        <View style={styles.progressSection}>
          {editableFields.progress ? (
            <View style={styles.editableProgress}>
              <TextInput
                style={styles.progressInput}
                value={String(editedTask.progress || 0)}
                onChangeText={(value) => handleChange('progress', Number(value))}
                keyboardType="numeric"
                maxLength={3}
              />
              <Text style={styles.progressSymbol}>%</Text>
              <View style={styles.editActions}>
                <Pressable
                  style={[styles.editButton, styles.cancelButton]}
                  onPress={() => handleCancel('progress')}
                  disabled={saving}
                >
                  <Ionicons name="close" size={20} color="#FF3B30" />
                </Pressable>
                <Pressable
                  style={[styles.editButton, styles.saveButton]}
                  onPress={() => handleSave('progress')}
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
            <Pressable onPress={() => handleEdit('progress')}>
              <AnimatedCircularProgress
                size={120}
                width={12}
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
            </Pressable>
          )}
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#8E8E93" />
            {editableFields.start_time ? (
              <View style={styles.editableDate}>
                <DatePicker
                  date={new Date(editedTask.start_time || task.start_time)}
                  onDateChange={(date) => handleChange('start_time', date.toISOString())}
                />
                <View style={styles.editActions}>
                  <Pressable
                    style={[styles.editButton, styles.cancelButton]}
                    onPress={() => handleCancel('start_time')}
                    disabled={saving}
                  >
                    <Ionicons name="close" size={20} color="#FF3B30" />
                  </Pressable>
                  <Pressable
                    style={[styles.editButton, styles.saveButton]}
                    onPress={() => handleSave('start_time')}
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
                onPress={() => handleEdit('start_time')}
              >
                <Text style={styles.infoText}>
                  {format(new Date(task.start_time), 'MMMM d, yyyy')}
                </Text>
                <Ionicons name="pencil" size={20} color="#8E8E93" />
              </Pressable>
            )}
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="folder-outline" size={20} color="#8E8E93" />
            {editableFields.type ? (
              <View style={styles.editableField}>
                <TextInput
                  style={styles.input}
                  value={editedTask.type}
                  onChangeText={(value) => handleChange('type', value)}
                  placeholder="Task Type"
                />
                <View style={styles.editActions}>
                  <Pressable
                    style={[styles.editButton, styles.cancelButton]}
                    onPress={() => handleCancel('type')}
                    disabled={saving}
                  >
                    <Ionicons name="close" size={20} color="#FF3B30" />
                  </Pressable>
                  <Pressable
                    style={[styles.editButton, styles.saveButton]}
                    onPress={() => handleSave('type')}
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
                onPress={() => handleEdit('type')}
              >
                <Text style={styles.infoText}>{task.type}</Text>
                <Ionicons name="pencil" size={20} color="#8E8E93" />
              </Pressable>
            )}
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="notifications-outline" size={20} color="#8E8E93" />
            <Pressable
              style={styles.toggleContainer}
              onPress={async () => {
                try {
                  setSaving(true);
                  const newValue = !task.alert_enabled;
                  
                  const { error: updateError } = await supabase
                    .from('tasks')
                    .update({ alert_enabled: newValue })
                    .eq('id', task.id);

                  if (updateError) throw updateError;

                  setTask(prev => prev ? { ...prev, alert_enabled: newValue } : null);
                  setEditedTask(prev => ({ ...prev, alert_enabled: newValue }));
                } catch (err: any) {
                  Alert.alert('Error', 'Failed to update alert settings');
                } finally {
                  setSaving(false);
                }
              }}
            >
              <Text style={styles.infoText}>Alerts</Text>
              <View style={[styles.toggle, task.alert_enabled && styles.toggleActive]}>
                <View style={[styles.toggleHandle, task.alert_enabled && styles.toggleHandleActive]} />
              </View>
            </Pressable>
          </View>
        </View>

        <View style={styles.tagsSection}>
          <Text style={styles.sectionTitle}>Tags</Text>
          {editableFields.tags ? (
            <View style={styles.editableField}>
              <TextInput
                style={styles.input}
                value={editedTask.tags?.join(', ')}
                onChangeText={(value) => handleChange('tags', value.split(',').map(tag => tag.trim()).filter(Boolean))}
                placeholder="Enter tags (comma-separated)"
              />
              <View style={styles.editActions}>
                <Pressable
                  style={[styles.editButton, styles.cancelButton]}
                  onPress={() => handleCancel('tags')}
                  disabled={saving}
                >
                  <Ionicons name="close" size={20} color="#FF3B30" />
                </Pressable>
                <Pressable
                  style={[styles.editButton, styles.saveButton]}
                  onPress={() => handleSave('tags')}
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
              style={[styles.tagsList, styles.editableText]}
              onPress={() => handleEdit('tags')}
            >
              {task.tags && task.tags.length > 0 ? (
                <View style={styles.tagsWrapper}>
                  {task.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.placeholderText}>Add tags</Text>
              )}
              <Ionicons name="pencil" size={20} color="#8E8E93" />
            </Pressable>
          )}
        </View>

        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Description</Text>
          {editableFields.description ? (
            <View style={styles.editableField}>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editedTask.description}
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
  progressSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  progressText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  editableProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  progressInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    width: 60,
    textAlign: 'right',
  },
  progressSymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginLeft: 4,
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
  toggleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 12,
  },
  toggle: {
    width: 51,
    height: 31,
    borderRadius: 15.5,
    backgroundColor: '#E5E5EA',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#34C759',
  },
  toggleHandle: {
    width: 27,
    height: 27,
    borderRadius: 13.5,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleHandleActive: {
    transform: [{ translateX: 20 }],
  },
  tagsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  tagsWrapper: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagsList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tag: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    color: '#1C1C1E',
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
});
