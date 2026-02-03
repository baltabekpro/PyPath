import React from 'react';
import { TrendingUp, Bot, ChevronRight, Zap, Bug, PlayCircle, Clock, Play, Award, Calendar } from 'lucide-react';
import { COURSES, getIcon, CURRENT_USER } from '../constants';
import { View } from '../types';

interface DashboardProps {
  setView: (view: View) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-fade-in pt-10">
      {/* Welcome Section */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-extrabold mb-2 text-white tracking-tight">С возвращением, {CURRENT_USER.name.split(' ')[0]}!</h1>
          <p className="text-py-muted text-base">Ваш код компилируется, а навыки растут. Так держать!</p>
        </div>
        <div className="hidden md:block text-right">
             <p className="text-xs text-py-muted font-mono mb-1 bg-py-surface px-3 py-1.5 rounded-lg border border-py-accent">
                {new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
             </p>
        </div>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Next Lesson Card (Primary Focus - 2/3 Width) */}
        <div 
          onClick={() => setView(View.PRACTICE)}
          className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-[#152e20] to-[#0a120d] border border-py-green/30 rounded-[2rem] p-10 group cursor-pointer shadow-2xl shadow-black/50 transition-all hover:border-py-green/50 hover:shadow-py-green/5 flex flex-col justify-center"
        >
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-64 h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
            <div className="absolute -right-10 -bottom-20 size-64 bg-py-green/20 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                 <div className="size-20 rounded-2xl bg-py-green/20 flex items-center justify-center text-py-green shadow-[0_0_30px_rgba(13,242,89,0.2)] border border-py-green/30 shrink-0">
                     <Play size={32} fill="currentColor" className="ml-1"/>
                 </div>
                 <div className="flex-1 text-center md:text-left">
                     <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/30 rounded-full border border-white/10 mb-3 backdrop-blur-sm">
                         <span className="size-2 bg-py-green rounded-full animate-pulse"></span>
                         <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">Текущий урок</span>
                     </div>
                     <h2 className="text-3xl font-bold text-white mb-2 leading-tight">Асинхронность в Python</h2>
                     <p className="text-gray-300 mb-6 max-w-md">Продолжите с места, где остановились: <span className="text-white font-medium">Урок 5: Event Loop</span></p>
                     
                     <div className="flex items-center justify-center md:justify-start gap-6">
                        <button className="bg-py-green text-py-dark px-8 py-3.5 rounded-xl font-bold hover:bg-white transition-colors shadow-lg shadow-py-green/20 flex items-center gap-2 group-hover:scale-105 duration-300">
                            Продолжить
                            <ChevronRight size={18} />
                        </button>
                        <div className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                            <Clock size={14} />
                            <span>~15 минут</span>
                        </div>
                     </div>
                 </div>
            </div>
        </div>

        {/* Daily Streak Card (Right Side) */}
        <div className="bg-[#0c120e] border border-py-accent rounded-[2rem] p-8 flex flex-col items-center justify-center relative overflow-hidden group hover:border-py-green/30 transition-colors">
             <div className="relative size-40 mb-6">
                 <svg className="size-full -rotate-90" viewBox="0 0 120 120">
                     <circle cx="60" cy="60" r="54" stroke="#1a2e21" strokeWidth="10" fill="none" />
                     <circle 
                        cx="60" 
                        cy="60" 
                        r="54" 
                        stroke="#0df259" 
                        strokeWidth="10" 
                        fill="none" 
                        strokeDasharray="339.29" 
                        strokeDashoffset="100" 
                        strokeLinecap="round"
                     />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className="text-4xl font-black text-white leading-none mb-1">{CURRENT_USER.streak}</span>
                     <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">дней</span>
                 </div>
             </div>
             
             <div className="text-center">
                 <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                    Огонь! <span className="text-2xl">🔥</span>
                 </h3>
                 <p className="text-sm text-gray-400 leading-relaxed max-w-[200px] mx-auto">
                    Вы в топ-10% по постоянству на этой неделе.
                 </p>
             </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
              { label: 'XP сегодня', value: '450', icon: Zap, color: 'text-yellow-400' },
              { label: 'Задач решено', value: '12', icon: Bug, color: 'text-red-400' },
              { label: 'Часов учебы', value: '2.5', icon: Clock, color: 'text-blue-400' },
              { label: 'Рейтинг', value: `#${CURRENT_USER.rank}`, icon: Award, color: 'text-purple-400' },
          ].map((stat, i) => (
              <div key={i} className="bg-py-surface border border-py-accent p-5 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-[#1f3628] transition-colors group">
                  <stat.icon size={24} className={`${stat.color} mb-3 group-hover:scale-110 transition-transform`} />
                  <span className="text-2xl font-black text-white mb-1">{stat.value}</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{stat.label}</span>
              </div>
          ))}
      </div>

      {/* Recent Courses / Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Active Courses List */}
          <div className="space-y-6">
              <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Мои курсы</h3>
                  <button onClick={() => setView(View.COURSES)} className="text-xs font-bold text-py-green hover:underline">Все курсы</button>
              </div>

              <div className="space-y-4">
                  {COURSES.slice(0, 3).map(course => (
                      <div key={course.id} className="bg-py-surface border border-py-accent p-4 rounded-2xl flex items-center gap-4 hover:border-py-green/30 transition-all cursor-pointer group" onClick={() => setView(View.COURSES)}>
                          <div className={`size-12 rounded-xl bg-[#0a0f0b] flex items-center justify-center ${course.color} border border-white/5`}>
                              {getIcon(course.icon)}
                          </div>
                          <div className="flex-1">
                              <h4 className="font-bold text-white text-sm mb-1 group-hover:text-py-green transition-colors">{course.title}</h4>
                              <div className="w-full h-1.5 bg-[#0a0f0b] rounded-full overflow-hidden">
                                  <div className={`h-full ${course.color.replace('text', 'bg')} rounded-full`} style={{width: `${course.progress}%`}}></div>
                              </div>
                          </div>
                          <span className="text-xs font-bold text-gray-500">{course.progress}%</span>
                          <button className="size-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:bg-py-green hover:text-py-dark transition-colors">
                              <Play size={14} fill="currentColor"/>
                          </button>
                      </div>
                  ))}
              </div>
          </div>

          {/* AI Mentor Quick Prompt */}
          <div className="bg-[#0c120e] border border-py-accent rounded-2xl p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                  <div className="bg-py-green/10 p-2 rounded-lg text-py-green">
                      <Bot size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-white">AI Ментор</h3>
              </div>
              
              <div className="bg-py-surface border border-py-accent rounded-xl p-4 mb-4 flex-1">
                  <div className="flex gap-3">
                      <div className="size-8 rounded-full bg-py-green flex items-center justify-center text-py-dark shrink-0 font-bold text-xs">AI</div>
                      <p className="text-sm text-gray-300 italic">
                          "Заметил, что ты изучаешь асинхронность. Хочешь объясню разницу между многопоточностью и асинхронностью на примере кухни в ресторане?"
                      </p>
                  </div>
              </div>

              <button 
                onClick={() => setView(View.AI_CHAT)}
                className="w-full py-3 bg-white/5 border border-py-accent hover:border-py-green/50 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
              >
                  <Bot size={16} />
                  Начать диалог
              </button>
          </div>
      </div>
    </div>
  );
};