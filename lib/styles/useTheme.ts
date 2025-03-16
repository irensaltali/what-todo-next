import { useContext } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';
import { colors, shadows } from './theme';

/**
 * Custom hook to get theme-aware styles
 * This automatically handles light/dark mode switching
 */
export const useTheme = () => {
  const { isDarkMode } = useContext(ThemeContext);

  return {
    isDarkMode,
    
    colors: {
      ...colors,
      
      // Override colors with dark mode values when in dark mode
      background: isDarkMode 
        ? colors.dark.background 
        : colors.background,
      
      text: {
        ...colors.text,
        primary: isDarkMode ? colors.dark.text.primary : colors.text.primary,
        secondary: isDarkMode ? colors.dark.text.secondary : colors.text.secondary,
      },
      
      border: {
        ...colors.border,
        light: isDarkMode ? colors.dark.border.light : colors.border.light,
        medium: isDarkMode ? colors.dark.border.medium : colors.border.medium,
      },
      
      icon: {
        ...colors.icon,
        primary: isDarkMode ? colors.dark.icon.primary : colors.icon.primary,
        secondary: isDarkMode ? colors.dark.icon.secondary : colors.icon.secondary,
      }
    },
    
    // Use dark shadows when in dark mode
    shadows: isDarkMode 
      ? { 
          small: shadows.dark.small, 
          medium: shadows.dark.medium,
          large: shadows.large, // No specific dark mode for large
        } 
      : shadows,
  };
}; 
