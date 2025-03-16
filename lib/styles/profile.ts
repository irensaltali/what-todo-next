import { StyleSheet, ViewStyle, TextStyle, ImageStyle, Platform } from 'react-native';
import * as theme from './theme';

// Define properly typed profile styles
export interface ProfileStyles {
  // Container and layout
  container: ViewStyle;
  
  // Status bar
  statusBar: ViewStyle;
  timeText: TextStyle;
  
  // Profile section
  profileSection: ViewStyle;
  metricsRow: ViewStyle;
  profileImage: ImageStyle;
  userName: TextStyle;
  metric: ViewStyle;
  metricNumber: TextStyle;
  metricLabel: TextStyle;
  
  // Buttons
  editButton: ViewStyle;
  editButtonText: TextStyle;
  signOutButton: ViewStyle;
  signOutText: TextStyle;
  
  // Menu section
  menuSection: ViewStyle;
  menuItem: ViewStyle;
  menuItemContent: ViewStyle;
  menuItemLeft: ViewStyle;
  menuItemLabel: TextStyle;
}

// Create profile styles
export const profileStyles = StyleSheet.create<ProfileStyles>({
  // Container and layout
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  
  // Status bar
  statusBar: {
    backgroundColor: theme.colors.background.primary,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  timeText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium as any,
  },
  
  // Profile section
  profileSection: {
    alignItems: 'center',
    padding: theme.spacing.lg,
    marginTop: theme.spacing.xs,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  userName: {
    fontSize: 24,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.text.primary,
  },
  metric: {
    alignItems: 'center',
  },
  metricNumber: {
    fontSize: 24,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs / 2,
  },
  metricLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  
  // Buttons
  editButton: {
    backgroundColor: theme.colors.secondary,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xxl,
    height: 48,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.small,
  },
  editButtonText: {
    color: '#fff',
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold as any,
  },
  signOutButton: {
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.xxl,
    height: 48,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE5E5', // Consider adding a danger background color to theme
  },
  signOutText: {
    color: theme.colors.text.error,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold as any,
  },
  
  // Menu section
  menuSection: {
    backgroundColor: theme.colors.background.primary,
    marginTop: theme.spacing.xxl,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
    ...theme.shadows.small,
  },
  menuItem: {
    height: 56,
    justifyContent: 'center',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    height: '100%',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.medium,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
}); 
