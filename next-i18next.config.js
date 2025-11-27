module.exports = {
  // Konfigurasi dasar i18n
  i18n: {
    defaultLocale: 'id',
    locales: ['id', 'en'],
    localePath: './src/locales',
  },
  
  // Opsi tambahan
  debug: process.env.NODE_ENV === 'development',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  defaultNS: 'common',
  
  // Konfigurasi React
  react: {
    useSuspense: false,
  },
  
  // Nonaktifkan fitur yang tidak diperlukan
  localeSubpaths: {},
  use: [],
  initImmediate: false
};