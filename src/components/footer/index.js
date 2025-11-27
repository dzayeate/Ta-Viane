import React from 'react';
import { HiHeart } from 'react-icons/hi2';

export default function Footer({ t }) {
  return (
    <div className="w-full glass-strong border-t border-neutral-200/50 py-6 mb-20 backdrop-blur-2xl">
      <div className="container-content">
        <div className="text-center space-y-2">
          <p className="text-sm text-neutral-700 font-medium">{t('main.subtitle')}</p>
          <p className="text-xs text-neutral-600 flex items-center justify-center gap-1">
            {t('main.developedBy')} dengan
            <HiHeart className="text-accent-500 inline animate-pulse" />
            oleh{" "}
            <a
              href="https://www.instagram.com/vianeepw/"
              className="font-semibold text-brand-600 hover:text-brand-700 hover:underline transition-colors duration-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              Viane Pindhi Wardiyane
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
