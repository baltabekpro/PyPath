import React, { useState, useEffect } from 'react';
import { Flame, Bot, ChevronRight, Zap, Target, Play, Award, Sparkles, Clock, Swords } from 'lucide-react';
import { APP_LANGUAGE, COURSES, CURRENT_USER, DASHBOARD_UI, MISSIONS, STATS, UI_TEXTS, getIconComponent } from '../constants';
import { View } from '../types';
import { apiGet } from '../api';

interface DashboardProps {
  setView: (view: View) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
    const isKz = APP_LANGUAGE === 'kz';
    const lt = {
        hello: isKz ? 'Сәлем' : 'Привет',
        zoneTitle: isKz ? 'Сенің оқу аймағың' : 'Твоя учебная зона',
        streak: isKz ? 'Серия' : 'Серия',
        currentMission: isKz ? 'Ағымдағы миссия' : 'Текущая миссия',
        missionSoon: isKz ? 'Жаңа миссия жақында пайда болады' : 'Новая миссия скоро появится',
        practiceNow: isKz ? 'Әзірге практиканы жалғастырыңыз' : 'Пока продолжайте практику',
        progress: isKz ? 'Прогресс' : 'Прогресс',
        start: isKz ? 'Бастау' : 'Старт',
        dailyQuests: isKz ? 'Күнделікті тапсырмалар' : 'Ежедневные задания',
        fullCourseProgress: isKz ? 'Толық курс прогресі' : 'Прогресс полного курса',
        openCourse: isKz ? 'Курсты ашу' : 'Открыть курс',
        gradePre: isKz ? '8/9 дейін' : 'До 8/9',
        grade8: isKz ? '8 сынып' : '8 класс',
        grade9: isKz ? '9 сынып' : '9 класс',
        practicesWord: isKz ? 'практика' : 'практик',
        preTitle: isKz ? '8/9 сыныпқа дейін' : 'До 8/9 класса',
        preDesc: isKz ? '8/9 сынып тақырыптарына дейін түсіну керек база.' : 'База, которую нужно понять до тем 8/9 классов.',
        pythonInterestingTitle: isKz ? 'Python-ның қызықты тақырыптары' : 'Интересные темы Python',
        pythonInterestingDesc: isKz ? 'Мотивация үшін практикалық бағыттар.' : 'Практические направления для мотивации.',
        dataSitesTitle: isKz ? 'Практикаға арналған дерек сайттары' : 'Сайты с данными для практики',
        dataSitesDesc: isKz ? 'Жобалар үшін шынайы датасеттерді қолданыңыз.' : 'Используйте реальные датасеты для проектов.',
        details: isKz ? 'Толығырақ' : 'Детали',
        totalXp: isKz ? 'Жалпы XP' : 'Общий XP',
        solved: isKz ? 'Шешілген есептер' : 'Решено задач',
        codingTime: isKz ? 'Код уақыты' : 'Время кодинга',
        hoursSuffix: isKz ? 'с' : 'ч',
        blitzTitle: isKz ? 'Жылдам бастау' : 'Быстрый запуск',
        blitzSubtitle: isKz ? 'Деректер толық болмаса да практиканы бастаңыз.' : 'Начните практику даже при частично пустых данных.',
        openLearning: isKz ? 'Оқуды ашу' : 'Открыть обучение',
    };
    const [currentUser, setCurrentUser] = useState(CURRENT_USER);
    const [stats, setStats] = useState(STATS);
    const [missions, setMissions] = useState(MISSIONS);
    const [courses, setCourses] = useState(COURSES);
    const [dailyQuests, setDailyQuests] = useState<any[]>([]);
    const [journeyTopics, setJourneyTopics] = useState<any[]>([]);
    const [journeyProgress, setJourneyProgress] = useState<Record<string, { theoryOpened: boolean; completedPractices: number[] }>>({});

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const [
                    userResult,
                    statsResult,
                    missionsResult,
                    coursesResult,
                    uiDataResult,
                    topicsDataResult,
                    progressDataResult,
                ] = await Promise.allSettled([
                    apiGet<any>('/currentUser'),
                    apiGet<any>('/stats'),
                    apiGet<any[]>('/missions'),
                    apiGet<any[]>('/courses'),
                    apiGet<any>('/uiData'),
                    apiGet<any[]>('/courses/journey'),
                    apiGet<any>('/courses/journey/progress')
                ]);

