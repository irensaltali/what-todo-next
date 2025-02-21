import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns'; // for date formatting

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
  const truncatedDescription = taskDescription.length > 80 ? taskDescription.substring(0, 80) + '...' : taskDescription;
  const visibleCategories = categories.slice(0, 3); // Show max 3 categories

  return (
    <View style={styles.cardContainer}>
      <View style={styles.contentContainer}>
        <Text style={styles.taskTitle}>{taskTitle}</Text>
        <Text style={styles.taskDescription}>{truncatedDescription}</Text>

        <View style={styles.categoriesContainer}>
          {visibleCategories.map((category, index) => (
            <View key={index} style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{category}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.deadlineText}>
            Deadline: {format(deadline, 'MMM dd, yyyy')}
          </Text>
          <TouchableOpacity style={styles.focusButton} onPress={onFocusPress}>
            <Text style={styles.focusButtonText}>Focus</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#F26E56',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  contentContainer: {
    paddingBottom: 16, // Space before the footer
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  taskDescription: {
    fontSize: 14,
    color: '#000',
    marginBottom: 12,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Allow categories to wrap to the next line
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: '#52C1C4', // Light gray badge
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 8,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    color: '#000',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  deadlineText: {
    fontSize: 12,
    color: '#111',
  },
  focusButton: {
    backgroundColor: '#FFC247', 
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  focusButtonText: {
    color: '#111',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default FeaturedTaskCard;
