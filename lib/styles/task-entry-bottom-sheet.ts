import { StyleSheet, ViewStyle, TextStyle, Dimensions, Platform } from 'react-native';
import * as theme from './theme';
import { spacing, typography } from './theme';

const { height } = Dimensions.get('window');
const MARGIN = 16; // Margin for the backdrop effect
const SHEET_MAX_HEIGHT = height * 0.9; // 90% of screen height

// Color palette for the task entry bottom sheet
export const taskEntryColors = {
  primary: '#FF9F1C',
  background: '#FFFFFF',
  text: {
    primary: '#2C2C2C',
    secondary: '#8E8E93',
    disabled: '#CCCCCC',
    active: '#FF9F1C',
  },
  border: {
    light: '#EEEEEE',
    medium: '#DDDDDD',
    input: '#DDDDDD',
  },
  handle: '#DEDEDE',
  backdrop: '#000000',
  divider: '#EEEEEE',
  toolbarBackground: '#F8F8F8',
  error: '#FF3B30',
  placeholder: 'rgba(142, 142, 147, 0.6)',
  flag: {
    active: '#FF9F1C',
    inactive: '#8E8E93',
  },
  calendar: {
    active: '#FF9F1C',
    inactive: '#8E8E93',
  },
  reminder: {
    active: '#FF9F1C',
    inactive: '#8E8E93',
  },
  menuBackground: 'white',
  shadow: '#000000',
};

// Define types for all styles used in the component
export interface TaskEntryBottomSheetStyles {
  // Modal and backdrop
  modalContainer: ViewStyle;
  backdropOuter: ViewStyle;
  contentWrapper: ViewStyle;
  contentPlaceholder: ViewStyle;
  gestureContainer: ViewStyle;
  bottomSheet: ViewStyle;
  handle: ViewStyle;
  menuBackdrop: ViewStyle;
  content: ViewStyle;
  
  // Header and buttons
  headerBar: ViewStyle;
  headerButton: ViewStyle;
  cancelButtonText: TextStyle;
  addButtonText: TextStyle;
  disabledButtonText: TextStyle;
  
  // Input containers
  combinedInputContainer: ViewStyle;
  titleContainer: ViewStyle;
  titleInput: TextStyle;
  divider: ViewStyle;
  
  // Rich editor
  richEditorContainer: ViewStyle;
  richToolbar: ViewStyle;
  richEditorContent: ViewStyle;
  editorErrorWrapper: ViewStyle;
  plainEditorContainer: ViewStyle;
  plainTextEditor: TextStyle;
  editorErrorText: TextStyle;
  editorSwitchWrapper: ViewStyle;
  editorSwitchButton: ViewStyle;
  editorSwitchText: TextStyle;
  
  // Metadata row
  metadataRow: ViewStyle;
  metadataButton: ViewStyle;
  metadataText: TextStyle;
  metadataActive: TextStyle;
  
  // Advanced options menu
  advancedOptionsMenu: ViewStyle;
  advancedOption: ViewStyle;
  advancedOptionText: TextStyle;
  
  // Reminder options
  reminderOptionsMenu: ViewStyle;
  reminderOptionsHeader: ViewStyle;
  reminderOptionsTitle: TextStyle;
  reminderOptionsList: ViewStyle;
  reminderOption: ViewStyle;
  reminderOptionSelected: ViewStyle;
  reminderOptionText: TextStyle;
  reminderOptionTextSelected: TextStyle;
  reminderActionButton: ViewStyle;
  reminderActionButtonText: TextStyle;
  
  // Date picker
  datePickerBackdrop: ViewStyle;
  iosDatePickerWrapper: ViewStyle;
  iosDatePickerContainer: ViewStyle;
  iosDatePickerHeader: ViewStyle;
  datePickerCancel: TextStyle;
  datePickerTitle: TextStyle;
  datePickerDone: TextStyle;
  iosDatePicker: ViewStyle;
}

