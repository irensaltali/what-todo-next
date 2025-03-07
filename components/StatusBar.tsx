import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { format } from 'date-fns';

interface StatusBarProps {
  showTime?: boolean;
  showBorder?: boolean;
  isDarkMode?: boolean;
}

export function StatusBar({ 
  showTime = false, 
  showBorder = true, 
  isDarkMode = false 
}: StatusBarProps) {
  const insets = useSafeAreaInsets();
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    if (showTime) {
      const timer = setInterval(() => {
        setTime(new Date());
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [showTime]);

  return (
    <>
      <ExpoStatusBar style={isDarkMode ? "light" : "dark"} backgroundColor={isDarkMode ? "#121212" : "#FFFFFF"} />
      <View 
        style={[
          styles.container, 
          { paddingTop: insets.top },
          showBorder && (isDarkMode ? styles.borderBottomDark : styles.borderBottom),
          isDarkMode && styles.containerDark
        ]}
      >
        {showTime && (
          <Text style={[styles.timeText, isDarkMode && styles.timeTextDark]}>
            {format(time, 'h:mm a')}
          </Text>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  containerDark: {
    backgroundColor: '#121212',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 1,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  borderBottomDark: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  timeTextDark: {
    color: '#E0E0E0',
  },
});
