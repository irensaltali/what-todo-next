import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import * as theme from './theme';

// Define properly typed date picker styles
export interface DatePickerStyles {
  // Container
  container: ViewStyle;
  dateText: TextStyle;
  errorText: TextStyle;
  
  // Modal
  modalOverlay: ViewStyle;
  modalContent: ViewStyle;
  modalHeader: ViewStyle;
  modalTitle: TextStyle;
  modalCloseButton: ViewStyle;
  picker: ViewStyle;
}

// Create date picker styles
export const datePickerStyles = StyleSheet.create<DatePickerStyles>({
  // Container
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  dateText: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
  },
  errorText: {
    fontSize: theme.typography.fontSize.xs,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
  
  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold as any,
  },
  modalCloseButton: {
    padding: theme.spacing.xs,
  },
  picker: {
    height: 300,
  },
}); 
