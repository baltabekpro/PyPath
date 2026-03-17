import React, { useState, useEffect } from 'react';
import { Lock, AlertTriangle, Smartphone, ArrowRight, Check, RefreshCw, Save, Loader2, Mail, AtSign, FileText } from 'lucide-react';
import { CURRENT_USER, SETTINGS_UI, UI_TEXTS, getIconComponent } from '../constants';
import { ActionToast } from './ActionToast';
import { apiPut, authApi, notificationsApi } from '../api';

type SettingsTab = 'profile' | 'appearance' | 'notifications';

const DEFAULT_SETTINGS_TABS = [
    { id: 'profile', label: 'Профиль', icon: 'User' },
    { id: 'appearance', label: 'Оформление', icon: 'Sparkles' },
    { id: 'notifications', label: 'Уведомления', icon: 'Bell' },
];

const DEFAULT_NOTIFICATION_OPTIONS = [
    { label: 'Push уведомления', enabled: true },
    { label: 'Email уведомления', enabled: false },
    { label: 'Напоминания о практике', enabled: true },
];

const REMOVED_NOTIFICATION_LABELS = new Set(['Достижения друзей', 'Ответы ментора']);

const normalizeNotificationOptions = (options: any[] | undefined | null) => {
    const list = Array.isArray(options) ? options : [];
    const normalized = list
        .filter((item: any) => item && typeof item.label === 'string' && !REMOVED_NOTIFICATION_LABELS.has(item.label))
        .map((item: any) => ({
            label: item.label,
            enabled: Boolean(item.enabled),
        }));

    return normalized.length > 0 ? normalized : DEFAULT_NOTIFICATION_OPTIONS;
};

