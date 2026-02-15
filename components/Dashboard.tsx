import React from 'react';
import { Flame, Bot, ChevronRight, Zap, Target, Play, Award, Sparkles, Gift, Clock, Swords, Lock } from 'lucide-react';
import { COURSES, CURRENT_USER, STATS } from '../constants';
import { View } from '../types';

interface DashboardProps {
  setView: (view: View) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in pt-6">
      
      {/* Welcome & Mentor Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-arcade-primary/20 to-transparent p-6 rounded-3xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 size-64 bg-arcade-primary/20 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="flex items-center gap-6 z-10 w-full md:w-auto">
             <div 
                className="size-20 bg-arcade-mentor rounded-full flex items-center justify-center shadow-neon-green border-4 border-white/20 animate-float cursor-pointer hover:scale-110 transition-transform"
                onClick={() => setView(View.AI_CHAT)}
             >
                 <Bot size={40} className="text-white" strokeWidth={2.5}/>
             </div>
             <div>
                 <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl rounded-tl-none inline-block mb-3 border border-white/5">
                    <p className="text-sm md:text-base text-white font-medium">👋 Привет, {CURRENT_USER.name}! Готов покорять код?</p>
                 </div>
                 <h1 className="text-3xl md:text-4xl font-display font-black text-white leading-none">Твоя База</h1>
             </div>
        </div>

        {/* Streak Counter (Fire) */}
        <div 
            onClick={() => setView(View.ACHIEVEMENTS)}
            className="flex items-center gap-4 bg-black/40 p-3 pr-6 rounded-2xl border border-orange-500/30 shadow-neon-orange transform hover:scale-105 transition-transform cursor-pointer group"
        >
             <div className="size-12 bg-gradient-to-t from-red-600 to-yellow-400 rounded-xl flex items-center justify-center animate-pulse-glow group-hover:rotate-6 transition-transform">
                 <Flame size={28} className="text-white fill-white" />
             </div>
             <div>
                 <p className="text-2xl font-black text-white leading-none">{CURRENT_USER.streak}</p>
                 <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Дней в огне</p>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* Current Mission (Big Card) */}
            <div 
              onClick={() => setView(View.PRACTICE)}
              className="group relative overflow-hidden bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2rem] border-2 border-indigo-500/30 hover:border-arcade-action transition-all cursor-pointer shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
                {/* Background Art */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-10"></div>
                <div className="absolute -right-20 -top-20 size-80 bg-arcade-action/20 blur-[80px] rounded-full group-hover:bg-arcade-action/30 transition-colors"></div>

                <div className="relative p-8 flex flex-col md:flex-row gap-8 items-center">
                     <div className="size-24 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/10 shadow-2xl group-hover:rotate-6 transition-transform duration-500">
                         <div className="size-16 bg-arcade-action rounded-2xl flex items-center justify-center text-white shadow-lg">
                             <Play size={32} fill="currentColor" className="ml-1"/>
                         </div>
                     </div>
                     
                     <div className="flex-1 text-center md:text-left">
                         <div className="inline-flex items-center gap-2 px-3 py-1 bg-arcade-action/20 text-arcade-action rounded-full border border-arcade-action/20 mb-3">
                             <Swords size={14} />
                             <span className="text-xs font-black uppercase tracking-wider">Текущая миссия</span>
                         </div>
                         <h2 className="text-3xl font-display font-black text-white mb-2 group-hover:text-arcade-action transition-colors">Петли Времени</h2>
                         <p className="text-gray-300 mb-6 font-medium">Уровень 5 • Босс: Бесконечный Цикл</p>
                         
                         {/* Progress Bar styled as HP */}
                         <div className="w-full h-4 bg-black/50 rounded-full overflow-hidden border border-white/10 relative">
                             <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-arcade-action to-yellow-400 w-[45%] rounded-full shadow-[0_0_15px_rgba(249,115,22,0.8)]"></div>
                             {/* Glare effect */}
                             <div className="absolute top-0 left-0 w-full h-[50%] bg-white/10 rounded-full"></div>
                         </div>
                         <div className="flex justify-between mt-2 text-xs font-bold text-gray-500 uppercase">
                             <span>Прогресс</span>
                             <span className="text-white">45%</span>
                         </div>
                     </div>

                     <div className="hidden md:flex flex-col items-center gap-1">
                        <button className="size-16 rounded-full bg-white text-arcade-action flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-all">
                            <ChevronRight size={32} strokeWidth={3} />
                        </button>
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider bg-black/40 px-2 py-1 rounded-lg">Start</span>
                     </div>
                </div>
            </div>

            {/* Daily Quests */}
            <div>
                <h3 className="text-xl font-display font-black text-white mb-4 flex items-center gap-2">
                    <Target className="text-arcade-danger" />
                    Ежедневные Квесты
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { title: "Реши 3 задачи", reward: "50 XP", icon: Zap, done: true, color: "text-yellow-400", border: "border-yellow-400/20", link: View.PRACTICE },
                        { title: "Без ошибок", reward: "Сундук", icon: Gift, done: false, color: "text-arcade-primary", border: "border-arcade-primary/20", link: View.COURSES },
                        { title: "Помоги другу", reward: "20 XP", icon: Bot, done: false, color: "text-arcade-mentor", border: "border-arcade-mentor/20", link: View.AI_CHAT },
                    ].map((quest, i) => (
                        <div 
                            key={i} 
                            onClick={() => setView(quest.link)}
                            className={`bg-arcade-card border-2 ${quest.done ? 'border-arcade-success/50 bg-arcade-success/10' : 'border-white/5'} p-4 rounded-2xl flex flex-col items-center text-center gap-3 hover:translate-y-[-4px] transition-transform cursor-pointer hover:border-white/20`}
                        >
                            <div className={`size-12 rounded-full flex items-center justify-center ${quest.done ? 'bg-arcade-success text-white' : 'bg-white/5 ' + quest.color}`}>
                                {quest.done ? <Award size={24} /> : <quest.icon size={24} />}
                            </div>
                            <div>
                                <h4 className={`font-bold text-sm ${quest.done ? 'text-arcade-success line-through' : 'text-white'}`}>{quest.title}</h4>
                                <div className="inline-block mt-1 bg-black/40 px-2 py-0.5 rounded-md border border-white/5">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">{quest.reward}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>

        {/* Sidebar / Stats */}
        <div className="space-y-6">
            
            {/* Player Stats */}
            <div className="bg-arcade-card border border-white/5 rounded-3xl p-6 relative overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display font-black text-white">Статистика</h3>
                    <button onClick={() => setView(View.PROFILE)} className="text-xs font-bold text-arcade-primary hover:underline">Подробнее</button>
                </div>
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-black/30 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-500/20 text-yellow-500 rounded-lg"><Zap size={18} /></div>
                            <span className="font-bold text-gray-300 text-sm">Всего XP</span>
                        </div>
                        <span className="font-mono font-bold text-white">{STATS.totalXp.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-black/30 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-arcade-danger/20 text-arcade-danger rounded-lg"><Target size={18} /></div>
                            <span className="font-bold text-gray-300 text-sm">Задач решено</span>
                        </div>
                        <span className="font-mono font-bold text-white">{STATS.problemsSolved}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-black/30 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-arcade-mentor/20 text-arcade-mentor rounded-lg"><Clock size={18} /></div>
                            <span className="font-bold text-gray-300 text-sm">Время в коде</span>
                        </div>
                        <span className="font-mono font-bold text-white">{STATS.codingHours}ч</span>
                    </div>
                </div>
            </div>

            {/* Quick Play / Mini Games */}
            <div 
                onClick={() => setView(View.PRACTICE)}
                className="bg-gradient-to-b from-arcade-primary to-purple-800 rounded-3xl p-6 text-center text-white relative overflow-hidden shadow-neon-purple group cursor-pointer hover:scale-[1.02] transition-transform"
            >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-20"></div>
                <Sparkles className="absolute top-4 left-4 text-white/40 animate-pulse" />
                <Sparkles className="absolute bottom-4 right-4 text-white/40 animate-pulse delay-700" />
                
                <h3 className="text-2xl font-display font-black mb-2 relative z-10">Блиц-Турнир</h3>
                <p className="text-purple-200 text-sm mb-6 relative z-10 font-medium">Реши 5 задач за 5 минут и получи удвоенный XP!</p>
                
                <button className="w-full py-3 bg-white text-arcade-primary rounded-xl font-black uppercase tracking-wider shadow-lg hover:bg-gray-100 transition-colors relative z-10">
                    Начать
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};