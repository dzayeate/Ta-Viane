// pages/_app.js
import Head from "next/head";
import { appWithTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import '@/i18n';
import '@/styles/globals.css';
import 'katex/dist/katex.min.css';
import '@uiw/react-markdown-preview/markdown.css';
import '@uiw/react-md-editor/markdown-editor.css';

function MyApp({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false);

  // Pastikan komponen sudah di-mount di sisi klien
  useEffect(() => {
    setMounted(true);
  }, []);

  // Jangan render apa-apa sampai komponen di-mount
  // Ini mencegah masalah hydration
  if (!mounted) {
    return null;
  }

  return (
    <>
      <Head>
        {/* Primary Meta Tags */}
        <title>Auto Physics - AI-Powered Physics Problem Generator</title>
        <meta name="title" content="Auto Physics - AI-Powered Physics Problem Generator" />
        <meta name="description" content="Generate custom physics problems, experiments, and worksheets with AI. Perfect for teachers, students, and parents looking for personalized physics exercises." />
        <meta name="keywords" content="physics problems, physics generator, AI physics, education, mechanics, electricity, optics, physics worksheets" />
        <meta name="author" content="Auto Physics Team" />
        <meta name="robots" content="index, follow" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <link rel="icon" href="/math.png" />
        <link rel="canonical" href="https://physicsquest.com" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://physicsquest.com/" />
        <meta property="og:title" content="Auto Physics - AI-Powered Physics Problem Generator" />
        <meta property="og:description" content="Generate custom physics problems and lab-ready prompts with AI. Perfect for teachers, students, and parents." />
        <meta property="og:image" content="https://physicsquest.com/images/physics-quest-og.jpg" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://physicsquest.com/" />
        <meta property="twitter:title" content="Auto Physics - AI-Powered Physics Problem Generator" />
        <meta property="twitter:description" content="Generate custom physics problems and lab-ready prompts with AI. Perfect for teachers, students, and parents." />
        <meta property="twitter:image" content="https://physicsquest.com/images/physics-quest-twitter.jpg" />

        {/* Additional Meta Tags */}
        <meta name="theme-color" content="#3b82f6" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
