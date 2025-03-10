import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LanguageState {
  language: string;
  setLanguage: (language: string) => void;
}

const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'en', // Default language
      setLanguage: (language: string) => set({ language }),
    }),
    {
      name: 'language-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useLanguageStore;
