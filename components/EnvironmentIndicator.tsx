import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import config from '../lib/config';

/**
 * Displays a visual indicator of the current environment when not in production
 * Helps developers and testers quickly identify which environment they're using
 */
export default function EnvironmentIndicator() {
  // Don't show anything in production
  if (config.isProduction) {
    return null;
  }

  // Define colors based on environment
  const backgroundColor = config.isStaging 
    ? 'rgba(255, 165, 0, 0.8)' // Orange for staging
    : 'rgba(0, 128, 255, 0.8)'; // Blue for development
  
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={styles.text}>
        {config.env.toUpperCase()} - v{config.appVersion}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderBottomLeftRadius: 5,
    zIndex: 1000,
  },
  text: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
}); 
