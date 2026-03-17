import React, { useState, useEffect, lazy, Suspense } from 'react';
import { View } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Editor } from './components/Editor';
import { Courses } from './components/Courses';
import { CourseJourney } from './components/CourseJourney';
import { Profile } from './components/Profile';
import { Settings } from './components/Settings';
import { Leaderboard } from './components/Leaderboard';
import { Achievements } from './components/Achievements';
import { AIChatPage } from './components/AIChatPage';
import { AuthPage } from './components/AuthPage';
import { Menu, Bell } from 'lucide-react';
import { UI_TEXTS, initializeAppData, CURRENT_USER } from './constants';
import { ActionToast } from './components/ActionToast';
import { apiGet, notificationsApi, type NotificationItem } from './api';

const AdminPanel = lazy(() => import('./components/AdminPanel').then((mod) => ({ default: mod.AdminPanel })));

const App: React.FC = () => {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(CURRENT_USER);
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [appNotifications, setAppNotifications] = useState<NotificationItem[]>([]);
  const appText = UI_TEXTS?.app ?? {};
  const [toastMessage, setToastMessage] = useState('');
  const [toastTone, setToastTone] = useState<'success' | 'info' | 'warning'>('info');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('theme');
    return stored === 'dark' ? 'dark' : 'light';
  });
  const role = String(currentUser?.settings?.role ?? currentUser?.role ?? '').toLowerCase();
  const isAdmin = role === 'admin' || Boolean(currentUser?.settings?.is_admin);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const onThemeChanged = () => {
      const stored = localStorage.getItem('theme');
      setTheme(stored === 'dark' ? 'dark' : 'light');
    };
    window.addEventListener('app-theme-changed', onThemeChanged as EventListener);
    return () => window.removeEventListener('app-theme-changed', onThemeChanged as EventListener);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      // Check for existing token
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await apiGet<any>('/auth/me');
          setCurrentUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
        }
      }

      await initializeAppData();
      if (!isMounted) return;

      try {
        const notifications = await notificationsApi.getAll();
        setAppNotifications(notifications.items || []);
      } catch {
        setAppNotifications([]);
      }

      setIsBootstrapping(false);
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAuthSuccess = (token: string, user: any) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    showToast(`Добро пожаловать, ${user.name}!`, 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setCurrentUser(CURRENT_USER);
    showToast('Вы вышли из аккаунта', 'info');
  };

  const showToast = (message: string, tone: 'success' | 'info' | 'warning' = 'info') => {
    setToastTone(tone);
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 2200);
  };

  const handleViewChange = (view: View) => {
    if (view === View.ADMIN && !isAdmin) {
      showToast('Недостаточно прав для админки', 'warning');
      return;
    }
    setCurrentView(view);
    setIsMobileMenuOpen(false); // Close menu on navigation
  };

  const loadNotifications = async () => {
    try {
      const notifications = await notificationsApi.getAll();
      setAppNotifications(notifications.items || []);
    } catch {
    }
  };

  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard setView={handleViewChange} />;
      case View.PRACTICE:
        return <Editor />;
      case View.AI_CHAT:
        return <AIChatPage />;
      case View.COURSES:
        return <Courses setView={handleViewChange} />;
      case View.COURSE_JOURNEY:
        return <CourseJourney setView={handleViewChange} />;
      case View.PROFILE:
        return <Profile setView={handleViewChange} />;
      case View.ACHIEVEMENTS:
        return <Achievements />;
      case View.LEADERBOARD:
        return <Leaderboard />;
      case View.SETTINGS:
        return <Settings />;
      case View.ADMIN:
        return (
          <Suspense
            fallback={
              <div className="min-h-[40vh] flex items-center justify-center">
                <div className="text-center">
                  <div className="size-8 border-2 border-py-accent border-t-py-green rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">Загружаем админку...</p>
                </div>
              </div>
            }
          >
            <AdminPanel isAdmin={isAdmin} />
          </Suspense>
        );
      default:
        return <Dashboard setView={handleViewChange} />;
    }
  };

  if (isBootstrapping) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-[#0c120e] text-slate-900 dark:text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="size-10 border-2 border-py-accent border-t-py-green rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500 dark:text-slate-300">Загружаем данные...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 selection:bg-emerald-300/40 selection:text-slate-900 relative">
      <ActionToast visible={Boolean(toastMessage)} message={toastMessage} tone={toastTone} />
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Responsive */}
      <Sidebar 
        currentView={currentView} 
        setView={handleViewChange} 
        isAdmin={isAdmin}
        isMobileOpen={isMobileMenuOpen} 
        closeMobileMenu={() => setIsMobileMenuOpen(false)}
      />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden w-full transition-all duration-300 relative">
        {/* Mobile Header Toggle for Immersive Views */}
        {(currentView === View.PRACTICE || currentView === View.AI_CHAT) && (
           <div className="md:hidden absolute top-4 left-4 z-20">
               <button 
                 onClick={() => setIsMobileMenuOpen(true)}
                 className="p-2 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-lg text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-900 dark:hover:text-slate-900 dark:hover:text-white"
               >
                 <Menu size={20} />
               </button>
           </div>
        )}

        {/* Main Header */}
        {currentView !== View.PRACTICE && currentView !== View.AI_CHAT && (
            <Header 
              onMenuClick={() => setIsMobileMenuOpen(true)} 
              onProfileClick={() => handleViewChange(View.PROFILE)}
              onLogout={handleLogout}
              onNotificationsClick={() => {
                const next = !showNotifications;
                setShowNotifications(next);
                if (next) {
                  loadNotifications();
                }
              }}
            />
        )}
        
        <div className={`flex-1 ${
            currentView !== View.PRACTICE && currentView !== View.AI_CHAT 
            ? 'overflow-y-auto custom-scrollbar' 
            : 'overflow-hidden'
        }`}>
          {renderView()}
        </div>

        {/* --- MODALS / OVERLAYS --- */}

        {/* Notifications Overlay */}
        {showNotifications && (
            <>
            <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowNotifications(false)}></div>
            <div className="absolute top-20 right-4 md:right-24 z-50 w-80 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl p-4 animate-float-up">
                <h3 className="text-slate-900 dark:text-white font-bold mb-3 flex items-center gap-2">
                    <Bell size={16} className="text-arcade-primary"/>
                  {appText.notificationsTitle}
                </h3>
                <div className="space-y-2 mb-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Новые</p>
                  <div className="space-y-2 max-h-44 overflow-y-auto custom-scrollbar pr-1">
                    {appNotifications.filter((n) => !n.read).map((item) => (
                      <div key={item.id} className="bg-slate-50 dark:bg-black/20 p-3 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer transition-colors">
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-bold">{item.time}</p>
                        <p className="text-sm text-slate-700 dark:text-slate-200">{item.text}</p>
                      </div>
                    ))}
                    {appNotifications.filter((n) => !n.read).length === 0 && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">Нет новых уведомлений</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">История</p>
                  <div className="space-y-2 max-h-44 overflow-y-auto custom-scrollbar pr-1">
                    {appNotifications.filter((n) => n.read).map((item) => (
                      <div key={item.id} className="bg-slate-50 dark:bg-black/10 p-3 rounded-xl border border-slate-200 dark:border-white/10 opacity-80">
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-bold">{item.time}</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={async () => {
                    try {
                      const result = await notificationsApi.markAllRead();
                      setAppNotifications(result.items || []);
                    } catch {
                      setAppNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                    }
                    showToast(appText.markAllRead, 'success');
                  }}
                  className="w-full mt-1 py-2 text-xs font-bold text-arcade-primary hover:text-slate-900 dark:hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  {appText.markAllRead}
                </button>
            </div>
            </>
        )}

      </main>
    </div>
  );
};

export default App;