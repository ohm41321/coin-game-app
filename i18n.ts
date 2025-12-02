// i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEN from './public/locales/en/translation.json';
import translationTH from './public/locales/th/translation.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: translationEN,
      },
      th: {
        translation: translationTH,
      },
    },
    lng: 'en', // Set default language
    fallbackLng: 'en',
    supportedLngs: ['en', 'th'],
    debug: true,
    interpolation: {
      escapeValue: false, // React already does escaping
    },
  });

export default i18n;
