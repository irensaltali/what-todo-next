import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import useLanguageStore from '@/store/languageStore';
import i18n from '@/i18n/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import { contentStyles } from '@/lib/styles/content';
import { useTheme } from '@/lib/styles/useTheme';

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
  const theme = useTheme();
  
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
    <View style={contentStyles.container}>
      <Stack.Screen 
        options={{ 
          title: t('profile.language_region'),
          headerLeft: () => (
            <Pressable 
              onPress={() => router.back()}
              style={contentStyles.backButton}
            >
              <Ionicons name="chevron-back" size={28} color={theme.colors.primary} />
            </Pressable>
          ),
        }} 
      />
      
      {changingLanguage && (
        <View style={contentStyles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={contentStyles.loadingText}>{t('change_language')}...</Text>
        </View>
      )}
      
      <View style={contentStyles.section}>
        {LANGUAGES.map((lang, index) => (
          <Pressable
            key={lang.code}
            style={[
              contentStyles.languageItem,
              index !== LANGUAGES.length - 1 && contentStyles.borderBottom,
              selectedLanguage === lang.code && contentStyles.selectedLanguage
            ]}
            onPress={() => handleLanguageChange(lang.code)}
            disabled={changingLanguage}
          >
            <View style={contentStyles.languageInfo}>
              <Text style={[
                contentStyles.languageName,
                selectedLanguage === lang.code && contentStyles.selectedText
              ]}>
                {lang.name}
              </Text>
              <Text style={contentStyles.regionName}>{lang.region}</Text>
            </View>
            {selectedLanguage === lang.code && (
              <Ionicons name="checkmark" size={24} color={theme.colors.text.success} />
            )}
          </Pressable>
        ))}
      </View>
      
      <Text style={contentStyles.noteText}>
        Note: The app will apply the language change immediately.
      </Text>
    </View>
  );
}
