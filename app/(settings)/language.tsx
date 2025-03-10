import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import useLanguageStore from '@/store/languageStore';
import i18n from '@/i18n/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';

const LANGUAGES = [
  { code: 'en', name: 'English', region: 'United States', rtl: false },
  { code: 'tr', name: 'Türkçe', region: 'Türkiye', rtl: false },
  { code: 'es', name: 'Español', region: 'España', rtl: false },
  { code: 'fr', name: 'Français', region: 'France', rtl: false },
  { code: 'de', name: 'Deutsch', region: 'Deutschland', rtl: false },
  { code: 'it', name: 'Italiano', region: 'Italia', rtl: false },
  { code: 'pt', name: 'Português', region: 'Brasil', rtl: false },
  { code: 'ru', name: 'Русский', region: 'Россия', rtl: false },
  { code: 'ja', name: '日本語', region: '日本', rtl: false },
  { code: 'ko', name: '한국어', region: '대한민국', rtl: false },
  { code: 'zh', name: '中文', region: '中国', rtl: false },
  // Add any RTL languages here with rtl: true
  // e.g., { code: 'ar', name: 'العربية', region: 'مصر', rtl: true },
];

export default function LanguageScreen() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguageStore();
  const [changingLanguage, setChangingLanguage] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  
  // Reset UI state when screen is loaded
  useEffect(() => {
    setSelectedLanguage(language);
    setChangingLanguage(false);
  }, [language]);
  
  const handleLanguageChange = async (langCode: string) => {
    if (langCode === language) return;
    
    try {
      setChangingLanguage(true);
      setSelectedLanguage(langCode);
      
      // Get language configuration for the selected language
      const langConfig = LANGUAGES.find(lang => lang.code === langCode);
      if (!langConfig) return;
      
      // Handle RTL if needed
      if (I18nManager.isRTL !== langConfig.rtl) {
        // We need to restart the app for RTL changes to take effect
        await I18nManager.forceRTL(langConfig.rtl);
      }
      
      // Store the new language locally
      await AsyncStorage.setItem('language', langCode);
      
      // Update the language in the store
      setLanguage(langCode);
      
      // Change the i18n language
      await i18n.changeLanguage(langCode);
      
      // Small delay to show the change visually
      setTimeout(() => {
        setChangingLanguage(false);
      }, 500);
      
    } catch (error) {
      console.error('Failed to change language:', error);
      setChangingLanguage(false);
      setSelectedLanguage(language); // Revert to current language on error
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: t('profile.language_region'),
          headerLeft: () => (
            <Pressable 
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={28} color="#007AFF" />
            </Pressable>
          ),
        }} 
      />
      
      {changingLanguage && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FF9F1C" />
          <Text style={styles.loadingText}>{t('change_language')}...</Text>
        </View>
      )}
      
      <View style={styles.section}>
        {LANGUAGES.map((lang, index) => (
          <Pressable
            key={lang.code}
            style={[
              styles.languageItem,
              index !== LANGUAGES.length - 1 && styles.borderBottom,
              selectedLanguage === lang.code && styles.selectedLanguage
            ]}
            onPress={() => handleLanguageChange(lang.code)}
            disabled={changingLanguage}
          >
            <View style={styles.languageInfo}>
              <Text style={[
                styles.languageName,
                selectedLanguage === lang.code && styles.selectedText
              ]}>
                {lang.name}
              </Text>
              <Text style={styles.regionName}>{lang.region}</Text>
            </View>
            {selectedLanguage === lang.code && (
              <Ionicons name="checkmark" size={24} color="#34C759" />
            )}
          </Pressable>
        ))}
      </View>
      
      <Text style={styles.noteText}>
        Note: The app will apply the language change immediately.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  backButton: {
    padding: 8,
    marginLeft: -4,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#1C1C1E',
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
  selectedLanguage: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
  },
  selectedText: {
    fontWeight: '700',
    color: '#007AFF',
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
  noteText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 20,
    marginHorizontal: 16,
  }
});
