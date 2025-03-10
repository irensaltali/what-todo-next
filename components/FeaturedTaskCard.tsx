import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { FocusTaskView } from './FocusTaskView';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

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
  const [showFocusView, setShowFocusView] = React.useState(false);
  const truncatedDescription = taskDescription.length > 80 
    ? taskDescription.substring(0, 80) + '...' 
    : taskDescription;
  const visibleCategories = categories.slice(0, 3);
  const { t } = useTranslation();

  const handleFocusPress = () => {
    setShowFocusView(true);
    onFocusPress();
  };

  return (
    <>
      <LinearGradient
        colors={['#1A2151', '#1B3976', '#2C5F9B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardContainer}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.featuredLabel}>{t('task.featured_task')}</Text>
            <Text style={styles.taskTitle}>{taskTitle}</Text>
          </View>
          <View style={styles.priorityBadge}>
            <Ionicons name="star" size={12} color="#7EB6FF" />
            <Text style={styles.priorityText}>{t('task.priority')}</Text>
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
            <Ionicons name="calendar-outline" size={16} color="#B8C2CC" />
            <Text style={styles.deadlineText}>
              {format(deadline, 'MMM d, yyyy')}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.focusButton} 
            onPress={handleFocusPress}
          >
            <Ionicons name="flash-outline" size={16} color="#7EB6FF" />
            <Text style={styles.focusButtonText}>{t('common.focus')}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <FocusTaskView
        visible={showFocusView}
        onClose={() => setShowFocusView(false)}
        task={{
          title: taskTitle,
          description: taskDescription,
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 12,
    padding: 16,
    // marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
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
    color: '#7EB6FF',
    fontWeight: '600',
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(126, 182, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  priorityText: {
    fontSize: 12,
    color: '#7EB6FF',
    fontWeight: '600',
  },
  taskDescription: {
    fontSize: 14,
    color: '#B8C2CC',
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deadlineText: {
    fontSize: 12,
    color: '#B8C2CC',
  },
  focusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(126, 182, 255, 0.2)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 4,
  },
  focusButtonText: {
    color: '#7EB6FF',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default FeaturedTaskCard;
