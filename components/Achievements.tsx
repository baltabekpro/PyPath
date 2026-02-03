import React from 'react';
import { Shield, Zap, Target, Flame, Bug, Code2, Coffee, Globe, Lock } from 'lucide-react';

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
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header with Stats */}
            <div className="bg-py-surface border border-py-accent rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-py-green/5 pointer-events-none"></div>
                <div className="z-10">
                    <h1 className="text-3xl font-bold text-white mb-2">Достижения</h1>
                    <p className="text-py-muted">Коллекционируйте бейджи за свои успехи в обучении.</p>
                </div>
                
                <div className="z-10 flex items-center gap-6 bg-py-dark/50 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                    <div className="size-16 relative flex items-center justify-center">
                        <svg className="size-full -rotate-90">
                             <circle cx="32" cy="32" r="28" stroke="#28392e" strokeWidth="4" fill="none" />
                             <circle cx="32" cy="32" r="28" stroke="#0df259" strokeWidth="4" fill="none" strokeDasharray="176" strokeDashoffset={176 - (176 * progressPercentage) / 100} className="transition-all duration-1000 ease-out" />
                        </svg>
                        <span className="absolute text-sm font-bold text-white">{Math.round(progressPercentage)}%</span>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white">{unlockedCount} <span className="text-py-muted text-sm font-normal">из {totalCount}</span></p>
                        <p className="text-xs text-py-green uppercase tracking-wide">Получено</p>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {ACHIEVEMENTS_LIST.map((ach) => (
                    <div 
                        key={ach.id} 
                        className={`relative group rounded-2xl p-6 border transition-all duration-300 flex flex-col items-center text-center ${
                            ach.unlocked 
                            ? 'bg-py-surface border-py-accent hover:border-py-green/50 hover:shadow-[0_0_20px_rgba(13,242,89,0.1)]' 
                            : 'bg-py-surface/30 border-transparent grayscale opacity-70 hover:opacity-100 hover:grayscale-0'
                        }`}
                    >
                        {!ach.unlocked && (
                            <div className="absolute top-3 right-3 text-py-muted">
                                <Lock size={16} />
                            </div>
                        )}

                        <div className={`size-16 rounded-2xl mb-4 flex items-center justify-center ${ach.unlocked ? `bg-py-dark ${ach.color} bg-opacity-20` : 'bg-py-dark text-gray-500'}`}>
                            <ach.icon size={32} strokeWidth={1.5} className={ach.unlocked ? ach.color : ''} />
                        </div>

                        <h3 className="text-white font-bold mb-1">{ach.title}</h3>
                        <p className="text-xs text-py-muted mb-4 min-h-[32px]">{ach.description}</p>

                        {/* Progress Bar for Locked Items */}
                        {!ach.unlocked ? (
                            <div className="w-full mt-auto">
                                <div className="flex justify-between text-[10px] text-py-muted mb-1 font-mono">
                                    <span>ПРОГРЕСС</span>
                                    <span>{ach.progress}/{ach.maxProgress}</span>
                                </div>
                                <div className="h-1.5 w-full bg-py-dark rounded-full overflow-hidden">
                                    <div className="h-full bg-py-green rounded-full transition-all duration-500" style={{ width: `${(ach.progress / ach.maxProgress) * 100}%` }}></div>
                                </div>
                            </div>
                        ) : (
                             <div className="mt-auto pt-4 border-t border-white/5 w-full">
                                <span className="text-[10px] text-py-green font-mono uppercase">Получено {ach.date}</span>
                             </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};