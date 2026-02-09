import React, { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { CURRENT_USER } from '../constants';
import { Shield, Target, Flame, Medal, Bug, Edit3, Settings, Share2, MapPin, Github, Code, Zap, Trophy, UserPlus, Circle, Swords, Lock, Search, Plus } from 'lucide-react';
import { View } from '../types';

interface ProfileProps {
  setView: (view: View) => void;
}

// --- Mock Data ---

const SKILL_DATA = [
  { subject: 'Алгоритмы', A: 120, fullMark: 150 },
  { subject: 'Логика', A: 98, fullMark: 150 },
  { subject: 'Python', A: 86, fullMark: 150 },
  { subject: 'Скорость', A: 99, fullMark: 150 },
  { subject: 'Команда', A: 85, fullMark: 150 },
  { subject: 'Архитектура', A: 65, fullMark: 150 },
];

const BATTLE_STATS = [
    { label: 'Стрик', value: 12, suffix: 'дн', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    { label: 'Квесты', value: 156, suffix: '', icon: Target, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { label: 'Ранг Лиги', value: 42, suffix: '#', icon: Medal, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
    { label: 'Точность', value: 92, suffix: '%', icon: Zap, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
];

// Rarity styles
const RARITY = {
    common: 'border-slate-600 bg-slate-800/50',
    rare: 'border-blue-500 bg-blue-900/20 shadow-[0_0_10px_rgba(59,130,246,0.3)]',
    epic: 'border-purple-500 bg-purple-900/20 shadow-[0_0_10px_rgba(168,85,247,0.3)]',
    legendary: 'border-yellow-400 bg-yellow-900/20 shadow-[0_0_15px_rgba(250,204,21,0.4)] animate-pulse-glow',
};

const SHOWCASE_TROPHIES = [
    { id: 1, icon: Trophy, rarity: 'legendary', name: 'Первый Турнир' },
    { id: 2, icon: Bug, rarity: 'epic', name: 'Охотник' },
    { id: 3, icon: Code, rarity: 'rare', name: 'Чистый Код' },
    null, // Locked slot
    null  // Locked slot
];

const FRIENDS = [
    { id: 1, name: 'Anna_Py', status: 'online', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna' },
    { id: 2, name: 'Dmitry_Dev', status: 'coding', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dmitry' },
    { id: 3, name: 'Sergey_ML', status: 'offline', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sergey' },
];

// Helper for counting animation
const CountUp: React.FC<{ end: number, suffix?: string }> = ({ end, suffix = '' }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
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
  const [loadRadar, setLoadRadar] = useState(false);

  useEffect(() => {
      // Small delay to trigger radar animation
      setTimeout(() => setLoadRadar(true), 100);
  }, []);

  return (
    <div className="min-h-screen pb-20 animate-fade-in relative bg-[#0F172A]">
        
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
                <button className="p-2 bg-black/30 backdrop-blur-md rounded-xl text-white hover:bg-white/10 transition-colors border border-white/10 hover:border-white/30">
                    <Share2 size={20} />
                </button>
                <button 
                    onClick={() => setView(View.SETTINGS)}
                    className="p-2 bg-black/30 backdrop-blur-md rounded-xl text-white hover:bg-white/10 transition-colors border border-white/10 hover:border-white/30 flex items-center gap-2"
                >
                    <Edit3 size={20} />
                    <span className="text-sm font-bold hidden md:inline">Редактировать</span>
                </button>
            </div>
        </div>

        {/* --- Identity Section (Overlapping Banner) --- */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 -mt-24 relative z-10 mb-12">
            <div className="flex flex-col md:flex-row items-end md:items-center gap-6 md:gap-8">
                
                {/* Avatar with Rank Frame & Effects */}
                <div className="relative group cursor-pointer">
                    {/* Fire Effect for Streak */}
                    {CURRENT_USER.streak > 10 && (
                        <div className="absolute -top-6 -left-6 z-20 pointer-events-none">
                            <Flame size={48} className="text-orange-500 fill-orange-500 animate-bounce-sm drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
                        </div>
                    )}
                    
                    {/* Avatar Container */}
                    <div className="size-32 md:size-40 rounded-3xl bg-[#0F172A] p-1.5 relative z-10 shadow-[0_0_40px_rgba(168,85,247,0.4)] overflow-hidden border-2 border-arcade-primary group-hover:border-white transition-colors">
                        <img src={CURRENT_USER.avatar} alt="Profile" className="size-full rounded-2xl object-cover bg-slate-800" />
                        {/* Glitch Overlay on Hover */}
                        <div className="absolute inset-0 bg-arcade-primary/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                    </div>
                    
                    {/* Rank Badge */}
                    <div className="absolute -bottom-3 -right-3 bg-gradient-to-br from-arcade-action to-red-600 text-white size-10 md:size-12 rounded-xl flex items-center justify-center font-black text-lg border-4 border-[#0F172A] shadow-lg z-20 rotate-3 group-hover:rotate-12 transition-transform scale-110">
                        {CURRENT_USER.levelNum}
                    </div>
                </div>

                {/* Name & Titles */}
                <div className="flex-1 pb-2">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                        <h1 className="text-3xl md:text-5xl font-display font-black text-white tracking-tight drop-shadow-lg">{CURRENT_USER.name}</h1>
                        <span className="hidden md:block text-gray-500">•</span>
                        <div className="flex items-center gap-1 text-arcade-mentor font-mono text-sm md:text-base font-bold bg-arcade-mentor/10 px-3 py-1 rounded-full border border-arcade-mentor/20 w-fit shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                            <Code size={14} />
                            Мастер Циклов
                        </div>
                    </div>
                    
                    <p className="text-gray-400 max-w-lg text-sm md:text-base mb-4 italic border-l-2 border-arcade-primary/30 pl-3">
                        "Код — это поэзия, написанная логикой. Взламываю реальность по одной строке за раз."
                    </p>
                    
                    {/* Interactive XP Bar */}
                    <div className="max-w-lg group cursor-help relative">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-1.5 text-gray-400 group-hover:text-white transition-colors">
                            <span>Level {CURRENT_USER.levelNum}</span>
                            <span className="text-arcade-primary">{CURRENT_USER.xp} / 1000 XP</span>
                        </div>
                        <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-white/10 relative shadow-inner">
                            <div className="h-full bg-gradient-to-r from-arcade-primary via-purple-500 to-arcade-action w-[45%] rounded-full shadow-[0_0_20px_rgba(168,85,247,0.6)] relative overflow-hidden group-hover:brightness-110 transition-all">
                                <div className="absolute inset-0 bg-white/20 animate-[shimmer_1.5s_infinite] transform -skew-x-12"></div>
                            </div>
                        </div>
                        <div className="absolute top-full left-0 mt-2 bg-black/90 backdrop-blur text-white text-xs px-3 py-2 rounded-lg border border-arcade-primary/30 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-20 shadow-xl translate-y-2 group-hover:translate-y-0">
                            🔥 550 XP до уровня {CURRENT_USER.levelNum + 1}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* --- Main Grid Layout --- */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN (Stats & Skills) */}
            <div className="lg:col-span-8 space-y-8">
                
                {/* Battle Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {BATTLE_STATS.map((stat, i) => (
                        <div key={i} className={`bg-[#1E293B] border ${stat.border} rounded-2xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 shadow-lg`}>
                            {/* Bg Glow */}
                            <div className={`absolute inset-0 ${stat.bg} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                            
                            <div className={`size-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-inner`}>
                                <stat.icon size={24} />
                            </div>
                            <div className={`text-3xl font-display font-black text-white mb-1`}>
                                <CountUp end={stat.value} suffix={stat.suffix} />
                            </div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Skill Radar & Deep Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Skill Map */}
                    <div className="bg-[#1E293B] border border-white/5 rounded-3xl p-6 flex flex-col items-center shadow-lg relative overflow-hidden">
                        {/* Background Grid */}
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] opacity-10"></div>
                        
                        <div className="absolute top-0 right-0 p-4 opacity-20"><Target className="text-arcade-primary" size={120} strokeWidth={0.5}/></div>
                        
                        <h3 className="w-full text-lg font-bold text-white mb-4 flex items-center gap-2 relative z-10">
                            <MapPin className="text-arcade-primary" size={20} />
                            Карта Навыков
                        </h3>
                        
                        <div className={`w-full h-[250px] relative z-10 transition-all duration-1000 ${loadRadar ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={SKILL_DATA}>
                                    <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 'bold' }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                    <Radar
                                        name="Skills"
                                        dataKey="A"
                                        stroke="#22D3EE"
                                        strokeWidth={3}
                                        fill="#22D3EE"
                                        fillOpacity={0.4}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Social / Info Block */}
                    <div className="space-y-6">
                        {/* Connections */}
                        <div className="bg-[#1E293B] border border-white/5 rounded-3xl p-6 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-transparent pointer-events-none"></div>
                            <h3 className="text-lg font-bold text-white mb-4 relative z-10">Связи</h3>
                            <div className="space-y-3 relative z-10">
                                <button className="w-full flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5 hover:bg-black/40 hover:border-blue-500/30 transition-all group">
                                    <div className="flex items-center gap-3">
                                        <Github size={20} className="text-gray-400 group-hover:text-white"/>
                                        <span className="text-gray-300 font-medium text-sm group-hover:text-white">NeoCoder_GitHub</span>
                                    </div>
                                    <div className="size-2 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e]"></div>
                                </button>
                                <button className="w-full flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5 hover:bg-black/40 hover:border-[#5865F2]/50 transition-all group">
                                    <div className="flex items-center gap-3">
                                        <div className="size-5 rounded-full bg-[#5865F2] flex items-center justify-center text-[10px] font-black text-white shadow-md">D</div>
                                        <span className="text-gray-300 font-medium text-sm group-hover:text-white">Neo#1337</span>
                                    </div>
                                    <div className="size-2 bg-gray-600 rounded-full"></div>
                                </button>
                            </div>
                        </div>

                        {/* Inventory / Arsenal */}
                         <div 
                             onClick={() => setView(View.ACHIEVEMENTS)}
                             className="bg-gradient-to-br from-slate-900 to-red-900/20 border border-red-500/20 rounded-3xl p-6 cursor-pointer hover:scale-[1.02] hover:border-red-500/40 transition-all group shadow-lg"
                         >
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors flex items-center gap-2">
                                    <Swords size={18} className="text-red-500" />
                                    Арсенал
                                </h3>
                                <Share2 size={18} className="text-red-500/50 group-hover:text-red-500" />
                            </div>
                            <p className="text-xs text-gray-400 mb-4">Ваши инструменты для взлома кода</p>
                            <div className="flex gap-2">
                                {[1,2,3].map(i => (
                                    <div key={i} className="size-10 bg-black/40 rounded-lg border border-red-500/20 flex items-center justify-center">
                                        <Lock size={14} className="text-red-900" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN (Showcase & Friends) */}
            <div className="lg:col-span-4 space-y-8">
                
                {/* Trophy Showcase */}
                <div 
                    onClick={() => setView(View.ACHIEVEMENTS)}
                    className="bg-[#1E293B] border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden cursor-pointer group"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-[50px] rounded-full pointer-events-none"></div>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-white flex items-center gap-2 group-hover:text-yellow-400 transition-colors">
                            <Trophy className="text-yellow-400" size={20} />
                            Витрина
                        </h3>
                        <button className="text-xs text-arcade-primary font-bold hover:underline">Открыть все</button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {SHOWCASE_TROPHIES.map((item, index) => {
                             const style = item ? RARITY[item.rarity as keyof typeof RARITY] : '';
                             return (
                                <div 
                                    key={index} 
                                    className={`
                                        aspect-square rounded-2xl flex flex-col items-center justify-center relative group/item transition-all duration-300
                                        ${item ? `${style} border-2` : 'bg-black/20 border-2 border-dashed border-white/10 hover:border-white/20'}
                                    `}
                                >
                                    {item ? (
                                        <>
                                            <div className={`size-12 rounded-xl bg-black/30 flex items-center justify-center mb-2 shadow-lg group-hover/item:scale-110 transition-transform duration-300 relative z-10 backdrop-blur-sm`}>
                                                <item.icon size={24} className="text-white drop-shadow-md" />
                                            </div>
                                            <span className={`text-[10px] font-bold text-white/90 text-center leading-tight px-1 relative z-10`}>{item.name}</span>
                                            {/* Rarity Flare */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity rounded-xl"></div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center opacity-40 group-hover/item:opacity-100 transition-opacity">
                                            <Lock size={20} className="text-gray-500 mb-1" />
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Слот</span>
                                        </div>
                                    )}
                                </div>
                             )
                        })}
                    </div>
                </div>

                {/* Friends List */}
                <div className="bg-[#1E293B] border border-white/5 rounded-3xl p-6 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <UserPlus className="text-arcade-success" size={20} />
                            Друзья
                        </h3>
                        <div className="bg-black/30 px-2 py-1 rounded text-xs font-bold text-gray-400">3/50</div>
                    </div>

                    <div className="space-y-4">
                        {FRIENDS.map(friend => (
                            <div key={friend.id} className="flex items-center justify-between group cursor-pointer p-2 rounded-xl hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <img src={friend.avatar} className="size-10 rounded-xl bg-black border border-white/10" alt={friend.name} />
                                        <div className={`absolute -bottom-1 -right-1 size-3.5 border-2 border-[#1E293B] rounded-full flex items-center justify-center ${
                                            friend.status === 'online' ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 
                                            friend.status === 'coding' ? 'bg-arcade-primary shadow-[0_0_5px_#a855f7]' : 'bg-gray-500'
                                        }`}>
                                            {friend.status === 'coding' && <Code size={8} className="text-white"/>}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">{friend.name}</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wide font-bold">
                                            {friend.status === 'online' ? 'В сети' : friend.status === 'coding' ? 'В редакторе' : 'Был 2ч назад'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" 
                                        title="Дуэль"
                                        onClick={(e) => { e.stopPropagation(); setView(View.PRACTICE); }}
                                    >
                                        <Swords size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        
                        <button 
                            onClick={() => setView(View.LEADERBOARD)}
                            className="w-full py-3 mt-4 bg-arcade-primary/10 border border-arcade-primary/30 rounded-xl text-xs font-bold text-arcade-primary hover:bg-arcade-primary hover:text-white hover:shadow-neon-purple transition-all flex items-center justify-center gap-2 group"
                        >
                            <Search size={14} className="group-hover:scale-110 transition-transform" />
                            Найти друга
                        </button>
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
};