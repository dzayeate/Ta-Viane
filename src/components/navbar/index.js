import React from 'react';
import { useTranslation } from 'next-i18next';
import LanguageSwitcher from '@/components/language-switcher';
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
    <nav className="fixed top-0 left-0 right-0 z-40 glass-strong border-b border-neutral-200/50 backdrop-blur-lg shadow-sm transition-all duration-300">
      <div className="container-app">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push('/')}>
            <div className="relative">
              <div className="absolute inset-0 bg-brand-200 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative p-2 bg-white rounded-xl shadow-sm border border-neutral-200 group-hover:border-brand-200 transition-colors">
                <img
                  src="/math.png"
                  alt="Auto Physics Logo"
                  className="w-8 h-8 md:w-9 md:h-9 object-contain"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-lg md:text-xl text-neutral-900 tracking-tight">{t('main.title')}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand-100 text-brand-700 border border-brand-200 uppercase tracking-wider">Beta</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {showLogout && (
              <button
                type="button"
                onClick={() => router.push('/saved-questions')}
                className="btn btn-ghost btn-sm md:btn-md gap-2 group"
                title="Bank Soal"
              >
                <HiDocumentText className="text-lg text-neutral-500 group-hover:text-brand-600 transition-colors" />
                <span className="hidden sm:inline font-medium text-neutral-600 group-hover:text-brand-700">Bank Soal</span>
              </button>
            )}
            <div className="h-6 w-px bg-neutral-200 mx-1 hidden sm:block"></div>
            <LanguageSwitcher />
            {showLogout && (
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-ghost btn-sm md:btn-md gap-2 group text-danger-600 hover:bg-danger-50 hover:text-danger-700"
                title={t('main.logout')}
              >
                <HiArrowRightOnRectangle className="text-lg" />
                <span className="hidden sm:inline font-medium">{t('main.logout')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;