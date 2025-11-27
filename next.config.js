const removeImports = require("next-remove-imports")();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  
  // Konfigurasi webpack
  webpack: (config) => {
    config.resolve.fallback = { fs: false };
    return config;
  },
  
  // Konfigurasi runtime
  publicRuntimeConfig: {
    default_timezone: 'Asia/Jakarta',
  },
  
  // Konfigurasi gambar
  images: {
    domains: ['sgp1.vultrobjects.com'],
  },
  
  // Konfigurasi rewrites
  rewrites: async () => [
    {
      source: '/_health',
      destination: '/api/_health',
    },
  ],
  
  // Nonaktifkan trailing slash
  trailingSlash: false,
  
  // Nonaktifkan redirect
  async redirects() {
    return [];
  },
  
  // Nonaktifkan i18n bawaan Next.js
  i18n: {
    locales: ['id', 'en'],
    defaultLocale: 'id',
  },
};

module.exports = removeImports(nextConfig);
