import React from 'react';
import { useTranslation } from 'next-i18next';
import LanguageSwitcher from '../language-switcher';
import { useRouter } from 'next/router';
import { HiArrowRightOnRectangle, HiBolt, HiDocumentText } from 'react-icons/hi2';
import { HiSparkles } from 'react-icons/hi';

const Navbar = ({ showLogout = false, onLogout }) => {
  const { t } = useTranslation('common');
  const router = useRouter();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('nupkt');
      localStorage.removeItem('password');
      router.push('/');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-neutral-200/50 backdrop-blur-2xl shadow-md">
      <div className="container-app">
        <div className="flex justify-between items-center h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-4 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-brand rounded-2xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative p-2.5 bg-white rounded-2xl shadow-md border border-neutral-200 group-hover:shadow-lg transition-all">
                <img
                  src="/math.png"
                  alt="Auto Physics Logo"
                  className="w-10 h-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent-500 rounded-full border-2 border-white animate-pulse shadow-lg"></div>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-xl text-neutral-900">{t('main.title')}</span>
                <HiBolt className="w-5 h-5 text-brand-500 animate-pulse" />
              </div>
              <span className="text-xs text-neutral-500 hidden sm:block font-medium">
                AI-Powered Question Generator
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {showLogout && (
              <button
                type="button"
                onClick={() => router.push('/saved-questions')}
                className="btn btn-ghost gap-2 group hover:bg-neutral-100"
                title="Bank Soal"
              >
                <HiDocumentText className="text-xl text-brand-600" />
                <span className="hidden sm:inline font-semibold text-brand-600">Bank Soal</span>
              </button>
            )}
            <LanguageSwitcher />
            {showLogout && (
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-ghost gap-2 group hover:bg-neutral-100"
                title={t('main.logout')}
              >
                <HiArrowRightOnRectangle className="text-xl transition-transform duration-200 group-hover:translate-x-0.5" />
                <span className="hidden sm:inline font-semibold">{t('main.logout')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;