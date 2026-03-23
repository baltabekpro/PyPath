import React, { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { APP_LANGUAGE, CURRENT_USER, SKILLS, STATS, PROFILE_UI, UI_TEXTS, getIconComponent } from '../constants';
import { Shield, Target, Flame, Medal, Edit3, Share2, Zap, Trophy, Plus } from 'lucide-react';
import { View } from '../types';
import { ActionToast } from './ActionToast';
import { apiGet } from '../api';

interface ProfileProps {
  setView: (view: View) => void;
}

// Rarity styles
const RARITY = {
    common: 'border-slate-600 bg-slate-800/50',
    rare: 'border-blue-500 bg-blue-900/20 shadow-[0_0_10px_rgba(59,130,246,0.3)]',
    epic: 'border-purple-500 bg-purple-900/20 shadow-[0_0_10px_rgba(168,85,247,0.3)]',
    legendary: 'border-yellow-400 bg-yellow-900/20 shadow-[0_0_15px_rgba(250,204,21,0.4)] animate-pulse-glow',
};

// Helper for counting animation
const CountUp: React.FC<{ end: number, suffix?: string }> = ({ end, suffix = '' }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!Number.isFinite(end) || end <= 0) {
            setCount(0);
            return;
        }
        let start = 0;
        const duration = 1500;
        const stepTime = Math.abs(Math.floor(duration / end));
        const timer = setInterval(() => {
            start += 1;
            setCount(start);
            if (start === end) clearInterval(timer);
        }, stepTime);
        return () => clearInterval(timer);
    }, [end]);
    return <span>{count}{suffix}</span>;
};

