import React, { useEffect, useRef, useState } from 'react';
import { COURSES, UI_TEXTS, getIcon } from '../constants';
import { Lock, Star, Play, ChevronLeft, Award, Zap, Skull, Map as MapIcon, X, EyeOff } from 'lucide-react';
import { View, Course } from '../types';
import { apiGet } from '../api';

interface CoursesProps {
  setView: (view: View) => void;
}

export const Courses: React.FC<CoursesProps> = ({ setView }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedLevel, setSelectedLevel] = useState<Course | null>(null);
  const [shakingId, setShakingId] = useState<number | null>(null);
  const [courses, setCourses] = useState(COURSES);
    const [journeyTopics, setJourneyTopics] = useState<any[]>([]);
    const [journeyProgress, setJourneyProgress] = useState<Record<string, { theoryOpened: boolean; completedPractices: number[] }>>({});
    const text = UI_TEXTS?.courses ?? {};
        const currentSeason = courses.find((c: any) => typeof c.currentSeason === 'number')?.currentSeason ?? 1;

  useEffect(() => {
    const loadCourses = async () => {
        try {
                        const [coursesDataResult, topicsDataResult, progressDataResult] = await Promise.allSettled([
                            apiGet<any[]>('/courses'),
                            apiGet<any[]>('/courses/journey'),
                            apiGet<any>('/courses/journey/progress'),
                        ]);

                        if (coursesDataResult.status === 'fulfilled') {
                            setCourses(coursesDataResult.value);
                        }
                        if (topicsDataResult.status === 'fulfilled') {
                            setJourneyTopics(Array.isArray(topicsDataResult.value) ? topicsDataResult.value : []);
                        }
                        if (progressDataResult.status === 'fulfilled') {
                            setJourneyProgress(progressDataResult.value && typeof progressDataResult.value === 'object' ? progressDataResult.value : {});
                        }
        } catch (error) {
            console.error('Failed to load courses:', error);
        }
    };
    loadCourses();
  }, []);

  useEffect(() => {
    const activeLevel = courses.find(c => !c.locked && c.progress < 100) || courses[0];
        if (!activeLevel) return;
    const element = document.getElementById(`level-${activeLevel?.id}`);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [courses]);

  const handleLevelClick = (course: Course) => {
      if (course.locked) {
          setShakingId(course.id);
          setTimeout(() => setShakingId(null), 400); 
      } else {
          setSelectedLevel(course);
      }
  };

  const handleStartMission = () => {
      if (selectedLevel) {
          localStorage.setItem('activeCourseId', String(selectedLevel.id));
      }
      setSelectedLevel(null);
      setView(View.COURSE_JOURNEY);
  };

  const generatePath = () => {
        if (courses.length === 0) return '';
    const points = courses.map((_, i) => {
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

    const totalJourneyPractices = journeyTopics.reduce((sum: number, item: any) => sum + (Array.isArray(item?.practices) ? item.practices.length : 0), 0);
    const completedJourneyPractices = journeyTopics.reduce((sum: number, item: any) => {
        const p = journeyProgress[String(item?.id)] || { completedPractices: [] };
        return sum + (Array.isArray(p.completedPractices) ? p.completedPractices.length : 0);
    }, 0);
    const journeyPercent = totalJourneyPractices > 0 ? Math.round((completedJourneyPractices / totalJourneyPractices) * 100) : 0;

    const selectedJourneyTopic = selectedLevel
        ? journeyTopics.find((item: any) => String(item?.id) === `course-${selectedLevel.id}`)
        : null;
    const selectedJourneyProgress = selectedJourneyTopic
        ? journeyProgress[String(selectedJourneyTopic.id)] || { completedPractices: [] }
        : { completedPractices: [] };

  return (
    <div className="relative h-full flex flex-col bg-slate-100 overflow-hidden">
       
       {/* Background Decor */}
       <div className="absolute inset-0 pointer-events-none">
           <div className="absolute top-0 left-1/4 size-96 bg-arcade-primary/10 blur-[120px] rounded-full"></div>
           <div className="absolute bottom-0 right-1/4 size-96 bg-arcade-action/10 blur-[120px] rounded-full"></div>
       </div>

       {/* Map Header */}
       <header className="z-20 bg-white/90 backdrop-blur-md border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 shadow-sm">
           <button onClick={() => setView(View.DASHBOARD)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
               <ChevronLeft size={20} />
               <span className="font-bold text-sm uppercase tracking-wider hidden sm:inline">{text.backToLobby || 'Назад'}</span>
           </button>
           <div className="flex flex-col items-center">
               <h1 className="text-slate-900 font-display font-black text-lg tracking-tight">{text.mapTitle || 'Карта курсов'}</h1>
               <div className="flex items-center gap-1.5 text-[10px] font-bold text-arcade-action uppercase tracking-widest">
                   <MapIcon size={12} />
                   <span>{text.season || 'Сезон обучения'} {currentSeason}</span>
               </div>
               <div className="mt-1 text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                    Journey: {completedJourneyPractices}/{totalJourneyPractices} ({journeyPercent}%)
               </div>
           </div>
           <div className="w-16"></div>
       </header>

       {/* Map Container */}
       <div ref={scrollContainerRef} className="flex-1 overflow-y-auto custom-scrollbar relative py-20 pb-40">
           <div className="max-w-md mx-auto relative min-h-screen" style={{ height: `${Math.max(courses.length * 180 + 200, 420)}px` }}>
               
               {/* Connection Line */}
            <svg
                className="absolute inset-0 size-full pointer-events-none z-0"
                viewBox={`0 0 100 ${courses.length * 180 + 200}`}
                preserveAspectRatio="none"
            >
                                        <path d={generatePath()} fill="none" stroke="#334155" strokeWidth="4" strokeDasharray="8 8" strokeLinecap="round" />
               </svg>

                             {courses.length === 0 && (
                                     <div className="absolute inset-0 flex items-center justify-center z-20 px-6">
                                             <div className="w-full bg-white border border-slate-200 rounded-2xl p-6 text-center">
                                                     <h3 className="text-slate-900 font-bold text-lg mb-2">Курсы пока не загружены</h3>
                                                     <p className="text-slate-600 text-sm mb-4">Структура экрана сохранена. Проверьте интеграцию данных API /courses.</p>
                                                     <button
                                                         onClick={() => setView(View.DASHBOARD)}
                                                         className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-700 text-white text-sm font-bold"
                                                     >
                                                         Вернуться на главную
                                                     </button>
                                             </div>
                                     </div>
                             )}

               {/* Nodes */}
               {courses.map((course, index) => {
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
                                        ? 'bg-slate-200 border-2 border-slate-300 text-slate-400 opacity-70' 
                                        : isCurrent
                                            ? 'bg-gradient-to-b from-arcade-action to-red-600 border-4 border-white text-white scale-110 shadow-[0_0_30px_rgba(249,115,22,0.6)] animate-pulse-glow'
                                            : 'bg-white border-4 border-arcade-success text-arcade-success'
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
                               <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-slate-200 inline-block shadow-sm">
                                   <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block mb-0.5">
                                       {course.isBoss ? text.bossLabel : `${text.chapterPrefix} ${course.id}`}
                                   </span>
                                   <span className={`text-xs font-bold leading-tight block ${isLocked ? 'blur-[1px]' : 'text-slate-800'}`}>
                                       {course.title}
                                   </span>
                                                                     {course.gradeBand && (
                                                                            <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider mt-1 block">
                                                                                {course.gradeBand === 'pre' ? 'До 8/9' : `${course.gradeBand} класс`}
                                                                            </span>
                                                                     )}
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
               
               <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-t-3xl md:rounded-3xl p-0 shadow-2xl transform transition-transform animate-float-up overflow-hidden">
                   
                   {/* Cyber Header */}
                   <div className="h-32 bg-gradient-to-br from-arcade-primary/20 to-purple-900/20 relative p-6 flex flex-col justify-end">
                       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                       <button onClick={() => setSelectedLevel(null)} className="absolute top-4 right-4 p-2 bg-white/60 rounded-full text-slate-800 hover:bg-white"><X size={18}/></button>
                       
                       <div className="flex items-center gap-3 relative z-10">
                            <div className={`size-12 rounded-xl flex items-center justify-center shadow-lg ${selectedLevel.isBoss ? 'bg-red-500' : 'bg-arcade-primary'} text-white`}>
                                {getIcon(selectedLevel.icon)}
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{text.briefing}</p>
                                <h2 className="text-xl font-display font-black text-slate-900 leading-tight">{selectedLevel.title}</h2>
                                                                {selectedLevel.section && (
                                                                    <p className="text-xs text-emerald-200 mt-1">{selectedLevel.section}</p>
                                                                )}
                            </div>
                       </div>
                   </div>

                   {/* Body */}
                   <div className="p-6 space-y-6">
                       <p className="text-slate-700 text-sm leading-relaxed border-l-2 border-arcade-action pl-4 italic">
                           "{selectedLevel.description}"
                       </p>

                       {/* Rewards Grid */}
                       <div className="grid grid-cols-2 gap-3">
                           <div className="bg-[#0F172A] p-3 rounded-xl border border-white/5 flex items-center gap-3">
                               <Award size={20} className="text-yellow-400" />
                               <div>
                                   <p className="text-[10px] text-gray-500 font-bold uppercase">Прогресс</p>
                                   <p className="font-bold text-white">{selectedLevel.progress}%</p>
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

                       {typeof selectedLevel.completedLessons === 'number' && (
                           <div className="text-xs text-gray-400 bg-[#0F172A] border border-white/5 rounded-lg px-3 py-2">
                               Уроки: <span className="text-white font-bold">{selectedLevel.completedLessons}</span> / {selectedLevel.totalLessons}
                           </div>
                       )}

                       {selectedJourneyTopic && (
                           <div className="text-xs text-slate-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                               Практика темы: <span className="text-emerald-800 font-bold">{selectedJourneyProgress.completedPractices.length}</span> / {Array.isArray(selectedJourneyTopic.practices) ? selectedJourneyTopic.practices.length : 0}
                           </div>
                       )}

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