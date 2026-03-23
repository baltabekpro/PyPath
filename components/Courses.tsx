import React, { useEffect, useRef, useState } from 'react';
import { APP_LANGUAGE, COURSES, UI_TEXTS, getIcon } from '../constants';
import { Lock, Star, Play, ChevronLeft, Award, Zap, Skull, Map as MapIcon, X, EyeOff } from 'lucide-react';
import { View, Course } from '../types';
import { apiGet } from '../api';

interface CoursesProps {
  setView: (view: View) => void;
}

const localizeCourseMeta = (course: Course, isKz: boolean) => {
    if (!isKz) {
        return {
            title: course.title,
            description: course.description,
            difficulty: course.difficulty,
        };
    }

    const translate = (value: string) => {
        const replacements: Array<[RegExp, string]> = [
            [/^Глава\s*(\d+)\s*:\s*/i, 'Тарау $1: '],
            [/Первые шаги/gi, 'Алғашқы қадамдар'],
            [/Переменные/gi, 'Айнымалылар'],
            [/и числа/gi, 'және сандар'],
            [/Условия/gi, 'Шарттар'],
            [/Циклы/gi, 'Циклдер'],
            [/Функции/gi, 'Функциялар'],
            [/Тестовый курс/gi, 'Тест курсы'],
            [/Пробуждение ИИ/gi, 'ИИ оянуы'],
            [/Общий модуль/gi, 'Жалпы модуль'],
            [/Подготовка к 8\/9/gi, '8/9 сыныпқа дайындық'],
            [/8 класс/gi, '8 сынып'],
            [/9 класс/gi, '9 сынып'],
            [/Очень лёгкий/gi, 'Өте жеңіл'],
            [/Лёгкий/gi, 'Жеңіл'],
            [/Средний/gi, 'Орта'],
            [/Босс/gi, 'Босс'],
            [/Практика/gi, 'Практика'],
            [/Теория/gi, 'Теория'],
        ];
        return replacements.reduce((acc, [pattern, replacement]) => acc.replace(pattern, replacement), value);
    };

    const fallbackTitle = translate(course.title || '');
    const fallbackDescription = translate(course.description || '');
    const fallbackDifficulty = translate(course.difficulty || '');

    const byId: Record<number, { title: string; description: string; difficulty: string }> = {
        1: {
            title: '1-тарау: Алғашқы қадамдар',
            description: 'Python деген не, командаларды қалай іске қосу және мәтінді экранға шығару.',
            difficulty: 'Өте жеңіл',
        },
        2: {
            title: '2-тарау: Айнымалылар және сандар',
            description: 'Сандарды айнымалыларда сақтап, қарапайым есептеулер жасаймыз.',
            difficulty: 'Жеңіл',
        },
        3: {
            title: '3-тарау: if шарттары',
            description: 'Шарт тексеріп, дұрыс болғанда қажетті кодты орындаймыз.',
            difficulty: 'Жеңіл',
        },
        4: {
            title: '4-тарау: for циклдері',
            description: 'Командаларды бірнеше рет қайталап, тізімдер бойынша өтеміз.',
            difficulty: 'Жеңіл',
        },
        5: {
            title: '5-тарау: Функциялар',
            description: 'Кодты ықшам әрі түсінікті ету үшін өз функцияларымызды жазамыз.',
            difficulty: 'Жеңіл',
        },
        6: {
            title: 'БОСС: Мини-жоба',
            description: 'Үйренген блоктардан мини-жоба құрастырыңыз: шығару, шарт, цикл және функция.',
            difficulty: 'Босс',
        },
    };

    return byId[course.id] || {
        title: fallbackTitle,
        description: fallbackDescription,
        difficulty: fallbackDifficulty,
    };
};

