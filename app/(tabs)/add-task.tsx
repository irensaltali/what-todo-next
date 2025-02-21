import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { DatePicker } from '../../components/DatePicker';
import { startOfDay } from 'date-fns';
import { supabase } from '../../lib/supabase';

interface FormData {
  title: string;
  date: Date;
  tags: string;
  details: string;
  alertEnabled: boolean;
}

interface FormErrors {
  title?: string;
  date?: string;
  form?: string;
}

export default function AddTaskScreen() {
  const insets = useSafeAreaInsets();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    date: new Date(),
    tags: '',
    details: '',
    alertEnabled: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }

    const today = startOfDay(new Date());
    const selectedDate = startOfDay(formData.date);
    if (selectedDate < today) {
      newErrors.date = 'Date cannot be in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setErrors({});

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      // Create the task
      const { error: insertError } = await supabase
        .from('tasks')
        .insert([
          {
            user_id: user.id,
            title: formData.title.trim(),
            description: formData.details.trim(),
            status: 'ongoing',
            start_time: formData.date.toISOString(),
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
            alert_enabled: formData.alertEnabled,
          },
        ]);

      if (insertError) throw insertError;

      // Navigate back on success
      router.back();
    } catch (error: any) {
      setErrors({
        form: error.message || 'Failed to create task. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>New Task</Text>
        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#1C1C1E" />
        </Pressable>
      </View>

      {errors.form && (
        <View style={styles.formError}>
          <Text style={styles.errorText}>{errors.form}</Text>
        </View>
      )}

      <View style={styles.form}>
        <View>
          <View style={[styles.inputContainer, errors.title && styles.inputError]}>
            <Ionicons name="document-text-outline" size={20} color="#8E8E93" />
            <TextInput
              style={styles.input}
              placeholder="Task Title"
              value={formData.title}
              onChangeText={(text) => {
                setFormData({ ...formData, title: text });
                if (errors.title) {
                  setErrors({ ...errors, title: undefined });
                }
              }}
              placeholderTextColor="#8E8E93"
            />
          </View>
          {errors.title && (
            <Text style={styles.errorText}>{errors.title}</Text>
          )}
        </View>

        <DatePicker
          date={formData.date}
          onDateChange={(newDate) => {
            setFormData({ ...formData, date: newDate });
            if (errors.date) {
              setErrors({ ...errors, date: undefined });
            }
          }}
          error={errors.date}
        />

        <View style={styles.inputContainer}>
          <Ionicons name="pricetags-outline" size={20} color="#8E8E93" />
          <TextInput
            style={styles.input}
            placeholder="Add Tags (comma separated)"
            value={formData.tags}
            onChangeText={(text) => setFormData({ ...formData, tags: text })}
            placeholderTextColor="#8E8E93"
          />
        </View>

        <View style={[styles.inputContainer, styles.textAreaContainer]}>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add your task details"
            value={formData.details}
            onChangeText={(text) => setFormData({ ...formData, details: text })}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            placeholderTextColor="#8E8E93"
          />
        </View>

        <View style={styles.toggleContainer}>
          <View style={styles.toggleLeft}>
            <Ionicons name="notifications-outline" size={20} color="#8E8E93" />
            <Text style={styles.toggleLabel}>Get alert for this task</Text>
          </View>
          <Pressable 
            style={[styles.toggle, formData.alertEnabled && styles.toggleActive]}
            onPress={() => setFormData({ ...formData, alertEnabled: !formData.alertEnabled })}
          >
            <View style={[styles.toggleHandle, formData.alertEnabled && styles.toggleHandleActive]} />
          </Pressable>
        </View>

        <Pressable 
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.createButtonText}>Create Task</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
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
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formError: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: '#FFE5E5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
  },
  form: {
    padding: 16,
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
  },
  textAreaContainer: {
    alignItems: 'flex-start',
  },
  textArea: {
    height: 120,
    paddingTop: 0,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleLabel: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  toggle: {
    width: 51,
    height: 31,
    borderRadius: 15.5,
    backgroundColor: '#E5E5EA',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#FF9F1C',
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
  createButton: {
    backgroundColor: '#FF9F1C',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});