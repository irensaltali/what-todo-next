import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const LANGUAGES = [
  { code: 'en', name: 'English', region: 'United States' },
  { code: 'es', name: 'Español', region: 'España' },
  { code: 'fr', name: 'Français', region: 'France' },
  { code: 'de', name: 'Deutsch', region: 'Deutschland' },
  { code: 'it', name: 'Italiano', region: 'Italia' },
  { code: 'pt', name: 'Português', region: 'Brasil' },
  { code: 'ru', name: 'Русский', region: 'Россия' },
  { code: 'ja', name: '日本語', region: '日本' },
  { code: 'ko', name: '한국어', region: '대한민국' },
  { code: 'zh', name: '中文', region: '中国' },
];

export default function LanguageScreen() {
  const currentLanguage = 'en';

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Language & Region' }} />
      
      <View style={styles.section}>
        {LANGUAGES.map((language, index) => (
          <Pressable
            key={language.code}
            style={[
              styles.languageItem,
              index !== LANGUAGES.length - 1 && styles.borderBottom,
            ]}
          >
            <View style={styles.languageInfo}>
              <Text style={styles.languageName}>{language.name}</Text>
              <Text style={styles.regionName}>{language.region}</Text>
            </View>
            {currentLanguage === language.code && (
              <Ionicons name="checkmark" size={24} color="#34C759" />
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  regionName: {
    fontSize: 14,
    color: '#6C757D',
  },
});