const DEFAULT_PRESET_AVATARS = ['PyPath', 'CodeNinja', 'ByteMage', 'DebugHero', 'NeonFox'];

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
    const presetAvatars = SETTINGS_UI?.presetAvatars?.length ? SETTINGS_UI.presetAvatars : DEFAULT_PRESET_AVATARS;
    const tabs = SETTINGS_UI?.tabs?.length ? SETTINGS_UI.tabs : DEFAULT_SETTINGS_TABS;
    const notificationOptions = normalizeNotificationOptions(SETTINGS_UI?.notificationOptions);
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
                const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => localStorage.getItem('theme') === 'dark' ? 'dark' : 'light');
        const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
        const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications');
        if (savedNotifications) {
            try {
                const parsed = JSON.parse(savedNotifications);
                setNotificationState(normalizeNotificationOptions(parsed));
            } catch {
            }
        }

    const savedAvatar = localStorage.getItem('avatar');
    if (savedAvatar) setFormData(prev => ({ ...prev, avatar: savedAvatar }));

    const savedProfile = localStorage.getItem('profile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setFormData(prev => ({ ...prev, ...profile }));
    }

        const loadPreferences = async () => {
            try {
                const result = await notificationsApi.getPreferences();
                if (result?.preferences?.length) {
                    const sanitized = normalizeNotificationOptions(result.preferences);
                    setNotificationState(sanitized);
                    localStorage.setItem('notifications', JSON.stringify(sanitized));
                }
            } catch {
            }
        };

        loadPreferences();
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

    const persistNotificationPreferences = async (next: any[]) => {
            localStorage.setItem('notifications', JSON.stringify(next));
            try {
                await notificationsApi.updatePreferences(next);
            } catch {
                showAction('Не удалось синхронизировать уведомления');
            }
    };

  const toggleNotification = async (index: number) => {
            setNotificationState((prev: any[]) => {
                const next = prev.map((item, i) => i === index ? { ...item, enabled: !item.enabled } : item);
                void persistNotificationPreferences(next);
                return next;
            });
  };

  const handleChangePassword = async () => {
      if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
          showAction('Заполните все поля пароля');
          return;
      }
      if (passwords.newPassword !== passwords.confirmPassword) {
          showAction('Новый пароль и подтверждение не совпадают');
          return;
      }

      setIsChangingPassword(true);
      try {
          await authApi.changePassword(passwords.currentPassword, passwords.newPassword, passwords.confirmPassword);
          setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
          showAction('Пароль успешно изменён');
      } catch {
          showAction('Не удалось изменить пароль');
      } finally {
          setIsChangingPassword(false);
      }
  };

  const handleDeleteAccount = () => {
      const confirmed = window.confirm(text.dangerText);
      if (confirmed) {
          showAction(text.toastDeleteRequested);
      }
  };

  const setTheme = (mode: 'light' | 'dark') => {
      setThemeMode(mode);
      localStorage.setItem('theme', mode);
      window.dispatchEvent(new CustomEvent('app-theme-changed'));
      showAction(mode === 'light' ? 'Светлая тема включена' : 'Тёмная тема включена');
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

                        {/* Password Change */}
                        <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
                            <h3 className="text-white font-bold flex items-center gap-2">
                                <Lock size={16} /> Изменить пароль
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <input
                                    type="password"
                                    value={passwords.currentPassword}
                                    onChange={(e) => setPasswords(prev => ({ ...prev, currentPassword: e.target.value }))}
                                    placeholder="Текущий пароль"
                                    className="w-full bg-[#0c120e] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-arcade-primary outline-none transition-colors shadow-inner"
                                />
                                <input
                                    type="password"
                                    value={passwords.newPassword}
                                    onChange={(e) => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
                                    placeholder="Новый пароль"
                                    className="w-full bg-[#0c120e] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-arcade-primary outline-none transition-colors shadow-inner"
                                />
                                <input
                                    type="password"
                                    value={passwords.confirmPassword}
                                    onChange={(e) => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                    placeholder="Подтвердите пароль"
                                    className="w-full bg-[#0c120e] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-arcade-primary outline-none transition-colors shadow-inner"
                                />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={handleChangePassword}
                                    disabled={isChangingPassword}
                                    className="px-5 py-2 rounded-xl text-sm font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-white disabled:opacity-60"
                                >
                                    {isChangingPassword ? 'Изменение...' : 'Сменить пароль'}
                                </button>
                            </div>
                        </div>
                   </div>
                </div>
              )}

                            {activeTab === 'appearance' && (
                                <div className="bg-py-surface border border-py-accent rounded-2xl p-4 md:p-6 animate-fade-in space-y-4">
                                    <h3 className="text-white font-bold text-lg">Тема интерфейса</h3>
                                    <p className="text-gray-400 text-sm">По умолчанию используется светлый дизайн. Вы можете переключиться в тёмный режим.</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setTheme('light')}
                                            className={`p-4 rounded-xl border text-left transition-colors ${themeMode === 'light' ? 'border-emerald-400 bg-emerald-500/10 text-white' : 'border-white/10 bg-black/20 text-gray-300 hover:bg-black/30'}`}
                                        >
                                            <p className="font-bold">Светлая тема</p>
                                            <p className="text-xs opacity-80 mt-1">Рекомендуется для обучения и чтения теории.</p>
                                        </button>
                                        <button
                                            onClick={() => setTheme('dark')}
                                            className={`p-4 rounded-xl border text-left transition-colors ${themeMode === 'dark' ? 'border-purple-400 bg-purple-500/10 text-white' : 'border-white/10 bg-black/20 text-gray-300 hover:bg-black/30'}`}
                                        >
                                            <p className="font-bold">Тёмная тема</p>
                                            <p className="text-xs opacity-80 mt-1">Для вечернего режима и контрастного интерфейса.</p>
                                        </button>
                                    </div>
                                </div>
                            )}

              {/* NOTIFICATIONS SETTINGS */}
              {activeTab === 'notifications' && (
                  <div className="bg-py-surface border border-py-accent rounded-2xl p-4 md:p-6 animate-fade-in">
                      <h2 className="text-lg font-bold text-white mb-6">{text.notificationsTitle}</h2>
                      <div className="space-y-4">
                          {notificationState.map((option: any, i: number) => (
                              <div key={option.label} onClick={() => toggleNotification(i)} className="flex items-center justify-between p-4 bg-[#0c120e] rounded-xl border border-white/5 cursor-pointer hover:border-white/10 transition-colors">
                                  <span className="text-gray-300 font-medium">{option.label}</span>
                                  <div className={`w-12 h-6 rounded-full relative transition-colors ${option.enabled ? 'bg-arcade-success' : 'bg-gray-700'}`}>
                                      <div className={`absolute top-1 size-4 bg-white rounded-full transition-all shadow-md ${option.enabled ? 'right-1' : 'left-1'}`}></div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};