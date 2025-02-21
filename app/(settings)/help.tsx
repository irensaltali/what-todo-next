import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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
  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Help Center' }} />
      
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#6C757D" />
          <Text style={styles.searchPlaceholder}>Search help articles</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        {FAQ_ITEMS.map((item, index) => (
          <Pressable
            key={index}
            style={[
              styles.faqItem,
              index !== FAQ_ITEMS.length - 1 && styles.borderBottom,
            ]}
          >
            <Text style={styles.question}>{item.question}</Text>
            <Text style={styles.answer}>{item.answer}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Support</Text>
        {CONTACT_OPTIONS.map((option, index) => (
          <Pressable
            key={index}
            style={[
              styles.contactOption,
              index !== CONTACT_OPTIONS.length - 1 && styles.borderBottom,
            ]}
          >
            <View style={styles.contactIcon}>
              <Ionicons name={option.icon as any} size={24} color="#FF6B00" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>{option.title}</Text>
              <Text style={styles.contactDescription}>{option.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6C757D" />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  searchSection: {
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchPlaceholder: {
    marginLeft: 8,
    fontSize: 16,
    color: '#6C757D',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 24,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  faqItem: {
    padding: 16,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  answer: {
    fontSize: 14,
    color: '#6C757D',
    lineHeight: 20,
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF3E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 14,
    color: '#6C757D',
  },
});