import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import * as theme from './theme';

// Define properly typed layout styles
export interface LayoutStyles {
  // Stack screen options
  headerStyle: ViewStyle;
  headerTitleStyle: TextStyle;
  
  // Tab styles
  tabBarStyle: ViewStyle;
  tabBarItemStyle: ViewStyle;
  
  // Add Button styles
  addButton: ViewStyle;
  addButtonPressed: ViewStyle;
  addButtonInner: ViewStyle;
}

// Create layout styles
export const layoutStyles = StyleSheet.create<LayoutStyles>({
  // Stack screen options
  headerStyle: {
    backgroundColor: theme.colors.background.primary,
    borderBottomWidth: 0,
  },
  headerTitleStyle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold as any,
    color: theme.colors.text.primary,
  },
  
  // Tab styles
  tabBarStyle: {
    backgroundColor: theme.colors.background.primary,
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    height: 84,
    paddingBottom: 20,
    paddingHorizontal: theme.spacing.lg,
  },
  tabBarItemStyle: {
    paddingVertical: theme.spacing.xs,
  },
  
  // Add Button styles
  addButton: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
    width: 64,
    height: 64,
    alignSelf: 'center',
  },
  addButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.95 }],
  },
  addButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.medium,
  },
}); 
