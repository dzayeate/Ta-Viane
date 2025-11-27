import { IoLanguage } from "react-icons/io5";
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation('common');
  
  // Handle language change
  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'id' : 'en';
    i18n.changeLanguage(newLang);
    
    // Dispatch custom event for language change
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: newLang } }));
  };

  return (
    <button
      onClick={toggleLanguage}
      className="btn btn-secondary gap-2 group relative"
      aria-label={t('language.switch')}
    >
      <IoLanguage className="text-xl transition-transform duration-200 group-hover:rotate-12" />
      <span className="font-medium">{t('language.' + (i18n.language === 'en' ? 'en' : 'id'))}</span>
    </button>
  );
};

export default LanguageSwitcher;