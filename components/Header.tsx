import React from 'react';
import { Search, Bell, Crown, Menu } from 'lucide-react';
import { CURRENT_USER } from '../constants';

interface HeaderProps {
    onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="flex items-center justify-between px-4 md:px-8 py-4 md:py-6 sticky top-0 bg-py-dark/80 backdrop-blur-md z-10 border-b border-py-accent">
      
      {/* Mobile Menu Toggle */}
      <button 
        onClick={onMenuClick}
        className="md:hidden p-2 text-gray-400 hover:text-white mr-2"
      >
          <Menu size={24} />
      </button>

      {/* Search */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-xl hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Поиск курсов, задач или пользователей..." 
            className="w-full bg-[#0a0f0b] border border-py-accent rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-1 focus:ring-py-green focus:border-py-green text-white placeholder-gray-500 outline-none transition-all shadow-inner hover:border-py-accent/80"
          />
        </div>
        {/* Mobile Search Icon */}
        <button className="md:hidden p-2 text-gray-400 hover:text-white">
            <Search size={20} />
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 md:gap-8">
        <div className="flex gap-2 md:gap-3">
          <button className="size-9 md:size-10 flex items-center justify-center rounded-xl bg-py-accent text-white hover:bg-py-surface hover:text-py-green transition-colors relative group">
            <Bell size={20} />
            <span className="absolute top-2 right-2 size-2 bg-py-green rounded-full border border-py-accent group-hover:animate-ping"></span>
            <span className="absolute top-2 right-2 size-2 bg-py-green rounded-full border border-py-accent"></span>
          </button>
          <button className="size-9 md:size-10 flex items-center justify-center rounded-xl bg-py-accent text-white hover:bg-py-surface transition-colors text-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.1)] hover:shadow-[0_0_20px_rgba(250,204,21,0.2)]">
            <Crown size={20} />
          </button>
        </div>

        {/* User */}
        <div className="flex items-center gap-4 border-l border-py-accent pl-4 md:pl-8">
          <div className="text-right hidden sm:block">
            <p className="text-base font-bold leading-none text-white mb-1.5">{CURRENT_USER.name}</p>
            <span className="text-[11px] font-bold bg-py-green text-py-dark px-2.5 py-0.5 rounded-md border border-py-green/50 shadow-[0_0_10px_rgba(13,242,89,0.2)]">PREMIUM</span>
          </div>
          <img 
            src={CURRENT_USER.avatar} 
            alt="Profile" 
            className="size-10 md:size-12 rounded-full border-2 border-py-green/30 object-cover p-0.5 hover:border-py-green transition-colors cursor-pointer"
          />
        </div>
      </div>
    </header>
  );
};