                if (userResult.status === 'fulfilled') setCurrentUser(userResult.value);
                if (statsResult.status === 'fulfilled') setStats(statsResult.value);
                if (missionsResult.status === 'fulfilled') setMissions(missionsResult.value);
                if (coursesResult.status === 'fulfilled') setCourses(coursesResult.value);
                if (uiDataResult.status === 'fulfilled') setDailyQuests(uiDataResult.value?.dashboard?.dailyQuests || []);
                if (topicsDataResult.status === 'fulfilled') setJourneyTopics(Array.isArray(topicsDataResult.value) ? topicsDataResult.value : []);
                if (progressDataResult.status === 'fulfilled') {
                    setJourneyProgress(progressDataResult.value && typeof progressDataResult.value === 'object' ? progressDataResult.value : {});
                }
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
            }
        };
        loadDashboardData();
    }, []);

    const mission = missions[0];
    const activeCourse = courses.find((c: any) => !c.locked && c.progress < 100) || courses[0];
    const progressPercent = activeCourse?.progress ?? 0;
    const text = UI_TEXTS?.dashboard ?? {};
    const visibleDailyQuests = dailyQuests;
        const preTopics = isKz ? [
            'Алгоритмдік ойлау',
            'Блок-сызбалар және логика',
            'Айнымалылар және енгізу/шығару',
            'Алғашқы шарттар мен циклдер',
        ] : [
            'Алгоритмическое мышление',
            'Блок-схемы и логика',
            'Переменные и ввод/вывод',
            'Первые условия и циклы',
        ];
        const pythonInteresting = isKz ? [
            'Python ойындарда (pygame)',
            'Python деректер талдауында',
            'Боттар және автоматтандыру',
            'Графиктерді визуализациялау',
        ] : [
            'Python в играх (pygame)',
            'Python для анализа данных',
            'Боты и автоматизация',
            'Визуализация графиков',
        ];
        const datasetSites = [
            { label: 'Kaggle Datasets', url: 'https://www.kaggle.com/datasets' },
            { label: 'UCI ML Repository', url: 'https://archive.ics.uci.edu' },
            { label: 'Google Dataset Search', url: 'https://datasetsearch.research.google.com' },
        ];

    const buildJourneySummary = (grade: 'pre' | '8' | '9') => {
        const gradeTopics = journeyTopics.filter((item: any) => item?.grade === grade);
        const total = gradeTopics.reduce((sum: number, item: any) => sum + (Array.isArray(item?.practices) ? item.practices.length : 0), 0);
        const completed = gradeTopics.reduce((sum: number, item: any) => {
            const p = journeyProgress[String(item?.id)] || { completedPractices: [] };
            return sum + (Array.isArray(p.completedPractices) ? p.completedPractices.length : 0);
        }, 0);
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { total, completed, percent };
    };

    const summaryPre = buildJourneySummary('pre');
    const summary8 = buildJourneySummary('8');
    const summary9 = buildJourneySummary('9');

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in pt-6">
      
      {/* Welcome & Mentor Header */}
    <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-arcade-primary/20 to-transparent p-6 rounded-3xl border border-slate-200 dark:border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 size-64 bg-arcade-primary/20 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="flex items-center gap-6 z-10 w-full md:w-auto">
             <div 
                className="size-20 bg-arcade-mentor rounded-full flex items-center justify-center shadow-neon-green border-4 border-white/20 animate-float cursor-pointer hover:scale-110 transition-transform"
                onClick={() => setView(View.AI_CHAT)}
             >
                 <Bot size={40} className="text-white" strokeWidth={2.5}/>
             </div>
             <div>
                 <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl rounded-tl-none inline-block mb-3 border border-slate-200 dark:border-white/5">
                          <p className="text-sm md:text-base text-slate-900 dark:text-white font-medium">{text.greeting?.replace('{name}', currentUser.name) || `${lt.hello}, ${currentUser.name}`}</p>
                 </div>
                      <h1 className="text-3xl md:text-4xl font-display font-black text-slate-900 dark:text-white leading-none">{text.baseTitle || lt.zoneTitle}</h1>
             </div>
        </div>

        {/* Streak Counter (Fire) */}
        <div 
            onClick={() => setView(View.ACHIEVEMENTS)}
            className="flex items-center gap-4 bg-slate-100 dark:bg-black/40 p-3 pr-6 rounded-2xl border border-orange-500/30 shadow-neon-orange transform hover:scale-105 transition-transform cursor-pointer group"
        >
             <div className="size-12 bg-gradient-to-t from-red-600 to-yellow-400 rounded-xl flex items-center justify-center animate-pulse-glow group-hover:rotate-6 transition-transform">
                 <Flame size={28} className="text-white fill-white" />
             </div>
             <div>
                 <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{currentUser.streak}</p>
                 <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">{text.streakLabel || lt.streak}</p>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* Current Mission (Big Card) */}
            <div 
              onClick={() => setView(View.COURSE_JOURNEY)}
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
                             <span className="text-xs font-black uppercase tracking-wider">{text.currentMission || lt.currentMission}</span>
                         </div>
                         <h2 className="text-3xl font-display font-black text-white mb-2 group-hover:text-arcade-action transition-colors">{mission?.title ?? text.fallbackMissionTitle ?? lt.missionSoon}</h2>
                         <p className="text-slate-700 dark:text-gray-300 mb-6 font-medium">{mission?.chapter ?? text.fallbackMissionChapter ?? lt.practiceNow}</p>
                         
                         {/* Progress Bar styled as HP */}
                         <div className="w-full h-4 bg-black/50 rounded-full overflow-hidden border border-white/10 relative">
                             <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-arcade-action to-yellow-400 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.8)]" style={{ width: `${progressPercent}%` }}></div>
                             {/* Glare effect */}
                             <div className="absolute top-0 left-0 w-full h-[50%] bg-white/10 rounded-full"></div>
                         </div>
                         <div className="flex justify-between mt-2 text-xs font-bold text-slate-500 dark:text-gray-400 uppercase">
                             <span>{text.progress || lt.progress}</span>
                             <span className="text-white">{progressPercent}%</span>
                         </div>
                     </div>

                     <div className="hidden md:flex flex-col items-center gap-1">
                        <button onClick={() => setView(View.COURSE_JOURNEY)} className="size-16 rounded-full bg-white text-arcade-action flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-all">
                            <ChevronRight size={32} strokeWidth={3} />
                        </button>
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider bg-black/40 px-2 py-1 rounded-lg">{text.start || lt.start}</span>
                     </div>
                </div>
            </div>

            {/* Daily Quests */}
            <div>
                <h3 className="text-xl font-display font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Target className="text-arcade-danger" />
                    {text.dailyQuests || lt.dailyQuests}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {visibleDailyQuests.map((quest: any, i: number) => {
                        const QuestIcon = getIconComponent(quest.icon);
                        return (
                        <div 
                            key={`${quest.link ?? 'quest'}-${i}`} 
                            onClick={() => setView(quest.link as View)}
                            className={`bg-white dark:bg-arcade-card border-2 ${quest.done ? 'border-arcade-success/50 bg-arcade-success/10 dark:bg-arcade-success/10' : 'border-slate-200 dark:border-white/5'} p-4 rounded-2xl flex flex-col items-center text-center gap-3 hover:translate-y-[-4px] transition-transform cursor-pointer hover:border-white/20`}
                        >
                            <div className={`size-12 rounded-full flex items-center justify-center ${quest.done ? 'bg-arcade-success text-white' : 'bg-slate-100 dark:bg-white/5 ' + quest.color}`}>
                                {quest.done ? <Award size={24} /> : <QuestIcon size={24} />}
                            </div>
                            <div>
                                <h4 className={`font-bold text-sm ${quest.done ? 'text-arcade-success line-through' : 'text-slate-900 dark:text-white'}`}>{quest.title}</h4>
                                <div className="inline-block mt-1 bg-black/40 px-2 py-0.5 rounded-md border border-slate-200 dark:border-white/5">
                                    <span className="text-[10px] font-bold text-slate-600 dark:text-gray-400 uppercase">{quest.reward}</span>
                                </div>
                            </div>
                        </div>
                    )})}
                </div>
            </div>

                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5">
                            <div className="flex items-center justify-between mb-3 gap-3">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white">{lt.fullCourseProgress}</h3>
                                <button
                                    onClick={() => setView(View.COURSE_JOURNEY)}
                                    className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700"
                                >
                                    {lt.openCourse}
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0c120e]">
                                    <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">{lt.gradePre}</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{summaryPre.completed}/{summaryPre.total} {lt.practicesWord}</p>
                                    <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">{summaryPre.percent}%</p>
                                </div>
                                <div className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0c120e]">
                                    <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">{lt.grade8}</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{summary8.completed}/{summary8.total} {lt.practicesWord}</p>
                                    <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">{summary8.percent}%</p>
                                </div>
                                <div className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0c120e]">
                                    <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">{lt.grade9}</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{summary9.completed}/{summary9.total} {lt.practicesWord}</p>
                                    <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">{summary9.percent}%</p>
                                </div>
                            </div>
                        </div>

                        {/* Pre 8/9 + Python Topics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3">{lt.preTitle}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{lt.preDesc}</p>
                                <div className="space-y-2">
                                    {preTopics.map((topic) => (
                                        <div key={topic} className="text-sm px-3 py-2 bg-slate-50 dark:bg-[#0c120e] border border-slate-200 dark:border-white/10 rounded-lg text-slate-700 dark:text-slate-200">
                                            {topic}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3">{lt.pythonInterestingTitle}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{lt.pythonInterestingDesc}</p>
                                <div className="space-y-2">
                                    {pythonInteresting.map((topic) => (
                                        <div key={topic} className="text-sm px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-900 dark:text-emerald-300">
                                            {topic}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">{lt.dataSitesTitle}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{lt.dataSitesDesc}</p>
                            <div className="flex flex-wrap gap-2">
                                {datasetSites.map((site) => (
                                    <a
                                        key={site.url}
                                        href={site.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sm px-3 py-2 rounded-lg bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/40"
                                    >
                                        {site.label}
                                    </a>
                                ))}
                            </div>
                        </div>

        </div>

        {/* Sidebar / Stats */}
        <div className="space-y-6">
            
            {/* Player Stats */}
            <div className="bg-white dark:bg-arcade-card border border-slate-200 dark:border-white/5 rounded-3xl p-6 relative overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display font-black text-slate-900 dark:text-white">{text.stats}</h3>
                    <button onClick={() => setView(View.PROFILE)} className="text-xs font-bold text-arcade-primary hover:underline">{text.details || lt.details}</button>
                </div>
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-black/30 rounded-xl border border-slate-200 dark:border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-500/20 text-yellow-500 rounded-lg"><Zap size={18} /></div>
                            <span className="font-bold text-slate-700 dark:text-gray-300 text-sm">{text.statsTotalXp || lt.totalXp}</span>
                        </div>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{(stats.totalXp ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-black/30 rounded-xl border border-slate-200 dark:border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-arcade-danger/20 text-arcade-danger rounded-lg"><Target size={18} /></div>
                            <span className="font-bold text-slate-700 dark:text-gray-300 text-sm">{text.statsSolved || lt.solved}</span>
                        </div>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{stats.problemsSolved ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-black/30 rounded-xl border border-slate-200 dark:border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-arcade-mentor/20 text-arcade-mentor rounded-lg"><Clock size={18} /></div>
                            <span className="font-bold text-slate-700 dark:text-gray-300 text-sm">{text.statsTime || lt.codingTime}</span>
                        </div>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{stats.codingHours ?? 0}{text.hoursSuffix || lt.hoursSuffix}</span>
                    </div>
                </div>
            </div>

            {/* Quick Play / Mini Games */}
            <div 
                onClick={() => setView(View.COURSE_JOURNEY)}
                className="bg-gradient-to-b from-arcade-primary to-purple-800 rounded-3xl p-6 text-center text-white relative overflow-hidden shadow-neon-purple group cursor-pointer hover:scale-[1.02] transition-transform"
            >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-20"></div>
                <Sparkles className="absolute top-4 left-4 text-white/40 animate-pulse" />
                <Sparkles className="absolute bottom-4 right-4 text-white/40 animate-pulse delay-700" />
                
                <h3 className="text-2xl font-display font-black mb-2 relative z-10">{text.blitzTitle || lt.blitzTitle}</h3>
                <p className="text-purple-200 text-sm mb-6 relative z-10 font-medium">{text.blitzSubtitle || lt.blitzSubtitle}</p>
                
                <button onClick={() => setView(View.COURSE_JOURNEY)} className="w-full py-3 bg-white text-arcade-primary rounded-xl font-black uppercase tracking-wider shadow-lg hover:bg-gray-100 transition-colors relative z-10">
                    {text.blitzStart || lt.openLearning}
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};