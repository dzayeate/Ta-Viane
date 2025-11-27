import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { 
  HiHome, 
  HiDocumentText, 
  HiSparkles, 
  HiPlus, 
  HiArrowRightOnRectangle, 
  HiChatBubbleLeftRight,
  HiBars3,
  HiXMark,
  HiEye
} from 'react-icons/hi2';
import LanguageSwitcher from '@/components/language-switcher';

const Sidebar = ({ 
  t, 
  user, 
  onLogout, 
  onOpenModal, 
  onAddQuestion, 
  onOpenReview, 
  questionCount = 0 
}) => {
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isActive = (path) => router.pathname === path;

  const navItems = [
    {
      label: t('main.home'),
      icon: HiHome,
      path: '/',
      onClick: () => router.push('/')
    },
    {
      label: 'Bank Soal',
      icon: HiDocumentText,
      path: '/saved-questions',
      onClick: () => router.push('/saved-questions')
    }
  ];

  const toggleMobileMenu = () => setIsMobileOpen(!isMobileOpen);

  return (
    <>
      {/* Mobile Header Toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <img src="/math.png" alt="Logo" className="w-8 h-8" />
          <span className="font-display font-bold text-lg text-neutral-900">Auto Physics</span>
        </div>
        <button 
          onClick={toggleMobileMenu}
          className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg"
        >
          {isMobileOpen ? <HiXMark className="w-6 h-6" /> : <HiBars3 className="w-6 h-6" />}
        </button>
      </div>

      {/* Overlay for Mobile */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-neutral-900/50 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 h-full w-72 bg-white border-r border-neutral-200 z-50
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:h-screen
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="h-20 flex items-center gap-3 px-6 border-b border-neutral-100">
            <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center border border-brand-100">
              <img src="/math.png" alt="Logo" className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-neutral-900 tracking-tight">Auto Physics</h1>
              <p className="text-xs text-neutral-500 font-medium">Teacher Dashboard</p>
            </div>
          </div>

          {/* Main Navigation */}
          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
            
            {/* Primary Actions */}
            <div className="space-y-3">
              <p className="px-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">Actions</p>
              <button
                onClick={() => {
                  router.push('/create-question');
                  setIsMobileOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-all shadow-sm hover:shadow-md group"
              >
                <HiSparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span className="font-semibold">Buat Soal Otomatis</span>
              </button>
              
              <button
                onClick={() => {
                  onAddQuestion();
                  setIsMobileOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-neutral-200 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-all"
              >
                <HiPlus className="w-5 h-5" />
                <span className="font-medium">Tambah Manual</span>
              </button>
            </div>

            {/* Menu Items */}
            <div className="space-y-1">
              <p className="px-2 text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Menu</p>
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    item.onClick();
                    setIsMobileOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${
                    isActive(item.path)
                      ? 'bg-brand-50 text-brand-700 font-semibold'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-brand-600' : 'text-neutral-400'}`} />
                  <span>{item.label}</span>
                </button>
              ))}

              {/* Review Button (Conditional) */}
              {questionCount > 0 && (
                <button
                  onClick={() => {
                    onOpenReview();
                    setIsMobileOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <HiEye className="w-5 h-5 text-neutral-400" />
                    <span>Review Soal</span>
                  </div>
                  <span className="bg-brand-100 text-brand-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {questionCount}
                  </span>
                </button>
              )}
            </div>

            {/* Feedback */}
            <div className="space-y-1">
              <p className="px-2 text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Support</p>
              <button
                onClick={() => {
                  router.push('/feedback');
                  setIsMobileOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
              >
                <HiChatBubbleLeftRight className="w-5 h-5 text-neutral-400" />
                <span>Feedback</span>
              </button>
            </div>
          </div>

          {/* Footer / User Profile */}
          <div className="p-4 border-t border-neutral-200 bg-neutral-50/50">
            <div className="flex items-center justify-between mb-4">
               <LanguageSwitcher />
            </div>
            
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white transition-colors cursor-default">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold shadow-sm">
                {user?.nama?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-900 truncate">{user?.nama || 'User'}</p>
                <p className="text-xs text-neutral-500 truncate">{user?.nuptk || 'NUPTK'}</p>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-neutral-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                title="Logout"
              >
                <HiArrowRightOnRectangle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
