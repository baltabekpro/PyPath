import React from 'react';
import { TrendingUp, Bot, ChevronRight, Zap, Bug, PlayCircle, Clock, Play, Award, Sparkles, Brain } from 'lucide-react';
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
          <p className="text-py-muted text-base">Ваш код компилируется, а навыки растут.</p>
        </div>
        <div className="hidden md:block text-right">
             <p className="text-xs text-py-muted font-mono mb-1 bg-py-surface px-3 py-1.5 rounded-lg border border-py-accent">
                {new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
             </p>
        </div>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Next Lesson Card (Primary Focus - 2/3 Width) */}
        <div 
          onClick={() => setView(View.PRACTICE)}
          className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-[#0f1912] to-[#050806] border border-py-accent hover:border-py-green/30 rounded-[2rem] p-8 group cursor-pointer shadow-xl transition-all flex flex-col justify-center"
        >
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-64 h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
            <div className="absolute -right-10 -bottom-20 size-64 bg-py-green/10 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                 <div className="size-20 rounded-2xl bg-[#1a2e21] flex items-center justify-center text-py-green shadow-lg border border-white/5 shrink-0 group-hover:scale-105 transition-transform">
                     <Play size={32} fill="currentColor" className="ml-1"/>
                 </div>
                 <div className="flex-1 text-center md:text-left">
                     <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5 mb-3">
                         <span className="size-2 bg-py-green rounded-full animate-pulse"></span>
                         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Текущий урок</span>
                     </div>
                     <h2 className="text-3xl font-bold text-white mb-2 leading-tight">Асинхронность в Python</h2>
                     <p className="text-py-muted mb-6 max-w-md">Продолжите с места, где остановились: <span className="text-white font-medium">Урок 5: Event Loop</span></p>
                     
                     <div className="flex items-center justify-center md:justify-start gap-6">
                        <button className="bg-py-green text-py-dark px-8 py-3.5 rounded-xl font-bold hover:bg-white transition-colors shadow-lg shadow-py-green/10 flex items-center gap-2">
                            Продолжить
                            <ChevronRight size={18} />
                        </button>
                        <div className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                            <Clock size={14} />
                            <span>~15 минут</span>
                        </div>
                     </div>
                 </div>
            </div>
        </div>

        {/* Daily Streak Card (Compact) */}
        <div className="bg-py-surface border border-py-accent rounded-[2rem] p-6 flex flex-col justify-between relative overflow-hidden group hover:border-py-green/20 transition-colors">
             <div className="flex justify-between items-start mb-4">
                 <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        Стрик
                    </h3>
                    <p className="text-xs text-py-muted mt-1">Не сбавляй темп!</p>
                 </div>
                 <div className="bg-orange-500/10 p-2 rounded-xl text-orange-500">
                     <TrendingUp size={24} />
                 </div>
             </div>
             
             <div className="flex items-end gap-2 mt-auto">
                 <span className="text-5xl font-black text-white leading-none">{CURRENT_USER.streak}</span>
                 <span className="text-sm font-bold text-py-muted mb-1.5 uppercase">дней</span>
             </div>
             
             {/* Mini visual representation */}
             <div className="flex gap-1 mt-6">
                {[1,2,3,4,5,6,7].map(d => (
                    <div key={d} className={`h-1.5 flex-1 rounded-full ${d <= 5 ? 'bg-orange-500' : 'bg-py-accent'}`}></div>
                ))}
             </div>
        </div>
      </div>

      {/* Stats Row - Mixed Colors */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
              { label: 'XP сегодня', value: '450', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
              { label: 'Задач решено', value: '12', icon: Bug, color: 'text-red-400', bg: 'bg-red-400/10' },
              { label: 'Часов учебы', value: '2.5', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-400/10' },
              { label: 'Рейтинг', value: `#${CURRENT_USER.rank}`, icon: Award, color: 'text-py-secondary', bg: 'bg-py-secondary/10' },
          ].map((stat, i) => (
              <div key={i} className="bg-py-surface border border-py-accent p-5 rounded-2xl flex flex-col items-start hover:border-white/10 transition-colors group">
                  <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} mb-3 group-hover:scale-110 transition-transform`}>
                      <stat.icon size={20} />
                  </div>
                  <span className="text-2xl font-black text-white mb-0.5">{stat.value}</span>
                  <span className="text-[10px] font-bold text-py-muted uppercase tracking-wider">{stat.label}</span>
              </div>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Active Courses List */}
          <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Мои курсы</h3>
                  <button onClick={() => setView(View.COURSES)} className="text-xs font-bold text-py-green hover:underline">Все курсы</button>
              </div>

              <div className="space-y-3">
                  {COURSES.slice(0, 3).map((course, idx) => (
                      <div key={course.id} className="bg-py-surface border border-py-accent p-4 rounded-2xl flex items-center gap-5 hover:border-white/10 transition-all cursor-pointer group" onClick={() => setView(View.COURSES)}>
                          <div className={`size-12 rounded-xl bg-[#0a0f0b] flex items-center justify-center ${course.color} border border-white/5`}>
                              {getIcon(course.icon)}
                          </div>
                          <div className="flex-1">
                              <div className="flex justify-between mb-1">
                                  <h4 className="font-bold text-white text-sm group-hover:text-py-green transition-colors">{course.title}</h4>
                                  <span className="text-xs font-bold text-py-muted">{course.progress}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-[#0a0f0b] rounded-full overflow-hidden">
                                  <div className={`h-full ${course.color.replace('text', 'bg')} rounded-full`} style={{width: `${course.progress}%`}}></div>
                              </div>
                          </div>
                          <button className={`size-9 rounded-lg flex items-center justify-center transition-colors ${idx === 0 ? 'bg-white/5 text-white' : 'text-py-muted hover:bg-white/5'}`}>
                              <ChevronRight size={18} />
                          </button>
                      </div>
                  ))}
              </div>
          </div>

          {/* AI Mentor - Revamped */}
          <div className="bg-gradient-to-b from-py-secondary/10 to-py-surface border border-py-secondary/20 rounded-2xl p-6 flex flex-col relative overflow-hidden">
              <div className="absolute -top-10 -right-10 size-40 bg-py-secondary/20 blur-[60px] rounded-full"></div>
              
              <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="bg-py-secondary p-2 rounded-lg text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]">
                      <Brain size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-none">AI Ментор</h3>
                    <p className="text-[10px] text-py-secondary font-bold uppercase tracking-wide mt-1">Всегда онлайн</p>
                  </div>
              </div>
              
              <div className="bg-black/20 border border-py-secondary/20 rounded-xl p-4 mb-6 flex-1 backdrop-blur-sm relative z-10">
                  <p className="text-sm text-gray-300 italic leading-relaxed">
                      "Привет! Я проанализировал твой код. Ты отлично справляешься с циклами, но давай улучшим работу с памятью?"
                  </p>
              </div>

              <button 
                onClick={() => setView(View.AI_CHAT)}
                className="w-full py-3 bg-py-secondary text-white rounded-xl text-sm font-bold hover:bg-py-secondary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-py-secondary/20 relative z-10"
              >
                  <Sparkles size={16} />
                  Спросить совета
              </button>
          </div>
      </div>
    </div>
  );
};