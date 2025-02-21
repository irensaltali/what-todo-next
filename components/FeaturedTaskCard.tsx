import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

interface FeaturedTaskCardProps {
  taskTitle: string;
  taskDescription: string;
  categories: string[];
  deadline: Date;
  onFocusPress: () => void;
}

const FeaturedTaskCard: React.FC<FeaturedTaskCardProps> = ({
  taskTitle,
  taskDescription,
  categories,
  deadline,
  onFocusPress,
}) => {
  const truncatedDescription = taskDescription.length > 80 
    ? taskDescription.substring(0, 80) + '...' 
    : taskDescription;
  const visibleCategories = categories.slice(0, 3);

  return (
    <View style={styles.cardContainer}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.featuredLabel}>Featured Task</Text>
          <Text style={styles.taskTitle}>{taskTitle}</Text>
        </View>
        <View style={styles.priorityBadge}>
          <Ionicons name="star" size={12} color="#fff" />
          <Text style={styles.priorityText}>Priority</Text>
        </View>
      </View>

      <Text style={styles.taskDescription}>{truncatedDescription}</Text>

      <View style={styles.categoriesContainer}>
        {visibleCategories.map((category, index) => (
          <View key={index} style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <View style={styles.deadlineContainer}>
          <Ionicons name="calendar-outline" size={16} color="#8E8E93" />
          <Text style={styles.deadlineText}>
            {format(deadline, 'MMM d, yyyy')}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.focusButton} 
          onPress={onFocusPress}
        >
          <Ionicons name="flash-outline" size={16} color="#fff" />
          <Text style={styles.focusButtonText}>Focus</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  featuredLabel: {
    fontSize: 12,
    color: '#FF9F1C',
    fontWeight: '600',
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9F1C',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  priorityText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  taskDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
    lineHeight: 20,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deadlineText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  focusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9F1C',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 4,
  },
  focusButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default FeaturedTaskCard
