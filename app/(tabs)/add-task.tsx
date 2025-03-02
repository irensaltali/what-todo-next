import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { DatePicker } from '../../components/DatePicker';
import { addDays, startOfDay, differenceInDays } from 'date-fns';
import { supabase } from '../../lib/supabase';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface FormData {
  title: string;
  deadline: Date;
  valueImpact: number;
  difficulty: number;
  tags: string;
  details: string;
  alertEnabled: boolean;
}

interface FormErrors {
  title?: string;
  deadline?: string;
  valueImpact?: string;
  difficulty?: string;
  form?: string;
}

export default function AddTaskScreen() {
  const insets = useSafeAreaInsets();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    deadline: addDays(new Date(), 7), // Default to 7 days from now
    valueImpact: 50, // Default value impact
    difficulty: 5, // Default difficulty
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
    const selectedDate = startOfDay(formData.deadline);
    if (selectedDate < today) {
      newErrors.deadline = 'Deadline cannot be in the past';
    }

    // Validate value impact (1-100)
    if (formData.valueImpact < 1 || formData.valueImpact > 100) {
      newErrors.valueImpact = 'Value impact must be between 1 and 100';
    }

    // Validate difficulty (1-10)
    if (formData.difficulty < 1 || formData.difficulty > 10) {
      newErrors.difficulty = 'Difficulty must be between 1 and 10';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculatePriority = () => {
    // Calculate deadline score (higher for closer deadlines)
    const today = startOfDay(new Date());
    const daysUntilDeadline = Math.max(0, differenceInDays(formData.deadline, today));
    const maxDays = 365;
    const deadlineScore = 100 - Math.min(100, (daysUntilDeadline / maxDays) * 100);
    
    // Value impact is already on a 1-100 scale
    const valueScore = formData.valueImpact;
    
    // Convert difficulty (1-10) to a 1-100 scale
    const difficultyScore = (formData.difficulty / 10) * 100;
    
    // Calculate priority score (weighted average)
    // Higher deadline urgency and value impact increase priority
    // Higher difficulty slightly decreases priority (harder tasks may take longer)
    const priorityScore = (deadlineScore * 0.4) + (valueScore * 0.4) + ((100 - difficultyScore) * 0.2);
    
    return Math.round(priorityScore);
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

      // Calculate priority score
      const priorityScore = calculatePriority();

      // Create the task
      const { error: insertError } = await supabase
        .from('tasks')
        .insert([
          {
            user_id: user.id,
            title: formData.title.trim(),
            description: formData.details.trim(),
            status: 'ongoing',
            start_time: new Date().toISOString(),
            deadline: formData.deadline.toISOString(),
            value_impact: formData.valueImpact,
            difficulty: formData.difficulty,
            priority_score: priorityScore,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
            alert_enabled: formData.alertEnabled,
            progress: 0,
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

  const handleValueImpactChange = (value: string) => {
    // Parse the input and ensure it's within the valid range (1-100)
    let numValue = parseInt(value);
    if (isNaN(numValue)) numValue = 50; // Default to 50 if invalid
    numValue = Math.max(1, Math.min(100, numValue)); // Clamp between 1-100
    
    setFormData({ ...formData, valueImpact: numValue });
    
    // Clear error if it exists
    if (errors.valueImpact) {
      setErrors({ ...errors, valueImpact: undefined });
    }
  };

  const handleDifficultyChange = (value: string) => {
    // Parse the input and ensure it's within the valid range (1-10)
    let numValue = parseInt(value);
    if (isNaN(numValue)) numValue = 5; // Default to 5 if invalid
    numValue = Math.max(1, Math.min(10, numValue)); // Clamp between 1-10
    
    setFormData({ ...formData, difficulty: numValue });
    
    // Clear error if it exists
    if (errors.difficulty) {
      setErrors({ ...errors, difficulty: undefined });
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
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Text style={styles.sectionTitle}>Task Details</Text>
          <View>
            <View style={[styles.inputContainer, errors.title && styles.inputError]}>
              <Ionicons name="document-text-outline" size={20} color="#8E8E93" />
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) => {
                  setFormData({ ...formData, title: text });
                  if (errors.title) {
                    setErrors({ ...errors, title: undefined });
                  }
                }}
                placeholder="Task Title"
                placeholderTextColor="#8E8E93"
              />
            </View>
            {errors.title && (
              <Text style={styles.errorText}>{errors.title}</Text>
            )}
          </View>

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
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Text style={styles.sectionTitle}>Priority Attributes</Text>
          
          <Text style={styles.fieldLabel}>📅 Deadline Priority</Text>
          <DatePicker
            date={formData.deadline}
            onDateChange={(newDate) => {
              setFormData({ ...formData, deadline: newDate });
              if (errors.deadline) {
                setErrors({ ...errors, deadline: undefined });
              }
            }}
            error={errors.deadline}
          />
          
          <Text style={[styles.fieldLabel, styles.valueImpactLabel]}>💎 Value Impact (1-100)</Text>
          <View style={styles.sliderContainer}>
            <Pressable 
              style={styles.sliderButton}
              onPress={() => handleValueImpactChange((formData.valueImpact - 5).toString())}
              disabled={formData.valueImpact <= 1}
            >
              <Ionicons name="remove" size={20} color="#8E8E93" />
            </Pressable>
            <View style={styles.sliderTrack}>
              <View 
                style={[
                  styles.sliderFill, 
                  { width: `${formData.valueImpact}%` },
                  formData.valueImpact < 30 ? styles.lowValue : 
                  formData.valueImpact < 70 ? styles.mediumValue : 
                  styles.highValue
                ]} 
              />
            </View>
            <TextInput
              style={styles.sliderValue}
              value={formData.valueImpact.toString()}
              onChangeText={handleValueImpactChange}
              keyboardType="numeric"
              maxLength={3}
            />
            <Pressable 
              style={styles.sliderButton}
              onPress={() => handleValueImpactChange((formData.valueImpact + 5).toString())}
              disabled={formData.valueImpact >= 100}
            >
              <Ionicons name="add" size={20} color="#8E8E93" />
            </Pressable>
          </View>
          {errors.valueImpact && (
            <Text style={styles.errorText}>{errors.valueImpact}</Text>
          )}
          
          <Text style={styles.fieldLabel}>⏱️ Task Difficulty (1-10)</Text>
          <View style={styles.difficultyContainer}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
              <Pressable
                key={level}
                style={[
                  styles.difficultyButton,
                  formData.difficulty === level && styles.difficultyButtonActive,
                  level <= 3 ? styles.easyDifficulty : 
                  level <= 7 ? styles.mediumDifficulty : 
                  styles.hardDifficulty
                ]}
                onPress={() => handleDifficultyChange(level.toString())}
              >
                <Text 
                  style={[
                    styles.difficultyButtonText,
                    formData.difficulty === level && styles.difficultyButtonTextActive
                  ]}
                >
                  {level}
                </Text>
              </Pressable>
            ))}
          </View>
          {errors.difficulty && (
            <Text style={styles.errorText}>{errors.difficulty}</Text>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()}>
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
        </Animated.View>
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
    marginTop: 4,
    marginLeft: 4,
  },
  form: {
    padding: 16,
    gap: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  valueImpactLabel: {
    marginTop: 16, // Added more top margin for better spacing
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
    marginBottom: 16,
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
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  sliderButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#FF9F1C',
  },
  lowValue: {
    backgroundColor: '#5593F1',
  },
  mediumValue: {
    backgroundColor: '#FFC247',
  },
  highValue: {
    backgroundColor: '#FF6B00',
  },
  sliderValue: {
    width: 40,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginLeft: 8,
  },
  difficultyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  difficultyButton: {
    width: '18%',
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  difficultyButtonActive: {
    backgroundColor: '#FF9F1C',
  },
  easyDifficulty: {
    backgroundColor: '#E3F2FD',
  },
  mediumDifficulty: {
    backgroundColor: '#FFF3E0',
  },
  hardDifficulty: {
    backgroundColor: '#FFEBEE',
  },
  difficultyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  difficultyButtonTextActive: {
    color: '#fff',
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
    marginBottom: 24,
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
