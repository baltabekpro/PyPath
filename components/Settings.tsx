import React, { useState, useEffect } from 'react';
import { User, Bell, Lock, Globe, Moon, AlertTriangle, CreditCard, Key, Shield, Smartphone, ArrowRight, Check, Camera, RefreshCw, Save, Loader2, Mail, AtSign, FileText } from 'lucide-react';
import { CURRENT_USER } from '../constants';

type SettingsTab = 'profile' | 'notifications' | 'billing' | 'api' | 'security';

const PRESET_AVATARS = [
    "Felix", "Aneka", "Zoe", "Max", "Liam", "Sky", "River", "Jude"
];

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  
  // --- Profile State ---
  const [formData, setFormData] = useState({
      name: CURRENT_USER.name,
      email: "neo@matrix.com",
      bio: "Код — это поэзия, написанная логикой.",
      avatar: CURRENT_USER.avatar
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const tabs = [
      { id: 'profile', icon: User, label: "Профиль" },
      { id: 'notifications', icon: Bell, label: "Уведомления" },
      { id: 'billing', icon: CreditCard, label: "Подписка" },
      { id: 'api', icon: Key, label: "API Ключи" },
      { id: 'security', icon: Shield, label: "Безопасность" },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (seed: string) => {
      setFormData({ ...formData, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}` });
  };

  const generateRandomAvatar = () => {
      const randomSeed = Math.random().toString(36).substring(7);
      handleAvatarChange(randomSeed);
  };

  const handleSave = () => {
      setIsSaving(true);
      // Simulate API Call
      setTimeout(() => {
          setIsSaving(false);
          setShowSuccess(true);
          // In a real app, update global context here
          setTimeout(() => setShowSuccess(false), 3000);
      }, 1500);
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 md:space-y-8 animate-fade-in pt-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Настройки</h1>
        {showSuccess && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-2 rounded-xl flex items-center gap-2 animate-in slide-in-from-top-2">
                <Check size={16} />
                <span className="text-sm font-bold">Изменения сохранены</span>
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          {/* Left Navigation */}
          <div className="lg:col-span-4 space-y-4 md:space-y-6">
              {/* Profile Card Preview */}
              <div className="bg-py-surface border border-py-accent rounded-2xl p-4 md:p-6 flex items-center gap-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-arcade-primary/10 to-transparent pointer-events-none"></div>
                  <img src={formData.avatar} alt="Avatar" className="size-12 md:size-16 rounded-full border-2 border-arcade-primary bg-black object-cover relative z-10" />
                  <div className="relative z-10 overflow-hidden">
                    <p className="text-white font-bold text-base md:text-lg truncate">{formData.name}</p>
                    <p className="text-py-muted text-xs md:text-sm truncate">{formData.email}</p>
                  </div>
              </div>

              {/* Menu */}
              <div className="bg-[#0c120e] border border-py-accent rounded-2xl overflow-hidden shadow-lg">
                  {tabs.map((item) => (
                      <button 
                        key={item.id}
                        onClick={() => setActiveTab(item.id as SettingsTab)}
                        className={`w-full flex items-center gap-4 px-6 py-4 text-sm font-medium transition-colors border-b border-white/5 last:border-0 relative ${activeTab === item.id ? 'bg-white/5 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                      >
                          <div className={`absolute left-0 top-0 bottom-0 w-1 bg-arcade-primary transition-all duration-300 ${activeTab === item.id ? 'opacity-100 h-full' : 'opacity-0 h-0'}`}></div>
                          <item.icon size={18} className={activeTab === item.id ? 'text-arcade-primary' : 'text-gray-500'} />
                          {item.label}
                          {activeTab === item.id && <ArrowRight size={14} className="ml-auto text-arcade-primary animate-pulse" />}
                      </button>
                  ))}
              </div>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-8 space-y-6">
              
              {/* PROFILE SETTINGS */}
              {activeTab === 'profile' && (
                <div className="bg-py-surface border border-py-accent rounded-2xl p-4 md:p-6 animate-fade-in relative overflow-hidden">
                   
                   {/* Avatar Section */}
                   <div className="mb-8 flex flex-col md:flex-row items-center gap-6 pb-8 border-b border-white/5">
                        <div className="relative group">
                            <div className="size-24 md:size-32 rounded-full border-4 border-arcade-primary shadow-[0_0_20px_rgba(168,85,247,0.3)] overflow-hidden bg-black">
                                <img src={formData.avatar} alt="Current Avatar" className="size-full object-cover" />
                            </div>
                            <button 
                                onClick={generateRandomAvatar}
                                className="absolute bottom-0 right-0 p-2 bg-arcade-action text-white rounded-full hover:bg-orange-600 transition-colors shadow-lg border-2 border-[#0F172A]"
                                title="Случайный аватар"
                            >
                                <RefreshCw size={16} />
                            </button>
                        </div>

                        <div className="flex-1 w-full">
                            <h3 className="text-white font-bold text-lg mb-3 text-center md:text-left">Выберите аватар</h3>
                            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar justify-center md:justify-start">
                                {PRESET_AVATARS.map((seed) => {
                                    const url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
                                    const isSelected = formData.avatar === url;
                                    return (
                                        <button 
                                            key={seed}
                                            onClick={() => handleAvatarChange(seed)}
                                            className={`size-12 rounded-full border-2 shrink-0 overflow-hidden transition-all ${isSelected ? 'border-arcade-primary scale-110 shadow-neon-purple' : 'border-white/10 hover:border-white/30'}`}
                                        >
                                            <img src={url} className="size-full bg-black" alt={seed}/>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                   </div>

                   {/* Form Inputs */}
                   <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
                                    <AtSign size={14} /> Никнейм
                                </label>
                                <div className="relative">
                                    <input 
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        type="text" 
                                        className="w-full bg-[#0c120e] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-arcade-primary outline-none transition-colors shadow-inner" 
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
                                    <Mail size={14} /> Email
                                </label>
                                <input 
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    type="email" 
                                    className="w-full bg-[#0c120e] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-arcade-primary outline-none transition-colors shadow-inner" 
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
                                <FileText size={14} /> О себе
                            </label>
                            <textarea 
                                name="bio"
                                value={formData.bio}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full bg-[#0c120e] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-arcade-primary outline-none transition-colors shadow-inner resize-none"
                            />
                            <p className="text-[10px] text-gray-500 text-right">Осталось символов: {200 - formData.bio.length}</p>
                        </div>

                        {/* Additional Settings Toggles */}
                        <div className="flex items-center justify-between py-4 border-t border-b border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-[#0c120e] rounded-xl border border-white/5 text-gray-300"><Moon size={20}/></div>
                                <div>
                                    <p className="text-white font-medium text-sm md:text-base">Тема оформления</p>
                                    <p className="text-xs text-py-muted">Cyberpunk Dark (Locked)</p>
                                </div>
                            </div>
                            <div className="w-10 h-6 bg-arcade-primary/20 rounded-full relative border border-arcade-primary/50 opacity-80 cursor-not-allowed">
                                <div className="absolute right-1 top-1 size-3.5 bg-arcade-primary rounded-full shadow-[0_0_8px_#A855F7]"></div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end pt-4">
                            <button 
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-arcade-primary hover:bg-purple-600 text-white px-8 py-3 rounded-xl font-bold shadow-neon-purple flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                <span>{isSaving ? 'Сохранение...' : 'Сохранить изменения'}</span>
                            </button>
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
                              <div key={i} className="flex items-center justify-between p-4 bg-[#0c120e] rounded-xl border border-white/5 cursor-pointer hover:border-white/10 transition-colors">
                                  <span className="text-gray-300 font-medium">{label}</span>
                                  <div className={`w-12 h-6 rounded-full relative transition-colors ${i < 2 ? 'bg-arcade-success' : 'bg-gray-700'}`}>
                                      <div className={`absolute top-1 size-4 bg-white rounded-full transition-all shadow-md ${i < 2 ? 'right-1' : 'left-1'}`}></div>
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
                                    <Lock size={18} className="text-arcade-mentor"/>
                                    <div>
                                        <p className="text-sm font-bold text-white">Пароль</p>
                                        <p className="text-xs text-py-muted">Последнее изменение: 3 месяца назад</p>
                                    </div>
                                </div>
                                <button className="text-xs font-bold text-white bg-white/5 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors border border-white/5">Изменить</button>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-[#0c120e] rounded-xl border border-white/5">
                                <div className="flex items-center gap-4">
                                    <Smartphone size={18} className="text-arcade-mentor"/>
                                    <div>
                                        <p className="text-sm font-bold text-white">2FA Аутентификация</p>
                                        <p className="text-xs text-py-muted">Защитите аккаунт</p>
                                    </div>
                                </div>
                                <button className="text-xs font-bold text-arcade-success bg-arcade-success/10 px-3 py-1.5 rounded-lg hover:bg-arcade-success/20 transition-colors border border-arcade-success/20">Включить</button>
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