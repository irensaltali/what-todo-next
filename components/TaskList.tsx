import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../lib/styles/useTheme';
import { Task, TaskStatus } from '../store/taskStore';

interface TaskListProps {
  tasks: Task[];
  onTaskPress: (task: Task) => void;
  onTaskStatusChange: (taskId: string, status: TaskStatus) => void;
}

export function TaskList({ tasks, onTaskPress, onTaskStatusChange }: TaskListProps) {
  const theme = useTheme();

  const renderTask = ({ item: task }: { item: Task }) => (
    <Pressable
      style={[styles.taskItem, { backgroundColor: theme.colors.background.primary }]}
      onPress={() => onTaskPress(task)}
    >
      <Pressable
        style={styles.checkbox}
        onPress={() => onTaskStatusChange(task.id, task.status === 'completed' ? 'ongoing' : 'completed')}
      >
        <Ionicons
          name={task.status === 'completed' ? 'checkmark-circle' : 'ellipse-outline'}
          size={24}
          color={task.status === 'completed' ? theme.colors.text.success : theme.colors.text.placeholder}
        />
      </Pressable>
      <View style={styles.taskContent}>
        <Text
          style={[
            styles.taskTitle,
            task.status === 'completed' && styles.completedTask,
            { color: theme.colors.text.primary },
          ]}
        >
          {task.title}
        </Text>
        {task.deadline && (
          <Text style={[styles.deadline, { color: theme.colors.text.secondary }]}>
            {new Date(task.deadline).toLocaleDateString()}
          </Text>
        )}
      </View>
    </Pressable>
  );

  return (
    <FlatList
      data={tasks}
      renderItem={renderTask}
      keyExtractor={(task) => task.id}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checkbox: {
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  completedTask: {
    textDecorationLine: 'line-through',
  },
  deadline: {
    fontSize: 14,
    marginTop: 4,
  },
}); 
