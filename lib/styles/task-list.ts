import { StyleSheet, ViewStyle, TextStyle, Dimensions, Platform } from 'react-native';
import * as theme from './theme';

// Define properly typed task list styles
export interface TaskListStyles {
  // Container and layout
  container: ViewStyle;
  header: ViewStyle;
  title: TextStyle;
  
  // List sections
  section: ViewStyle;
  listHeader: ViewStyle;
  listTitle: TextStyle;
  
  // Task items
  swipeContainer: ViewStyle;
  taskItem: ViewStyle;
  checkboxContainer: ViewStyle;
  taskContentContainer: ViewStyle;
  taskTitleContainer: ViewStyle;
  taskTitle: TextStyle;
  checkbox: ViewStyle;
  checkboxChecked: ViewStyle;
  
  // Swipe actions
  rightActions: ViewStyle;
  actionButton: ViewStyle;
  archiveButton: ViewStyle;
  deleteButton: ViewStyle;
  actionText: TextStyle;
  
  // Empty state
  emptyState: ViewStyle;
  emptyStateText: TextStyle;
  emptyStateHint: TextStyle;
  emptyListContainer: ViewStyle;
  loader: ViewStyle;
}

// Create task list styles
export const taskListStyles = StyleSheet.create<TaskListStyles>({
  // Container and layout
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  title: {
    fontSize: 30,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.text.primary,
  },
  
  // List sections
  section: {
    marginBottom: theme.spacing.lg,
  },
  listHeader: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: `${theme.colors.background.secondary}CC`, // With opacity
  },
  listTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold as any,
    color: theme.colors.text.primary,
  },
  
  // Task items
  swipeContainer: {
    backgroundColor: theme.colors.background.secondary,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    borderBottomColor: theme.colors.background.secondary,
    borderBottomWidth: 2,
  },
  checkboxContainer: {
    paddingRight: theme.spacing.sm,
  },
  taskContentContainer: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    marginLeft: theme.spacing.xs / 2,
  },
  taskTitleContainer: {
    flex: 1,
  },
  taskTitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.text.placeholder,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 0, // Remove left margin as it's now on the left side
  },
  checkboxChecked: {
    backgroundColor: theme.colors.text.placeholder,
    borderColor: theme.colors.text.placeholder,
  },
  
  // Swipe actions
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 120,
  },
  actionButton: {
    width: 60,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  archiveButton: {
    backgroundColor: '#FFC247', // Consider adding to theme colors
  },
  deleteButton: {
    backgroundColor: theme.colors.text.error,
  },
  actionText: {
    color: '#fff',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold as any,
  },
  
  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    marginTop: theme.spacing.lg,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.placeholder,
    textAlign: 'center',
  },
  emptyStateHint: {
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.placeholder,
    textAlign: 'center',
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100%', // Ensure it fills the whole screen
  },
  loader: {
    padding: theme.spacing.lg,
  },
}); 
