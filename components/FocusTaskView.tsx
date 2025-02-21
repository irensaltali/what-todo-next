import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Platform,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';

interface FocusTaskViewProps {
  visible: boolean;
  onClose: () => void;
  task: {
    title: string;
    description: string;
  };
}

type Mode = 'timer' | 'stopwatch';

const formatTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export function FocusTaskView({ visible, onClose, task }: FocusTaskViewProps) {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<Mode>('timer');
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const pulseAnim = useSharedValue(1);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prev) => (mode === 'stopwatch' ? prev + 1 : prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, mode]);

  useEffect(() => {
    if (mode === 'timer') {
      setTime(25 * 60); // 25 minutes default
    } else {
      setTime(0);
    }
    setIsRunning(false);
  }, [mode]);

  const handleStartStop = () => {
    if (mode === 'timer' && time === 0) {
      return; // Prevent starting when timer is at 0
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(mode === 'timer' ? 25 * 60 : 0);
  };

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  useEffect(() => {
    if (isRunning) {
      pulseAnim.value = withSequence(
        withSpring(1.1),
        withSpring(1),
        withTiming(1, { duration: 1000 })
      );
    }
  }, [time]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={['#1A2151', '#1B3976', '#2C5F9B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{task.title}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.modeToggle}>
          <Pressable
            style={[styles.modeButton, mode === 'timer' && styles.modeButtonActive]}
            onPress={() => setMode('timer')}
          >
            <Text
              style={[
                styles.modeButtonText,
                mode === 'timer' && styles.modeButtonTextActive,
              ]}
            >
              Timer
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.modeButton,
              mode === 'stopwatch' && styles.modeButtonActive,
            ]}
            onPress={() => setMode('stopwatch')}
          >
            <Text
              style={[
                styles.modeButtonText,
                mode === 'stopwatch' && styles.modeButtonTextActive,
              ]}
            >
              Stopwatch
            </Text>
          </Pressable>
        </View>

        <View style={styles.clockSection}>
          <Animated.Text style={[styles.clockText, pulseStyle]}>
            {formatTime(time)}
          </Animated.Text>
          <View style={styles.clockControls}>
            <TouchableOpacity
              style={[styles.clockButton, styles.resetButton]}
              onPress={handleReset}
            >
              <Ionicons name="refresh" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.clockButton, styles.startButton]}
              onPress={handleStartStop}
            >
              <Ionicons
                name={isRunning ? 'pause' : 'play'}
                size={24}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="list-outline" size={20} color="#7EB6FF" />
            <Text style={styles.cardTitle}>Task Details</Text>
          </View>
          <Text style={styles.description}>{task.description}</Text>
        </View>
      </View>
    </Modal>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    marginRight: 16,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeToggle: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  modeButtonActive: {
    backgroundColor: '#7EB6FF',
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  modeButtonTextActive: {
    color: '#1A2151',
  },
  clockSection: {
    alignItems: 'center',
    marginVertical: 40,
  },
  clockText: {
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
    fontSize: 64,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 2,
  },
  clockControls: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 16,
  },
  clockButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  startButton: {
    backgroundColor: '#7EB6FF',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    marginHorizontal: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7EB6FF',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#B8C2CC',
  },
});