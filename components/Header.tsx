import React, { useEffect, useState } from 'react';
import { Bell, Menu } from 'lucide-react';
import { CURRENT_USER, UI_TEXTS } from '../constants';
import { apiGet } from '../api';

interface HeaderProps {
    onMenuClick?: () => void;
    onProfileClick?: () => void;
    onNotificationsClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, onProfileClick, onNotificationsClick }) => {
  const [currentUser, setCurrentUser] = useState(CURRENT_USER);
  const maxXp = currentUser.maxXp || 1000;
  const xpPercent = Math.min(100, Math.max(0, Math.round((currentUser.xp / maxXp) * 100)));
  const text = UI_TEXTS?.header ?? {};

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const userData = await apiGet<any>('/currentUser');
        setCurrentUser(userData);
      } catch {
      }
    };

    loadCurrentUser();
  }, []);

  return (
    <header className="flex items-center justify-between px-4 md:px-8 py-4 sticky top-0 bg-arcade-bg/80 backdrop-blur-md z-30 border-b border-white/5">
      
      {/* Mobile Menu Toggle */}
      <button 
        onClick={onMenuClick}
        className="md:hidden p-2 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-colors mr-2"
      >
          <Menu size={24} />
      </button>

      {/* XP Bar & Level (Game HUD) */}
      <div className="flex-1 flex items-center gap-4 md:gap-8 max-w-2xl">
          <div className="hidden md:flex items-center gap-3 bg-arcade-card px-4 py-2 rounded-2xl border border-white/10 shadow-lg">
             <div className="size-8 bg-arcade-action rounded-lg flex items-center justify-center text-white font-black text-xs shadow-lg rotate-3 border-2 border-white/20">
                 {currentUser.levelNum}
             </div>
             <div className="flex flex-col min-w-[140px]">
                 <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1">
                   <span className="text-white">{text.xpLabel}</span>
                 <span className="text-arcade-action">{currentUser.xp} / {maxXp}</span>
                 </div>
                 <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden border border-white/5">
                 <div className="h-full bg-gradient-to-r from-yellow-400 to-arcade-action rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]" style={{ width: `${xpPercent}%` }}></div>
                 </div>
             </div>
          </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 md:gap-6">
        <div className="flex gap-3">
          {/* Notification Button */}
          <button 
            onClick={onNotificationsClick}
            className="size-10 md:size-12 flex items-center justify-center rounded-2xl bg-arcade-card border border-white/5 text-gray-300 hover:text-white hover:bg-white/5 transition-all active:scale-95 shadow-lg group relative"
          >
            <Bell size={22} strokeWidth={2.5} className="group-hover:animate-shake" />
            <div className="absolute top-2 right-3 size-2 bg-red-500 rounded-full border border-[#1E293B] hidden group-hover:block"></div>
          </button>
        </div>

        {/* User Profile Pill */}
        <div 
            className="flex items-center gap-3 pl-4 md:pl-6 border-l border-white/10 cursor-pointer group"
            onClick={onProfileClick}
        >
          <div className="text-right hidden sm:block group-hover:opacity-80 transition-opacity">
            <p className="text-sm font-display font-bold leading-none text-white mb-1">{currentUser.name}</p>
            <p className="text-xs font-bold text-arcade-mentor uppercase tracking-wide">{currentUser.level}</p>
          </div>
          <div className="relative">
              <div className="absolute inset-0 bg-arcade-primary rounded-2xl blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <img 
                src={currentUser.avatar} 
                alt="Profile" 
                className="relative size-10 md:size-12 rounded-2xl border-2 border-white/20 bg-black object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute -bottom-1 -right-1 size-4 bg-arcade-success rounded-full border-2 border-arcade-bg"></div>
          </div>
        </div>
      </div>
    </header>
  );
};