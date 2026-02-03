import React from 'react';
import { COURSES, getIcon } from '../constants';
import { Lock, Play, CheckCircle2 } from 'lucide-react';
import { View } from '../types';

interface CoursesProps {
  setView: (view: View) => void;
}

const getDifficultyStyle = (level: string) => {
    switch (level) {
        case 'Новичок': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        case 'Средний': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
        case 'Сложный': return 'bg-red-500/10 text-red-400 border-red-500/20';
        default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
};

export const Courses: React.FC<CoursesProps> = ({ setView }) => {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
       <div className="flex flex-col gap-2">
           <h1 className="text-3xl font-bold text-white">Каталог курсов</h1>
           <p className="text-gray-400">Прокачай навыки Python с нашими курируемыми курсами.</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {COURSES.map(course => {
               const completedLessons = Math.round((course.progress / 100) * course.totalLessons);
               
               return (
               <div key={course.id} className="bg-py-surface border border-py-accent rounded-2xl overflow-hidden hover:border-py-green/50 transition-all group flex flex-col shadow-lg">
                   {/* Card Header Gradient */}
                   <div className="h-32 bg-gradient-to-br from-[#131f17] to-[#0c140e] p-6 relative flex flex-col justify-between border-b border-white/5">
                       <div className="flex justify-between items-start">
                           <div className={`size-12 rounded-xl bg-[#0a0f0b] flex items-center justify-center ${course.color} shadow-lg border border-white/10`}>
                               {getIcon(course.icon)}
                           </div>
                           <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getDifficultyStyle(course.difficulty)}`}>
                               {course.difficulty}
                           </span>
                       </div>
                   </div>
                   
                   <div className="p-6 flex-1 flex flex-col">
                       <h3 className="text-xl font-bold text-white mb-2 group-hover:text-py-green transition-colors leading-tight">{course.title}</h3>
                       <p className="text-sm text-gray-300 mb-6 leading-relaxed flex-1">{course.description}</p>
                       
                       {/* Progress Info */}
                       <div className="space-y-3 mb-6">
                           <div className="flex justify-between items-end text-xs">
                               <span className="font-bold text-white flex items-center gap-1.5">
                                   {course.progress === 100 ? <CheckCircle2 size={14} className="text-py-green"/> : null}
                                   {course.progress}% Завершено
                               </span>
                               <span className="text-gray-400 font-mono">
                                   {completedLessons}/{course.totalLessons} Уроков
                               </span>
                           </div>
                           <div className="h-1.5 w-full bg-[#0c140e] rounded-full overflow-hidden border border-white/5">
                               <div className={`h-full ${course.color.replace('text', 'bg')} rounded-full transition-all duration-1000`} style={{ width: `${course.progress}%` }}></div>
                           </div>
                       </div>

                       <button 
                         onClick={() => setView(View.PRACTICE)}
                         className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border ${
                             course.progress > 0 
                             ? 'bg-py-green text-py-dark hover:bg-white border-transparent' 
                             : 'bg-transparent text-white border-py-accent hover:border-py-green hover:text-py-green'
                         }`}
                        >
                           {course.progress > 0 ? (
                               <>Продолжить <Play size={16} fill="currentColor" /></>
                           ) : (
                               'Начать курс'
                           )}
                       </button>
                   </div>
               </div>
           )})}

           {/* Locked Course - Enhanced Visuals */}
           <div className="bg-[#0c120e] border border-py-accent border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-5"></div>
                
                <div className="size-20 rounded-full bg-py-surface border border-py-accent flex items-center justify-center text-gray-600 mb-2 shadow-inner group-hover:scale-110 transition-transform duration-500">
                    <Lock size={32} />
                </div>
                
                <div className="relative z-10 max-w-[80%]">
                    <h3 className="text-lg font-bold text-gray-300 mb-2">Машинное обучение</h3>
                    <p className="text-xs text-gray-500 mb-4 leading-relaxed">Продвинутый курс по нейронным сетям и Deep Learning.</p>
                    <div className="inline-flex items-center gap-2 bg-py-accent/50 text-gray-400 px-4 py-2 rounded-full text-xs font-bold border border-white/5">
                        <Lock size={12} />
                        Откроется на 20 уровне
                    </div>
                </div>
           </div>
       </div>
    </div>
  );
};