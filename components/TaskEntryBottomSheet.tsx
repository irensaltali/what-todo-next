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
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
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
  const [datePickerMode, setDatePickerMode] = useState<'date' | 'time'>('date');
  const [tempDate, setTempDate] = useState<Date | null>(null); // Track temporary date during picker session
  const [isReminderEnabled, setIsReminderEnabled] = useState(false);
  const [reminders, setReminders] = useState<string[]>([]);
  const [showReminderOptions, setShowReminderOptions] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [advancedOptionsPosition, setAdvancedOptionsPosition] = useState({ x: 0, y: 0 });
  const [submitting, setSubmitting] = useState(false);
  
  const translateY = useRef(new Animated.Value(height)).current;
  const titleInputRef = useRef<TextInput>(null);
  const richEditorRef = useRef<RichEditor>(null);
  const reminderButtonRef = useRef<View>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const { t } = useTranslation();
  const { top } = useSafeAreaInsets();

  // Define reminder options
  const reminderOptions = [
    { label: '5 minutes before', value: '5min', offsetMinutes: 5 },
    { label: '15 minutes before', value: '15min', offsetMinutes: 15 },
    { label: '30 minutes before', value: '30min', offsetMinutes: 30 },
    { label: '1 hour before', value: '1hour', offsetMinutes: 60 },
    { label: '3 hours before', value: '3hours', offsetMinutes: 180 },
    { label: '1 day before', value: '1day', offsetMinutes: 60 * 24 },
    { label: '2 days before', value: '2days', offsetMinutes: 60 * 24 * 2 },
  ];

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
    setReminders([]);
    setShowReminderOptions(false);
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
    // For Android, the picker is automatically dismissed when a date is selected
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    // On iOS, the onChange is called for every minor change, and null is not passed
    // The user will manually dismiss using the Done button, so we just update the date
    if (selectedDate) {
      setDate(selectedDate);
      setHasChanges(true);
    }
  };

  // Open the date picker with platform-specific handling
  const openDatePicker = () => {
    // Store the current date as temp date before opening
    setTempDate(date);
    setDatePickerMode('date');
    setShowDatePicker(true);
  };

  // Android date change handler
  const handleAndroidDateChange = (event: any, selectedDate?: Date) => {
    // Android always closes the picker after selection or cancellation
    setShowDatePicker(false);
    
    // Only update the date if a date was selected (not cancelled)
    if (event.type !== 'dismissed' && selectedDate) {
      setDate(selectedDate);
      setHasChanges(true);
    } else if (event.type === 'neutralButtonPressed') {
      // Handle "clear" button if present
      setDate(null);
      setHasChanges(true);
    }
    // If dismissed, keep the original date
  };

  // iOS date change handler - updates temporary state without dismissing
  const handleIOSDateChange = (event: any, selectedDate?: Date) => {
    // On iOS, onChange is triggered for every minor change
    // We update the temporary date but keep the picker open
    if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  // iOS date confirmation handler - called when Done is pressed
  const handleIOSDateConfirm = () => {
    // When Done is pressed, commit the temp date to the actual date
    // If tempDate is null but the picker is open, use the current date (today)
    if (tempDate) {
      setDate(tempDate);
    } else {
      setDate(new Date());
    }
    
    // Close the picker and mark that changes were made
    setShowDatePicker(false);
    setHasChanges(true);
  };

  // iOS date cancel handler - called when Cancel is pressed
  const handleIOSDateCancel = () => {
    // Discard any changes and keep the original date
    setShowDatePicker(false);
    // tempDate is not committed to date
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

      // Create reminders if enabled and we have a task ID and date
      if (reminders.length > 0 && date && data && data.id) {
        // Create multiple reminders
        const reminderPromises = reminders.map(async (reminderValue) => {
          const reminderTime = calculateReminderTime(reminderValue);
          if (reminderTime) {
            const reminderData = {
              task_id: data.id,
              reminder_time: reminderTime,
            };
            return createTaskReminder(reminderData);
          }
          return null;
        });
        
        // Process all reminder creation promises
        await Promise.all(reminderPromises.filter(p => p !== null));
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
    if (showReminderOptions) {
      setShowReminderOptions(false);
    }
  };

  // Add a menu backdrop specific to the reminder options
  const handleReminderBackdropPress = () => {
    setShowReminderOptions(false);
  };

  // Calculate reminder time based on deadline and offset
  const calculateReminderTime = (reminderValue: string): string | null => {
    if (!date) return null;
    
    // Find the reminder option
    const option = reminderOptions.find(opt => opt.value === reminderValue);
    if (!option) return null;
    
    // Calculate the time by subtracting minutes from the deadline
    const reminderDate = new Date(date.getTime());
    reminderDate.setMinutes(reminderDate.getMinutes() - option.offsetMinutes);
    
    return reminderDate.toISOString();
  };

  // Toggle a reminder option
  const toggleReminderOption = (value: string) => {
    setHasChanges(true);
    setIsReminderEnabled(true);
    
    if (reminders.includes(value)) {
      // Remove if already selected
      setReminders(reminders.filter(r => r !== value));
    } else {
      // Add if not already selected
      setReminders([...reminders, value]);
    }
  };

  // Format date for display
  const formatDisplayDate = (date: Date | null): string => {
    if (!date) return 'Date';
    
    // Use a more intuitive date format
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Check if it's today or tomorrow for better readability
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      // Format for other dates
      const options: Intl.DateTimeFormatOptions = { 
        month: 'short', 
        day: 'numeric', 
        year: new Date().getFullYear() === date.getFullYear() ? undefined : 'numeric'
      };
      return date.toLocaleDateString(undefined, options);
    }
  };
  
  // Render the date picker based on platform
  const renderDatePicker = () => {
    if (!showDatePicker) return null;
    
    // For iOS, show a modal with a spinner
    if (Platform.OS === 'ios') {
      return (
        <Modal
          transparent={true}
          visible={showDatePicker}
          animationType="slide"
          onRequestClose={handleIOSDateCancel}
        >
          <View style={styles.datePickerBackdrop}>
            <TouchableOpacity
              style={{flex: 1}}
              activeOpacity={1}
              onPress={handleIOSDateCancel}
            />
            <View style={styles.iosDatePickerWrapper}>
              <View style={styles.iosDatePickerContainer}>
                <View style={styles.iosDatePickerHeader}>
                  <TouchableOpacity onPress={handleIOSDateCancel}>
                    <Text style={styles.datePickerCancel}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={styles.datePickerTitle}>Select Date</Text>
                  <TouchableOpacity onPress={handleIOSDateConfirm}>
                    <Text style={styles.datePickerDone}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={tempDate || date || new Date()}
                  mode={datePickerMode}
                  onChange={handleIOSDateChange}
                  style={styles.iosDatePicker}
                  display="spinner"
                  themeVariant="light"
                  textColor="#000000"
                />
              </View>
            </View>
          </View>
        </Modal>
      );
    }
    
    // For Android, show the native dialog
    return (
      <DateTimePicker
        value={tempDate || date || new Date()}
        mode={datePickerMode}
        is24Hour={true}
        display="default"
        onChange={handleAndroidDateChange}
        themeVariant="light"
        textColor="#000000"
      />
    );
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
              
              {/* Add backdrop for closing any open menu when tapping outside */}
              {(showAdvancedOptions || showReminderOptions) && (
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
                    onPress={openDatePicker}
                  >
                    <MaterialIcons name="calendar-today" size={20} color={date ? "#FF9F1C" : "#8E8E93"} />
                    <Text style={[styles.metadataText, date && styles.metadataActive]}>
                      {formatDisplayDate(date)}
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
                  
                  <View>
                    <TouchableOpacity 
                      ref={reminderButtonRef}
                      style={styles.metadataButton}
                      onPress={() => {
                        if (!date) {
                          Alert.alert('Set a date first', 'Please set a deadline date before adding reminders.');
                          return;
                        }
                        setShowReminderOptions(!showReminderOptions);
                        setHasChanges(true);
                      }}
                    >
                      <Ionicons 
                        name="alarm-outline" 
                        size={22} 
                        color={reminders.length > 0 ? "#FF9F1C" : "#8E8E93"} 
                      />
                      <Text style={[styles.metadataText, reminders.length > 0 && styles.metadataActive]}>
                        {reminders.length > 0 ? `${reminders.length} Reminder${reminders.length > 1 ? 's' : ''}` : 'Reminder'}
                      </Text>
                    </TouchableOpacity>
                    
                    {showReminderOptions && (
                      <View style={[
                        styles.advancedOptionsMenu,
                        { right: -40, bottom: 60, width: 220 }
                      ]}>
                        {reminderOptions.map((option) => (
                          <TouchableOpacity
                            key={option.value}
                            style={styles.advancedOption}
                            onPress={() => toggleReminderOption(option.value)}
                          >
                            <Ionicons 
                              name={reminders.includes(option.value) ? "checkmark-circle" : "alarm-outline"} 
                              size={18} 
                              color={reminders.includes(option.value) ? "#FF9F1C" : "#8E8E93"} 
                            />
                            <Text 
                              style={[
                                styles.advancedOptionText,
                                reminders.includes(option.value) && { color: '#FF9F1C', fontWeight: '500' }
                              ]}
                            >
                              {option.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                  
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
                        { right: 0, bottom: 60 }
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
                
                {/* Date picker - platform specific */}
                {renderDatePicker()}
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
  reminderOptionsMenu: {
    position: 'absolute',
    width: 250,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
    maxHeight: 360,
    overflow: 'hidden',
  },
  reminderOptionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  reminderOptionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  reminderOptionsList: {
    maxHeight: 220,
  },
  reminderOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  reminderOptionSelected: {
    backgroundColor: '#FFF8EC',
  },
  reminderOptionText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  reminderOptionTextSelected: {
    fontWeight: '500',
    color: '#FF9F1C',
  },
  reminderActionButton: {
    backgroundColor: '#FF9F1C',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    margin: 16,
    marginTop: 8,
  },
  reminderActionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  datePickerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 1001,
  },
  iosDatePickerWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  iosDatePickerContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  iosDatePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#F8F8F8',
  },
  datePickerCancel: {
    color: '#8E8E93',
    fontWeight: '500',
    fontSize: 16,
  },
  datePickerTitle: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
  datePickerDone: {
    color: '#FF9F1C',
    fontWeight: '700',
    fontSize: 16,
  },
  iosDatePicker: {
    backgroundColor: 'white',
    color: '#000000',
    height: 220,
    width: '100%',
  },
});
