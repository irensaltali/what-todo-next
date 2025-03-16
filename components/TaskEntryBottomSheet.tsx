import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
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
import { createTask, PRIORITY_LEVELS } from '../data/taskService';
import { createTaskReminder } from '../data/taskReminderService';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import { usePostHog } from 'posthog-react-native';
import logger, { EventName } from '../lib/logger';
import * as Sentry from '@sentry/react-native';
import { taskEntryStyles, taskEntryColors } from '../lib/styles/task-entry-bottom-sheet';

const { height } = Dimensions.get('window');
const MARGIN = 16; // Margin for the backdrop effect
const SHEET_MAX_HEIGHT = height * 0.9; // 90% of screen height

interface TaskEntryBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onTaskAdded?: () => void;
}

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
  const [richContent, setRichContent] = useState('');
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
  const [useRichEditor, setUseRichEditor] = useState(true);
  const [editorError, setEditorError] = useState<Error | null>(null);
  
  const translateY = useRef(new Animated.Value(height)).current;
  const titleInputRef = useRef<TextInput>(null);
  const richEditorRef = useRef<RichEditor>(null);
  const plainTextEditorRef = useRef<TextInput>(null);
  const reminderButtonRef = useRef<View>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const { t } = useTranslation();
  const { top } = useSafeAreaInsets();
  const posthog = usePostHog();

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

  // Effect for safely initializing and cleaning up rich editor
  useEffect(() => {
    // When component mounts or becomes visible, initialize editor
    if (isVisible && richEditorRef.current && useRichEditor) {
      console.log('[DEBUG] RichEditor: Sheet became visible, initializing editor');
      // Use setTimeout to ensure the editor has fully mounted
      setTimeout(() => {
        try {
          console.log('[DEBUG] RichEditor: Attempting to set initial content');
          richEditorRef.current?.setContentHTML('');
          console.log('[DEBUG] RichEditor: Initial content set successfully');
        } catch (error) {
          console.error('[DEBUG] RichEditor: Error initializing rich editor:', error);
          // If we get an error, switch to plain text editor
          setEditorError(error as Error);
          setUseRichEditor(false);
        }
      }, 300);
    } else {
      console.log('[DEBUG] RichEditor: Sheet visibility change:', isVisible);
    }

    // Cleanup function for when component unmounts
    return () => {
      // Cleanup any editor state if needed
      if (!isVisible && richEditorRef.current && useRichEditor) {
        console.log('[DEBUG] RichEditor: Cleaning up editor on unmount/close');
        try {
          richEditorRef.current?.setContentHTML('');
          console.log('[DEBUG] RichEditor: Cleanup successful');
        } catch (error) {
          console.log('[DEBUG] RichEditor: Editor cleanup error:', error);
        }
      }
    };
  }, [isVisible, useRichEditor]);

  const resetForm = () => {
    console.log('[DEBUG] RichEditor: Resetting form state');
    setTitle('');
    setDescription('');
    setRichContent('');
    // Don't try to directly manipulate the editor here
    // We'll handle this in the useEffect
    setPriority(0);
    setDate(null);
    setTempDate(null);
    setIsReminderEnabled(false);
    setReminders([]);
    setShowReminderOptions(false);
    setShowAdvancedOptions(false);
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
    console.log('[TaskEntry] Submit button pressed');
    
    // Step 1: Perform all validations upfront
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    setSubmitting(true);
    console.log('[TaskEntry] Submission started');

    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'You must be logged in to create a task');
        setSubmitting(false);
        return;
      }

      // Use the stored content based on which editor is active
      let descriptionHTML = useRichEditor ? richContent.trim() : description.trim();
      console.log('[TaskEntry] Using content from state:', { 
        editorType: useRichEditor ? 'rich' : 'plain',
        contentLength: descriptionHTML.length,
        contentType: typeof descriptionHTML,
        contentPreview: descriptionHTML.substring(0, 50) + (descriptionHTML.length > 50 ? '...' : '')
      });
      
      // Track analytics event for task creation attempt
      logger.trackEvent(posthog, EventName.TASK_CREATION_STARTED, {
        has_deadline: !!date,
        has_description: !!descriptionHTML,
        priority_level: priority,
        uses_rich_editor: useRichEditor,
        has_reminders: reminders.length > 0,
        reminders_count: reminders.length,
      });
      
      // Prepare task data with all required fields
      const taskData = {
        user_id: user.id,
        title: title.trim(),
        description: descriptionHTML || null,
        parent_task_id: null,
        priority: priority,
        is_recursive: false,
        recursion_count: null,
        recursion_end: null,
        outcome_value: null,
        difficulty: null,
        is_deleted: false,
        status: 'ongoing' as 'ongoing',
        deadline: date ? date.toISOString() : null,
      };
      
      console.log('[TaskEntry] Task data prepared:', {
        title: taskData.title,
        descriptionLength: taskData.description ? taskData.description.length : 0,
        priority: taskData.priority,
        deadline: taskData.deadline
      });
      
      // Step 2: Create a temporary ID for the task (for optimistic UI updates)
      const tempTaskId = `temp-${Date.now()}`;
      const tempTaskData = {
        ...taskData,
        id: tempTaskId,
        created_at: new Date().toISOString(),
      };
      
      // Step 3: Update UI state immediately - this feels instant to the user
      if (onTaskAdded) {
        // Create a temp task object for optimistic UI updates
        const optimisticTask = {
          ...tempTaskData,
          // Add any required fields that might be used by the task list
        };
        
        // Notify parent that a task was added - parent can immediately update UI
        onTaskAdded();
      }
      
      // Step 4: Close the form immediately to improve perceived performance
      setHasChanges(false);
      resetForm();
      safelyClose();
      
      // UI is now updated, reset submitting state
      setSubmitting(false);
      
      // Step 5: Perform the actual backend save in the background
      const saveToBackend = async (retryCount = 0, maxRetries = 3) => {
        try {
          const { data, error } = await createTask(taskData);
          
          if (error) {
            throw error;
          }
          
          // Successfully saved to backend!
          console.log('[TaskEntry] Task successfully saved to backend:', data?.id || 'unknown ID');
          
          // Track successful task creation in analytics
          logger.trackEvent(posthog, EventName.TASK_CREATED, {
            task_id: data?.id,
            has_deadline: !!taskData.deadline,
            priority_level: taskData.priority,
          });
          
          // Create reminders if enabled and we have a task ID and date
          if (reminders.length > 0 && date && data && data.id) {
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
            
            await Promise.all(reminderPromises.filter(p => p !== null));
            
            // Track reminder creation analytics
            logger.trackEvent(posthog, EventName.REMINDER_ADDED, {
              task_id: data.id,
              reminders_count: reminders.length,
            });
          }
          
        } catch (error) {
          console.error(`[TaskEntry] Error saving task (attempt ${retryCount + 1}):`, error);
          
          // Log error to Sentry with context
          Sentry.withScope(scope => {
            scope.setTag('action', 'task_creation');
            scope.setTag('retry_count', String(retryCount));
            scope.setExtra('task_title', taskData.title);
            scope.setExtra('priority', taskData.priority);
            scope.setExtra('has_reminders', reminders.length > 0);
            Sentry.captureException(error);
          });
          
          // Track failed task creation in analytics
          logger.trackEvent(posthog, EventName.TASK_CREATION_FAILED, {
            error_message: (error as Error).message,
            retry_count: retryCount,
          });
          
          // Retry on failure if we haven't reached max retries
          if (retryCount < maxRetries) {
            // Exponential backoff: wait longer between each retry
            const backoffTime = Math.pow(2, retryCount) * 1000;
            setTimeout(() => {
              saveToBackend(retryCount + 1, maxRetries);
            }, backoffTime);
          } else {
            // If all retries fail, show a background notification
            // This doesn't block the app, just informs the user
            Alert.alert(
              'Sync Issue',
              'We had trouble saving your task to the cloud. Please check your connection and try again later.',
              [{ text: 'OK' }],
              { cancelable: true }
            );
          }
        }
      };
      
      // Start the background save process
      saveToBackend();
      
    } catch (error) {
      // This only catches errors in the initial validation/preparation phase
      console.error('[TaskEntry] Error preparing task submission:', error);
      
      // Log error to Sentry with context
      Sentry.withScope(scope => {
        scope.setTag('action', 'task_preparation');
        scope.setExtra('task_title', title);
        Sentry.captureException(error);
      });
      
      // Track error in analytics
      logger.trackEvent(posthog, EventName.ERROR_OCCURRED, {
        error_message: (error as Error).message,
      });
      
      Alert.alert('Error', 'Something went wrong while preparing your task. Please try again.');
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
          <View style={taskEntryStyles.datePickerBackdrop}>
            <TouchableOpacity
              style={{flex: 1}}
              activeOpacity={1}
              onPress={handleIOSDateCancel}
            />
            <View style={taskEntryStyles.iosDatePickerWrapper}>
              <View style={taskEntryStyles.iosDatePickerContainer}>
                <View style={taskEntryStyles.iosDatePickerHeader}>
                  <TouchableOpacity onPress={handleIOSDateCancel}>
                    <Text style={taskEntryStyles.datePickerCancel}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={taskEntryStyles.datePickerTitle}>Select Date</Text>
                  <TouchableOpacity onPress={handleIOSDateConfirm}>
                    <Text style={taskEntryStyles.datePickerDone}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={tempDate || date || new Date()}
                  mode={datePickerMode}
                  onChange={handleIOSDateChange}
                  style={taskEntryStyles.iosDatePicker}
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
      <SafeAreaView style={taskEntryStyles.modalContainer}>
        {/* Backdrop with margin effect */}
        <Animated.View 
          style={[
            taskEntryStyles.backdropOuter,
            { opacity }
          ]}
        />
        
        {/* Inner content wrapper with margin */}
        <Animated.View
          style={[
            taskEntryStyles.contentWrapper,
            {
              transform: [{ scale }],
            }
          ]}
        >
          {/* This is a placeholder view for the background content */}
          <View style={taskEntryStyles.contentPlaceholder} />
        </Animated.View>
        
        {/* Sheet container - now positioned higher */}
        <GestureHandlerRootView style={taskEntryStyles.gestureContainer}>
          <GestureDetector gesture={panGesture}>
            <Animated.View 
              style={[
                taskEntryStyles.bottomSheet,
                { 
                  transform: [{ translateY }],
                  maxHeight: SHEET_MAX_HEIGHT,
                }
              ]}
            >
              <View style={taskEntryStyles.handle} />
              
              {/* Add backdrop for closing any open menu when tapping outside */}
              {(showAdvancedOptions || showReminderOptions) && (
                <TouchableOpacity
                  style={taskEntryStyles.menuBackdrop}
                  activeOpacity={1}
                  onPress={handleBackdropPress}
                />
              )}
              
              <KeyboardAvoidingView
                style={taskEntryStyles.content}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
              >
                <View style={taskEntryStyles.headerBar}>
                  <TouchableOpacity 
                    style={taskEntryStyles.headerButton}
                    onPress={handleClose}
                  >
                    <Text style={taskEntryStyles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={taskEntryStyles.headerButton}
                    onPress={handleSubmit}
                    disabled={submitting}
                  >
                    <Text style={submitting ? taskEntryStyles.disabledButtonText : taskEntryStyles.addButtonText}>
                      {submitting ? 'Adding...' : 'Add'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={taskEntryStyles.combinedInputContainer}>
                  <View style={taskEntryStyles.titleContainer}>
                    <TextInput
                      ref={titleInputRef}
                      style={taskEntryStyles.titleInput}
                      placeholder="Task title"
                      value={title}
                      onChangeText={handleTitleChange}
                      returnKeyType="next"
                      placeholderTextColor={taskEntryColors.placeholder}
                      selectionColor={taskEntryColors.primary}
                    />
                  </View>
                </View>
                
                <View style={taskEntryStyles.richEditorContainer}>
                  {useRichEditor ? (
                    <>
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
                        style={taskEntryStyles.richToolbar}
                        iconSize={18}
                        iconContainerStyle={{ paddingHorizontal: 6 }}
                      />
                      <View style={taskEntryStyles.editorErrorWrapper}>
                        <RichEditor
                          ref={richEditorRef}
                          placeholder="Add notes or description..."
                          initialContentHTML=""
                          onChange={(content) => {
                            console.log('[DEBUG] RichEditor: Content changed, type:', typeof content);
                            try {
                              // Only update content if we have a valid string
                              if (typeof content === 'string') {
                                setRichContent(content);
                                setHasChanges(true);
                              } else {
                                console.warn('[DEBUG] RichEditor: Received non-string content');
                                // Try to gracefully handle non-string content
                                if (content && typeof (content as any).toString === 'function') {
                                  setRichContent((content as any).toString());
                                  setHasChanges(true);
                                }
                              }
                            } catch (error) {
                              console.error('[DEBUG] RichEditor: Error in onChange handler:', error);
                              // Switch to plain text as a fallback
                              setEditorError(error as Error);
                              setUseRichEditor(false);
                            }
                          }}
                          onFocus={() => {
                            console.log('[DEBUG] RichEditor: Editor focused');
                          }}
                          onBlur={() => {
                            console.log('[DEBUG] RichEditor: Editor lost focus');
                          }}
                          editorStyle={{
                            backgroundColor: 'transparent',
                            contentCSSText: 'font-size: 14px; padding: 10px 12px; min-height: 110px; color: #2C2C2C; font-family: -apple-system, BlinkMacSystemFont, sans-serif;'
                          }}
                          containerStyle={taskEntryStyles.richEditorContent}
                          useContainer={true}
                        />
                      </View>
                      <View style={taskEntryStyles.editorSwitchWrapper}>
                        <TouchableOpacity 
                          style={taskEntryStyles.editorSwitchButton}
                          onPress={() => setUseRichEditor(false)}
                        >
                          <Text style={taskEntryStyles.editorSwitchText}>
                            Switch to plain text editor
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    // Plain text fallback editor
                    <View style={taskEntryStyles.plainEditorContainer}>
                      <TextInput
                        ref={plainTextEditorRef}
                        style={taskEntryStyles.plainTextEditor}
                        placeholder="Add notes or description..."
                        value={description}
                        onChangeText={(text) => {
                          setDescription(text);
                          setHasChanges(true);
                        }}
                        multiline
                        placeholderTextColor={taskEntryColors.placeholder}
                        selectionColor={taskEntryColors.primary}
                      />
                      {editorError && (
                        <Text style={taskEntryStyles.editorErrorText}>
                          Rich editor unavailable. Using plain text mode.
                        </Text>
                      )}
                      <View style={taskEntryStyles.editorSwitchWrapper}>
                        <TouchableOpacity 
                          style={taskEntryStyles.editorSwitchButton}
                          onPress={() => {
                            setEditorError(null);
                            setUseRichEditor(true);
                          }}
                        >
                          <Text style={taskEntryStyles.editorSwitchText}>
                            Try rich text editor
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
                
                <View style={taskEntryStyles.metadataRow}>
                  <TouchableOpacity 
                    style={taskEntryStyles.metadataButton}
                    onPress={openDatePicker}
                  >
                    <MaterialIcons 
                      name="calendar-today" 
                      size={20} 
                      color={date ? taskEntryColors.calendar.active : taskEntryColors.calendar.inactive} 
                    />
                    <Text style={[taskEntryStyles.metadataText, date && taskEntryStyles.metadataActive]}>
                      {formatDisplayDate(date)}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={taskEntryStyles.metadataButton}
                    onPress={handlePriorityChange}
                  >
                    <Ionicons 
                      name="flag-outline" 
                      size={22} 
                      color={priority > 0 ? taskEntryColors.flag.active : taskEntryColors.flag.inactive} 
                    />
                    <Text style={[taskEntryStyles.metadataText, priority > 0 && taskEntryStyles.metadataActive]}>
                      {priority > 0 ? `P${priority}` : 'Priority'}
                    </Text>
                  </TouchableOpacity>
                  
                  <View>
                    <TouchableOpacity 
                      ref={reminderButtonRef}
                      style={taskEntryStyles.metadataButton}
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
                        color={reminders.length > 0 ? taskEntryColors.reminder.active : taskEntryColors.reminder.inactive} 
                      />
                      <Text style={[taskEntryStyles.metadataText, reminders.length > 0 && taskEntryStyles.metadataActive]}>
                        {reminders.length > 0 ? `${reminders.length} Reminder${reminders.length > 1 ? 's' : ''}` : 'Reminder'}
                      </Text>
                    </TouchableOpacity>
                    
                    {showReminderOptions && (
                      <View style={[
                        taskEntryStyles.advancedOptionsMenu,
                        { right: -40, bottom: 60, width: 220 }
                      ]}>
                        {reminderOptions.map((option) => (
                          <TouchableOpacity
                            key={option.value}
                            style={taskEntryStyles.advancedOption}
                            onPress={() => toggleReminderOption(option.value)}
                          >
                            <Ionicons 
                              name={reminders.includes(option.value) ? "checkmark-circle" : "alarm-outline"} 
                              size={18} 
                              color={reminders.includes(option.value) ? taskEntryColors.primary : taskEntryColors.text.secondary} 
                            />
                            <Text 
                              style={[
                                taskEntryStyles.advancedOptionText,
                                reminders.includes(option.value) && { color: taskEntryColors.primary, fontWeight: '500' }
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
                      style={taskEntryStyles.metadataButton}
                      onPress={handleToggleAdvancedOptions}
                    >
                      <Ionicons name="ellipsis-horizontal" size={22} color={taskEntryColors.text.secondary} />
                      <Text style={taskEntryStyles.metadataText}>More</Text>
                    </TouchableOpacity>
                    
                    {showAdvancedOptions && (
                      <View style={[
                        taskEntryStyles.advancedOptionsMenu,
                        { right: 0, bottom: 60 }
                      ]}>
                        <TouchableOpacity style={taskEntryStyles.advancedOption}>
                          <Ionicons name="time-outline" size={18} color={taskEntryColors.text.secondary} />
                          <Text style={taskEntryStyles.advancedOptionText}>Set due time</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={taskEntryStyles.advancedOption}>
                          <Ionicons name="repeat-outline" size={18} color={taskEntryColors.text.secondary} />
                          <Text style={taskEntryStyles.advancedOptionText}>Make recurring</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={taskEntryStyles.advancedOption}>
                          <Ionicons name="list-outline" size={18} color={taskEntryColors.text.secondary} />
                          <Text style={taskEntryStyles.advancedOptionText}>Add subtasks</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={taskEntryStyles.advancedOption}>
                          <Ionicons name="bookmark-outline" size={18} color={taskEntryColors.text.secondary} />
                          <Text style={taskEntryStyles.advancedOptionText}>Add tags</Text>
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
