import React, { useState, useEffect } from 'react';
import { View } from '../types';
import { Gamepad2, Volume2 } from 'lucide-react';
import { SIDEBAR_NAV_ITEMS, UI_TEXTS, getIconComponent } from '../constants';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  isMobileOpen?: boolean;
  closeMobileMenu?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const text = UI_TEXTS?.sidebar ?? {};
  const [soundOn, setSoundOn] = useState(true);
  
  useEffect(() => {
    const savedSound = localStorage.getItem('soundOn');
    if (savedSound !== null) setSoundOn(savedSound === 'true');
  }, []);

  const navItems = (SIDEBAR_NAV_ITEMS || []).map((item: any) => ({
    ...item,
    view: item.view as View,
    Icon: getIconComponent(item.icon),
  }));

  // --- DESKTOP SIDEBAR ---
  return (
    <>
      <aside 
        className={`
          hidden md:flex fixed inset-y-0 left-0 z-40 w-72 bg-arcade-bg/95 backdrop-blur-xl border-r border-white/10 
          flex-col justify-between p-6 h-screen relative
        `}
      >
        <div className="flex flex-col gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView(View.DASHBOARD)}>
            <div className="size-12 bg-gradient-to-br from-arcade-action to-red-500 rounded-2xl flex items-center justify-center text-white shadow-neon-orange group-hover:scale-105 transition-transform duration-300 rotate-3 group-hover:rotate-6">
              <Gamepad2 size={28} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-2xl font-display font-black leading-none tracking-tight text-white mb-0.5 group-hover:text-arcade-action transition-colors">{text.logoLine1}<br/>{text.logoLine2}</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-3">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => setView(item.view)}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 group relative overflow-hidden font-display font-bold text-lg active:scale-95 ${
                  currentView === item.view
                    ? 'bg-arcade-primary text-white shadow-neon-purple translate-x-2'
                    : 'text-arcade-muted hover:text-white hover:bg-white/10'
                }`}
              >
                <item.Icon 
                  size={24} 
                  className={`transition-transform duration-300 ${currentView === item.view ? 'scale-110' : 'group-hover:scale-110'}`}
                  strokeWidth={2.5} 
                />
                <span className="tracking-wide">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Footer Area */}
        <div className="flex flex-col gap-4">
          {/* Sound Toggle */}
            <button onClick={() => {
              const newSound = !soundOn;
              setSoundOn(newSound);
              localStorage.setItem('soundOn', newSound.toString());
            }} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
              <div className="flex items-center gap-3">
                  <div className="bg-arcade-mentor/20 p-2 rounded-lg text-arcade-mentor">
                      <Volume2 size={20} />
                  </div>
                    <span className="text-sm font-bold text-gray-300">{text.soundLabel}</span>
              </div>
              <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${soundOn ? 'bg-arcade-success shadow-neon-green' : 'bg-gray-700'}`}>
                <div className={`absolute top-1 size-3 bg-white rounded-full transition-all ${soundOn ? 'right-1' : 'left-1'}`}></div>
              </div>
          </button>
        </div>
      </aside>

      {/* --- MOBILE BOTTOM BAR (COMPANION APP STYLE) --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-[#0F172A]/95 backdrop-blur-xl border-t border-white/10 z-50 px-6 pb-2">
         <div className="flex items-center justify-between h-full relative">
             
             {/* Main Tabs */}
             {navItems.filter(i => i.mobile).map((item) => (
                 <button
                    key={item.label}
                    onClick={() => setView(item.view)}
                    className={`flex flex-col items-center justify-center gap-1 w-14 h-full transition-all ${
                        currentView === item.view ? 'text-arcade-primary' : 'text-gray-500'
                    }`}
                 >
                    <div className={`p-1.5 rounded-xl transition-all ${currentView === item.view ? 'bg-arcade-primary/20 -translate-y-2 scale-110 shadow-neon-purple' : ''}`}>
                        <item.Icon size={24} strokeWidth={currentView === item.view ? 2.5 : 2} />
                    </div>
                    <span className={`text-[10px] font-bold ${currentView === item.view ? 'opacity-100' : 'opacity-0'}`}>
                        {item.label}
                    </span>
                 </button>
             ))}

             {/* Floating FAB for Action (Arena/Play) */}
             <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                <button 
                    onClick={() => setView(View.PRACTICE)}
                    className="size-16 bg-gradient-to-tr from-arcade-action to-red-500 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(249,115,22,0.6)] border-4 border-[#0F172A] active:scale-95 transition-transform"
                >
                    <Gamepad2 size={32} />
                </button>
             </div>
         </div>
      </div>
    </>
  );
};