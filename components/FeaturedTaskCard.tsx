import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { FocusTaskView } from './FocusTaskView';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { featuredTaskCardStyles, featureCardColors } from '@/lib/styles/featured-task-card';

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
        style={featuredTaskCardStyles.cardContainer}
      >
        <View style={featuredTaskCardStyles.header}>
          <View style={featuredTaskCardStyles.headerLeft}>
            <Text style={featuredTaskCardStyles.featuredLabel}>{t('task.featured_task')}</Text>
            <Text style={featuredTaskCardStyles.taskTitle}>{taskTitle}</Text>
          </View>
          <View style={featuredTaskCardStyles.priorityBadge}>
            <Ionicons name="star" size={12} color={featureCardColors.accent} />
            <Text style={featuredTaskCardStyles.priorityText}>{t('task.priority')}</Text>
          </View>
        </View>

        <Text style={featuredTaskCardStyles.taskDescription}>{truncatedDescription}</Text>

        <View style={featuredTaskCardStyles.categoriesContainer}>
          {visibleCategories.map((category, index) => (
            <View key={index} style={featuredTaskCardStyles.categoryBadge}>
              <Text style={featuredTaskCardStyles.categoryText}>{category}</Text>
            </View>
          ))}
        </View>

        <View style={featuredTaskCardStyles.footer}>
          <View style={featuredTaskCardStyles.deadlineContainer}>
            <Ionicons name="calendar-outline" size={16} color={featureCardColors.text.secondary} />
            <Text style={featuredTaskCardStyles.deadlineText}>
              {format(deadline, 'MMM d, yyyy')}
            </Text>
          </View>
          <TouchableOpacity 
            style={featuredTaskCardStyles.focusButton} 
            onPress={handleFocusPress}
          >
            <Ionicons name="flash-outline" size={16} color={featureCardColors.accent} />
            <Text style={featuredTaskCardStyles.focusButtonText}>{t('common.focus')}</Text>
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

export default FeaturedTaskCard;
