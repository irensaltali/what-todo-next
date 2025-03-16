import { StyleSheet, ViewStyle, TextStyle, ImageStyle, Dimensions } from 'react-native';
import * as theme from './theme';

// Get screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Create a responsive design system
const size = {
  base: 8,
  font: screenWidth * 0.04,
  radius: 8,
  padding: screenWidth * 0.04,
};

// Responsive font sizes
const fontSize = {
  small: size.font * 0.75,
  medium: size.font,
  large: size.font * 1.5,
  xlarge: size.font * 2,
};

// Responsive spacing
const spacing = {
  xs: size.base * 0.5,
  sm: size.base * 1.1,
  md: size.base * 1.5,
  lg: size.base * 2,
  xl: size.base * 3,
};

// Responsive sizing
const sizing = {
  avatarSize: screenWidth * 0.12,
  iconSize: {
    small: screenWidth * 0.05,
    medium: screenWidth * 0.06,
    large: screenWidth * 0.08,
  },
  progressCircle: screenWidth * 0.12,
  progressWidth: screenWidth * 0.012,
  statusIcon: screenWidth * 0.1,
  statusDot: screenWidth * 0.02,
  settingsButton: screenWidth * 0.1,
};

// Status colors
export const STATUS_COLORS = {
  ongoing: '#5593F1',
  inprogress: '#FFC247',
  canceled: '#F26E56',
  completed: '#52C1C4',
};

export const STATUS_ICON_COLORS = {
  ongoing: '#4C85DB',
  inprogress: '#E5B03F',
  canceled: '#DA624D',
  completed: '#4AAFB2',
};

// Define properly typed home styles
export interface HomeStyles {
  // Container and layout
  container: ViewStyle;
  fixedHeaderContainer: ViewStyle;
  scrollView: ViewStyle;
  scrollContent: ViewStyle;
  
  // Header section
  header: ViewStyle;
  headerLeft: ViewStyle;
  headerRightContainer: ViewStyle;
  avatar: ImageStyle;
  greeting: TextStyle;
  subtitle: TextStyle;
  
  // Collapsible section
  collapsibleContainer: ViewStyle;
  sectionTitleContainer: ViewStyle;
  sectionTitle: TextStyle;
  collapsibleContent: ViewStyle;
  
  // Status summary
  statusSummary: ViewStyle;
  statusBadge: ViewStyle;
  statusDot: ViewStyle;
  statusCount: TextStyle;
  
  // Status grid
  statusGrid: ViewStyle;
  statusCard: ViewStyle;
  statusContent: ViewStyle;
  statusIcon: ViewStyle;
  statusTextContainer: ViewStyle;
  statusTitle: TextStyle;
  statusLabel: TextStyle;
  
  // Tasks section
  tasksSection: ViewStyle;
  taskCard: ViewStyle;
  taskInfo: ViewStyle;
  taskTitle: TextStyle;
  taskType: TextStyle;
  taskCount: TextStyle;
  emptyStateText: TextStyle;
}

// Export responsive variables for use in components
export const homeResponsive = {
  size,
  fontSize,
  spacing,
  sizing,
  statusSectionHeight: screenHeight * 0.16
};

// Create home styles
export const homeStyles = StyleSheet.create<HomeStyles>({
  // Container and layout
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  fixedHeaderContainer: {
    backgroundColor: theme.colors.background.secondary,
    zIndex: 10,
    paddingHorizontal: spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
  },
  
  // Header section
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: sizing.avatarSize,
    height: sizing.avatarSize,
    borderRadius: sizing.avatarSize / 2,
    marginRight: spacing.md,
  },
  greeting: {
    fontSize: fontSize.large,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  subtitle: {
    fontSize: fontSize.small,
    color: theme.colors.text.placeholder,
    marginTop: spacing.xs,
  },
  
  // Collapsible section
  collapsibleContainer: {
    paddingHorizontal: spacing.md,
    backgroundColor: 'transparent',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  sectionTitle: {
    fontSize: fontSize.medium,
    fontWeight: '600',
    color: theme.colors.text.placeholder,
    marginBottom: spacing.sm,
  },
  collapsibleContent: {
    overflow: 'hidden',
  },
  
  // Status summary
  statusSummary: {
    flexDirection: 'row',
    marginRight: spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  statusDot: {
    width: sizing.statusDot,
    height: sizing.statusDot,
    borderRadius: sizing.statusDot / 2,
    marginRight: spacing.xs,
  },
  statusCount: {
    fontSize: fontSize.small,
    color: theme.colors.text.placeholder,
    fontWeight: '500',
  },
  
  // Status grid
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    paddingHorizontal: 0,
  },
  statusCard: {
    width: '48%',
    borderRadius: size.radius * 1.5,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    ...theme.shadows.small,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    width: sizing.statusIcon,
    height: sizing.statusIcon,
    borderRadius: sizing.statusIcon / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTextContainer: {
    flex: 1,
    justifyContent: 'space-between',
    marginLeft: spacing.sm,
  },
  statusTitle: {
    fontSize: fontSize.medium,
    fontWeight: 'bold',
    color: '#080100',
    marginBottom: spacing.xs / 2,
  },
  statusLabel: {
    fontSize: fontSize.small,
    color: '#080100',
    opacity: 0.9,
  },
  
  // Tasks section
  tasksSection: {
    flex: 1,
    paddingHorizontal: 0,
    marginHorizontal: spacing.md,
    marginTop: 0,
    marginBottom: spacing.sm,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
    borderRadius: size.radius * 1.5,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#080100',
    ...theme.shadows.medium,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: fontSize.medium,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: spacing.xs,
  },
  taskType: {
    fontSize: fontSize.small,
    color: theme.colors.text.placeholder,
    marginBottom: spacing.xs,
  },
  taskCount: {
    fontSize: fontSize.small * 0.9,
    color: theme.colors.text.placeholder,
  },
  emptyStateText: {
    fontSize: fontSize.medium,
    color: theme.colors.text.placeholder,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
}); 
