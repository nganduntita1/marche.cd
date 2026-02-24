import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { Platform } from 'react-native';

import en from '../assets/locales/en.json';
import fr from '../assets/locales/fr.json';

const LANGUAGE_STORAGE_KEY = 'app_language';
const LANGUAGE_MODE_STORAGE_KEY = 'app_language_mode';
const LANGUAGE_MODE_MANUAL = 'manual';
const SUPPORTED_LANGUAGES = ['en', 'fr'] as const;

type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const normalizeLanguage = (rawLanguage?: string | null): SupportedLanguage => {
  if (!rawLanguage) return 'fr';

  const baseLanguage = rawLanguage.toLowerCase().split('-')[0];
  if (SUPPORTED_LANGUAGES.includes(baseLanguage as SupportedLanguage)) {
    return baseLanguage as SupportedLanguage;
  }

  return 'fr';
};

const detectDeviceLanguage = (): SupportedLanguage => {
  if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
    const browserLanguage = navigator.language || navigator.languages?.[0];
    if (browserLanguage) {
      return normalizeLanguage(browserLanguage);
    }
  }

  const locale = getLocales()[0];
  if (locale?.languageTag) {
    return normalizeLanguage(locale.languageTag);
  }

  return 'fr';
};

const applySavedLanguagePreference = async () => {
  try {
    const languageMode = await AsyncStorage.getItem(LANGUAGE_MODE_STORAGE_KEY);
    if (languageMode !== LANGUAGE_MODE_MANUAL) {
      return;
    }

    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (!savedLanguage) return;

    const normalizedSavedLanguage = normalizeLanguage(savedLanguage);
    if (normalizedSavedLanguage !== i18n.language) {
      await i18n.changeLanguage(normalizedSavedLanguage);
    }
  } catch (error) {
    console.error('Error applying saved language preference:', error);
  }
};

export const syncLanguagePreference = async () => {
  try {
    const languageMode = await AsyncStorage.getItem(LANGUAGE_MODE_STORAGE_KEY);

    if (languageMode === LANGUAGE_MODE_MANUAL) {
      await applySavedLanguagePreference();
      return;
    }

    const detectedLanguage = detectDeviceLanguage();
    if (detectedLanguage !== i18n.language) {
      await i18n.changeLanguage(detectedLanguage);
    }
  } catch (error) {
    console.error('Error syncing language preference:', error);
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
    },
    lng: detectDeviceLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })
  .then(() => {
    void syncLanguagePreference();
  });

export default i18n;
