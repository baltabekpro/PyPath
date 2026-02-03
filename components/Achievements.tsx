import React from 'react';
import { Shield, Zap, Target, Flame, Bug, Code2, Coffee, Globe, Lock, Trophy, Calendar, Star } from 'lucide-react';

interface Achievement {
    id: number;
    title: string;
    description: string;
    icon: any;
    progress: number;
    maxProgress: number;
    color: string;
    unlocked: boolean;
    date?: string;
}

const ACHIEVEMENTS_LIST: Achievement[] = [
    { id: 1, title: 'Hello World', description: 'Завершите первый урок', icon: Code2, progress: 1, maxProgress: 1, color: 'text-blue-400', unlocked: true, date: '12.03.2024' },
    { id: 2, title: 'Воин Кода', description: 'Решите 50 задач', icon: Shield, progress: 50, maxProgress: 50, color: 'text-yellow-400', unlocked: true, date: '15.03.2024' },
    { id: 3, title: 'В огне', description: 'Стрик 7 дней подряд', icon: Flame, progress: 7, maxProgress: 7, color: 'text-orange-500', unlocked: true, date: '18.03.2024' },
    { id: 4, title: 'Охотник на багов', description: 'Найдите 20 ошибок в коде', icon: Bug, progress: 12, maxProgress: 20, color: 'text-red-400', unlocked: false },
    { id: 5, title: 'Ночная Сова', description: 'Занимайтесь после 22:00', icon: Coffee, progress: 3, maxProgress: 5, color: 'text-purple-400', unlocked: false },
    { id: 6, title: 'Снайпер', description: '100% точность в тесте', icon: Target, progress: 0, maxProgress: 1, color: 'text-green-400', unlocked: false },
    { id: 7, title: 'Веб-мастер', description: 'Закончите курс по Flask', icon: Globe, progress: 45, maxProgress: 100, color: 'text-cyan-400', unlocked: false },
    { id: 8, title: 'Спидраннер', description: 'Решите задачу за 30 сек', icon: Zap, progress: 0, maxProgress: 1, color: 'text-yellow-200', unlocked: false },
];

export const Achievements: React.FC = () => {
    const unlockedCount = ACHIEVEMENTS_LIST.filter(a => a.unlocked).length;
    const totalCount = ACHIEVEMENTS_LIST.length;
    const progressPercentage = (unlockedCount / totalCount) * 100;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-10 animate-fade-in">
            {/* Header Stats Block - Rebalanced Hierarchy */}
            <div className="bg-gradient-to-br from-[#131f17] to-[#0c140e] border border-py-accent rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden shadow-2xl">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-py-green/5 blur-3xl rounded-full pointer-events-none transform translate-x-20"></div>
                
                <div className="z-10 flex-1 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-py-accent/50 rounded-full border border-white/5 backdrop-blur-sm">
                        <Trophy size={14} className="text-yellow-400" />
                        <span className="text-xs font-bold text-gray-300 uppercase tracking-wide">Зал славы</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">Ваши достижения</h1>
                    <p className="text-gray-400 text-lg max-w-lg leading-relaxed">
                        Каждая решенная задача и пройденный урок приближают вас к новому званию. Продолжайте в том же духе!
                    </p>
                </div>
                
                {/* Enlarged Progress Circle */}
                <div className="z-10 flex items-center gap-8 bg-[#0a0f0b]/80 p-6 rounded-2xl border border-white/10 shadow-xl backdrop-blur-md min-w-[300px]">
                    <div className="relative size-24 flex items-center justify-center shrink-0">
                        {/* Added viewBox to ensure scaling doesn't crop the stroke */}
                        <svg className="size-full -rotate-90" viewBox="0 0 96 96">
                             <circle cx="48" cy="48" r="40" stroke="#1a2e21" strokeWidth="8" fill="none" />
                             <circle cx="48" cy="48" r="40" stroke="#0df259" strokeWidth="8" fill="none" strokeDasharray="251" strokeDashoffset={251 - (251 * progressPercentage) / 100} className="transition-all duration-1000 ease-out" strokeLinecap="round"/>
                        </svg>
                        <span className="absolute text-xl font-black text-white">{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Прогресс</span>
                        <span className="text-3xl font-black text-white leading-none mb-1">{unlockedCount} <span className="text-gray-500 text-xl">/ {totalCount}</span></span>
                        <span className="text-sm text-py-green font-medium">Получено наград</span>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {ACHIEVEMENTS_LIST.map((ach) => (
                    <div 
                        key={ach.id} 
                        className={`relative group rounded-2xl p-6 border transition-all duration-300 flex flex-col h-full ${
                            ach.unlocked 
                            ? 'bg-py-surface border-py-accent hover:border-py-green/40 hover:shadow-[0_4px_20px_rgba(13,242,89,0.05)]' 
                            : 'bg-[#0c120e] border-white/5 opacity-80 hover:opacity-100 hover:border-white/10'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`size-14 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-inner border border-white/5 ${
                                ach.unlocked 
                                ? `bg-[#0a0f0b] ${ach.color} bg-opacity-20` 
                                : 'bg-[#151e18] text-gray-600'
                            }`}>
                                <ach.icon size={28} strokeWidth={ach.unlocked ? 2 : 1.5} className={ach.unlocked ? ach.color : ''} />
                            </div>

                            {/* Status Icon */}
                            {ach.unlocked ? (
                                <div className="bg-py-green/10 p-1.5 rounded-lg border border-py-green/20">
                                    <Star size={16} className="text-py-green fill-py-green" />
                                </div>
                            ) : (
                                <div className="bg-[#1a231e] p-1.5 rounded-lg border border-white/10 text-gray-500 group-hover:text-gray-300 transition-colors">
                                    <Lock size={16} />
                                </div>
                            )}
                        </div>

                        <h3 className={`font-bold mb-2 text-lg ${ach.unlocked ? 'text-white' : 'text-gray-400'}`}>{ach.title}</h3>
                        <p className={`text-sm mb-6 leading-relaxed flex-1 ${ach.unlocked ? 'text-gray-300' : 'text-gray-500'}`}>{ach.description}</p>

                        {/* Standardized Footer for both states */}
                        <div className="mt-auto pt-4 border-t border-white/5 w-full min-h-[50px] flex items-center">
                            {!ach.unlocked ? (
                                <div className="w-full">
                                    <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1.5 font-mono tracking-wide">
                                        <span>ПРОГРЕСС</span>
                                        <span>{ach.progress}/{ach.maxProgress}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-black rounded-full overflow-hidden border border-white/5">
                                        <div className="h-full bg-gray-600 group-hover:bg-py-green rounded-full transition-all duration-500" style={{ width: `${(ach.progress / ach.maxProgress) * 100}%` }}></div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                                    <Calendar size={14} className="text-py-green" />
                                    <span>Получено: <span className="text-gray-300">{ach.date}</span></span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};