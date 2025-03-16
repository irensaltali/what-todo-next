import { Platform } from 'react-native';

/**
 * App-wide theme definitions for consistent styling
 */

// Colors
export const colors = {
  // Primary colors
  primary: '#FF9F1C',
  secondary: '#FF6B00',
  
  // Text colors
  text: {
    primary: '#1C1C1E',
    secondary: '#6C757D',
    placeholder: '#8E8E93',
    error: '#FF3B30',
    success: '#34C759',
    light: '#E0E0E0',
  },
  
  // Background colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F8F9FA',
    tertiary: '#F2F2F7',
    card: '#FFFFFF',
    modal: 'rgba(0, 0, 0, 0.5)',
  },
  
  // Border colors
  border: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: '#E5E5EA',
    error: '#FF3B30',
  },
  
  // Icon colors
  icon: {
    primary: '#1C1C1E',
    secondary: '#8E8E93',
    accent: '#FF9F1C',
  },
  
  // Dark mode colors
  dark: {
    background: {
      primary: '#121212',
      secondary: '#1E1E1E',
      tertiary: '#252525',
      card: '#2C2C2E',
      modal: 'rgba(0, 0, 0, 0.7)',
    },
    text: {
      primary: '#E0E0E0',
      secondary: '#AAAAAA',
    },
    border: {
      light: 'rgba(255, 255, 255, 0.1)',
      medium: '#3A3A3C',
    },
    icon: {
      primary: '#E0E0E0',
      secondary: '#BBBBBB',
    }
  }
};

// Typography
export const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    sm: 16,
    md: 20,
    lg: 24,
  },
};

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Border radius
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  round: 9999,
};

// Shadows
export const shadows = {
  small: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 1,
    },
    android: {
      elevation: 2,
    },
    default: {},
  }),
  medium: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    android: {
      elevation: 3,
    },
    default: {},
  }),
  large: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
    android: {
      elevation: 6,
    },
    default: {},
  }),
  // Dark mode shadows (stronger)
  dark: {
    small: Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
      default: {},
    }),
    medium: Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      default: {},
    }),
  }
};

// Common layout styles
export const layouts = {
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  section: {
    backgroundColor: colors.background.card,
    marginTop: spacing.lg,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.medium,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    ...shadows.medium,
  },
};

// Button styles
export const buttons = {
  primary: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.small,
  },
  primaryText: {
    color: '#fff',
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  secondary: {
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  secondaryText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  danger: {
    backgroundColor: colors.text.error,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  dangerText: {
    color: '#fff',
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
};

// Form styles
export const forms = {
  input: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    ...shadows.small,
  },
  inputError: {
    borderWidth: 1,
    borderColor: colors.text.error,
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.error,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
};

// Authentication styles
export const auth = {
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.xxl,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  image: {
    width: '100%',
    height: 200,
  },
  title: {
    fontSize: 32,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    marginBottom: spacing.xxxl,
    color: colors.text.secondary,
  },
  form: {
    gap: spacing.lg,
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.text.error,
  },
  errorText: {
    color: colors.text.error,
    fontSize: typography.fontSize.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.background.tertiary,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.md,
  },
  footer: {
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
    marginTop: spacing.xxxl,
    color: colors.text.secondary,
  },
  footerLink: {
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
}; 
