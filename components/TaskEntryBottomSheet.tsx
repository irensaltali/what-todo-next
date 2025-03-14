import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  ScrollView,
  Dimensions,
  Platform,
  Alert,
  UIManager,
  StatusBar,
  SafeAreaView,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView, Gesture, GestureDetector } from 'react-native-gesture-handler';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../data/supabase';
import { createTask } from '../data/taskService'; // Update import to use the specific file
import { createTaskReminder } from '../data/taskReminderService'; // Import the reminder service
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';

const { height, width } = Dimensions.get('window');
const MARGIN = 16; // Margin for the backdrop effect
const SHEET_MAX_HEIGHT = height * 0.9; // 90% of screen height

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

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [advancedOptionsPosition, setAdvancedOptionsPosition] = useState({ x: 0, y: 0 });
  const [submitting, setSubmitting] = useState(false);
  
  const translateY = useRef(new Animated.Value(height)).current;
  const titleInputRef = useRef<TextInput>(null);
  const richEditorRef = useRef<RichEditor>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const { t } = useTranslation();
  const { top } = useSafeAreaInsets();

  useEffect(() => {
    if (isVisible) {
      // Reset form state when opening
      resetForm();
      
      // Scale down the background content slightly
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      // Open animation - come up from the bottom but stop higher
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.6, // Slightly darker backdrop
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Focus after animation without concern for keyboard
        titleInputRef.current?.focus();
      });
    } else {
      // Reset the background content scale
      Animated.timing(scale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
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
    
    // No need for keyboard listeners anymore
  }, [isVisible]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    if (richEditorRef.current) {
      richEditorRef.current.setContentHTML('');
    }
    setPriority(0);
    setDate(null);
    setIsReminderEnabled(false);
    setHasChanges(false);
  };

  const handleClose = () => {
    if (hasChanges && (title.trim() !== '' || description.trim() !== '')) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Discard', 
            style: 'destructive',
            onPress: () => safelyClose()
          }
        ]
      );
    } else {
      safelyClose();
    }
  };

  // Function to safely close the bottom sheet
  const safelyClose = () => {
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
    ]).start(() => {
      // Only call onClose after animation completes
      onClose();
    });
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
      setSubmitting(true);
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'You must be logged in to create a task');
        return;
      }

      // Get the HTML content from the rich editor
      let descriptionHTML = description;
      if (richEditorRef.current) {
        descriptionHTML = await richEditorRef.current.getContentHtml() || '';
      }

      // Prepare task data with all required fields
      const taskData = {
        user_id: user.id,
        title: title.trim(),
        description: descriptionHTML.trim() || null,
        parent_task_id: null, // Required field, null for top-level tasks
        priority: priority,
        is_recursive: false, // Required field
        recursion_count: null, // Optional field
        recursion_end: null, // Optional field
        outcome_value: null, // Optional field
        difficulty: null, // Optional field
        is_deleted: false, // Required field
        status: 'ongoing' as 'ongoing', // Use the proper enum value
        deadline: date ? date.toISOString() : null,
      };

      // Save to database using our service instead of direct supabase call
      const { data, error } = await createTask(taskData);

      if (error) {
        throw error;
      }

      // Clear form and close sheet
      resetForm();
      handleClose();
      
      // Notify parent
      if (onTaskAdded) {
        onTaskAdded();
      }

      // Create reminder if enabled and we have a task ID and date
      if (isReminderEnabled && date && data && data.id) {
        const reminderData = {
          task_id: data.id,
          reminder_time: date.toISOString(),
        };
        await createTaskReminder(reminderData);
      }
    } catch (error) {
      console.error('Error creating task:', error);
      Alert.alert('Error', 'Failed to create task. Please try again.');
    } finally {
      setSubmitting(false);
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
        // Limit the drag to a reasonable amount to show resistance
        translateY.setValue(Math.min(event.translationY, height * 0.2));
      }
    })
    .onEnd((event) => {
      if (event.translationY > 100) {
        // If dragged far enough down, check for unsaved changes immediately
        if (hasChanges && (title.trim() !== '' || description.trim() !== '')) {
          // Immediately snap back to original position
          translateY.setValue(0);
          // Show confirmation dialog immediately
          handleClose();
        } else {
          // No changes, close immediately
          Animated.timing(translateY, {
            toValue: height,
            duration: 200,
            useNativeDriver: true,
          }).start(() => safelyClose());
        }
      } else {
        // Otherwise snap back to original position
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 300,
        }).start();
      }
    })
    .runOnJS(true);

  // Toggle advanced options menu
  const handleToggleAdvancedOptions = () => {
    setShowAdvancedOptions(!showAdvancedOptions);
  };

  // Add a handler to close the menu when tapping anywhere else
  const handleBackdropPress = () => {
    if (showAdvancedOptions) {
      setShowAdvancedOptions(false);
    }
  };

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="none"
      onRequestClose={handleClose} // This prevents hardware back button from closing directly
      statusBarTranslucent={true}
    >
      <SafeAreaView style={styles.modalContainer}>
        {/* Backdrop with margin effect */}
        <Animated.View 
          style={[
            styles.backdropOuter,
            { opacity }
          ]}
        />
        
        {/* Inner content wrapper with margin */}
        <Animated.View
          style={[
            styles.contentWrapper,
            {
              transform: [{ scale }],
            }
          ]}
        >
          {/* This is a placeholder view for the background content */}
          <View style={styles.contentPlaceholder} />
        </Animated.View>
        
        {/* Sheet container - now positioned higher */}
        <GestureHandlerRootView style={styles.gestureContainer}>
          <GestureDetector gesture={panGesture}>
            <Animated.View 
              style={[
                styles.bottomSheet,
                { 
                  transform: [{ translateY }],
                  maxHeight: SHEET_MAX_HEIGHT,
                }
              ]}
            >
              <View style={styles.handle} />
              
              {/* Add backdrop for closing the advanced options menu when tapping outside */}
              {showAdvancedOptions && (
                <TouchableOpacity
                  style={styles.menuBackdrop}
                  activeOpacity={1}
                  onPress={handleBackdropPress}
                />
              )}
              
              <KeyboardAvoidingView
                style={styles.content}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
              >
                <View style={styles.headerBar}>
                  <TouchableOpacity 
                    style={styles.headerButton}
                    onPress={handleClose}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.headerButton}
                    onPress={handleSubmit}
                    disabled={submitting}
                  >
                    <Text style={submitting ? styles.disabledButtonText : styles.addButtonText}>
                      {submitting ? 'Adding...' : 'Add'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.combinedInputContainer}>
                  <View style={styles.titleContainer}>
                    <TextInput
                      ref={titleInputRef}
                      style={styles.titleInput}
                      placeholder="Title"
                      value={title}
                      onChangeText={handleTitleChange}
                      returnKeyType="next"
                      placeholderTextColor="#8E8E93"
                    />
                  </View>
                </View>
                
                <View style={styles.richEditorContainer}>
                  <RichToolbar
                    editor={richEditorRef}
                    selectedIconTint="#FF9F1C"
                    iconTint="#8E8E93"
                    actions={[
                      actions.setBold, 
                      actions.setItalic, 
                      actions.setUnderline, 
                      actions.setStrikethrough,
                      '|', 
                      actions.insertBulletsList,
                      actions.insertOrderedList
                    ]}
                    style={styles.richToolbar}
                    iconSize={18}
                    iconContainerStyle={{ paddingHorizontal: 6 }}
                  />
                  <RichEditor
                    ref={richEditorRef}
                    placeholder="Add a description..."
                    initialContentHTML={description}
                    onChange={(text) => {
                      setDescription(text);
                      setHasChanges(true);
                    }}
                    editorStyle={{
                      backgroundColor: 'transparent',
                      contentCSSText: 'font-size: 14px; padding: 12px; min-height: 110px; color: #2C2C2C;'
                    }}
                    containerStyle={styles.richEditorContent}
                  />
                </View>
                
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
                  
                  <View>
                    <TouchableOpacity 
                      style={styles.metadataButton}
                      onPress={handleToggleAdvancedOptions}
                    >
                      <Ionicons name="ellipsis-horizontal" size={22} color="#8E8E93" />
                      <Text style={styles.metadataText}>More</Text>
                    </TouchableOpacity>
                    
                    {showAdvancedOptions && (
                      <View style={[
                        styles.advancedOptionsMenu,
                        { right: 0, bottom: 60 } // Position above the button
                      ]}>
                        <TouchableOpacity style={styles.advancedOption}>
                          <Ionicons name="time-outline" size={18} color="#8E8E93" />
                          <Text style={styles.advancedOptionText}>Set due time</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.advancedOption}>
                          <Ionicons name="repeat-outline" size={18} color="#8E8E93" />
                          <Text style={styles.advancedOptionText}>Make recurring</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.advancedOption}>
                          <Ionicons name="list-outline" size={18} color="#8E8E93" />
                          <Text style={styles.advancedOptionText}>Add subtasks</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.advancedOption}>
                          <Ionicons name="bookmark-outline" size={18} color="#8E8E93" />
                          <Text style={styles.advancedOptionText}>Add tags</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
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
              </KeyboardAvoidingView>
            </Animated.View>
          </GestureDetector>
        </GestureHandlerRootView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  backdropOuter: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  contentWrapper: {
    flex: 1,
    margin: MARGIN,
    borderRadius: 16,
    overflow: 'hidden',
  },
  contentPlaceholder: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  gestureContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: Platform.OS === 'ios' ? StatusBar.currentHeight || 44 : 0, // Leave space for status bar
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
    height: '100%',
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
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  combinedInputContainer: {
    borderWidth: 1.5,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    flex: 0,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  titleInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'left',
    paddingHorizontal: 0,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginHorizontal: 0, // Remove horizontal margin
  },
  richEditorContainer: {
    minHeight: 146,
    maxHeight: Math.min(250, height * 0.3),
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    overflow: 'hidden',
  },
  richToolbar: {
    backgroundColor: '#F8F8F8',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    height: 36,
    paddingHorizontal: 8,
  },
  richEditorContent: {
    flex: 1,
    minHeight: 110,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    marginTop: 0,
    marginBottom: 16,
  },
  metadataButton: {
    alignItems: 'center',
    marginHorizontal: 4,
    position: 'relative',
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
  cancelButtonText: {
    color: '#8E8E93',
    fontWeight: '500',
    fontSize: 16,
  },
  addButtonText: {
    color: '#FF9F1C',
    fontWeight: '700',
    fontSize: 16,
  },
  disabledButtonText: {
    color: '#CCCCCC',
    fontWeight: '700',
    fontSize: 16,
  },
  // New hover menu styles
  advancedOptionsMenu: {
    position: 'absolute',
    width: 180,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    paddingVertical: 8,
    zIndex: 1000,
  },
  advancedOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  advancedOptionText: {
    fontSize: 14,
    marginLeft: 12,
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 100,
  },
});
