import { StyleSheet, ViewStyle, TextStyle, Platform, Dimensions } from 'react-native';
import * as theme from './theme';

const { width } = Dimensions.get('window');

// Define theme colors for focus task view
export const focusViewColors = {
  light: {
    background: ['#FAFAFA', '#F5F5F5', '#EFEFEF'] as const,
    text: '#333',
    subText: '#777',
    iconColor: '#555',
    modeToggleBg: 'rgba(0, 0, 0, 0.05)',
    resetButtonBg: 'rgba(0, 0, 0, 0.05)',
    startButtonBg: '#FF9F1C',
    circleBackground: '#E0E0E0',
    dominoMarkerDark: '#666',
    dominoMarkerLight: '#CCC',
  },
  dark: {
    background: ['#121212', '#1E1E1E', '#252525'] as const,
    text: '#E0E0E0',
    subText: '#AAAAAA',
    iconColor: '#BBBBBB',
    modeToggleBg: 'rgba(255, 255, 255, 0.1)',
    resetButtonBg: 'rgba(255, 255, 255, 0.1)',
    startButtonBg: '#FF9F1C', // Same accent color in dark mode
    circleBackground: '#444444',
    dominoMarkerDark: '#AAAAAA',
    dominoMarkerLight: '#666666',
  }
};

// Define properly typed focus task view styles
export interface FocusTaskViewStyles {
  // Container and layout
  container: ViewStyle;
  closeButton: ViewStyle;
  
  // Mode toggle
  modeToggle: ViewStyle;
  modeButton: ViewStyle;
  modeButtonActive: ViewStyle;
  modeButtonText: TextStyle;
  modeButtonTextActive: TextStyle;
  
  // Task info
  taskTitle: TextStyle;
  
  // Clock section
  clockSection: ViewStyle;
  circleContainer: ViewStyle;
  clockTextContainer: ViewStyle;
  clockText: TextStyle;
  statusText: TextStyle;
  
  // Controls
  clockControls: ViewStyle;
  clockButton: ViewStyle;
  resetButton: ViewStyle;
  startButton: ViewStyle;
  
  // Bottom menu
  bottomMenu: ViewStyle;
  menuItem: ViewStyle;
}

// Create focus task view styles
export const focusTaskViewStyles = StyleSheet.create<FocusTaskViewStyles>({
  // Container and layout
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  closeButton: {
    position: 'absolute',
    top: 16 + (Platform.OS === 'ios' ? 44 : 0),
    left: 16,
    zIndex: 10,
  },
  
  // Mode toggle
  modeToggle: {
    flexDirection: 'row',
    marginTop: 40,
    marginHorizontal: width * 0.30,
    borderRadius: 16,
    padding: 2,
    alignSelf: 'center',
  },
  modeButton: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 14,
  },
  modeButtonActive: {
    backgroundColor: '#FF9F1C',
    ...theme.shadows.small,
  },
  modeButtonText: {
    fontSize: 12,
    fontWeight: theme.typography.fontWeight.semibold as any,
  },
  modeButtonTextActive: {
    color: '#FFF',
  },
  
  // Task info
  taskTitle: {
    fontSize: 16,
    fontWeight: theme.typography.fontWeight.regular as any,
    marginTop: 16,
    textAlign: 'center',
  },
  
  // Clock section
  clockSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    flex: 1,
  },
  circleContainer: {
    position: 'relative',
    width: width * 0.7,
    height: width * 0.7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockTextContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  clockText: {
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
    fontSize: 36,
    fontWeight: theme.typography.fontWeight.semibold as any,
    letterSpacing: 1,
  },
  statusText: {
    marginTop: 8,
    fontSize: 14,
  },
  
  // Controls
  clockControls: {
    flexDirection: 'row',
    marginTop: 40,
    gap: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  startButton: {
    backgroundColor: '#FF9F1C',
    ...theme.shadows.medium,
  },
  
  // Bottom menu
  bottomMenu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    width: '100%',
  },
  menuItem: {
    padding: 12,
  },
}); 
