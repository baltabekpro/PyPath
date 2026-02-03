import React from 'react';
import { User, Bell, Lock, Globe, Moon, LogOut } from 'lucide-react';
import { CURRENT_USER } from '../constants';

export const Settings: React.FC = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-white">Настройки</h1>

      <div className="bg-py-surface border border-py-accent rounded-2xl overflow-hidden">
        {/* Account Section */}
        <div className="p-6 border-b border-py-accent">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <User size={20} className="text-py-green" />
            Учетная запись
          </h2>
          <div className="flex items-center gap-4">
            <img src={CURRENT_USER.avatar} alt="Avatar" className="size-16 rounded-full border border-py-accent" />
            <div>
              <p className="text-white font-bold">{CURRENT_USER.name}</p>
              <p className="text-py-muted text-sm">user@example.com</p>
              <button className="mt-2 text-xs text-py-green hover:underline">Изменить аватар</button>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="p-6 space-y-6">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-py-accent rounded-lg text-white"><Bell size={18}/></div>
                    <div>
                        <p className="text-white font-medium">Уведомления</p>
                        <p className="text-xs text-py-muted">Получать новости и достижения</p>
                    </div>
                </div>
                <div className="w-10 h-6 bg-py-green rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 size-4 bg-white rounded-full"></div>
                </div>
             </div>

             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-py-accent rounded-lg text-white"><Moon size={18}/></div>
                    <div>
                        <p className="text-white font-medium">Темная тема</p>
                        <p className="text-xs text-py-muted">Всегда включена</p>
                    </div>
                </div>
                <div className="w-10 h-6 bg-py-green/50 rounded-full relative cursor-not-allowed">
                    <div className="absolute right-1 top-1 size-4 bg-white/50 rounded-full"></div>
                </div>
             </div>

             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-py-accent rounded-lg text-white"><Globe size={18}/></div>
                    <div>
                        <p className="text-white font-medium">Язык</p>
                        <p className="text-xs text-py-muted">Русский</p>
                    </div>
                </div>
                <select className="bg-py-dark border border-py-accent text-white text-sm rounded-lg p-2 outline-none focus:border-py-green">
                    <option>Русский</option>
                    <option>English</option>
                </select>
             </div>
        </div>
        
        {/* Footer actions */}
        <div className="p-6 bg-py-dark/30 border-t border-py-accent flex flex-col sm:flex-row gap-4">
            <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-py-accent text-white hover:bg-white/5 transition-colors text-sm font-medium">
                <Lock size={16} />
                Сменить пароль
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium ml-auto">
                <LogOut size={16} />
                Выйти
            </button>
        </div>
      </div>
    </div>
  );
};