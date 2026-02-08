import React from 'react';
import { View } from '../types';
import { LayoutGrid, Map, Code, Settings, Trophy, Crown, Bot, Gamepad2, LogOut, X, Volume2, User } from 'lucide-react';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  isMobileOpen?: boolean;
  closeMobileMenu?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isMobileOpen = false, closeMobileMenu }) => {
  const navItems = [
    { view: View.DASHBOARD, label: 'Лобби', icon: LayoutGrid },
    { view: View.PROFILE, label: 'Герой', icon: User },
    { view: View.COURSES, label: 'Карта', icon: Map },
    { view: View.PRACTICE, label: 'Арена Кода', icon: Code },
    { view: View.AI_CHAT, label: 'Оракул', icon: Bot },
    { view: View.LEADERBOARD, label: 'Топ Игроков', icon: Crown },
    { view: View.ACHIEVEMENTS, label: 'Трофеи', icon: Trophy },
  ];

  const shouldHideCTA = currentView === View.PRACTICE;

  return (
    <aside 
      className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-arcade-bg/95 backdrop-blur-xl border-r border-white/10 
        transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col justify-between p-6 h-screen
      `}
    >
      <div className="flex flex-col gap-8">
        {/* Logo & Close Button */}
        <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView(View.DASHBOARD)}>
              <div className="size-12 bg-gradient-to-br from-arcade-action to-red-500 rounded-2xl flex items-center justify-center text-white shadow-neon-orange group-hover:scale-105 transition-transform duration-300 rotate-3 group-hover:rotate-6">
                <Gamepad2 size={28} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col justify-center">
                <h1 className="text-2xl font-display font-black leading-none tracking-tight text-white mb-0.5 group-hover:text-arcade-action transition-colors">Code<br/>Arcade</h1>
              </div>
            </div>
            
            <button 
                onClick={closeMobileMenu}
                className="md:hidden p-2 text-gray-400 hover:text-white transition-colors bg-white/5 rounded-xl"
            >
                <X size={24} />
            </button>
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
              <item.icon 
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
        
        {/* Sound Toggle (Visual) */}
        <button className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
            <div className="flex items-center gap-3">
                <div className="bg-arcade-mentor/20 p-2 rounded-lg text-arcade-mentor">
                    <Volume2 size={20} />
                </div>
                <span className="text-sm font-bold text-gray-300">Звуки</span>
            </div>
            <div className="w-10 h-5 bg-arcade-success rounded-full relative cursor-pointer shadow-neon-green">
                <div className="absolute right-1 top-1 size-3 bg-white rounded-full"></div>
            </div>
        </button>

        {!shouldHideCTA ? (
            <button 
            onClick={() => setView(View.PRACTICE)}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-lg font-black text-white bg-gradient-to-r from-arcade-action to-red-500 hover:shadow-neon-orange transition-all duration-300 group active:scale-95 shadow-press hover:translate-y-[-2px] active:translate-y-[2px] active:shadow-press-active border-b-4 border-red-700"
            >
            <Code size={24} strokeWidth={3} className="group-hover:rotate-12 transition-transform"/>
            <span>ИГРАТЬ</span>
            </button>
        ) : (
             <button 
             onClick={() => setView(View.SETTINGS)}
             className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-sm font-bold text-gray-400 bg-white/5 hover:bg-white/10 hover:text-white transition-all duration-300"
             >
             <Settings size={20} />
             <span>Настройки</span>
             </button>
        )}
      </div>
    </aside>
  );
};