// i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend'; // Import the backend

i18n
  // Load translations from the backend
  .use(Backend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Init i18next
  .init({
    debug: true,
    fallbackLng: 'en',
    supportedLngs: ['en', 'th'],
    interpolation: {
      escapeValue: false, // Not needed for react as it escapes by default
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json', // Path to your translation files
    },
  });

export default i18n;
