import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import translationCS from '@/locales/cs/translation.json'
import translationEN from '@/locales/en/translation.json'
import translationSK from '@/locales/sk/translation.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'cs',
    supportedLngs: ['en', 'cs', 'sk'],
    resources: {
      cs: { translation: translationCS },
      en: { translation: translationEN },
      sk: { translation: translationSK },
    },
    debug: false,
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
