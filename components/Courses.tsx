import React, { useEffect, useRef, useState } from 'react';
import { COURSES, UI_TEXTS, getIcon } from '../constants';
import { Lock, Star, Play, ChevronLeft, Award, Zap, Skull, Map as MapIcon, X, EyeOff } from 'lucide-react';
import { View, Course } from '../types';

interface CoursesProps {
  setView: (view: View) => void;
}

export const Courses: React.FC<CoursesProps> = ({ setView }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedLevel, setSelectedLevel] = useState<Course | null>(null);
  const [shakingId, setShakingId] = useState<number | null>(null);
    const text = UI_TEXTS?.courses ?? {};

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
          setTimeout(() => setShakingId(null), 400); 
      } else {
          setSelectedLevel(course);
      }
  };

  const handleStartMission = () => {
      // Logic: Start mission -> Go to Practice (Editor)
      // Ideally pass "Briefing" context, for now we just switch view
      setSelectedLevel(null);
      setView(View.PRACTICE);
  };

  const generatePath = () => {
    const points = COURSES.map((_, i) => {
        const xPercent = i % 4 === 1 ? 80 : (i % 4 === 3 ? 20 : 50);
        return { x: xPercent, y: i * 180 + 100 };
    });

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
        const next = points[i + 1];
        path += ` L ${next.x} ${next.y}`;
    }
    return path;
  };

  return (
    <div className="relative h-full flex flex-col bg-[#0F172A] overflow-hidden">
       
       {/* Background Decor */}
       <div className="absolute inset-0 pointer-events-none">
           <div className="absolute top-0 left-1/4 size-96 bg-arcade-primary/10 blur-[120px] rounded-full"></div>
           <div className="absolute bottom-0 right-1/4 size-96 bg-arcade-action/10 blur-[120px] rounded-full"></div>
       </div>

       {/* Map Header */}
       <header className="z-20 bg-[#0F172A]/90 backdrop-blur-md border-b border-white/5 p-4 flex items-center justify-between sticky top-0 shadow-2xl">
           <button onClick={() => setView(View.DASHBOARD)} className="flex items-center gap-2 text-arcade-muted hover:text-white transition-colors">
               <ChevronLeft size={20} />
               <span className="font-bold text-sm uppercase tracking-wider hidden sm:inline">{text.backToLobby}</span>
           </button>
           <div className="flex flex-col items-center">
               <h1 className="text-white font-display font-black text-lg tracking-tight">{text.mapTitle}</h1>
               <div className="flex items-center gap-1.5 text-[10px] font-bold text-arcade-action uppercase tracking-widest">
                   <MapIcon size={12} />
                   <span>{text.season}</span>
               </div>
           </div>
           <div className="w-16"></div>
       </header>

       {/* Map Container */}
       <div ref={scrollContainerRef} className="flex-1 overflow-y-auto custom-scrollbar relative py-20 pb-40">
           <div className="max-w-md mx-auto relative min-h-screen" style={{ height: `${COURSES.length * 180 + 200}px` }}>
               
               {/* Connection Line */}
            <svg
                className="absolute inset-0 size-full pointer-events-none z-0"
                viewBox={`0 0 100 ${COURSES.length * 180 + 200}`}
                preserveAspectRatio="none"
            >
                    <path d={generatePath()} fill="none" stroke="#334155" strokeWidth="4" strokeDasharray="8 8" strokeLinecap="round" />
               </svg>

               {/* Nodes */}
               {COURSES.map((course, index) => {
                   const xPos = index % 4 === 1 ? '80%' : (index % 4 === 3 ? '20%' : '50%');
                   const yPos = index * 180 + 100;
                   const isLocked = course.locked;
                   const isCompleted = course.progress === 100;
                   const isCurrent = !isLocked && !isCompleted;

                   return (
                       <div 
                           key={course.id}
                           id={`level-${course.id}`}
                           className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 w-40"
                           style={{ left: xPos, top: yPos }}
                       >
                           {/* Level Node Button */}
                           <button
                               onClick={() => handleLevelClick(course)}
                               className={`
                                   relative transition-all duration-300 flex items-center justify-center shadow-2xl group
                                   ${course.isBoss ? 'size-24 rounded-2xl rotate-45' : 'size-20 rounded-full'}
                                   ${isLocked 
                                        ? 'bg-[#0F172A] border-2 border-slate-700 text-slate-700 opacity-60' 
                                        : isCurrent
                                            ? 'bg-gradient-to-b from-arcade-action to-red-600 border-4 border-white text-white scale-110 shadow-[0_0_30px_rgba(249,115,22,0.6)] animate-pulse-glow'
                                            : 'bg-[#1E293B] border-4 border-arcade-success text-arcade-success'
                                   }
                                   ${shakingId === course.id ? 'animate-shake' : ''}
                                   ${!isLocked && 'hover:scale-110 active:scale-95 cursor-pointer'}
                               `}
                           >
                               <div className={`${course.isBoss ? '-rotate-45' : ''}`}>
                                  {isLocked ? <Lock size={24} /> : getIcon(course.icon)}
                               </div>
                               
                               {/* Current Tag */}
                               {isCurrent && (
                                   <div className={`absolute -top-10 bg-white text-arcade-action px-2 py-0.5 rounded-lg font-black text-[10px] uppercase shadow-lg animate-bounce-sm whitespace-nowrap ${course.isBoss ? '-rotate-45' : ''}`}>
                                       {text.currentLevel}
                                   </div>
                               )}
                           </button>

                           {/* Info Label */}
                           <div className={`mt-4 text-center transition-opacity ${isLocked ? 'opacity-30' : 'opacity-100'}`}>
                               <div className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/5 inline-block">
                                   <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block mb-0.5">
                                       {course.isBoss ? text.bossLabel : `${text.chapterPrefix} ${course.id}`}
                                   </span>
                                   <span className={`text-xs font-bold leading-tight block ${isLocked ? 'blur-[2px]' : 'text-gray-200'}`}>
                                       {course.title}
                                   </span>
                               </div>
                           </div>

                       </div>
                   );
               })}

           </div>
       </div>

       {/* Mission Briefing Modal */}
       {selectedLevel && (
           <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
               <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedLevel(null)}></div>
               
               <div className="relative w-full max-w-lg bg-[#1E293B] border border-white/10 rounded-t-3xl md:rounded-3xl p-0 shadow-2xl transform transition-transform animate-float-up overflow-hidden">
                   
                   {/* Cyber Header */}
                   <div className="h-32 bg-gradient-to-br from-arcade-primary/20 to-purple-900/20 relative p-6 flex flex-col justify-end">
                       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                       <button onClick={() => setSelectedLevel(null)} className="absolute top-4 right-4 p-2 bg-black/30 rounded-full text-white hover:bg-white/20"><X size={18}/></button>
                       
                       <div className="flex items-center gap-3 relative z-10">
                            <div className={`size-12 rounded-xl flex items-center justify-center shadow-lg ${selectedLevel.isBoss ? 'bg-red-500' : 'bg-arcade-primary'} text-white`}>
                                {getIcon(selectedLevel.icon)}
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{text.briefing}</p>
                                <h2 className="text-xl font-display font-black text-white leading-tight">{selectedLevel.title}</h2>
                            </div>
                       </div>
                   </div>

                   {/* Body */}
                   <div className="p-6 space-y-6">
                       <p className="text-gray-300 text-sm leading-relaxed border-l-2 border-arcade-action pl-4 italic">
                           "{selectedLevel.description}"
                       </p>

                       {/* Rewards Grid */}
                       <div className="grid grid-cols-2 gap-3">
                           <div className="bg-[#0F172A] p-3 rounded-xl border border-white/5 flex items-center gap-3">
                               <Award size={20} className="text-yellow-400" />
                               <div>
                                   <p className="text-[10px] text-gray-500 font-bold uppercase">{text.reward}</p>
                                   <p className="font-bold text-white">100 XP</p>
                               </div>
                           </div>
                           <div className="bg-[#0F172A] p-3 rounded-xl border border-white/5 flex items-center gap-3">
                               <Zap size={20} className="text-arcade-success" />
                               <div>
                                   <p className="text-[10px] text-gray-500 font-bold uppercase">{text.difficulty}</p>
                                   <p className="font-bold text-white">{selectedLevel.difficulty}</p>
                               </div>
                           </div>
                       </div>

                       {/* Action */}
                       <button 
                         onClick={handleStartMission}
                         className="w-full py-4 rounded-xl bg-gradient-to-r from-arcade-action to-red-600 text-white font-black text-sm uppercase tracking-widest shadow-neon-orange hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group"
                       >
                           <Play size={18} fill="currentColor" />
                           {text.acceptMission}
                       </button>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};