import React from 'react';
import { View, Text, Platform, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { format } from 'date-fns';
import { useTheme, statusBarStyles, getStatusBarContainerStyle } from '../lib/styles';

interface StatusBarProps {
  showTime?: boolean;
  showBorder?: boolean;
}

export function StatusBar({ 
  showTime = false, 
  showBorder = true, 
}: StatusBarProps) {
  const insets = useSafeAreaInsets();
  const [time, setTime] = React.useState(new Date());
  const { isDarkMode, colors, shadows } = useTheme();

  React.useEffect(() => {
    if (showTime) {
      const timer = setInterval(() => {
        setTime(new Date());
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [showTime]);

  // Create a dynamically generated style with our helper function
  const containerStyle = getStatusBarContainerStyle(
    insets.top,
    colors.background.primary,
    isDarkMode ? shadows.small : shadows.small,
    showBorder,
    colors.border.light
  );

  return (
    <>
      <ExpoStatusBar 
        style={isDarkMode ? "light" : "dark"} 
        backgroundColor={colors.background.primary}
      />
      <View style={[statusBarStyles.container, containerStyle]}>
        {showTime && (
          <Text style={[
            statusBarStyles.timeText, 
            { color: colors.text.primary }
          ]}>
            {format(time, 'h:mm a')}
          </Text>
        )}
      </View>
    </>
  );
}
