import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import gu from './locales/gu.json';
import hi from './locales/hi.json';
import en from './locales/en.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      gu: { translation: gu },
      hi: { translation: hi },
      en: { translation: en },
    },
    lng: 'gu', // Default language is Gujarati
    fallbackLng: 'gu',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
