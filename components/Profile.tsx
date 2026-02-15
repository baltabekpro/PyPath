import React, { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { CURRENT_USER, SKILLS, FRIENDS, STATS, PROFILE_UI, UI_TEXTS, getIconComponent } from '../constants';
import { Shield, Target, Flame, Medal, Edit3, Share2, MapPin, Github, Zap, Trophy, UserPlus, Swords, Search, Plus } from 'lucide-react';
import { View } from '../types';

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
    const showcaseTrophies = PROFILE_UI?.showcaseTrophies ?? [];
    const text = UI_TEXTS?.profile ?? {};
        const battleStatText = text.battleStats ?? {};

  useEffect(() => {
      // Small delay to trigger radar animation
      setTimeout(() => setLoadRadar(true), 100);
  }, []);

  const battleStats = [
        { label: battleStatText.streak, value: CURRENT_USER.streak, suffix: 'дн', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
        { label: battleStatText.quests, value: STATS.problemsSolved, suffix: '', icon: Target, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
        { label: battleStatText.leagueRank, value: CURRENT_USER.rank, suffix: '#', icon: Medal, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
        { label: battleStatText.accuracy, value: STATS.accuracy, suffix: '%', icon: Zap, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
  ];

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
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-arcade-primary text-white font-black px-4 py-1.5 rounded-xl text-xs uppercase tracking-widest shadow-lg border-2 border-[#0F172A] z-20 flex items-center gap-2 whitespace-nowrap">
                        <Shield size={12} fill="currentColor"/> {CURRENT_USER.level}
                    </div>
                </div>

                {/* Name & Bio */}
                <div className="flex-1 text-center md:text-left pt-12 md:pt-0">
                    <h1 className="text-3xl md:text-5xl font-display font-black text-white mb-2 tracking-tight">
                        {CURRENT_USER.name}
                    </h1>
                    <p className="text-gray-400 font-medium max-w-lg mx-auto md:mx-0 leading-relaxed">
                        {CURRENT_USER.bio || text.defaultBio}
                    </p>
                    
                    {/* Tags / Badges */}
                    <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                        <div className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20 flex items-center gap-2">
                            <MapPin size={12} /> {PROFILE_UI?.location}
                        </div>
                        <div className="px-3 py-1 rounded-lg bg-purple-500/10 text-purple-400 text-xs font-bold border border-purple-500/20 flex items-center gap-2">
                            <Github size={12} /> {PROFILE_UI?.github}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none py-3 px-6 rounded-xl bg-white text-black font-bold uppercase tracking-wide hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                        {text.add}
                    </button>
                    <button className="flex-1 md:flex-none py-3 px-6 rounded-xl bg-arcade-card border border-white/10 text-white font-bold uppercase tracking-wide hover:bg-white/10 transition-colors">
                        {text.message}
                    </button>
                </div>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* --- LEFT COLUMN --- */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* Battle Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {battleStats.map((stat, i) => (
                        <div key={i} className={`rounded-2xl p-4 border ${stat.border} ${stat.bg} flex flex-col items-center justify-center gap-2 transition-transform hover:scale-105`}>
                            <stat.icon size={24} className={stat.color} />
                            <div className="text-center">
                                <div className="text-2xl font-black text-white leading-none">
                                    <CountUp end={stat.value} suffix={stat.suffix} />
                                </div>
                                <div className={`text-[10px] font-bold uppercase tracking-wider ${stat.color} mt-1`}>{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Skills Radar */}
                <div className="bg-[#1E293B] rounded-3xl p-6 border border-white/5 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-display font-black text-xl text-white flex items-center gap-2">
                            <Zap size={20} className="text-yellow-400" />
                            {text.skillsMatrix}
                        </h3>
                        <div className="text-xs font-bold text-gray-500 bg-black/30 px-2 py-1 rounded">{text.lastUpdated}</div>
                    </div>
                    
                    <div className="h-[300px] w-full relative z-10">
                        {loadRadar && (
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={SKILLS}>
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
                        )}
                    </div>
                </div>

                {/* Showcase Trophies */}
                <div>
                     <h3 className="font-display font-black text-xl text-white mb-4 flex items-center gap-2">
                        <Trophy size={20} className="text-arcade-action" />
                                {text.showcase}
                     </h3>
                     <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                         {showcaseTrophies.map((item: any, i: number) => {
                             const isLocked = !item || item.locked;
                             const TrophyIcon = item?.icon ? getIconComponent(item.icon) : null;
                             return (
                                <div key={i} className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-2 relative group cursor-pointer ${!isLocked ? RARITY[item.rarity as keyof typeof RARITY] : 'border-white/5 bg-white/5 border-dashed'}`}>
                                    {!isLocked && TrophyIcon ? (
                                        <>
                                           <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                           <TrophyIcon size={28} className="text-white drop-shadow-md group-hover:scale-110 transition-transform" />
                                           <span className="text-[10px] font-bold text-gray-300 text-center leading-tight px-1">{item.name}</span>
                                        </>
                                    ) : (
                                        <Plus size={24} className="text-gray-600" />
                                    )}
                                </div>
                             );
                         })}
                     </div>
                </div>

            </div>

            {/* --- RIGHT COLUMN --- */}
            <div className="space-y-8">
                
                {/* Clan / School Card */}
                <div className="bg-gradient-to-b from-indigo-900 to-[#1E293B] rounded-3xl p-1 shadow-lg border border-indigo-500/30">
                    <div className="bg-[#0F172A] rounded-[1.4rem] p-6 h-full relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[50px] rounded-full"></div>
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="size-20 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 rotate-3 border border-white/20">
                                <Swords size={32} className="text-white" />
                            </div>
                            <h3 className="text-white font-black text-lg uppercase tracking-wider">{text.schoolName}</h3>
                            <p className="text-indigo-300 text-xs font-bold mb-6">{text.schoolClass}</p>
                            
                            <div className="w-full space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">{text.members}</span>
                                    <span className="text-white font-bold">24</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">{text.totalXp}</span>
                                    <span className="text-arcade-primary font-bold">1.2M</span>
                                </div>
                            </div>

                            <button className="w-full mt-6 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-wider transition-colors">
                                {text.schoolProfile}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Friends List */}
                <div className="bg-[#1E293B] rounded-3xl p-6 border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-white">{text.friends}</h3>
                        <div className="bg-black/30 px-2 py-1 rounded-lg text-xs font-bold text-gray-400 border border-white/5">{FRIENDS.length}</div>
                    </div>
                    
                    <div className="space-y-4">
                        {FRIENDS.map((friend: any) => (
                            <div key={friend.id} className="flex items-center justify-between group cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <img src={friend.avatar} className="size-10 rounded-xl bg-black object-cover border border-white/10" />
                                        <div className={`absolute -bottom-1 -right-1 size-3 rounded-full border-2 border-[#1E293B] ${friend.status === 'online' ? 'bg-green-500' : friend.status === 'coding' ? 'bg-arcade-primary animate-pulse' : 'bg-gray-500'}`}></div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white group-hover:text-arcade-primary transition-colors">{friend.name}</p>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase">{friend.status === 'coding' ? text.codingStatus : `Lvl ${friend.level}`}</p>
                                    </div>
                                </div>
                                <button className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                    <UserPlus size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                    
                    <button className="w-full mt-6 py-3 border-t border-white/5 text-xs font-bold text-gray-400 hover:text-white uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                        <Search size={14} /> {text.findFriends}
                    </button>
                </div>

            </div>

        </div>
    </div>
  );
};