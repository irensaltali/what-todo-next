import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const FEATURES = [
  {
    icon: 'infinite',
    title: 'Unlimited Tasks',
    description: 'Create as many tasks as you need',
  },
  {
    icon: 'people',
    title: 'Team Collaboration',
    description: 'Work together with your team',
  },
  {
    icon: 'analytics',
    title: 'Advanced Analytics',
    description: 'Get detailed insights and reports',
  },
  {
    icon: 'cloud-upload',
    title: 'Cloud Backup',
    description: 'Never lose your important data',
  },
];

const PLANS = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '$9.99',
    period: 'per month',
    popular: false,
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: '$89.99',
    period: 'per year',
    popular: true,
    savings: 'Save 25%',
  },
];

export default function PremiumScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Go Premium' }} />
      
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' }}
          style={styles.headerImage}
        />
        <Text style={styles.headerTitle}>Unlock Premium Features</Text>
        <Text style={styles.headerSubtitle}>
          Get access to all features and take your productivity to the next level
        </Text>
      </View>

      <View style={styles.features}>
        {FEATURES.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name={feature.icon as any} size={24} color="#FF6B00" />
            </View>
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.plans}>
        {PLANS.map((plan) => (
          <Pressable key={plan.id} style={[styles.planCard, plan.popular && styles.popularPlan]}>
            {plan.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>Most Popular</Text>
              </View>
            )}
            <Text style={[styles.planName, plan.popular && styles.popularPlanText]}>
              {plan.name}
            </Text>
            <Text style={[styles.planPrice, plan.popular && styles.popularPlanText]}>
              {plan.price}
            </Text>
            <Text style={[styles.planPeriod, plan.popular && styles.popularPlanText]}>
              {plan.period}
            </Text>
            {plan.savings && (
              <Text style={styles.savingsText}>{plan.savings}</Text>
            )}
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.subscribeButton}>
        <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    alignItems: 'center',
    padding: 24,
  },
  headerImage: {
    width: 200,
    height: 200,
    marginBottom: 24,
    borderRadius: 100,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  features: {
    padding: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF3E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6C757D',
  },
  plans: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  planCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  popularPlan: {
    backgroundColor: '#FF6B00',
    transform: [{ scale: 1.05 }],
  },
  popularBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  popularText: {
    color: '#FF6B00',
    fontSize: 12,
    fontWeight: '600',
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  planPeriod: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 8,
  },
  popularPlanText: {
    color: '#fff',
  },
  savingsText: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '600',
  },
  subscribeButton: {
    backgroundColor: '#FF6B00',
    marginHorizontal: 16,
    marginVertical: 24,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
