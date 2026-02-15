import React, { useState } from 'react';
import { View } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Editor } from './components/Editor';
import { Courses } from './components/Courses';
import { Profile } from './components/Profile';
import { Settings } from './components/Settings';
import { Leaderboard } from './components/Leaderboard';
import { Achievements } from './components/Achievements';
import { AIChatPage } from './components/AIChatPage';
import { Menu, X, Check, Crown, Bell } from 'lucide-react';
import { APP_UI, UI_TEXTS } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const appNotifications = APP_UI?.notifications ?? [];
  const premiumData = APP_UI?.premium ?? {};
  const appText = UI_TEXTS?.app ?? {};

  const handleViewChange = (view: View) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false); // Close menu on navigation
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
      case View.PROFILE:
        return <Profile setView={handleViewChange} />;
      case View.ACHIEVEMENTS:
        return <Achievements />;
      case View.LEADERBOARD:
        return <Leaderboard />;
      case View.SETTINGS:
        return <Settings />;
      default:
        return <Dashboard setView={handleViewChange} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-py-dark font-sans text-py-text selection:bg-py-green/30 selection:text-white relative">
      
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
        isMobileOpen={isMobileMenuOpen} 
        closeMobileMenu={() => setIsMobileMenuOpen(false)}
      />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden w-full transition-all duration-300 relative">
        {/* Mobile Header Toggle for Immersive Views */}
        {(currentView === View.PRACTICE || currentView === View.AI_CHAT) && (
           <div className="md:hidden absolute top-4 left-4 z-20">
               <button 
                 onClick={() => setIsMobileMenuOpen(true)}
                 className="p-2 bg-py-surface border border-py-accent rounded-lg text-gray-400 hover:text-white"
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
              onNotificationsClick={() => setShowNotifications(!showNotifications)}
              onPremiumClick={() => setShowPremium(true)}
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
            <div className="absolute top-20 right-4 md:right-24 z-50 w-80 bg-[#1E293B] border border-white/10 rounded-2xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-5">
                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                    <Bell size={16} className="text-arcade-primary"/>
                  {appText.notificationsTitle || 'Уведомления'}
                </h3>
                <div className="space-y-3">
                   {appNotifications.map((item: any, index: number) => (
                    <div key={index} className="bg-black/20 p-3 rounded-xl border border-white/5 hover:bg-white/5 cursor-pointer transition-colors">
                      <p className="text-[10px] text-gray-400 mb-1 font-bold">{item.time}</p>
                      <p className="text-sm text-gray-200">{item.text}</p>
                    </div>
                   ))}
                </div>
                <button onClick={() => setShowNotifications(false)} className="w-full mt-3 py-2 text-xs font-bold text-gray-500 hover:text-white transition-colors">
                  {appText.markAllRead || 'Пометить все как прочитанные'}
                </button>
            </div>
            </>
        )}

        {/* Premium Modal */}
        {showPremium && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowPremium(false)}></div>
                <div className="relative bg-[#1E293B] border border-orange-500/30 w-full max-w-2xl rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(249,115,22,0.2)] animate-float-up transform transition-all">
                    <button onClick={() => setShowPremium(false)} className="absolute top-4 right-4 p-2 bg-black/30 rounded-full text-white hover:bg-white/20 z-20"><X size={20}/></button>

                    <div className="grid md:grid-cols-2">
                        <div className="bg-gradient-to-br from-orange-600 to-red-700 p-8 text-white flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                            <div className="relative z-10">
                                 <div className="inline-flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-white/10 shadow-lg">
                                 <Crown size={12} fill="currentColor" /> {appText.premiumStatus || 'Pro Status'}
                                 </div>
                               <h2 className="text-3xl font-display font-black mb-2 leading-none">{appText.premiumTitle || 'Стань Легендой'}</h2>
                               <p className="text-orange-100 text-sm font-medium">{appText.premiumSubtitle || 'Разблокируй полный потенциал и получи доступ к элитным миссиям.'}</p>
                            </div>
                            <div className="relative z-10 mt-8">
                               <div className="text-4xl font-black">{premiumData.price || '299₽'} <span className="text-sm font-bold text-orange-200 uppercase tracking-wider">{premiumData.period || '/ мес'}</span></div>
                            </div>
                        </div>

                        <div className="p-8 bg-[#1E293B]">
              <h3 className="font-bold text-white mb-4 uppercase tracking-widest text-xs text-gray-400">{appText.premiumBenefitsTitle || 'Преимущества PRO'}</h3>
                            <ul className="space-y-3 mb-8">
                              {(premiumData.benefits || []).map((item: string, i: number) => (
                                     <li key={i} className="flex items-center gap-3 text-sm text-gray-300 font-medium">
                                         <div className="size-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                                             <Check size={12} className="text-green-400" strokeWidth={4} />
                                         </div>
                                         {item}
                                     </li>
                                ))}
                            </ul>
                            <button className="w-full py-3 rounded-xl bg-white text-orange-600 font-black uppercase tracking-wider hover:bg-gray-100 transition-colors shadow-lg active:scale-95">
                              {appText.activatePro || 'Активировать PRO'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #28392e;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #0df259;
        }
      `}</style>
    </div>
  );
};

export default App;