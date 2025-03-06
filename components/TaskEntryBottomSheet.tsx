import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  Keyboard,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView, Gesture, GestureDetector } from 'react-native-gesture-handler';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../lib/supabase';

const { height } = Dimensions.get('window');

interface TaskEntryBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onTaskAdded?: () => void;
}

const PRIORITY_LEVELS = [
  { level: 0, label: 'No priority' },
  { level: 1, label: 'High' },
  { level: 2, label: 'Medium' },
  { level: 3, label: 'Low' },
];

export const TaskEntryBottomSheet: React.FC<TaskEntryBottomSheetProps> = ({
  isVisible,
  onClose,
  onTaskAdded,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(0);
  const [date, setDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isReminderEnabled, setIsReminderEnabled] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const translateY = useRef(new Animated.Value(height)).current;
  const titleInputRef = useRef<TextInput>(null);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // Reset form state when opening
      resetForm();
      
      // Open animation
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto focus on the title input
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 300);
    } else {
      // Close animation
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: height,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority(0);
    setDate(null);
    setIsReminderEnabled(false);
    setHasChanges(false);
  };

  const handleClose = () => {
    if (hasChanges && title.trim() !== '') {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Discard', 
            style: 'destructive',
            onPress: () => onClose()
          }
        ]
      );
    } else {
      onClose();
    }
  };

  const handlePriorityChange = () => {
    // Cycle through priority levels: 0 -> 1 -> 2 -> 3 -> 0
    setPriority((prev) => (prev + 1) % 4);
    setHasChanges(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      setHasChanges(true);
    }
  };

  const handleTitleChange = (text: string) => {
    // Check if title starts with priority notation (e.g., !!3)
    const priorityMatch = text.match(/^!!([1-3])\s(.*)/);
    
    if (priorityMatch) {
      const extractedPriority = parseInt(priorityMatch[1], 10);
      const extractedTitle = priorityMatch[2];
      
      setPriority(extractedPriority);
      setTitle(extractedTitle);
    } else {
      setTitle(text);
    }
    
    setHasChanges(true);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'You must be logged in to create a task');
        return;
      }

      // Prepare task data
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        user_id: user.id,
        priority: priority,
        status: 'ongoing',
        start_time: date ? date.toISOString() : new Date().toISOString(),
        reminder: isReminderEnabled,
      };

      // Save to database
      const { error } = await supabase.from('tasks').insert([taskData]);

      if (error) {
        throw error;
      }

      // Success handling
      if (onTaskAdded) {
        onTaskAdded();
      }
      
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
      Alert.alert('Error', 'Failed to create task. Please try again.');
    }
  };

  const handlePanGesture = (translationY: number) => {
    // Handle drag to dismiss
    if (translationY > 100) {
      handleClose();
    }
  };
  
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.setValue(event.translationY);
      }
    })
    .onEnd((event) => {
      if (event.translationY > 100) {
        handleClose();
      } else {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    });

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <View style={styles.container}>
        <Animated.View 
          style={[styles.backdrop, { opacity }]} 
          onTouchStart={handleClose}
        />
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoidingView}
        >
          <GestureHandlerRootView style={{ flex: 1 }}>
            <GestureDetector gesture={panGesture}>
              <Animated.View 
                style={[
                  styles.bottomSheet,
                  { transform: [{ translateY }] }
                ]}
              >
                <View style={styles.handle} />
                
                <View style={styles.content}>
                  <View style={styles.titleRow}>
                    <TouchableOpacity 
                      style={styles.priorityButton}
                      onPress={handlePriorityChange}
                    >
                      <Text style={[
                        styles.priorityText,
                        priority === 1 && styles.priorityHigh,
                        priority === 2 && styles.priorityMedium,
                        priority === 3 && styles.priorityLow,
                      ]}>
                        {priority > 0 ? `!!${priority}` : ''}
                      </Text>
                    </TouchableOpacity>
                    
                    <TextInput
                      ref={titleInputRef}
                      style={styles.titleInput}
                      placeholder="Enter task title"
                      value={title}
                      onChangeText={handleTitleChange}
                      returnKeyType="next"
                    />
                  </View>
                  
                  <TextInput
                    style={styles.descriptionInput}
                    placeholder="Description"
                    value={description}
                    onChangeText={(text) => {
                      setDescription(text);
                      setHasChanges(true);
                    }}
                    multiline
                    textAlignVertical="top"
                  />
                  
                  <View style={styles.metadataRow}>
                    <TouchableOpacity 
                      style={styles.metadataButton}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Ionicons name="calendar-outline" size={22} color={date ? "#FF9F1C" : "#8E8E93"} />
                      <Text style={[styles.metadataText, date && styles.metadataActive]}>
                        {date ? date.toLocaleDateString() : 'Date'}
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.metadataButton}
                      onPress={handlePriorityChange}
                    >
                      <Ionicons name="flag-outline" size={22} color={priority > 0 ? "#FF9F1C" : "#8E8E93"} />
                      <Text style={[styles.metadataText, priority > 0 && styles.metadataActive]}>
                        {priority > 0 ? `P${priority}` : 'Priority'}
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.metadataButton}
                      onPress={() => {
                        setIsReminderEnabled(!isReminderEnabled);
                        setHasChanges(true);
                      }}
                    >
                      <Ionicons name="alarm-outline" size={22} color={isReminderEnabled ? "#FF9F1C" : "#8E8E93"} />
                      <Text style={[styles.metadataText, isReminderEnabled && styles.metadataActive]}>
                        Reminder
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.metadataButton}>
                      <Ionicons name="ellipsis-horizontal" size={22} color="#8E8E93" />
                    </TouchableOpacity>
                  </View>
                  
                  {showDatePicker && (
                    <DateTimePicker
                      value={date || new Date()}
                      mode="date"
                      is24Hour={true}
                      display="default"
                      onChange={handleDateChange}
                    />
                  )}
                  
                  <View style={styles.actionBar}>
                    <TouchableOpacity 
                      style={styles.cancelButton}
                      onPress={handleClose}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.submitButton}
                      onPress={handleSubmit}
                    >
                      <Ionicons name="checkmark" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            </GestureDetector>
          </GestureHandlerRootView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  keyboardAvoidingView: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    minHeight: 300,
    paddingBottom: Platform.OS === 'ios' ? 30 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
  },
  handle: {
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#DEDEDE',
    alignSelf: 'center',
    marginTop: 8,
  },
  content: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  priorityButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8E8E93',
  },
  priorityHigh: {
    color: '#FF3B30',
  },
  priorityMedium: {
    color: '#FF9F1C',
  },
  priorityLow: {
    color: '#52C1C4',
  },
  titleInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    fontWeight: '500',
  },
  descriptionInput: {
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    marginBottom: 16,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    marginBottom: 16,
  },
  metadataButton: {
    alignItems: 'center',
    marginHorizontal: 4,
  },
  metadataText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  metadataActive: {
    color: '#FF9F1C',
    fontWeight: '500',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelButtonText: {
    color: '#8E8E93',
    fontWeight: '500',
  },
  submitButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
});
