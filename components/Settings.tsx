import React, { useState, useEffect } from 'react';
import { Lock, Moon, AlertTriangle, Smartphone, ArrowRight, Check, RefreshCw, Save, Loader2, Mail, AtSign, FileText } from 'lucide-react';
import { CURRENT_USER, SETTINGS_UI, UI_TEXTS, getIconComponent } from '../constants';
import { ActionToast } from './ActionToast';
import { apiPut } from '../api';

type SettingsTab = 'profile' | 'notifications' | 'billing' | 'api' | 'security';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const presetAvatars = SETTINGS_UI?.presetAvatars ?? [];
  const tabs = SETTINGS_UI?.tabs ?? [];
  const notificationOptions = SETTINGS_UI?.notificationOptions ?? [];
    const text = UI_TEXTS?.settings ?? {};
  
  // --- Profile State ---
  const [formData, setFormData] = useState({
      name: CURRENT_USER.name,
      email: CURRENT_USER.email || '',
      bio: CURRENT_USER.bio || '',
      avatar: CURRENT_USER.avatar
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
    const [actionMessage, setActionMessage] = useState('');
    const [notificationState, setNotificationState] = useState(notificationOptions);
    const [isDarkTheme, setIsDarkTheme] = useState(true);

  useEffect(() => {
    // Load from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme !== null) setIsDarkTheme(savedTheme === 'dark');

    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) setNotificationState(JSON.parse(savedNotifications));

    const savedAvatar = localStorage.getItem('avatar');
    if (savedAvatar) setFormData(prev => ({ ...prev, avatar: savedAvatar }));

    const savedProfile = localStorage.getItem('profile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setFormData(prev => ({ ...prev, ...profile }));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (seed: string) => {
      const newAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
      setFormData({ ...formData, avatar: newAvatar });
      localStorage.setItem('avatar', newAvatar);
  };

  const generateRandomAvatar = () => {
      const randomSeed = Math.random().toString(36).substring(7);
      handleAvatarChange(randomSeed);
  };

  const handleSave = async () => {
      setIsSaving(true);
      try {
          const updatedUser = await apiPut<any>('/currentUser', {
              name: formData.name,
              bio: formData.bio,
              avatar: formData.avatar,
          });

          Object.assign(CURRENT_USER as any, updatedUser);
          localStorage.setItem('profile', JSON.stringify(formData));
          setIsSaving(false);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
      } catch {
          localStorage.setItem('profile', JSON.stringify(formData));
          setIsSaving(false);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
      }
  };

  const showAction = (message: string) => {
      setActionMessage(message);
      setShowSuccess(false);
      setTimeout(() => setActionMessage(''), 2500);
  };

  const toggleNotification = (index: number) => {
      setNotificationState((prev: any[]) => {
        const newState = prev.map((item, i) => i === index ? { ...item, enabled: !item.enabled } : item);
        localStorage.setItem('notifications', JSON.stringify(newState));
        return newState;
      });
  };

  const handleDeleteAccount = () => {
      const confirmed = window.confirm(text.dangerText);
      if (confirmed) {
          showAction(text.toastDeleteRequested);
      }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 md:space-y-8 animate-fade-in pt-6 pb-20">
            <ActionToast
                visible={showSuccess || Boolean(actionMessage)}
                message={showSuccess ? text.saved : actionMessage}
                tone={showSuccess ? 'success' : 'info'}
            />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-white">{text.title}</h1>
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
                                    {tabs.map((item: any) => {
                                            const TabIcon = getIconComponent(item.icon);
                                            return (
                                                <button 
                                                    key={item.id}
                                                    onClick={() => setActiveTab(item.id as SettingsTab)}
                                                    className={`w-full flex items-center gap-4 px-6 py-4 text-sm font-medium transition-colors border-b border-white/5 last:border-0 relative ${activeTab === item.id ? 'bg-white/5 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                                                >
                                                        <div className={`absolute left-0 top-0 bottom-0 w-1 bg-arcade-primary transition-all duration-300 ${activeTab === item.id ? 'opacity-100 h-full' : 'opacity-0 h-0'}`}></div>
                                                        <TabIcon size={18} className={activeTab === item.id ? 'text-arcade-primary' : 'text-gray-500'} />
                                                        {item.label}
                                                        {activeTab === item.id && <ArrowRight size={14} className="ml-auto text-arcade-primary animate-pulse" />}
                                                </button>
                                            );
                                    })}
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
                                title={text.randomAvatarTitle}
                            >
                                <RefreshCw size={16} />
                            </button>
                        </div>

                        <div className="flex-1 w-full">
                            <h3 className="text-white font-bold text-lg mb-3 text-center md:text-left">{text.chooseAvatar}</h3>
                            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar justify-center md:justify-start">
                                {presetAvatars.map((seed: string) => {
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
                                    <AtSign size={14} /> {text.nickname}
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
                                <FileText size={14} /> {text.about}
                            </label>
                            <textarea 
                                name="bio"
                                value={formData.bio}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full bg-[#0c120e] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-arcade-primary outline-none transition-colors shadow-inner resize-none"
                            />
                            <p className="text-[10px] text-gray-500 text-right">{text.charsLeft}: {200 - formData.bio.length}</p>
                        </div>

                        {/* Additional Settings Toggles */}
                        <div className="flex items-center justify-between py-4 border-t border-b border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-[#0c120e] rounded-xl border border-white/5 text-gray-300"><Moon size={20}/></div>
                                <div>
                                    <p className="text-white font-medium text-sm md:text-base">{text.themeTitle}</p>
                                    <p className="text-xs text-py-muted">{text.themeValue}</p>
                                </div>
                            </div>
                            <button
                              onClick={() => {
                                const newTheme = !isDarkTheme;
                                setIsDarkTheme(newTheme);
                                localStorage.setItem('theme', newTheme ? 'dark' : 'light');
                              }}
                              className={`w-10 h-6 rounded-full relative border transition-colors ${isDarkTheme ? 'bg-arcade-primary/20 border-arcade-primary/50' : 'bg-gray-700 border-gray-600'}`}
                            >
                                <div className={`absolute top-1 size-3.5 rounded-full transition-all ${isDarkTheme ? 'right-1 bg-arcade-primary shadow-[0_0_8px_#A855F7]' : 'left-1 bg-white'}`}></div>
                            </button>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end pt-4">
                            <button 
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-arcade-primary hover:bg-purple-600 text-white px-8 py-3 rounded-xl font-bold shadow-neon-purple flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                <span>{isSaving ? text.saving : text.save}</span>
                            </button>
                        </div>
                   </div>
                </div>
              )}

              {/* NOTIFICATIONS SETTINGS */}
              {activeTab === 'notifications' && (
                  <div className="bg-py-surface border border-py-accent rounded-2xl p-4 md:p-6 animate-fade-in">
                      <h2 className="text-lg font-bold text-white mb-6">{text.notificationsTitle}</h2>
                      <div className="space-y-4">
                          {notificationState.map((option: any, i: number) => (
                              <div key={i} onClick={() => toggleNotification(i)} className="flex items-center justify-between p-4 bg-[#0c120e] rounded-xl border border-white/5 cursor-pointer hover:border-white/10 transition-colors">
                                  <span className="text-gray-300 font-medium">{option.label}</span>
                                  <div className={`w-12 h-6 rounded-full relative transition-colors ${option.enabled ? 'bg-arcade-success' : 'bg-gray-700'}`}>
                                      <div className={`absolute top-1 size-4 bg-white rounded-full transition-all shadow-md ${option.enabled ? 'right-1' : 'left-1'}`}></div>
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
                        <h2 className="text-lg font-bold text-white mb-6">{text.securityTitle}</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-[#0c120e] rounded-xl border border-white/5">
                                <div className="flex items-center gap-4">
                                    <Lock size={18} className="text-arcade-mentor"/>
                                    <div>
                                        <p className="text-sm font-bold text-white">{text.passwordTitle}</p>
                                        <p className="text-xs text-py-muted">{text.passwordChanged}</p>
                                    </div>
                                </div>
                                <button onClick={() => showAction(text.toastPasswordChanged)} className="text-xs font-bold text-white bg-white/5 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors border border-white/5">{text.change}</button>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-[#0c120e] rounded-xl border border-white/5">
                                <div className="flex items-center gap-4">
                                    <Smartphone size={18} className="text-arcade-mentor"/>
                                    <div>
                                        <p className="text-sm font-bold text-white">{text.twofaTitle}</p>
                                        <p className="text-xs text-py-muted">{text.twofaHint}</p>
                                    </div>
                                </div>
                                <button onClick={() => showAction(text.toastTwofaEnabled)} className="text-xs font-bold text-arcade-success bg-arcade-success/10 px-3 py-1.5 rounded-lg hover:bg-arcade-success/20 transition-colors border border-arcade-success/20">{text.enable}</button>
                            </div>

                            {/* Logout Button */}
                            <div className="flex items-center justify-between p-4 bg-[#0c120e] rounded-xl border border-white/5">
                                <div className="flex items-center gap-4">
                                    <ArrowRight size={18} className="text-arcade-action rotate-180"/>
                                    <div>
                                        <p className="text-sm font-bold text-white">Выход из аккаунта</p>
                                        <p className="text-xs text-py-muted">Завершить текущую сессию</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => {
                                        localStorage.removeItem('token');
                                        window.location.reload();
                                    }} 
                                    className="text-xs font-bold text-white bg-arcade-action/10 px-3 py-1.5 rounded-lg hover:bg-arcade-action/20 transition-colors border border-arcade-action/20"
                                >
                                    Выйти
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="border border-red-500/20 rounded-2xl p-4 md:p-6 bg-red-500/5">
                        <h2 className="text-lg font-bold text-red-400 mb-2 flex items-center gap-2">
                            <AlertTriangle size={20}/>
                            {text.dangerTitle}
                        </h2>
                        <p className="text-sm text-gray-400 mb-6">{text.dangerText}</p>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <p className="text-white font-bold text-sm">{text.deleteAccount}</p>
                                <p className="text-xs text-gray-500">{text.deleteAccountHint}</p>
                            </div>
                            <button onClick={handleDeleteAccount} className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-colors text-xs font-bold whitespace-nowrap">
                                {text.deleteForever}
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