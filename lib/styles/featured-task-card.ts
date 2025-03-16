import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import * as theme from './theme';

// Define properly typed featured task card styles
export interface FeaturedTaskCardStyles {
  // Container
  cardContainer: ViewStyle;
  
  // Header
  header: ViewStyle;
  headerLeft: ViewStyle;
  featuredLabel: TextStyle;
  taskTitle: TextStyle;
  priorityBadge: ViewStyle;
  priorityText: TextStyle;
  
  // Content
  taskDescription: TextStyle;
  
  // Categories
  categoriesContainer: ViewStyle;
  categoryBadge: ViewStyle;
  categoryText: TextStyle;
  
  // Footer
  footer: ViewStyle;
  deadlineContainer: ViewStyle;
  deadlineText: TextStyle;
  focusButton: ViewStyle;
  focusButtonText: TextStyle;
}

// Colors for the featured task card
export const featureCardColors = {
  gradient: ['#1A2151', '#1B3976', '#2C5F9B'] as readonly string[],
  accent: '#7EB6FF',
  text: {
    primary: '#fff',
    secondary: '#B8C2CC',
  },
  background: {
    badge: 'rgba(126, 182, 255, 0.2)',
    category: 'rgba(255, 255, 255, 0.1)',
  },
  border: 'rgba(255, 255, 255, 0.1)',
};

// Create featured task card styles
export const featuredTaskCardStyles = StyleSheet.create<FeaturedTaskCardStyles>({
  // Container
  cardContainer: {
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.medium,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  headerLeft: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  featuredLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: featureCardColors.accent,
    fontWeight: theme.typography.fontWeight.semibold as any,
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: featureCardColors.text.primary,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: featureCardColors.background.badge,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    gap: 4,
  },
  priorityText: {
    fontSize: theme.typography.fontSize.sm,
    color: featureCardColors.accent,
    fontWeight: theme.typography.fontWeight.semibold as any,
  },
  
  // Content
  taskDescription: {
    fontSize: theme.typography.fontSize.md,
    color: featureCardColors.text.secondary,
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  },
  
  // Categories
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  categoryBadge: {
    backgroundColor: featureCardColors.background.category,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: 4,
    paddingHorizontal: theme.spacing.sm,
  },
  categoryText: {
    fontSize: theme.typography.fontSize.sm,
    color: featureCardColors.text.primary,
  },
  
  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: featureCardColors.border,
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deadlineText: {
    fontSize: theme.typography.fontSize.sm,
    color: featureCardColors.text.secondary,
  },
  focusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: featureCardColors.background.badge,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: 6,
    paddingHorizontal: theme.spacing.md,
    gap: 4,
  },
  focusButtonText: {
    color: featureCardColors.accent,
    fontWeight: theme.typography.fontWeight.semibold as any,
    fontSize: theme.typography.fontSize.md,
  },
}); 
