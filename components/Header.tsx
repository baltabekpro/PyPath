import React from 'react';
import { Search, Bell, Crown } from 'lucide-react';
import { CURRENT_USER } from '../constants';

export const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between px-8 py-6 sticky top-0 bg-py-dark/80 backdrop-blur-md z-10 border-b border-py-accent">
      {/* Search */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-py-muted" size={18} />
          <input 
            type="text" 
            placeholder="Поиск курсов, тем или задач..." 
            className="w-full bg-py-accent border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-1 focus:ring-py-green text-white placeholder-py-muted outline-none transition-all"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6">
        <div className="flex gap-2">
          <button className="size-10 flex items-center justify-center rounded-xl bg-py-accent text-white hover:bg-py-surface transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 size-2 bg-py-green rounded-full border border-py-accent"></span>
          </button>
          <button className="size-10 flex items-center justify-center rounded-xl bg-py-accent text-white hover:bg-py-surface transition-colors text-yellow-400">
            <Crown size={20} />
          </button>
        </div>

        {/* User */}
        <div className="flex items-center gap-3 border-l border-py-accent pl-6">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold leading-none text-white">{CURRENT_USER.name}</p>
            <p className="text-xs text-py-green">Премиум</p>
          </div>
          <img 
            src={CURRENT_USER.avatar} 
            alt="Profile" 
            className="size-10 rounded-full border-2 border-py-green/20 object-cover"
          />
        </div>
      </div>
    </header>
  );
};