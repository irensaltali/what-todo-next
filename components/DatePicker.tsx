import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, isAfter, startOfDay } from 'date-fns';
import { useTheme, spacing, typography, borderRadius } from '../lib/styles';

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
          styles.container, 
          { 
            backgroundColor: colors.background.card,
            ...shadows.medium
          },
          error && { borderWidth: 1, borderColor: colors.text.error }
        ]}
        onPress={openPicker}
      >
        <Ionicons name="calendar-outline" size={20} color={colors.icon.secondary} />
        <Text style={[styles.dateText, { color: colors.text.primary }]}>
          {format(date, 'MMMM d, yyyy')}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.icon.secondary} />
      </Pressable>

      {error && (
        <Text style={[styles.errorText, { color: colors.text.error }]}>
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
            style={[styles.modalOverlay, { backgroundColor: colors.background.modal }]}
            onPress={() => setShowPicker(false)}
          >
            <View style={[
              styles.modalContent, 
              { 
                backgroundColor: colors.background.card,
                ...shadows.medium 
              }
            ]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
                  Select Date
                </Text>
                <Pressable
                  style={styles.modalCloseButton}
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
                style={styles.picker}
              />
            </View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    gap: spacing.md,
  },
  dateText: {
    flex: 1,
    fontSize: typography.fontSize.md,
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
  },
  modalCloseButton: {
    padding: spacing.xs,
  },
  picker: {
    height: 300,
  },
});
