import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, isAfter, startOfDay } from 'date-fns';
import { useTheme } from '../lib/styles/useTheme';
import { datePickerStyles } from '../lib/styles/date-picker';

interface DatePickerProps {
  date: Date;
  onDateChange: (date: Date) => void;
  error?: string;
}

export function DatePicker({ date, onDateChange, error }: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const today = startOfDay(new Date());
  const { colors, shadows, isDarkMode } = useTheme();

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (selectedDate) {
      // Validate the date is not in the past
      if (isAfter(startOfDay(selectedDate), today) || 
          startOfDay(selectedDate).getTime() === today.getTime()) {
        onDateChange(selectedDate);
      }
    }
  };

  const openPicker = () => {
    if (Platform.OS === 'web') {
      // For web, we create a hidden input and trigger it
      const input = document.createElement('input');
      input.type = 'date';
      input.min = format(today, 'yyyy-MM-dd');
      input.value = format(date, 'yyyy-MM-dd');
      input.onchange = (e: any) => {
        const newDate = new Date(e.target.value);
        if (!isNaN(newDate.getTime())) {
          onDateChange(newDate);
        }
      };
      input.click();
    } else {
      setShowPicker(true);
    }
  };

  return (
    <View>
      <Pressable
        style={[
          datePickerStyles.container, 
          { 
            backgroundColor: colors.background.card,
            ...shadows.medium
          },
          error && { borderWidth: 1, borderColor: colors.text.error }
        ]}
        onPress={openPicker}
      >
        <Ionicons name="calendar-outline" size={20} color={colors.icon.secondary} />
        <Text style={[datePickerStyles.dateText, { color: colors.text.primary }]}>
          {format(date, 'MMMM d, yyyy')}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.icon.secondary} />
      </Pressable>

      {error && (
        <Text style={[datePickerStyles.errorText, { color: colors.text.error }]}>
          {error}
        </Text>
      )}

      {(Platform.OS === 'ios' || Platform.OS === 'android') && showPicker && (
        <Modal
          transparent
          animationType="fade"
          visible={showPicker}
          onRequestClose={() => setShowPicker(false)}
        >
          <Pressable
            style={[datePickerStyles.modalOverlay, { backgroundColor: colors.background.modal }]}
            onPress={() => setShowPicker(false)}
          >
            <View style={[
              datePickerStyles.modalContent, 
              { 
                backgroundColor: colors.background.card,
                ...shadows.medium 
              }
            ]}>
              <View style={datePickerStyles.modalHeader}>
                <Text style={[datePickerStyles.modalTitle, { color: colors.text.primary }]}>
                  Select Date
                </Text>
                <Pressable
                  style={datePickerStyles.modalCloseButton}
                  onPress={() => setShowPicker(false)}
                >
                  <Ionicons name="close" size={24} color={colors.icon.primary} />
                </Pressable>
              </View>
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onChange={handleDateChange}
                minimumDate={today}
                style={datePickerStyles.picker}
              />
            </View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}