export const Profile: React.FC<ProfileProps> = ({ setView }) => {
    const isKz = APP_LANGUAGE === 'kz';
    const locale = isKz ? 'kk-KZ' : 'ru-RU';
  const [loadRadar, setLoadRadar] = useState(false);
        const [actionMessage, setActionMessage] = useState('');
        const [currentUser, setCurrentUser] = useState(CURRENT_USER);
        const [stats, setStats] = useState(STATS);
        const [skills, setSkills] = useState(SKILLS);
        const [lastUpdatedLabel, setLastUpdatedLabel] = useState(isKz ? 'Жаңа ғана жаңартылды' : 'Обновлено только что');
    const [activity, setActivity] = useState<any[]>([]);
    const [chartBundle, setChartBundle] = useState<{ lineByTasks: any[]; topicProgress: any[]; updatedAt?: string | null } | null>(null);

  useEffect(() => {
    const loadProfileData = async () => {
        try {
                        const [userData, statsData, skillsData, activityData, chartData] = await Promise.all([
                apiGet<any>('/currentUser'),
                apiGet<any>('/stats'),
                            apiGet<any[]>('/skills'),
                            apiGet<any[]>('/activity'),
                            apiGet<any>('/progress/charts')
            ]);
            setCurrentUser(userData);
            setStats(statsData);
            setSkills(skillsData);
                    setActivity(activityData || []);
                    setChartBundle(chartData || null);
            setLastUpdatedLabel(new Date().toLocaleString(locale, { hour: '2-digit', minute: '2-digit' }));
        } catch (error) {
            console.error('Failed to load profile data:', error);
            setLastUpdatedLabel(isKz ? 'Жергілікті дерек жаңартылды' : 'Обновлено локально');
        }
    };
    loadProfileData();
  }, [isKz, locale]);
    const showcaseTrophies = PROFILE_UI?.showcaseTrophies ?? [];
    const text = UI_TEXTS?.profile ?? {};
        const battleStatText = text.battleStats ?? {};

    const showAction = (message: string) => {
            setActionMessage(message);
            setTimeout(() => setActionMessage(''), 2200);
    };

  useEffect(() => {
      // Small delay to trigger radar animation
      setTimeout(() => setLoadRadar(true), 100);
  }, []);

  const battleStats = [
      { label: battleStatText.streak, value: currentUser.streak, suffix: isKz ? 'к' : 'дн', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
        { label: battleStatText.quests, value: stats.problemsSolved, suffix: '', icon: Target, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
        { label: battleStatText.leagueRank, value: currentUser.rank, suffix: '#', icon: Medal, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
        { label: battleStatText.accuracy, value: stats.accuracy, suffix: '%', icon: Zap, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
  ];

  const normalizedSkills = (skills || []).map((item: any, index: number) => ({
      subject: String(item?.subject || item?.skill || `${isKz ? 'Дағды' : 'Навык'} ${index + 1}`),
      score: Number(item?.score || item?.value || 0),
      fullMark: Number(item?.fullMark || 100),
  }));

  const lineProgressData = (chartBundle?.lineByTasks?.length ? chartBundle.lineByTasks : (activity || []).map((item: any, index: number) => ({
      task: index + 1,
      level: Number(item?.value || item?.xp || 0),
  })));

  const topicProgressData = (chartBundle?.topicProgress?.length ? chartBundle.topicProgress : normalizedSkills.map((item: any) => ({
      topic: String(item?.subject || (isKz ? 'Тақырып' : 'Тема')),
      progress: Number(item?.score || 0),
  })));

    return (
        <div className="min-h-screen pb-20 animate-fade-in relative bg-slate-100 dark:bg-[#0F172A]">
                <ActionToast visible={Boolean(actionMessage)} message={actionMessage} tone="info" />
        
        {/* --- Hero Banner --- */}
        <div className="h-64 w-full relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 transition-all duration-1000 group-hover:scale-105"></div>
            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
            {/* Abstract Shapes */}
            <div className="absolute top-10 left-10 size-64 bg-arcade-primary/30 blur-[100px] rounded-full animate-float"></div>
            <div className="absolute bottom-10 right-10 size-64 bg-arcade-action/20 blur-[100px] rounded-full animate-float" style={{animationDelay: '2s'}}></div>
            
            {/* Top Actions */}
            <div className="absolute top-6 right-6 flex gap-3 z-20">
                <button onClick={async () => {
                    const shareText = `Профиль ${currentUser.name} на PyPath`;
                    const shareUrl = window.location.href;
                    try {
                        if (navigator.share) {
                            await navigator.share({
                                title: 'Профиль PyPath',
                                text: shareText,
                                url: shareUrl,
                            });
                        } else {
                            await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
                        }
                        showAction(text.toastShared);
                    } catch {
                        showAction(text.toastShared);
                    }
                }} className="p-2 bg-white/70 dark:bg-black/30 backdrop-blur-md rounded-xl text-slate-800 dark:text-slate-200 dark:text-white hover:bg-white dark:hover:bg-white/20 transition-colors border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/30">
                    <Share2 size={20} />
                </button>
                <button 
                    onClick={() => setView(View.SETTINGS)}
                    className="p-2 bg-white/70 dark:bg-black/30 backdrop-blur-md rounded-xl text-slate-800 dark:text-slate-200 dark:text-white hover:bg-white dark:hover:bg-white/20 transition-colors border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/30 flex items-center gap-2"
                >
                    <Edit3 size={20} />
                    <span className="text-sm font-bold hidden md:inline">{text.edit}</span>
                </button>
            </div>
        </div>
        {/* --- Identity Section (Overlapping Banner) --- */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 -mt-24 relative z-10 mb-12">
            <div className="flex flex-col md:flex-row items-end md:items-center gap-6 md:gap-8">
                
                {/* Avatar with Rank Frame & Effects */}
                <div className="relative group cursor-pointer">
                    {/* Fire Effect for Streak */}
                    {currentUser.streak > 10 && (
                        <div className="absolute -top-6 -left-6 z-20 pointer-events-none">
                            <Flame size={48} className="text-orange-500 fill-orange-500 animate-bounce-sm drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
                        </div>
                    )}
                    
                    {/* Avatar Container */}
                    <div className="size-32 md:size-40 rounded-3xl bg-white dark:bg-[#0F172A] p-1.5 relative z-10 shadow-[0_0_40px_rgba(168,85,247,0.25)] overflow-hidden border-2 border-arcade-primary group-hover:border-white transition-colors">
                        <img src={currentUser.avatar} alt="Profile" className="size-full rounded-2xl object-cover bg-slate-800" />
                        {/* Glitch Overlay on Hover */}
                        <div className="absolute inset-0 bg-arcade-primary/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                    </div>
                    
                    {/* Rank Badge */}
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-arcade-primary text-white font-black px-4 py-1.5 rounded-xl text-xs uppercase tracking-widest shadow-lg border-2 border-slate-100 dark:border-[#0F172A] z-20 flex items-center gap-2 whitespace-nowrap">
                        <Shield size={12} fill="currentColor"/> {currentUser.level}
                    </div>
                </div>

                {/* Name & Bio */}
                <div className="flex-1 text-center md:text-left pt-12 md:pt-0">
                    <h1 className="text-3xl md:text-5xl font-display font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                        {currentUser.name}
                    </h1>
                    <p className="text-slate-600 dark:text-gray-400 font-medium max-w-lg mx-auto md:mx-0 leading-relaxed">
                        {currentUser.bio || text.defaultBio}
                    </p>
                    
                </div>

            </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* --- LEFT COLUMN --- */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* Battle Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {battleStats.map((stat, i) => (
                        <div key={stat.label} className={`rounded-2xl p-4 border ${stat.border} ${stat.bg} flex flex-col items-center justify-center gap-2 transition-transform hover:scale-105`}>
                            <stat.icon size={24} className={stat.color} />
                            <div className="text-center">
                                <div className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                                    <CountUp end={stat.value} suffix={stat.suffix} />
                                </div>
                                <div className={`text-[10px] font-bold uppercase tracking-wider ${stat.color} mt-1`}>{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Skills Radar */}
                <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 border border-slate-200 dark:border-white/5 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-display font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
                            <Zap size={20} className="text-yellow-400" />
                                {text.skillsMatrix || 'Матрица навыков'}
                        </h3>
                        <div className="text-xs font-bold text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-black/30 px-2 py-1 rounded">{text.lastUpdated || 'Обновлено'}: {lastUpdatedLabel}</div>
                    </div>
                    
                    <div className="h-[300px] w-full relative z-10">
                            {loadRadar && normalizedSkills.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={normalizedSkills}>
                                <PolarGrid stroke="#334155" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 'bold' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                <Radar
                                    name="Skills"
                                    dataKey="score"
                                    stroke="#A855F7"
                                    strokeWidth={3}
                                    fill="#A855F7"
                                    fillOpacity={0.3}
                                />
                                <Radar
                                    name="Full"
                                    dataKey="fullMark"
                                    stroke="transparent"
                                    fill="transparent"
                                    fillOpacity={0}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-center px-6">
                                <div className="bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl p-5">
                                    <p className="text-slate-900 dark:text-white font-bold mb-1">Навыки пока не заполнены</p>
                                    <p className="text-slate-600 dark:text-gray-400 text-sm">Решите несколько задач на арене — график появится автоматически.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                                {/* Combined Progress Charts */}
                                <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 border border-slate-200 dark:border-white/5">
                                    <h3 className="font-display font-black text-xl text-slate-900 dark:text-white mb-4">Уровень после каждого задания</h3>
                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                        <div className="h-64 bg-slate-50 dark:bg-black/20 rounded-2xl p-3 border border-slate-200 dark:border-white/5">
                                                        <p className="text-xs uppercase tracking-wider text-slate-600 dark:text-gray-400 mb-2">Линейная динамика</p>
                                                        {lineProgressData.length > 0 ? (
                                                            <ResponsiveContainer width="100%" height="90%">
                                                                <LineChart data={lineProgressData}>
                                                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                                                      <XAxis dataKey="task" stroke="#94A3B8" />
                                                                    <YAxis stroke="#94A3B8" />
                                                                    <Tooltip />
                                                                    <Line type="monotone" dataKey="level" stroke="#22D3EE" strokeWidth={2.5} dot={false} />
                                                                </LineChart>
                                                            </ResponsiveContainer>
                                                        ) : (
                                                            <div className="h-full flex items-center justify-center text-sm text-slate-600 dark:text-gray-400">Недостаточно данных по заданиям</div>
                                                        )}
                                                </div>
                                                <div className="h-64 bg-slate-50 dark:bg-black/20 rounded-2xl p-3 border border-slate-200 dark:border-white/5">
                                                        <p className="text-xs uppercase tracking-wider text-slate-600 dark:text-gray-400 mb-2">Прогресс по темам</p>
                                                        {topicProgressData.length > 0 ? (
                                                            <ResponsiveContainer width="100%" height="90%">
                                                                <BarChart data={topicProgressData}>
                                                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                                                    <XAxis dataKey="topic" stroke="#94A3B8" tick={{ fontSize: 10 }} />
                                                                    <YAxis stroke="#94A3B8" />
                                                                    <Tooltip />
                                                                    <Bar dataKey="progress" fill="#34D399" radius={[6, 6, 0, 0]} />
                                                                </BarChart>
                                                            </ResponsiveContainer>
                                                        ) : (
                                                            <div className="h-full flex items-center justify-center text-sm text-slate-600 dark:text-gray-400">Недостаточно данных по темам</div>
                                                        )}
                                                </div>
                                        </div>
                                </div>

                {/* Showcase Trophies */}
                <div>
                     <h3 className="font-display font-black text-xl text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Trophy size={20} className="text-arcade-action" />
                                {text.showcase || 'Витрина достижений'}
                     </h3>
                     <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                         {(showcaseTrophies.length > 0 ? showcaseTrophies : Array.from({ length: 5 }, () => ({ locked: true }))).map((item: any, i: number) => {
                             const isLocked = !item || item.locked;
                             const TrophyIcon = item?.icon ? getIconComponent(item.icon) : null;
                             return (
                                <div key={item?.id || `trophy-${i}`} className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-2 relative group cursor-pointer ${!isLocked ? RARITY[item.rarity as keyof typeof RARITY] : 'border-white/5 bg-white/5 border-dashed'}`}>
                                    {!isLocked && TrophyIcon ? (
                                        <>
                                           <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                           <TrophyIcon size={28} className="text-white drop-shadow-md group-hover:scale-110 transition-transform" />
                                           <span className="text-[10px] font-bold text-slate-700 dark:text-gray-300 text-center leading-tight px-1">{item.name}</span>
                                        </>
                                    ) : (
                                        <Plus size={24} className="text-gray-600 dark:text-gray-400" />
                                    )}
                                </div>
                             );
                         })}
                     </div>
                </div>

            </div>

            {/* --- RIGHT COLUMN --- */}
            <div className="space-y-8">
                <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 border border-slate-200 dark:border-white/5">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">Личный режим</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2">
                            <span className="text-slate-600 dark:text-gray-400">Рейтинг мира</span>
                            <span className="text-slate-900 dark:text-white font-bold">#{currentUser.rank}</span>
                        </div>
                        <div className="flex items-center justify-between bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2">
                            <span className="text-slate-600 dark:text-gray-400">Текущая лига</span>
                            <span className="text-slate-900 dark:text-white font-bold">{currentUser.league || '—'}</span>
                        </div>
                        <div className="flex items-center justify-between bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2">
                            <span className="text-slate-600 dark:text-gray-400">Серия дней</span>
                            <span className="text-slate-900 dark:text-white font-bold">{currentUser.streak}</span>
                        </div>
                    </div>
                    <button onClick={() => setView(View.LEADERBOARD)} className="w-full mt-5 py-2 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-bold uppercase tracking-wider transition-colors">
                        Открыть рейтинг мира
                    </button>
                </div>

            </div>

        </div>
    </div>
  );
};