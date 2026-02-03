import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ACTIVITY_DATA, CURRENT_USER } from '../constants';
import { Shield, Target, Flame, Medal } from 'lucide-react';

export const Profile: React.FC = () => {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
        {/* Header Profile Card */}
        <div className="bg-py-surface border border-py-accent rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-py-green/10 to-transparent pointer-events-none" />
             
             <div className="relative">
                 <div className="size-32 rounded-full p-1 border-4 border-py-green/30">
                     <img src={CURRENT_USER.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                 </div>
                 <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-py-green text-py-dark font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                    Уровень {CURRENT_USER.levelNum}
                 </div>
             </div>

             <div className="flex-1 text-center md:text-left z-10">
                 <h1 className="text-3xl font-bold text-white mb-1">{CURRENT_USER.name}</h1>
                 <p className="text-py-green font-medium mb-4">{CURRENT_USER.level}</p>
                 <div className="flex flex-wrap justify-center md:justify-start gap-4">
                     <div className="bg-py-dark/50 px-4 py-2 rounded-xl border border-white/5 flex items-center gap-2">
                         <Flame className="text-orange-500" size={18} />
                         <span className="text-white font-bold">{CURRENT_USER.streak} Дней подряд</span>
                     </div>
                     <div className="bg-py-dark/50 px-4 py-2 rounded-xl border border-white/5 flex items-center gap-2">
                         <Target className="text-blue-500" size={18} />
                         <span className="text-white font-bold">98% Точность</span>
                     </div>
                 </div>
             </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Learning Activity Chart */}
            <div className="lg:col-span-2 bg-py-surface border border-py-accent rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-6">Активность обучения</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={ACTIVITY_DATA}>
                            <XAxis 
                                dataKey="name" 
                                stroke="#52665a" 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false} 
                            />
                            <Tooltip 
                                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                contentStyle={{ backgroundColor: '#102216', borderColor: '#28392e', borderRadius: '8px', color: '#fff' }}
                            />
                            <Bar dataKey="xp" radius={[4, 4, 0, 0]}>
                                {ACTIVITY_DATA.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.xp > 600 ? '#0df259' : '#28392e'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Achievements */}
            <div className="bg-py-surface border border-py-accent rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white">Недавние награды</h3>
                    <span className="text-xs text-py-green cursor-pointer">Смотреть все</span>
                </div>
                <div className="space-y-4">
                    {[
                        { title: 'Воин Кода', desc: 'Решено 50 легких задач', icon: Shield, color: 'text-yellow-400' },
                        { title: 'Охотник на багов', desc: 'Исправлено 20 ошибок', icon: Bug, color: 'text-red-400' },
                        { title: 'Топ 50', desc: 'Попал в топ-50 лиги', icon: Medal, color: 'text-purple-400' }
                    ].map((ach, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                            <div className={`size-10 rounded-lg bg-py-dark flex items-center justify-center ${ach.color} bg-opacity-20`}>
                                <ach.icon size={20} className={ach.color} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white">{ach.title}</h4>
                                <p className="text-xs text-py-muted">{ach.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};

// Simple Bug icon import fix for this specific file scope since Lucide imports are usually top-level
import { Bug } from 'lucide-react';
