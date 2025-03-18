import { createTheme, useTheme as useRestyleTheme } from '@shopify/restyle';

const palette = {
  primary: '#007AFF',
  secondary: '#5856D6',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#8E8E93',
  lightGray: '#C7C7CC',
  background: '#F2F2F7',
  error: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',
};

export const theme = createTheme({
  colors: {
    primary: palette.primary,
    secondary: palette.secondary,
    white: palette.white,
    black: palette.black,
    gray: palette.gray,
    lightGray: palette.lightGray,
    background: palette.background,
    error: palette.error,
    success: palette.success,
    warning: palette.warning,
    text: {
      primary: palette.black,
      secondary: palette.gray,
      placeholder: palette.lightGray,
    } as const,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadii: {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
  },
});

export type Theme = typeof theme;
export const useTheme = useRestyleTheme<Theme>; 
