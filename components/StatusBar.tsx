import React from 'react';
import { View, Text, StyleSheet, Platform, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { format } from 'date-fns';
import { useTheme, spacing, typography } from '../lib/styles';

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

  // Create a dynamically generated style object with proper typing
  const containerStyle: ViewStyle = {
    paddingTop: insets.top,
    backgroundColor: colors.background.primary,
    ...(isDarkMode ? shadows.small : shadows.small) as ViewStyle
  };

  if (showBorder) {
    containerStyle.borderBottomWidth = 1;
    containerStyle.borderBottomColor = colors.border.light;
  }

  return (
    <>
      <ExpoStatusBar 
        style={isDarkMode ? "light" : "dark"} 
        backgroundColor={colors.background.primary}
      />
      <View style={[styles.container, containerStyle]}>
        {showTime && (
          <Text style={[
            styles.timeText, 
            { color: colors.text.primary }
          ]}>
            {format(time, 'h:mm a')}
          </Text>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
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
