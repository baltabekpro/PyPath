import React from 'react';
import { COURSES, getIcon } from '../constants';
import { Lock, Star, Play } from 'lucide-react';
import { View } from '../types';

interface CoursesProps {
  setView: (view: View) => void;
}

export const Courses: React.FC<CoursesProps> = ({ setView }) => {
  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-8 animate-fade-in pt-6 pb-20">
       <div className="text-center mb-12">
           <h1 className="text-4xl font-display font-black text-white mb-2">Карта Приключений</h1>
           <p className="text-arcade-muted font-medium">Выбирай уровень и прокачивай своего персонажа.</p>
       </div>

       <div className="relative flex flex-col items-center gap-16 md:gap-24">
           {/* Center Path Line */}
           <div className="absolute top-0 bottom-0 w-3 bg-white/5 rounded-full -z-10"></div>
           
           {COURSES.map((course, index) => {
               const isLocked = course.progress === 0 && index > 0 && COURSES[index-1].progress < 100;
               const isCompleted = course.progress === 100;
               const isCurrent = !isLocked && !isCompleted;

               // Calculate offset for zigzag effect
               const offsetClass = index % 2 === 0 ? 'translate-x-0' : (index % 4 === 1 ? 'md:translate-x-16' : 'md:-translate-x-16');

               return (
               <div key={course.id} className={`relative z-10 flex flex-col items-center group ${offsetClass}`}>
                   
                   {/* Level Node (Circle) */}
                   <div 
                        onClick={() => !isLocked && setView(View.PRACTICE)}
                        className={`
                            size-24 md:size-32 rounded-full border-b-8 shadow-2xl flex items-center justify-center transition-all duration-300 cursor-pointer relative
                            ${isLocked 
                                ? 'bg-gray-800 border-gray-900 text-gray-600 cursor-not-allowed' 
                                : isCurrent 
                                    ? 'bg-gradient-to-b from-arcade-action to-orange-600 border-orange-800 text-white scale-110 shadow-neon-orange animate-float' 
                                    : 'bg-arcade-success border-emerald-700 text-white'
                            }
                            ${!isLocked && 'active:scale-95 active:border-b-0 active:translate-y-2'}
                        `}
                   >
                       {/* Icon inside */}
                       <div className="transform group-hover:scale-110 transition-transform duration-300">
                           {isLocked ? <Lock size={32} /> : getIcon(course.icon)}
                       </div>

                       {/* Stars for completed levels */}
                       {isCompleted && (
                           <div className="absolute -bottom-2 flex gap-1">
                               {[1,2,3].map(s => <Star key={s} size={16} className="text-yellow-400 fill-yellow-400 stroke-orange-600 stroke-2" />)}
                           </div>
                       )}

                       {/* 'START' label for current level */}
                       {isCurrent && (
                           <div className="absolute -top-10 bg-white text-arcade-action px-3 py-1 rounded-lg font-black text-xs uppercase shadow-lg animate-bounce-sm">
                               Start
                               <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-t-[6px] border-t-white border-r-[6px] border-r-transparent"></div>
                           </div>
                       )}
                   </div>

                   {/* Info Card (Below Node) */}
                   <div className={`mt-4 text-center transition-opacity duration-300 ${isLocked ? 'opacity-50' : 'opacity-100'}`}>
                       <h3 className="font-display font-black text-white text-lg md:text-xl leading-tight">{course.title}</h3>
                       <p className={`text-xs font-bold uppercase mt-1 px-3 py-1 rounded-full inline-block ${
                           isLocked ? 'bg-gray-800 text-gray-500' : 'bg-white/10 text-arcade-muted'
                       }`}>
                           {course.difficulty}
                       </p>
                   </div>

               </div>
           )})}
           
           {/* Boss Level Placeholder */}
           <div className="relative z-10 flex flex-col items-center opacity-50">
               <div className="size-40 rounded-[2rem] bg-gray-900 border-4 border-dashed border-gray-700 flex items-center justify-center">
                   <Lock size={48} className="text-gray-700" />
               </div>
               <p className="mt-4 font-black text-gray-600 uppercase tracking-widest">Скоро...</p>
           </div>
       </div>
    </div>
  );
};