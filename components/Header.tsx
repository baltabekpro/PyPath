import React from 'react';
import { Search, Bell, Crown, Menu } from 'lucide-react';
import { CURRENT_USER } from '../constants';

interface HeaderProps {
    onMenuClick?: () => void;
    onProfileClick?: () => void;
    onNotificationsClick?: () => void;
    onPremiumClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, onProfileClick, onNotificationsClick, onPremiumClick }) => {
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
                 {CURRENT_USER.levelNum}
             </div>
             <div className="flex flex-col min-w-[140px]">
                 <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1">
                     <span className="text-white">XP</span>
                     <span className="text-arcade-action">450 / 1000</span>
                 </div>
                 <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden border border-white/5">
                     <div className="h-full bg-gradient-to-r from-yellow-400 to-arcade-action w-[45%] rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div>
                 </div>
             </div>
          </div>
          
          <div className="relative w-full hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
                type="text" 
                placeholder="Найти квест или игрока..." 
                className="w-full bg-arcade-card border border-transparent rounded-2xl py-3 pl-12 pr-4 text-sm focus:border-arcade-primary focus:bg-arcade-card/80 text-white placeholder-gray-500 outline-none transition-all shadow-inner"
            />
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
          
          {/* Premium/Crown Button */}
          <button 
            onClick={onPremiumClick}
            className="size-10 md:size-12 flex items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-neon-orange transition-transform hover:scale-110 active:scale-95 border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 relative group overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <Crown size={24} strokeWidth={3} />
          </button>
        </div>

        {/* User Profile Pill */}
        <div 
            className="flex items-center gap-3 pl-4 md:pl-6 border-l border-white/10 cursor-pointer group"
            onClick={onProfileClick}
        >
          <div className="text-right hidden sm:block group-hover:opacity-80 transition-opacity">
            <p className="text-sm font-display font-bold leading-none text-white mb-1">{CURRENT_USER.name}</p>
            <p className="text-xs font-bold text-arcade-mentor uppercase tracking-wide">{CURRENT_USER.level}</p>
          </div>
          <div className="relative">
              <div className="absolute inset-0 bg-arcade-primary rounded-2xl blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <img 
                src={CURRENT_USER.avatar} 
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