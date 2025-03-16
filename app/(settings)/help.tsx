import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { contentStyles } from '@/lib/styles/content';
import { useTheme } from '@/lib/styles/useTheme';

const FAQ_ITEMS = [
  {
    question: 'How do I create a new task?',
    answer: 'To create a new task, tap the + button in the center of the bottom tab bar. Fill in the task details and tap "Create Task".',
  },
  {
    question: 'Can I share tasks with others?',
    answer: 'Yes, you can share tasks with team members by adding their email addresses in the task sharing section. This feature is available for Premium users.',
  },
  {
    question: 'How do I set task reminders?',
    answer: 'When creating or editing a task, toggle the "Alerts" switch to enable reminders. You can customize reminder times in the task settings.',
  },
  {
    question: 'How do I track my progress?',
    answer: 'Your task progress is displayed in the Analytics tab. You can view detailed statistics and reports about your completed and ongoing tasks.',
  },
];

const CONTACT_OPTIONS = [
  {
    icon: 'mail',
    title: 'Email Support',
    description: 'Get help via email',
  },
  {
    icon: 'chatbubbles',
    title: 'Live Chat',
    description: 'Chat with our support team',
  },
  {
    icon: 'call',
    title: 'Phone Support',
    description: 'Speak with a representative',
  },
];

export default function HelpScreen() {
  const theme = useTheme();
  
  return (
    <ScrollView style={contentStyles.container}>
      <Stack.Screen options={{ title: 'Help Center' }} />
      
      <View style={contentStyles.searchSection}>
        <View style={contentStyles.searchBar}>
          <Ionicons name="search" size={20} color={theme.colors.text.secondary} />
          <Text style={contentStyles.searchPlaceholder}>Search help articles</Text>
        </View>
      </View>

      <View style={contentStyles.section}>
        <Text style={contentStyles.sectionTitle}>Frequently Asked Questions</Text>
        {FAQ_ITEMS.map((item, index) => (
          <Pressable
            key={index}
            style={[
              contentStyles.faqItem,
              index !== FAQ_ITEMS.length - 1 && contentStyles.borderBottom,
            ]}
          >
            <Text style={contentStyles.question}>{item.question}</Text>
            <Text style={contentStyles.answer}>{item.answer}</Text>
          </Pressable>
        ))}
      </View>

      <View style={contentStyles.section}>
        <Text style={contentStyles.sectionTitle}>Contact Support</Text>
        {CONTACT_OPTIONS.map((option, index) => (
          <Pressable
            key={index}
            style={[
              contentStyles.contactOption,
              index !== CONTACT_OPTIONS.length - 1 && contentStyles.borderBottom,
            ]}
          >
            <View style={contentStyles.contactIcon}>
              <Ionicons name={option.icon as any} size={24} color={theme.colors.secondary} />
            </View>
            <View style={contentStyles.contactInfo}>
              <Text style={contentStyles.contactTitle}>{option.title}</Text>
              <Text style={contentStyles.contactDescription}>{option.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
