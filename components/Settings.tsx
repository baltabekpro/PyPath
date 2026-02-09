import React, { useState } from 'react';
import { User, Bell, Lock, Globe, Moon, AlertTriangle, CreditCard, Key, Shield, Smartphone, ArrowRight, Check } from 'lucide-react';
import { CURRENT_USER } from '../constants';

type SettingsTab = 'profile' | 'notifications' | 'billing' | 'api' | 'security';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const tabs = [
      { id: 'profile', icon: User, label: "Профиль" },
      { id: 'notifications', icon: Bell, label: "Уведомления" },
      { id: 'billing', icon: CreditCard, label: "Подписка" },
      { id: 'api', icon: Key, label: "API Ключи" },
      { id: 'security', icon: Shield, label: "Безопасность" },
  ];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 md:space-y-8 animate-fade-in pt-6">
      <h1 className="text-2xl md:text-3xl font-bold text-white">Настройки</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          {/* Left Navigation */}
          <div className="lg:col-span-4 space-y-4 md:space-y-6">
              {/* Profile Card */}
              <div className="bg-py-surface border border-py-accent rounded-2xl p-4 md:p-6 flex items-center gap-4">
                  <img src={CURRENT_USER.avatar} alt="Avatar" className="size-12 md:size-16 rounded-full border border-py-accent" />
                  <div>
                    <p className="text-white font-bold text-base md:text-lg">{CURRENT_USER.name}</p>
                    <p className="text-py-muted text-xs md:text-sm">user@example.com</p>
                    <button className="mt-2 text-xs text-py-green hover:underline">Изменить аватар</button>
                  </div>
              </div>

              {/* Menu */}
              <div className="bg-[#0c120e] border border-py-accent rounded-2xl overflow-hidden">
                  {tabs.map((item) => (
                      <button 
                        key={item.id}
                        onClick={() => setActiveTab(item.id as SettingsTab)}
                        className={`w-full flex items-center gap-4 px-6 py-4 text-sm font-medium transition-colors border-b border-white/5 last:border-0 relative ${activeTab === item.id ? 'bg-white/5 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                      >
                          <div className={`absolute left-0 top-0 bottom-0 w-1 bg-py-green transition-all duration-300 ${activeTab === item.id ? 'opacity-100 h-full' : 'opacity-0 h-0'}`}></div>
                          <item.icon size={18} className={activeTab === item.id ? 'text-py-green' : 'text-gray-500'} />
                          {item.label}
                          {activeTab === item.id && <ArrowRight size={14} className="ml-auto text-py-green animate-pulse" />}
                      </button>
                  ))}
              </div>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-8 space-y-6">
              
              {/* PROFILE SETTINGS */}
              {activeTab === 'profile' && (
                <div className="bg-py-surface border border-py-accent rounded-2xl p-4 md:p-6 animate-fade-in">
                   <h2 className="text-lg font-bold text-white mb-6">Основные настройки</h2>
                   <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Никнейм</label>
                                <input type="text" defaultValue={CURRENT_USER.name} className="w-full bg-[#0c120e] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-py-green outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                                <input type="email" defaultValue="neo@matrix.com" className="w-full bg-[#0c120e] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-py-green outline-none" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pb-6 border-b border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-[#0c120e] rounded-xl border border-white/5 text-gray-300"><Moon size={20}/></div>
                                <div>
                                    <p className="text-white font-medium text-sm md:text-base">Темная тема</p>
                                    <p className="text-xs text-py-muted">Всегда включена в стиле Cyberpunk</p>
                                </div>
                            </div>
                            <div className="w-10 md:w-12 h-5 md:h-6 bg-[#1f2e25] rounded-full relative cursor-not-allowed border border-white/10 shrink-0 opacity-50">
                                <div className="absolute right-1 top-0.5 md:top-1 size-3.5 md:size-4 bg-gray-500 rounded-full"></div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-[#0c120e] rounded-xl border border-white/5 text-gray-300"><Globe size={20}/></div>
                                <div>
                                    <p className="text-white font-medium text-sm md:text-base">Язык</p>
                                    <p className="text-xs text-py-muted">Язык интерфейса и курсов</p>
                                </div>
                            </div>
                            <select className="bg-[#0c120e] border border-py-accent text-white text-sm rounded-xl px-4 py-2 outline-none focus:border-py-green transition-colors">
                                <option>Русский</option>
                                <option>English</option>
                            </select>
                        </div>
                   </div>
                </div>
              )}

              {/* NOTIFICATIONS SETTINGS */}
              {activeTab === 'notifications' && (
                  <div className="bg-py-surface border border-py-accent rounded-2xl p-4 md:p-6 animate-fade-in">
                      <h2 className="text-lg font-bold text-white mb-6">Уведомления</h2>
                      <div className="space-y-4">
                          {[
                              "Новые квесты и задачи",
                              "Ответы ментора",
                              "Достижения друзей",
                              "Новости обновлений"
                          ].map((label, i) => (
                              <div key={i} className="flex items-center justify-between p-4 bg-[#0c120e] rounded-xl border border-white/5">
                                  <span className="text-gray-300 font-medium">{label}</span>
                                  <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${i < 2 ? 'bg-py-green' : 'bg-gray-700'}`}>
                                      <div className={`absolute top-1 size-4 bg-white rounded-full transition-all ${i < 2 ? 'right-1' : 'left-1'}`}></div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {/* SECURITY SETTINGS */}
              {(activeTab === 'security' || activeTab === 'api' || activeTab === 'billing') && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="bg-py-surface border border-py-accent rounded-2xl p-4 md:p-6">
                        <h2 className="text-lg font-bold text-white mb-6">Безопасность</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-[#0c120e] rounded-xl border border-white/5">
                                <div className="flex items-center gap-4">
                                    <Lock size={18} className="text-py-secondary"/>
                                    <div>
                                        <p className="text-sm font-bold text-white">Пароль</p>
                                        <p className="text-xs text-py-muted">Последнее изменение: 3 месяца назад</p>
                                    </div>
                                </div>
                                <button className="text-xs font-bold text-white bg-white/5 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors border border-white/5">Изменить</button>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-[#0c120e] rounded-xl border border-white/5">
                                <div className="flex items-center gap-4">
                                    <Smartphone size={18} className="text-py-secondary"/>
                                    <div>
                                        <p className="text-sm font-bold text-white">2FA Аутентификация</p>
                                        <p className="text-xs text-py-muted">Защитите аккаунт</p>
                                    </div>
                                </div>
                                <button className="text-xs font-bold text-py-green bg-py-green/10 px-3 py-1.5 rounded-lg hover:bg-py-green/20 transition-colors border border-py-green/20">Включить</button>
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="border border-red-500/20 rounded-2xl p-4 md:p-6 bg-red-500/5">
                        <h2 className="text-lg font-bold text-red-400 mb-2 flex items-center gap-2">
                            <AlertTriangle size={20}/>
                            Опасная зона
                        </h2>
                        <p className="text-sm text-gray-400 mb-6">Действия в этой зоне необратимы. Будьте осторожны.</p>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <p className="text-white font-bold text-sm">Удалить аккаунт</p>
                                <p className="text-xs text-gray-500">Все данные будут потеряны безвозвратно</p>
                            </div>
                            <button className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-colors text-xs font-bold whitespace-nowrap">
                                Удалить навсегда
                            </button>
                        </div>
                    </div>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};