import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Initialize i18next
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // Bahasa default
    fallbackLng: 'id',
    debug: process.env.NODE_ENV === 'development',
    
    // Namespace yang digunakan
    ns: ['common'],
    defaultNS: 'common',
    
    // Konfigurasi backend untuk memuat file terjemahan
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    
    // Deteksi bahasa
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'language',
      caches: ['localStorage'],
    },
    
    // Bahasa yang didukung
    supportedLngs: ['id', 'en'],
    
    // Konfigurasi interpolasi
    interpolation: {
      escapeValue: false, // React sudah melakukan escape
    },
    
    // Konfigurasi React
    react: {
      useSuspense: false,
    },
  });

export default i18n;
