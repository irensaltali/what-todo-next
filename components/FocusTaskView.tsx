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
  useSharedValue,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import Svg, { Circle, Line } from 'react-native-svg';

interface FocusTaskViewProps {
  visible: boolean;
  onClose: () => void;
  task: {
    title: string;
    description: string;
  };
}

type Mode = 'pomo' | 'stopwatch';

const formatTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Create the animated circle component
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function FocusTaskView({ visible, onClose, task }: FocusTaskViewProps) {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<Mode>('pomo');
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(25 * 60); // Default 25 minutes for Pomodoro
  const [totalTime, setTotalTime] = useState(25 * 60); // Keep track of total time for progress
  const [sessionCount, setSessionCount] = useState(0);
  const [isBreak, setIsBreak] = useState(false);
  const [workDuration, setWorkDuration] = useState(25 * 60);
  const [shortBreakDuration, setShortBreakDuration] = useState(5 * 60);
  const [longBreakDuration, setLongBreakDuration] = useState(15 * 60);
  const maxSessionsBeforeLongBreak = 4;
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Progress circle animation
  const progress = useSharedValue(0);
  const circleSize = width * 0.7;
  const strokeWidth = 3;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

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
    if (mode === 'pomo') {
      setTime(workDuration);
      setTotalTime(workDuration);
    } else {
      setTime(0);
      setTotalTime(60); // For stopwatch, track progress in 1-minute increments
    }
    setIsRunning(false);
    progress.value = 0;
  }, [mode, workDuration]);

  useEffect(() => {
    // Update progress for circle
    if (mode === 'pomo') {
      progress.value = withTiming(1 - time / totalTime, { duration: 300 });
    } else if (mode === 'stopwatch') {
      // For stopwatch, reset progress every minute
      const currentMinute = Math.floor(time / 60);
      const secondsInCurrentMinute = time % 60;
      progress.value = withTiming(secondsInCurrentMinute / 60, { duration: 300 });
    }
    
    // Handle completion of timer
    if (isRunning && time === 0 && mode === 'pomo') {
      if (!isBreak) {
        setSessionCount((prev) => prev + 1);
        if (sessionCount + 1 < maxSessionsBeforeLongBreak) {
          setIsBreak(true);
          setTime(shortBreakDuration);
          setTotalTime(shortBreakDuration);
        } else {
          setIsBreak(true);
          setSessionCount(0);
          setTime(longBreakDuration);
          setTotalTime(longBreakDuration);
        }
      } else {
        setIsBreak(false);
        setTime(workDuration);
        setTotalTime(workDuration);
      }
    }
  }, [time, isRunning, mode, sessionCount, isBreak]);

  const handleStartStop = () => {
    if (mode === 'pomo' && time === 0) {
      return; // Prevent starting when timer is at 0
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsBreak(false);
    setSessionCount(0);
    
    if (mode === 'pomo') {
      setTime(workDuration);
      setTotalTime(workDuration);
    } else {
      setTime(0);
      setTotalTime(60);
    }
    
    progress.value = 0;
  };

  // Circle progress animation
  const animatedCircleProps = useAnimatedStyle(() => {
    const strokeDashoffset = circumference * (1 - progress.value);
    
    return {
      strokeDashoffset,
      strokeWidth: mode === 'pomo' ? 
        interpolate(
          progress.value, 
          [0, 1], 
          [strokeWidth, strokeWidth * 3]
        ) : strokeWidth,
      stroke: mode === 'pomo' ? 
        progress.value > 0.75 ? '#FF8C42' : 
        progress.value > 0.5 ? '#FFA66D' : 
        progress.value > 0.25 ? '#FFC39E' : 
        '#7EB6FF' : '#7EB6FF',
    } as any;
  });

  // Extract values for the AnimatedCircle
  const strokeDashoffset = circumference * (1 - progress.value);
  const currentStrokeWidth = mode === 'pomo' ? 
    interpolate(
      progress.value, 
      [0, 1], 
      [strokeWidth, strokeWidth * 3]
    ) : strokeWidth;
  const currentStroke = mode === 'pomo' ? 
    progress.value > 0.75 ? '#FF8C42' : 
    progress.value > 0.5 ? '#FFA66D' : 
    progress.value > 0.25 ? '#FFC39E' : 
    '#7EB6FF' : '#7EB6FF';

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
          colors={['#FAFAFA', '#F5F5F5', '#EFEFEF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Close Button (X) */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={24} color="#555" />
        </TouchableOpacity>

        {/* Toggle Switch */}
        <View style={styles.modeToggle}>
          <Pressable
            style={[styles.modeButton, mode === 'pomo' && styles.modeButtonActive]}
            onPress={() => setMode('pomo')}
          >
            <Text
              style={[
                styles.modeButtonText,
                mode === 'pomo' && styles.modeButtonTextActive,
              ]}
            >
              Pomo
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

        {/* Task Title */}
        <Text style={styles.taskTitle}>{task.title}</Text>

        {/* Circle Timer */}
        <View style={styles.clockSection}>
          <View style={styles.circleContainer}>
            <Svg width={circleSize} height={circleSize}>
              {/* Background circle */}
              <Circle
                cx={circleSize / 2}
                cy={circleSize / 2}
                r={radius}
                stroke="#E0E0E0"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              
              {/* Progress circle */}
              <AnimatedCircle
                cx={circleSize / 2}
                cy={circleSize / 2}
                r={radius}
                stroke={currentStroke}
                strokeWidth={currentStrokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
              
              {/* Stopwatch domino markers (for stopwatch mode) */}
              {mode === 'stopwatch' && Array.from({ length: 60 }).map((_, index) => {
                const angle = (index * 6 - 90) * (Math.PI / 180);
                const x1 = circleSize / 2 + (radius - 10) * Math.cos(angle);
                const y1 = circleSize / 2 + (radius - 10) * Math.sin(angle);
                const x2 = circleSize / 2 + (radius - 2) * Math.cos(angle);
                const y2 = circleSize / 2 + (radius - 2) * Math.sin(angle);
                
                return (
                  <Line
                    key={index}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={index % 5 === 0 ? "#666" : "#CCC"}
                    strokeWidth={index % 5 === 0 ? 2 : 1}
                  />
                );
              })}
            </Svg>
            
            <View style={styles.clockTextContainer}>
              <Text style={styles.clockText}>{formatTime(time)}</Text>
              <Text style={styles.statusText}>
                {mode === 'pomo' ? 
                  (isBreak ? (sessionCount === maxSessionsBeforeLongBreak - 1 ? 'Long Break' : 'Short Break') : 'Focus Time') : 
                  'Elapsed Time'}
              </Text>
            </View>
          </View>

          <View style={styles.clockControls}>
            <TouchableOpacity
              style={[styles.clockButton, styles.resetButton]}
              onPress={handleReset}
            >
              <Ionicons name="refresh" size={24} color="#555" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.clockButton, styles.startButton]}
              onPress={handleStartStop}
            >
              <Ionicons
                name={isRunning ? 'pause' : 'play'}
                size={28}
                color="#FFF"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Menu */}
        <View style={[styles.bottomMenu, { paddingBottom: insets.bottom > 0 ? insets.bottom : 16 }]}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => setIsDarkMode(!isDarkMode)}
          >
            <Ionicons 
              name={isDarkMode ? "sunny" : "moon"} 
              size={24} 
              color="#555" 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => setSoundEnabled(!soundEnabled)}
          >
            <Ionicons 
              name={soundEnabled ? "volume-high" : "volume-mute"} 
              size={24} 
              color="#555" 
            />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="settings-outline" size={24} color="#555" />
          </TouchableOpacity>
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
  closeButton: {
    position: 'absolute',
    top: 16 + (Platform.OS === 'ios' ? 44 : 0),
    left: 16,
    zIndex: 10,
  },
  modeToggle: {
    flexDirection: 'row',
    marginTop: 40,
    marginHorizontal: width * 0.30,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  modeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#777',
  },
  modeButtonTextActive: {
    color: '#FFF',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#777',
    marginTop: 16,
    textAlign: 'center',
  },
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
    fontWeight: '600',
    color: '#333',
    letterSpacing: 1,
  },
  statusText: {
    marginTop: 8,
    fontSize: 14,
    color: '#777',
  },
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
    backgroundColor: '#7EB6FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
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
