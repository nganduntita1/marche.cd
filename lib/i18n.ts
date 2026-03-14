import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import fr from '../assets/locales/fr.json';

const LANGUAGE_STORAGE_KEY = 'app_language';
const LANGUAGE_MODE_STORAGE_KEY = 'app_language_mode';
const SUPPORTED_LANGUAGES = ['fr'] as const;

type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const normalizeLanguage = (rawLanguage?: string | null): SupportedLanguage => {
  if (!rawLanguage) return 'fr';
  return 'fr';
};

const detectDeviceLanguage = (): SupportedLanguage => normalizeLanguage('fr');

const applySavedLanguagePreference = async () => {
  try {
    // Force French and clear stale language preferences from older app versions.
    await AsyncStorage.multiRemove([LANGUAGE_STORAGE_KEY, LANGUAGE_MODE_STORAGE_KEY]);
    if (i18n.language !== 'fr') {
      await i18n.changeLanguage('fr');
    }
  } catch (error) {
    console.error('Error applying saved language preference:', error);
  }
};

export const syncLanguagePreference = async () => {
  try {
    await applySavedLanguagePreference();
  } catch (error) {
    console.error('Error syncing language preference:', error);
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
    },
    lng: 'fr',
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false,
    },
  })
  .then(() => {
    void syncLanguagePreference();
  });

export default i18n;
