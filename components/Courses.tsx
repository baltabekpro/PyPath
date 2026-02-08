import React, { useEffect, useRef, useState } from 'react';
import { COURSES, getIcon } from '../constants';
import { Lock, Star, Play, ChevronLeft, Award, Zap, Skull, Map as MapIcon, X } from 'lucide-react';
import { View, Course } from '../types';

interface CoursesProps {
  setView: (view: View) => void;
}

export const Courses: React.FC<CoursesProps> = ({ setView }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedLevel, setSelectedLevel] = useState<Course | null>(null);
  const [shakingId, setShakingId] = useState<number | null>(null);

  // Auto-scroll to the first unlocked but incomplete level
  useEffect(() => {
    const activeLevel = COURSES.find(c => !c.locked && c.progress < 100) || COURSES[0];
    const element = document.getElementById(`level-${activeLevel.id}`);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const handleLevelClick = (course: Course) => {
      if (course.locked) {
          setShakingId(course.id);
          setTimeout(() => setShakingId(null), 400); // Reset shake
      } else {
          setSelectedLevel(course);
      }
  };

  // Generate SVG Path for the snake layout
  const generatePath = () => {
    // 0: Center (50%), 1: Right (80%), 2: Center (50%), 3: Left (20%)
    const points = COURSES.map((_, i) => {
        const xPercent = i % 4 === 1 ? 80 : (i % 4 === 3 ? 20 : 50);
        return { x: xPercent, y: i * 160 + 80 }; // 160px row height
    });

    let path = `M ${points[0].x}% ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
        const curr = points[i];
        const next = points[i + 1];
        // Simple straight line or curve
        // Using straight lines for "constellation" look
        path += ` L ${next.x}% ${next.y}`;
    }
    return path;
  };

  return (
    <div className="relative h-full flex flex-col bg-[#0F172A] overflow-hidden">
       
       {/* Background Decor */}
       <div className="absolute inset-0 pointer-events-none">
           <div className="absolute top-0 left-1/4 size-96 bg-arcade-primary/10 blur-[120px] rounded-full"></div>
           <div className="absolute bottom-0 right-1/4 size-96 bg-arcade-action/10 blur-[120px] rounded-full"></div>
           {/* Code Snippets floating */}
           <div className="absolute top-20 right-10 font-mono text-white/5 text-xl font-bold animate-float rotate-12">def __init__(self):</div>
           <div className="absolute bottom-40 left-10 font-mono text-white/5 text-xl font-bold animate-float" style={{animationDelay: '1s'}}>return True</div>
       </div>

       {/* Sticky Header */}
       <header className="z-20 bg-[#0F172A]/90 backdrop-blur-md border-b border-white/5 p-4 flex items-center justify-between sticky top-0 shadow-2xl">
           <button onClick={() => setView(View.DASHBOARD)} className="flex items-center gap-2 text-arcade-muted hover:text-white transition-colors">
               <ChevronLeft size={20} />
               <span className="font-bold text-sm uppercase tracking-wider">Лобби</span>
           </button>
           <div className="flex flex-col items-center">
               <h1 className="text-white font-display font-black text-lg tracking-tight">Глава 1: Начало Пути</h1>
               <div className="flex items-center gap-1.5 text-[10px] font-bold text-arcade-action uppercase tracking-widest">
                   <MapIcon size={12} />
                   <span>Прогресс: 4/8</span>
               </div>
           </div>
           <div className="w-16"></div> {/* Spacer */}
       </header>

       {/* Map Container */}
       <div ref={scrollContainerRef} className="flex-1 overflow-y-auto custom-scrollbar relative py-20 pb-40">
           <div className="max-w-md mx-auto relative min-h-screen" style={{ height: `${COURSES.length * 160 + 200}px` }}>
               
               {/* Connecting Path */}
               <svg className="absolute inset-0 size-full pointer-events-none z-0">
                    {/* Background Path (Dim) */}
                    <path d={generatePath()} fill="none" stroke="#334155" strokeWidth="6" strokeDasharray="12 12" strokeLinecap="round" />
                    {/* Foreground Path (Lit for completed) - Simplified: logic would be complex for exact gradient cutoffs */}
               </svg>

               {/* Level Nodes */}
               {COURSES.map((course, index) => {
                   // Calculate position style
                   const xPos = index % 4 === 1 ? '80%' : (index % 4 === 3 ? '20%' : '50%');
                   const yPos = index * 160 + 80;
                   const isLocked = course.locked;
                   const isCompleted = course.progress === 100;
                   const isCurrent = !isLocked && !isCompleted;
                   const isBoss = course.isBoss;

                   return (
                       <div 
                           key={course.id}
                           id={`level-${course.id}`}
                           className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10"
                           style={{ left: xPos, top: yPos }}
                       >
                           {/* The Button */}
                           <button
                               onClick={() => handleLevelClick(course)}
                               className={`
                                   relative transition-all duration-300 flex items-center justify-center shadow-2xl group
                                   ${isBoss ? 'size-28 md:size-32 rounded-[2rem]' : 'size-20 md:size-24 rounded-full'}
                                   ${isLocked 
                                        ? 'bg-[#1E293B] border-4 border-[#334155] text-[#64748B]' 
                                        : isCurrent
                                            ? 'bg-gradient-to-b from-arcade-action to-red-500 border-4 border-white text-white scale-110 shadow-neon-orange animate-pulse-glow'
                                            : 'bg-[#10B981] border-4 border-[#059669] text-white'
                                   }
                                   ${shakingId === course.id ? 'animate-shake' : ''}
                                   ${!isLocked && 'hover:scale-110 active:scale-95 cursor-pointer'}
                               `}
                           >
                               {/* Icon */}
                               <div className={`${isLocked ? 'opacity-50' : 'opacity-100 drop-shadow-md'}`}>
                                   {isLocked ? <Lock size={isBoss ? 40 : 28} /> : getIcon(course.icon)}
                               </div>

                               {/* Current Indicator "START" */}
                               {isCurrent && (
                                   <div className="absolute -top-12 bg-white text-arcade-action px-3 py-1 rounded-xl font-black text-xs uppercase shadow-lg animate-bounce-sm whitespace-nowrap">
                                       ТЫ ЗДЕСЬ
                                       <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45"></div>
                                   </div>
                               )}
                           </button>

                           {/* Star Rating (Completed) */}
                           {isCompleted && (
                               <div className="flex gap-1 mt-2 p-1 bg-black/40 rounded-full backdrop-blur-sm border border-white/5">
                                   {[1, 2, 3].map((s) => (
                                       <Star 
                                         key={s} 
                                         size={12} 
                                         className={`${(course.stars || 0) >= s ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} 
                                       />
                                   ))}
                               </div>
                           )}

                           {/* Level Label */}
                           {(!isLocked || isBoss) && (
                               <div className={`mt-2 px-3 py-1 rounded-lg backdrop-blur-md border border-white/5 text-center max-w-[120px] ${isBoss ? 'bg-red-500/20 text-red-200' : 'bg-black/40 text-gray-300'}`}>
                                   <span className="text-[10px] font-bold uppercase tracking-wider block">{isBoss ? 'BOSS LEVEL' : `Уровень ${course.id}`}</span>
                               </div>
                           )}

                       </div>
                   );
               })}

           </div>
       </div>

       {/* Level Preview Modal (Bottom Sheet) */}
       {selectedLevel && (
           <div className="fixed inset-0 z-50 flex items-end justify-center">
               <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedLevel(null)}></div>
               
               <div className="relative w-full max-w-xl bg-[#1E293B] border-t border-white/10 rounded-t-3xl p-6 shadow-2xl transform transition-transform animate-float-up">
                   
                   {/* Close Button */}
                   <button 
                     onClick={() => setSelectedLevel(null)}
                     className="absolute top-4 right-4 p-2 bg-white/5 rounded-full text-gray-400 hover:text-white"
                   >
                       <X size={20} />
                   </button>

                   <div className="flex flex-col items-center text-center">
                       {/* Level Icon */}
                       <div className={`size-20 rounded-2xl flex items-center justify-center mb-4 shadow-lg ${
                           selectedLevel.isBoss ? 'bg-red-500 text-white shadow-neon-orange' : 'bg-arcade-primary text-white shadow-neon-purple'
                       }`}>
                           {getIcon(selectedLevel.icon)}
                       </div>

                       <h2 className="text-2xl font-display font-black text-white mb-2">{selectedLevel.title}</h2>
                       <p className="text-arcade-muted mb-6 max-w-xs">{selectedLevel.description}</p>

                       {/* Stats */}
                       <div className="flex items-center gap-4 w-full justify-center mb-8">
                           <div className="bg-[#0F172A] px-4 py-3 rounded-xl border border-white/5 flex flex-col items-center min-w-[80px]">
                               <span className="text-[10px] text-gray-500 font-bold uppercase">Сложность</span>
                               <span className={`font-bold ${selectedLevel.difficulty === 'Сложно' ? 'text-red-400' : 'text-green-400'}`}>{selectedLevel.difficulty}</span>
                           </div>
                           <div className="bg-[#0F172A] px-4 py-3 rounded-xl border border-white/5 flex flex-col items-center min-w-[80px]">
                               <span className="text-[10px] text-gray-500 font-bold uppercase">Награда</span>
                               <span className="font-bold text-yellow-400 flex items-center gap-1"><Award size={14}/> 50 XP</span>
                           </div>
                       </div>

                       {/* Big CTA */}
                       <button 
                         onClick={() => setView(View.PRACTICE)}
                         className="w-full py-4 rounded-2xl bg-gradient-to-r from-arcade-action to-red-500 text-white font-black text-lg uppercase tracking-widest shadow-neon-orange hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                       >
                           <Play fill="currentColor" />
                           Погнали!
                       </button>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};