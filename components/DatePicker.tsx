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

interface DatePickerProps {
  date: Date;
  onDateChange: (date: Date) => void;
  error?: string;
}

export function DatePicker({ date, onDateChange, error }: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const today = startOfDay(new Date());

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
        style={[styles.container, error && styles.containerError]}
        onPress={openPicker}
      >
        <Ionicons name="list-outline" size={20} color="#8E8E93" />
        <Text style={styles.dateText}>
          {format(date, 'MMMM d, yyyy')}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#8E8E93" />
      </Pressable>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {(Platform.OS === 'ios' || Platform.OS === 'android') && showPicker && (
        <Modal
          transparent
          animationType="fade"
          visible={showPicker}
          onRequestClose={() => setShowPicker(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowPicker(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Date</Text>
                <Pressable
                  style={styles.modalCloseButton}
                  onPress={() => setShowPicker(false)}
                >
                  <Ionicons name="close" size={24} color="#1C1C1E" />
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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  containerError: {
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  modalCloseButton: {
    padding: 4,
  },
  picker: {
    height: 300,
  },
});