// Create the styles
export const taskEntryStyles = StyleSheet.create<TaskEntryBottomSheetStyles>({
  // Modal and backdrop
  modalContainer: {
    flex: 1,
  },
  backdropOuter: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: taskEntryColors.backdrop,
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
    top: Platform.OS === 'ios' ? 44 : 0, // Leave space for status bar
  },
  bottomSheet: {
    backgroundColor: taskEntryColors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 0,
    shadowColor: taskEntryColors.shadow,
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
    backgroundColor: taskEntryColors.handle,
    alignSelf: 'center',
    marginTop: 8,
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 100,
  },
  content: {
    padding: 16,
    flex: 1,
  },
  
  // Header and buttons
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
  cancelButtonText: {
    color: taskEntryColors.text.secondary,
    fontWeight: '500',
    fontSize: 16,
  },
  addButtonText: {
    color: taskEntryColors.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  disabledButtonText: {
    color: taskEntryColors.text.disabled,
    fontWeight: '700',
    fontSize: 16,
  },
  
  // Input containers
  combinedInputContainer: {
    borderWidth: 1,
    borderColor: taskEntryColors.border.input,
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
    flex: 0,
    shadowColor: taskEntryColors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  titleInput: {
    flex: 1,
    height: 35,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'left',
    paddingHorizontal: 0,
    color: taskEntryColors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: taskEntryColors.divider,
    marginHorizontal: 0,
  },
  
  // Rich editor
  richEditorContainer: {
    minHeight: 146,
    maxHeight: Math.min(250, height * 0.3),
    marginTop: 0,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: taskEntryColors.border.input,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: taskEntryColors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  richToolbar: {
    backgroundColor: taskEntryColors.toolbarBackground,
    borderBottomWidth: 1,
    borderBottomColor: taskEntryColors.border.light,
    height: 32,
    paddingHorizontal: 10,
  },
  richEditorContent: {
    flex: 1,
    minHeight: 110,
  },
  editorErrorWrapper: {
    flex: 1,
    position: 'relative',
  },
  plainEditorContainer: {
    flex: 1,
    padding: 12,
    backgroundColor: taskEntryColors.background,
  },
  plainTextEditor: {
    flex: 1,
    height: 150,
    fontSize: 14,
    color: taskEntryColors.text.primary,
    textAlignVertical: 'top',
  },
  editorErrorText: {
    color: taskEntryColors.error,
    fontSize: 12,
    marginTop: 6,
  },
  editorSwitchWrapper: {
    alignItems: 'center',
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F2',
  },
  editorSwitchButton: {
    paddingVertical: 6,
  },
  editorSwitchText: {
    color: taskEntryColors.text.secondary,
    fontSize: 12,
  },
  
  // Metadata row
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: taskEntryColors.border.light,
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
    color: taskEntryColors.text.secondary,
    marginTop: 4,
  },
  metadataActive: {
    color: taskEntryColors.text.active,
    fontWeight: '500',
  },
  
  // Advanced options menu
  advancedOptionsMenu: {
    position: 'absolute',
    width: 180,
    backgroundColor: taskEntryColors.menuBackground,
    borderRadius: 8,
    shadowColor: taskEntryColors.shadow,
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
  
  // Reminder options
  reminderOptionsMenu: {
    position: 'absolute',
    width: 250,
    backgroundColor: taskEntryColors.menuBackground,
    borderRadius: 12,
    shadowColor: taskEntryColors.shadow,
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
    borderBottomColor: taskEntryColors.border.light,
  },
  reminderOptionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: taskEntryColors.text.primary,
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
    color: taskEntryColors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  reminderOptionTextSelected: {
    fontWeight: '500',
    color: taskEntryColors.text.active,
  },
  reminderActionButton: {
    backgroundColor: taskEntryColors.primary,
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
  
  // Date picker
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
    backgroundColor: taskEntryColors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: taskEntryColors.shadow,
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
    borderBottomColor: taskEntryColors.border.light,
    backgroundColor: taskEntryColors.toolbarBackground,
  },
  datePickerCancel: {
    color: taskEntryColors.text.secondary,
    fontWeight: '500',
    fontSize: 16,
  },
  datePickerTitle: {
    color: taskEntryColors.text.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  datePickerDone: {
    color: taskEntryColors.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  iosDatePicker: {
    backgroundColor: taskEntryColors.background,
    height: 220,
    width: '100%',
  },
}); 
