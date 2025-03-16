import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  Platform,
  Dimensions,
  TouchableOpacity,
  useColorScheme,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  useDerivedValue
} from 'react-native-reanimated';
import Svg, { Circle, Line } from 'react-native-svg';
import { useTheme } from '../contexts/ThemeContext';
import { Audio } from 'expo-av';
import { focusTaskViewStyles, focusViewColors } from '@/lib/styles/focus-task-view';

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

// Get dimensions for responsive layout
const { width } = Dimensions.get('window');

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
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Store separate state for pomo and stopwatch modes
  const [pomoTime, setPomoTime] = useState(workDuration);
  const [pomoTotalTime, setPomoTotalTime] = useState(workDuration);
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [stopwatchTotalTime, setStopwatchTotalTime] = useState(60);
  
  // Store separate progress values for each mode
  const [pomoProgress, setPomoProgress] = useState(0);
  const [stopwatchProgress, setStopwatchProgress] = useState(0);
  
  // Sound reference and status
  const tickingSound = useRef<Audio.Sound | null>(null);
  const [soundLoaded, setSoundLoaded] = useState(false);
  
  // Use the theme context instead of local state
  const { isDarkMode, toggleTheme } = useTheme();
  
  // Get the current theme based on isDarkMode state
  const theme = isDarkMode ? focusViewColors.dark : focusViewColors.light;
  
  // Progress circle animation
  const progress = useSharedValue(0);
  const circleSize = width * 0.7;
  const strokeWidth = 3;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // State variables derived from progress for rendering
  const [progressStrokeDashoffset, setProgressStrokeDashoffset] = useState(circumference);
  const [progressStrokeWidth, setProgressStrokeWidth] = useState(strokeWidth);
  const [progressStrokeColor, setProgressStrokeColor] = useState('#7EB6FF');
  
  // Update derived state when progress changes
  useEffect(() => {
    const updateProgressValues = () => {
      const progressValue = progress.value;
      setProgressStrokeDashoffset(circumference * (1 - progressValue));
      
      if (mode === 'pomo') {
        setProgressStrokeWidth(
          interpolate(progressValue, [0, 1], [strokeWidth, strokeWidth * 3])
        );
        
        if (progressValue > 0.75) setProgressStrokeColor('#FF8C42');
        else if (progressValue > 0.5) setProgressStrokeColor('#FFA66D');
        else if (progressValue > 0.25) setProgressStrokeColor('#FFC39E');
        else setProgressStrokeColor('#7EB6FF');
      } else {
        setProgressStrokeWidth(strokeWidth);
        setProgressStrokeColor('#7EB6FF');
      }
    };
    
    // Initial update
    updateProgressValues();
    
    // Set up an interval to update values periodically
    // This avoids having progress.value in the dependency array
    const intervalId = setInterval(updateProgressValues, 16); // ~60fps
    
    return () => clearInterval(intervalId);
  }, [mode, circumference, strokeWidth]);

  // Initialize audio session
  useEffect(() => {
    const setupAudio = async () => {
      try {
        console.log('Setting up audio session...');
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
          allowsRecordingIOS: false,
        });
        console.log('Audio session set up successfully');
      } catch (error) {
        console.error('Failed to set audio mode', error);
      }
    };
    
    setupAudio();
  }, []);

  // Load and unload sound
  useEffect(() => {
    const loadSound = async () => {
      try {
        console.log('Loading ticking sound...');
        
        // Unload any existing sound first
        if (tickingSound.current) {
          await tickingSound.current.unloadAsync();
          tickingSound.current = null;
        }
        
        const soundObject = new Audio.Sound();
        await soundObject.loadAsync(require('../assets/sounds/tictac.wav'));
        await soundObject.setIsLoopingAsync(true);
        
        tickingSound.current = soundObject;
        setSoundLoaded(true);
        console.log('Ticking sound loaded successfully');
      } catch (error: any) {
        console.error('Failed to load sound', error);
        Alert.alert('Sound Error', 'Failed to load ticking sound: ' + (error?.message || 'Unknown error'));
      }
    };

    if (visible) {
      loadSound();
    }

    return () => {
      const unloadSound = async () => {
        console.log('Unloading sound...');
        if (tickingSound.current) {
          try {
            await tickingSound.current.stopAsync();
            await tickingSound.current.unloadAsync();
            tickingSound.current = null;
            setSoundLoaded(false);
            console.log('Sound unloaded successfully');
          } catch (error) {
            console.error('Error unloading sound', error);
          }
        }
      };
      
      unloadSound();
    };
  }, [visible]);

  // Play or pause ticking sound based on isRunning and soundEnabled
  useEffect(() => {
    const manageTicking = async () => {
      if (!tickingSound.current || !soundLoaded) {
        console.log('Sound not loaded yet, cannot play/pause');
        return;
      }
      
      try {
        if (isRunning && soundEnabled) {
          console.log('Starting to play ticking sound...');
          const status = await tickingSound.current.getStatusAsync();
          
          if (status.isLoaded) {
            if (!status.isPlaying) {
              console.log('Playing sound now');
              // Add 100ms latency before playing sound
              await new Promise(resolve => setTimeout(resolve, 100));
              await tickingSound.current.playAsync();
              const playStatus = await tickingSound.current.getStatusAsync();
              console.log('Sound playing status:', playStatus.isLoaded && playStatus.isPlaying);
            } else {
              console.log('Sound is already playing');
            }
          } else {
            console.log('Sound is not loaded, cannot play');
          }
        } else {
          console.log('Pausing ticking sound...');
          const status = await tickingSound.current.getStatusAsync();
          
          if (status.isLoaded && status.isPlaying) {
            console.log('Pausing sound now');
            await tickingSound.current.pauseAsync();
          } else {
            console.log('Sound is not playing, no need to pause');
          }
        }
      } catch (error: any) {
        console.error('Error managing ticking sound', error);
        Alert.alert('Sound Error', 'Error playing/pausing sound: ' + (error?.message || 'Unknown error'));
      }
    };
    
    manageTicking();
  }, [isRunning, soundEnabled, soundLoaded]);

  // Handle sound toggle
  const handleSoundToggle = async () => {
    const newSoundEnabled = !soundEnabled;
    setSoundEnabled(newSoundEnabled);
    
    console.log('Sound toggled to:', newSoundEnabled);
    
    // Play a short test sound when enabling to verify sound works
    if (newSoundEnabled && tickingSound.current && soundLoaded && !isRunning) {
      try {
        console.log('Playing test sound...');
        await tickingSound.current.playAsync();
        setTimeout(async () => {
          if (tickingSound.current) {
            await tickingSound.current.pauseAsync();
            console.log('Test sound stopped');
          }
        }, 1000);
      } catch (error) {
        console.error('Error playing test sound', error);
      }
    }
  };

  // Initialize the component once
  useEffect(() => {
    // Initial setup - only runs once when component mounts
    setPomoTime(workDuration);
    setPomoTotalTime(workDuration);
    setStopwatchTime(0);
    setStopwatchTotalTime(60);
    setPomoProgress(0);
    setStopwatchProgress(0);
    
    // Set initial values based on mode
    if (mode === 'pomo') {
      setTime(pomoTime);
      setTotalTime(pomoTotalTime);
      progress.value = pomoProgress;
    } else {
      setTime(stopwatchTime);
      setTotalTime(stopwatchTotalTime);
      progress.value = stopwatchProgress;
    }
    
    // Update progress value
    updateProgressValue();
  }, []);

  // Handle closing the modal - reset all states
  const handleClose = () => {
    // Stop sound when closing
    if (tickingSound.current && soundLoaded) {
      console.log('Stopping sound on close');
      tickingSound.current.stopAsync().catch(err => console.error('Error stopping sound', err));
    }
    
    // Reset all states before closing
    setIsRunning(false);
    setIsBreak(false);
    setSessionCount(0);
    setPomoTime(workDuration);
    setPomoTotalTime(workDuration);
    setStopwatchTime(0);
    setStopwatchTotalTime(60);
    setPomoProgress(0);
    setStopwatchProgress(0);
    progress.value = 0;
    
    // Call the original onClose
    onClose();
  };

  // Update progress value based on current mode and time
  const updateProgressValue = () => {
    let newProgressValue = 0;
    
    if (mode === 'pomo') {
      newProgressValue = 1 - time / totalTime;
      setPomoProgress(newProgressValue);
    } else if (mode === 'stopwatch') {
      // For stopwatch, reset progress every minute
      const secondsInCurrentMinute = time % 60;
      newProgressValue = secondsInCurrentMinute / 60;
      setStopwatchProgress(newProgressValue);
    }
    
    // Use a shorter duration for smoother updates during active timing
    const animationDuration = isRunning ? 100 : 300;
    progress.value = withTiming(newProgressValue, { duration: animationDuration });
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prev) => {
          const newTime = mode === 'stopwatch' ? prev + 1 : prev - 1;
          
          // Update the mode-specific time state
          if (mode === 'pomo') {
            setPomoTime(newTime);
          } else {
            setStopwatchTime(newTime);
          }
          
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, mode]);

  // Handle mode toggle without resetting the clock
  useEffect(() => {
    // Stop the timer when switching modes
    setIsRunning(false);
    
    // Switch to the appropriate saved state
    if (mode === 'pomo') {
      setTime(pomoTime);
      setTotalTime(pomoTotalTime);
      
      // Calculate and apply the correct progress angle based on current time
      const newProgress = 1 - pomoTime / pomoTotalTime;
      setPomoProgress(newProgress);
      progress.value = withTiming(newProgress, { duration: 300 });
    } else {
      setTime(stopwatchTime);
      setTotalTime(stopwatchTotalTime);
      
      // Calculate and apply the correct progress angle based on current time
      const secondsInCurrentMinute = stopwatchTime % 60;
      const newProgress = secondsInCurrentMinute / 60;
      setStopwatchProgress(newProgress);
      progress.value = withTiming(newProgress, { duration: 300 });
    }
  }, [mode]);

  useEffect(() => {
    // Update progress for circle
    updateProgressValue();
    
    // Handle completion of timer
    if (isRunning && time === 0 && mode === 'pomo') {
      if (!isBreak) {
        setSessionCount((prev) => prev + 1);
        if (sessionCount + 1 < maxSessionsBeforeLongBreak) {
          setIsBreak(true);
          const newTime = shortBreakDuration;
          setTime(newTime);
          setPomoTime(newTime);
          const newTotalTime = shortBreakDuration;
          setTotalTime(newTotalTime);
          setPomoTotalTime(newTotalTime);
          // Reset progress for new break session
          const newProgress = 0;
          setPomoProgress(newProgress);
          progress.value = newProgress;
        } else {
          setIsBreak(true);
          setSessionCount(0);
          const newTime = longBreakDuration;
          setTime(newTime);
          setPomoTime(newTime);
          const newTotalTime = longBreakDuration;
          setTotalTime(newTotalTime);
          setPomoTotalTime(newTotalTime);
          // Reset progress for new break session
          const newProgress = 0;
          setPomoProgress(newProgress);
          progress.value = newProgress;
        }
      } else {
        setIsBreak(false);
        const newTime = workDuration;
        setTime(newTime);
        setPomoTime(newTime);
        const newTotalTime = workDuration;
        setTotalTime(newTotalTime);
        setPomoTotalTime(newTotalTime);
        // Reset progress for new work session
        const newProgress = 0;
        setPomoProgress(newProgress);
        progress.value = newProgress;
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
    // Pause sound when resetting
    if (tickingSound.current && isRunning) {
      tickingSound.current.pauseAsync();
    }
    
    setIsRunning(false);
    
    if (mode === 'pomo') {
      setIsBreak(false);
      setSessionCount(0);
      const newTime = workDuration;
      setTime(newTime);
      setPomoTime(newTime);
      const newTotalTime = workDuration;
      setTotalTime(newTotalTime);
      setPomoTotalTime(newTotalTime);
      // Reset progress for pomo mode
      const newProgress = 0;
      setPomoProgress(newProgress);
      progress.value = newProgress;
    } else {
      const newTime = 0;
      setTime(newTime);
      setStopwatchTime(newTime);
      const newTotalTime = 60;
      setTotalTime(newTotalTime);
      setStopwatchTotalTime(newTotalTime);
      // Reset progress for stopwatch mode
      const newProgress = 0;
      setStopwatchProgress(newProgress);
      progress.value = newProgress;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={[focusTaskViewStyles.container, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={theme.background}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
        />

        {/* Close Button (X) */}
        <TouchableOpacity
          style={focusTaskViewStyles.closeButton}
          onPress={handleClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={24} color={theme.iconColor} />
        </TouchableOpacity>

        {/* Toggle Switch */}
        <View style={[focusTaskViewStyles.modeToggle, { backgroundColor: theme.modeToggleBg }]}>
          <Pressable
            style={[focusTaskViewStyles.modeButton, mode === 'pomo' && focusTaskViewStyles.modeButtonActive]}
            onPress={() => setMode('pomo')}
          >
            <Text
              style={[
                focusTaskViewStyles.modeButtonText,
                { color: theme.subText },
                mode === 'pomo' && focusTaskViewStyles.modeButtonTextActive,
              ]}
            >
              Pomo
            </Text>
          </Pressable>
          <Pressable
            style={[
              focusTaskViewStyles.modeButton,
              mode === 'stopwatch' && focusTaskViewStyles.modeButtonActive,
            ]}
            onPress={() => setMode('stopwatch')}
          >
            <Text
              style={[
                focusTaskViewStyles.modeButtonText,
                { color: theme.subText },
                mode === 'stopwatch' && focusTaskViewStyles.modeButtonTextActive,
              ]}
            >
              Stopwatch
            </Text>
          </Pressable>
        </View>

        {/* Task Title */}
        <Text style={[focusTaskViewStyles.taskTitle, { color: theme.subText }]}>{task.title}</Text>

        {/* Circle Timer */}
        <View style={focusTaskViewStyles.clockSection}>
          <View style={focusTaskViewStyles.circleContainer}>
            <Svg width={circleSize} height={circleSize}>
              {/* Background circle */}
              <Circle
                cx={circleSize / 2}
                cy={circleSize / 2}
                r={radius}
                stroke={theme.circleBackground}
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              
              {/* Progress circle */}
              <AnimatedCircle
                cx={circleSize / 2}
                cy={circleSize / 2}
                r={radius}
                stroke={progressStrokeColor}
                strokeWidth={progressStrokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={progressStrokeDashoffset}
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
                    stroke={index % 5 === 0 ? theme.dominoMarkerDark : theme.dominoMarkerLight}
                    strokeWidth={index % 5 === 0 ? 2 : 1}
                  />
                );
              })}
            </Svg>
            
            <View style={focusTaskViewStyles.clockTextContainer}>
              <Text style={[focusTaskViewStyles.clockText, { color: theme.text }]}>{formatTime(time)}</Text>
              <Text style={[focusTaskViewStyles.statusText, { color: theme.subText }]}>
                {mode === 'pomo' ? 
                  (isBreak ? (sessionCount === maxSessionsBeforeLongBreak - 1 ? 'Long Break' : 'Short Break') : 'Focus Time') : 
                  'Elapsed Time'}
              </Text>
            </View>
          </View>

          <View style={focusTaskViewStyles.clockControls}>
            <TouchableOpacity
              style={[focusTaskViewStyles.clockButton, focusTaskViewStyles.resetButton, { backgroundColor: theme.resetButtonBg }]}
              onPress={handleReset}
            >
              <Ionicons name="refresh" size={24} color={theme.iconColor} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[focusTaskViewStyles.clockButton, focusTaskViewStyles.startButton, { backgroundColor: theme.startButtonBg }]}
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
        <View style={[focusTaskViewStyles.bottomMenu, { paddingBottom: insets.bottom > 0 ? insets.bottom : 16 }]}>
          <TouchableOpacity 
            style={focusTaskViewStyles.menuItem}
            onPress={toggleTheme}
          >
            <Ionicons 
              name={isDarkMode ? "sunny" : "moon"} 
              size={24} 
              color={theme.iconColor} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={focusTaskViewStyles.menuItem}
            onPress={handleSoundToggle}
          >
            <Ionicons 
              name={soundEnabled ? "volume-high" : "volume-mute"} 
              size={24} 
              color={theme.iconColor} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity style={focusTaskViewStyles.menuItem}>
            <Ionicons name="settings-outline" size={24} color={theme.iconColor} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
