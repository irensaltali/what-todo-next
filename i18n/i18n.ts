import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './languages/en.json';
import tr from './languages/tr.json';
import es from './languages/es.json';
import fr from './languages/fr.json';
import de from './languages/de.json';
import it from './languages/it.json';
import pt from './languages/pt.json';
import ru from './languages/ru.json';
import ja from './languages/ja.json';
import ko from './languages/ko.json';
import zh from './languages/zh.json';

// Simple language detector without RNLocalize
const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      // Check AsyncStorage first
      const storedLanguage = await AsyncStorage.getItem('language');
      if (storedLanguage) {
        callback(storedLanguage);
        return;
      }

      // Default to English if no stored language
      const defaultLang = 'en';
      await AsyncStorage.setItem('language', defaultLang);
      callback(defaultLang);
    } catch (error) {
      console.error('Language detection error:', error);
      callback('en'); // Fallback to English on error
    }
  },
  init: () => {},
  cacheUserLanguage: () => {},
};

i18n
  .use(languageDetector as any)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      tr: { translation: tr },
      es: { translation: es },
      fr: { translation: fr },
      de: { translation: de },
      it: { translation: it },
      pt: { translation: pt },
      ru: { translation: ru },
      ja: { translation: ja },
      ko: { translation: ko },
      zh: { translation: zh }
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React Native handles escaping
    },
    compatibilityJSON: 'v4', // For RN compatibility
  });

export default i18n;
