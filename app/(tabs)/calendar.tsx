import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format, addDays, startOfWeek } from 'date-fns';
import { StatusBar } from '../../components/StatusBar';

interface Task {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  participants?: string[];
}

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Team Meeting',
      startTime: '09:00',
      endTime: '10:00',
      participants: [
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        'https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      ],
    },
    {
      id: '2',
      title: 'Project Review',
      startTime: '11:00',
      endTime: '12:00',
    },
  ]);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startOfWeek(selectedDate), i);
    return {
      date,
      dayName: format(date, 'EEE'),
      dayNumber: format(date, 'd'),
    };
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable style={styles.iconButton}>
          <Ionicons name="chevron-back" size={24} color="#1C1C1E" />
        </Pressable>
        <Text style={styles.dateText}>
          {format(selectedDate, 'EEEE, d MMMM yyyy')}
        </Text>
        <Pressable style={styles.iconButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#1C1C1E" />
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.calendar}>
        {weekDays.map((day, index) => {
          const isSelected = format(day.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
          return (
            <Pressable
              key={index}
              style={[styles.dayItem, isSelected && styles.selectedDay]}
              onPress={() => setSelectedDate(day.date)}>
              <Text style={[styles.dayName, isSelected && styles.selectedText]}>
                {day.dayName}
              </Text>
              <Text style={[styles.dayNumber, isSelected && styles.selectedText]}>
                {day.dayNumber}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView style={styles.taskList}>
        {tasks.map((task) => (
          <View key={task.id} style={styles.taskItem}>
            <View style={styles.taskHeader}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Pressable style={styles.iconButton}>
                <Ionicons name="ellipsis-horizontal" size={20} color="#8E8E93" />
              </Pressable>
            </View>
            <Text style={styles.taskTime}>
              {task.startTime} - {task.endTime}
            </Text>
            {task.participants && (
              <View style={styles.participants}>
                {task.participants.map((url, index) => (
                  <Image
                    key={index}
                    source={{ uri: url }}
                    style={[
                      styles.participantAvatar,
                      { marginLeft: index > 0 ? -12 : 0 },
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendar: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  dayItem: {
    width: 60,
    height: 80,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#fff',
  },
  selectedDay: {
    backgroundColor: '#FF9F1C',
  },
  dayName: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  selectedText: {
    color: '#fff',
  },
  taskList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  taskItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  taskTime: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
  },
  participants: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fff',
  },
});