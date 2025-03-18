import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/lib/styles/useTheme';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const SPACING = 16;
const ITEM_WIDTH = (width - (SPACING * (COLUMN_COUNT + 1))) / COLUMN_COUNT;

export default function BrowseScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const theme = useTheme();

  // Temporary mock data for lists
  const lists = [
    { id: '1', name: 'Work', icon: 'briefcase-outline', color: '#FF9F1C' },
    { id: '2', name: 'Personal', icon: 'person-outline', color: '#2EC4B6' },
    { id: '3', name: 'Shopping', icon: 'cart-outline', color: '#E71D36' },
    { id: '4', name: 'Health', icon: 'fitness-outline', color: '#011627' },
  ];

  const ListCard = ({ list }: { list: typeof lists[0] }) => (
    <Pressable
      style={[styles.card, { backgroundColor: list.color }]}
      onPress={() => {
        // TODO: Navigate to list details
      }}
    >
      <View style={styles.cardContent}>
        <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
          <Ionicons name={list.icon as any} size={24} color="#fff" />
        </View>
        <Text style={styles.cardTitle}>{list.name}</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('browse.title')}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {lists.map((list) => (
            <ListCard key={list.id} list={list} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING / 2,
  },
  card: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    margin: SPACING / 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginTop: 8,
  },
}); 
