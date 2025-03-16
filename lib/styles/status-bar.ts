import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import * as theme from './theme';
import { spacing, typography } from './theme';

// Define types for all styles used in the component
export interface StatusBarStyles {
  container: ViewStyle;
  timeText: TextStyle;
}

// Create the styles
export const statusBarStyles = StyleSheet.create<StatusBarStyles>({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  timeText: {
    fontSize: typography.fontSize.md,
    fontWeight: '500',
  },
});

// Helper function to create dynamic container style
export const getStatusBarContainerStyle = (
  topInset: number,
  backgroundColor: string,
  shadow: ViewStyle,
  showBorder: boolean,
  borderColor?: string
): ViewStyle => {
  const style: ViewStyle = {
    paddingTop: topInset,
    backgroundColor,
    ...shadow,
  };

  if (showBorder && borderColor) {
    style.borderBottomWidth = 1;
    style.borderBottomColor = borderColor;
  }

  return style;
}; 
