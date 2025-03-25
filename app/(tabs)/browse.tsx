import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTaskStore, Task } from '../../store/taskStore';
import { layoutStyles } from '../../lib/styles/layout';
import { browseStyles } from '../../lib/styles/browse';

const { width } = Dimensions.get('window');

interface CategoryCard {
  id: string;
  title: string;
  icon: string;
  color: string;
  count: number;
}

export default function BrowseScreen() {
  const { t } = useTranslation();
  const taskStore = useTaskStore();
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<CategoryCard[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const tasks = await taskStore.filterTasks({});
      
      // Calculate task counts for each category
      const categoryCounts = tasks.reduce((acc: Record<string, number>, task: Task) => {
        if (task.status) {
          acc[task.status] = (acc[task.status] || 0) + 1;
        }
        return acc;
      }, {});

      // Create category cards
      const categoryCards: CategoryCard[] = [
        {
          id: 'all',
          title: t('browse.categories.all'),
          icon: 'grid-outline',
          color: '#007AFF',
          count: tasks.length,
        },
        {
          id: 'ongoing',
          title: t('browse.categories.ongoing'),
          icon: 'time-outline',
          color: '#FF6B6B',
          count: categoryCounts['ongoing'] || 0,
        },
        {
          id: 'inprogress',
          title: t('browse.categories.inprogress'),
          icon: 'hourglass-outline',
          color: '#4ECDC4',
          count: categoryCounts['inprogress'] || 0,
        },
        {
          id: 'completed',
          title: t('browse.categories.completed'),
          icon: 'checkmark-circle-outline',
          color: '#45B7D1',
          count: categoryCounts['completed'] || 0,
        },
      ];

      setCategories(categoryCards);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderCategoryCard = (category: CategoryCard, index: number) => {
    const cardStyle = {
      ...browseStyles.categoryCard,
      backgroundColor: category.color,
      transform: [{ translateY: index * 10 }],
      zIndex: categories.length - index,
    };

    return (
      <Pressable
        key={category.id}
        style={cardStyle}
        onPress={() => {
          // Handle category press
        }}
      >
        <View style={browseStyles.cardContent}>
          <View style={browseStyles.cardHeader}>
            <Ionicons name={category.icon as any} size={24} color="#FFFFFF" />
            <Text style={browseStyles.cardCount}>{category.count}</Text>
          </View>
          <Text style={browseStyles.cardTitle}>{category.title}</Text>
        </View>
      </Pressable>
    );
  };

  if (isLoading) {
    return (
      <View style={browseStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[browseStyles.container, { backgroundColor: '#FFFFFF' }]}>
      <View style={browseStyles.header}>
        <Text style={[browseStyles.title, { color: '#000000' }]}>
          {t('browse.title')}
        </Text>
      </View>

      <ScrollView
        style={browseStyles.content}
        contentContainerStyle={browseStyles.categoriesContainer}
        showsVerticalScrollIndicator={false}
      >
        {categories.map((category, index) => renderCategoryCard(category, index))}
      </ScrollView>
    </SafeAreaView>
  );
} 