export const Courses: React.FC<CoursesProps> = ({ setView }) => {
    const isKz = APP_LANGUAGE === 'kz';
    const lt = {
        back: isKz ? 'Артқа' : 'Назад',
        mapTitle: isKz ? 'Курстар картасы' : 'Карта курсов',
        season: isKz ? 'Оқу маусымы' : 'Сезон обучения',
        noCoursesTitle: isKz ? 'Курстар әлі жүктелмеді' : 'Курсы пока не загружены',
        noCoursesDesc: isKz ? 'Экран құрылымы сақталды. /courses API интеграциясын тексеріңіз.' : 'Структура экрана сохранена. Проверьте интеграцию данных API /courses.',
        returnHome: isKz ? 'Басты бетке оралу' : 'Вернуться на главную',
        gradePre: isKz ? '8/9 дейін' : 'До 8/9',
        gradeClass: isKz ? 'сынып' : 'класс',
        progress: isKz ? 'Прогресс' : 'Прогресс',
        lessons: isKz ? 'Сабақтар' : 'Уроки',
        topicPractice: isKz ? 'Тақырып практикасы' : 'Практика темы',
    };
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
    <div className="relative h-full flex flex-col bg-slate-100 dark:bg-[#0c120e] overflow-hidden">
       
       {/* Background Decor */}
       <div className="absolute inset-0 pointer-events-none">
           <div className="absolute top-0 left-1/4 size-96 bg-arcade-primary/10 blur-[120px] rounded-full"></div>
           <div className="absolute bottom-0 right-1/4 size-96 bg-arcade-action/10 blur-[120px] rounded-full"></div>
       </div>

       {/* Map Header */}
       <header className="z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-white/10 p-4 flex items-center justify-between sticky top-0 shadow-sm">
           <button onClick={() => setView(View.DASHBOARD)} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
               <ChevronLeft size={20} />
               <span className="font-bold text-sm uppercase tracking-wider hidden sm:inline">{text.backToLobby || lt.back}</span>
           </button>
           <div className="flex flex-col items-center">
               <h1 className="text-slate-900 dark:text-white font-display font-black text-lg tracking-tight">{text.mapTitle || lt.mapTitle}</h1>
               <div className="flex items-center gap-1.5 text-[10px] font-bold text-arcade-action uppercase tracking-widest">
                   <MapIcon size={12} />
                   <span>{text.season || lt.season} {currentSeason}</span>
               </div>
            <div className="mt-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
                {isKz ? 'Жол картасы' : 'Journey'}: {completedJourneyPractices}/{totalJourneyPractices} ({journeyPercent}%)
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
                                             <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 text-center">
                                                     <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2">{lt.noCoursesTitle}</h3>
                                                     <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">{lt.noCoursesDesc}</p>
                                                     <button
                                                         onClick={() => setView(View.DASHBOARD)}
                                                         className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold"
                                                     >
                                                         {lt.returnHome}
                                                     </button>
                                             </div>
                                     </div>
                             )}

               {/* Nodes */}
               {courses.map((course, index) => {
                   const localizedMeta = localizeCourseMeta(course, isKz);
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
                                        ? 'bg-slate-200 dark:bg-slate-800 border-2 border-slate-300 dark:border-white/10 text-slate-400 opacity-70' 
                                        : isCurrent
                                            ? 'bg-gradient-to-b from-arcade-action to-red-600 border-4 border-white text-white scale-110 shadow-[0_0_30px_rgba(249,115,22,0.6)] animate-pulse-glow'
                                            : 'bg-white dark:bg-slate-900 border-4 border-arcade-success text-arcade-success'
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
                                   <div className={`absolute -top-10 bg-white dark:bg-slate-900 text-arcade-action px-2 py-0.5 rounded-lg font-black text-[10px] uppercase shadow-lg animate-bounce-sm whitespace-nowrap ${course.isBoss ? '-rotate-45' : ''}`}>
                                       {text.currentLevel}
                                   </div>
                               )}
                           </button>

                           {/* Info Label */}
                           <div className={`mt-4 text-center transition-opacity ${isLocked ? 'opacity-30' : 'opacity-100'}`}>
                               <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 inline-block shadow-sm">
                                   <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 block mb-0.5">
                                       {course.isBoss ? text.bossLabel : `${text.chapterPrefix} ${course.id}`}
                                   </span>
                                   <span className={`text-xs font-bold leading-tight block ${isLocked ? 'blur-[1px] text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
                                       {localizedMeta.title}
                                   </span>
                                                                     {course.gradeBand && (
                                                                            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 dark:text-emerald-300 font-bold uppercase tracking-wider mt-1 block">
                                                                                {course.gradeBand === 'pre' ? lt.gradePre : `${course.gradeBand} ${lt.gradeClass}`}
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
               
               <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-t-3xl md:rounded-3xl p-0 shadow-2xl transform transition-transform animate-float-up overflow-hidden">
                   
                   {/* Cyber Header */}
                   <div className="h-32 bg-gradient-to-br from-arcade-primary/20 to-purple-900/20 relative p-6 flex flex-col justify-end">
                       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                       <button onClick={() => setSelectedLevel(null)} className="absolute top-4 right-4 p-2 bg-white/70 dark:bg-slate-800 rounded-full text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700"><X size={18}/></button>
                       
                       <div className="flex items-center gap-3 relative z-10">
                            <div className={`size-12 rounded-xl flex items-center justify-center shadow-lg ${selectedLevel.isBoss ? 'bg-red-500' : 'bg-arcade-primary'} text-white`}>
                                {getIcon(selectedLevel.icon)}
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">{text.briefing}</p>
                                <h2 className="text-xl font-display font-black text-slate-900 dark:text-white leading-tight">{localizeCourseMeta(selectedLevel, isKz).title}</h2>
                                                                {selectedLevel.section && (
                                                                    <p className="text-xs text-emerald-700 dark:text-emerald-400 dark:text-emerald-200 mt-1">{selectedLevel.section}</p>
                                                                )}
                            </div>
                       </div>
                   </div>

                   {/* Body */}
                   <div className="p-6 space-y-6">
                       <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed border-l-2 border-arcade-action pl-4 italic">
                           "{localizeCourseMeta(selectedLevel, isKz).description}"
                       </p>

                       {/* Rewards Grid */}
                       <div className="grid grid-cols-2 gap-3">
                           <div className="bg-slate-100 dark:bg-[#0F172A] p-3 rounded-xl border border-slate-200 dark:border-white/10 flex items-center gap-3">
                               <Award size={20} className="text-yellow-400" />
                               <div>
                                   <p className="text-[10px] text-slate-500 dark:text-gray-400 font-bold uppercase">{lt.progress}</p>
                                   <p className="font-bold text-slate-900 dark:text-white">{selectedLevel.progress}%</p>
                               </div>
                           </div>
                           <div className="bg-slate-100 dark:bg-[#0F172A] p-3 rounded-xl border border-slate-200 dark:border-white/10 flex items-center gap-3">
                               <Zap size={20} className="text-arcade-success" />
                               <div>
                                   <p className="text-[10px] text-slate-500 dark:text-gray-400 font-bold uppercase">{text.difficulty}</p>
                                   <p className="font-bold text-slate-900 dark:text-white">{localizeCourseMeta(selectedLevel, isKz).difficulty}</p>
                               </div>
                           </div>
                       </div>

                       {typeof selectedLevel.completedLessons === 'number' && (
                           <div className="text-xs text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2">
                               {lt.lessons}: <span className="text-slate-900 dark:text-white font-bold">{selectedLevel.completedLessons}</span> / {selectedLevel.totalLessons}
                           </div>
                       )}

                       {selectedJourneyTopic && (
                           <div className="text-xs text-slate-700 dark:text-slate-300 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                               {lt.topicPractice}: <span className="text-emerald-800 font-bold">{selectedJourneyProgress.completedPractices.length}</span> / {Array.isArray(selectedJourneyTopic.practices) ? selectedJourneyTopic.practices.length : 0}
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