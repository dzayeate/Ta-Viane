const removeImports = require("next-remove-imports")();
const webpack = require("webpack");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  
  // Konfigurasi webpack
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };

      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^node:/,
          (resource) => {
            resource.request = resource.request.replace(/^node:/, "");
          }
        )
      );
    }
    return config;
  },
  
  // Konfigurasi gambar
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sgp1.vultrobjects.com',
      },
    ],
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
