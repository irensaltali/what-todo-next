import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import * as theme from './theme';

// Define properly typed content styles
export interface ContentStyles {
  // Container
  container: ViewStyle;
  
  // Search
  searchSection: ViewStyle;
  searchBar: ViewStyle;
  searchPlaceholder: TextStyle;
  
  // Section
  section: ViewStyle;
  sectionTitle: TextStyle;
  
  // List items
  listItem: ViewStyle;
  borderBottom: ViewStyle;
  
  // FAQ styles
  faqItem: ViewStyle;
  question: TextStyle;
  answer: TextStyle;
  
  // Contact styles
  contactOption: ViewStyle;
  contactIcon: ViewStyle;
  contactInfo: ViewStyle;
  contactTitle: TextStyle;
  contactDescription: TextStyle;

  // Language styles
  backButton: ViewStyle;
  loadingOverlay: ViewStyle;
  loadingText: TextStyle;
  languageItem: ViewStyle;
  selectedLanguage: ViewStyle;
  selectedText: TextStyle;
  languageInfo: ViewStyle;
  languageName: TextStyle;
  regionName: TextStyle;
  noteText: TextStyle;
}

// Create content styles
export const contentStyles = StyleSheet.create<ContentStyles>({
  // Container
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  
  // Search
  searchSection: {
    padding: theme.spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadows.small,
  },
  searchPlaceholder: {
    marginLeft: theme.spacing.xs,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  
  // Section
  section: {
    backgroundColor: theme.colors.background.primary,
    marginTop: theme.spacing.xxl,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.medium,
  },
  
  // List items
  listItem: {
    padding: theme.spacing.lg,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.medium,
  },
  
  // FAQ styles
  faqItem: {
    padding: theme.spacing.lg,
  },
  question: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  answer: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.md,
  },
  
  // Contact styles
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF3E0', // Consider adding this to theme colors
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs / 2,
  },
  contactDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },

  // Language styles
  backButton: {
    padding: theme.spacing.xs,
    marginLeft: -4,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  loadingText: {
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
  },
  selectedLanguage: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)', // Success color with opacity
  },
  selectedText: {
    fontWeight: theme.typography.fontWeight.bold as any,
    color: '#007AFF', // iOS blue color - might want to add to theme
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs / 2,
  },
  regionName: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  noteText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.placeholder,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
    marginHorizontal: theme.spacing.lg,
  },
}); 
