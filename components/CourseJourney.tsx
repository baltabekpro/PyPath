import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, ChevronLeft, GraduationCap, Lock, PlayCircle, Trophy, X } from 'lucide-react';
import { View } from '../types';
import { APP_LANGUAGE } from '../constants';
import { apiGet } from '../api';
import { AIChat } from './AIChat';
import { QuizBlock } from './QuizBlock';
import {
  GradeTab,
  TopicProgress,
  useCourseJourneyData,
} from '../hooks/useCourseJourneyData';

interface CourseJourneyProps {
  setView: (view: View) => void;
}

type LearningPage = 'theory' | 'practice';

const ACTIVE_TOPIC_KEY = 'courseJourneyActiveTopicV1';
const ACTIVE_PAGE_KEY = 'courseJourneyActivePageV1';
const AUTO_OPEN_QUIZ_KEY = 'courseJourneyAutoOpenQuizV1';
const PRACTICE_TOPIC_KEY = 'practicePrefillTopicIdV1';
const PRACTICE_INDEX_KEY = 'practicePrefillIndexV1';

const getStoredPage = (): LearningPage => {
  const raw = localStorage.getItem(ACTIVE_PAGE_KEY);
  return raw === 'practice' ? 'practice' : 'theory';
};

export const CourseJourney: React.FC<CourseJourneyProps> = ({ setView }) => {
  const isKz = APP_LANGUAGE === 'kz';
  const text = {
    backToCourses: isKz ? 'Курстарға оралу' : 'К курсам',
    openPractice: isKz ? 'Практикаға өту' : 'Перейти к практике',
    fullCourse: isKz ? 'Толық курс' : 'Полный курс',
    preTab: isKz ? '8/9 дейін' : 'До 8/9',
    classLabel: isKz ? 'сынып' : 'класс',
    theoryAndPractices: isKz ? 'Теория + {count} практика' : 'Теория + {count} практик',
    completed: isKz ? 'Орындалды: {done}/{total}' : 'Выполнено: {done}/{total}',
    saving: isKz ? 'Прогресс сақталуда...' : 'Сохраняем прогресс...',
    saved: isKz ? 'Прогресс сақталды' : 'Прогресс сохранен',
    syncLater: isKz ? 'Теория ашылды, прогресс кейін синхрондалады' : 'Теория открыта, прогресс сохранится при следующей синхронизации',
    syncFail: isKz ? 'Теория жергілікті ашылды, сервер уақытша жауап бермеді' : 'Теория открыта локально, но сервер пока не ответил',
    theory: isKz ? 'Теория' : 'Теория',
    practicePage: isKz ? 'Практика' : 'Практика',
    theoryOpened: isKz ? 'Теория ашық' : 'Теория открыта',
    unlockPracticeHint: isKz ? 'Алдымен теорияны ашыңыз, содан кейін практикалық тапсырмалар белсенді болады.' : 'Сначала откройте теорию, после этого практические задания станут активными.',
    practiceOrderHint: isKz ? 'Практика ретімен ашылады: алдымен 1-тапсырма, кейін 2 және ары қарай.' : 'Практика открывается по порядку: сначала 1 задание, затем 2 и далее.',
    oracleChat: isKz ? 'Оракул чаты' : 'Чат с Оракулом',
    stage: isKz ? 'Курс кезеңі' : 'Этап курса',
    stageTheory: isKz ? 'Теорияны ашу' : 'Открыть теорию',
    stagePractice: isKz ? 'Практиканы аяқтау' : 'Завершить практику',
    stageQuiz: isKz ? 'Финалдық тест' : 'Финальный тест',
    stageDone: isKz ? 'Курс аяқталды' : 'Курс завершен',
    progressInTopic: isKz ? 'Осы курс прогресі' : 'Прогресс этого курса',
    nextStep: isKz ? 'Келесі қадам' : 'Что дальше',
    nextTopicUnlocked: isKz ? 'Келесі курс ашылды:' : 'Следующий курс открыт:',
    noNextTopic: isKz ? 'Бұл деңгейдегі соңғы курс аяқталды. Енді профиль мен жетістіктер бөлімін тексеріңіз.' : 'Это последний курс в уровне. Теперь можно проверить профиль и достижения.',
    finishQuizHint: isKz ? 'Финалдық тестті тапсырып, медаль мен келесі курстың ашылғанын алыңыз.' : 'Завершите финальный тест, чтобы получить медаль и открыть следующий курс.',
    chooseTopic: isKz ? 'Курстар тізбегі' : 'Цепочка курсов',
    unlocked: isKz ? 'Ашық' : 'Открыт',
    locked: isKz ? 'Құлыптаулы' : 'Закрыт',
    rewardEarned: isKz ? 'Медаль алынды' : 'Медаль получена',
  };

  const [grade, setGrade] = useState<GradeTab>('8');
  const [selectedTopicId, setSelectedTopicId] = useState<string>(() => localStorage.getItem(ACTIVE_TOPIC_KEY) || '');
  const [activePage, setActivePage] = useState<LearningPage>(getStoredPage);
  const [isOracleOpen, setIsOracleOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  const {
    topicsByGrade,
    progress,
    isSaving,
    saveNote,
    upsertTopicProgress,
  } = useCourseJourneyData({
    saving: text.saving,
    saved: text.saved,
    syncLater: text.syncLater,
    syncFail: text.syncFail,
  });

  const topics = topicsByGrade[grade] || [];

  useEffect(() => {
    let mounted = true;

    const loadGrade = async () => {
      try {
        const currentUser = await apiGet<any>('/currentUser');
        const storedGrade = currentUser?.settings?.currentGrade;
        if (!mounted) return;
        if (storedGrade === 'pre' || storedGrade === '8' || storedGrade === '9') {
          setGrade(storedGrade);
        }
      } catch {
      }
    };

    void loadGrade();

    return () => {
      mounted = false;
    };
  }, []);
  const selectedTopic = useMemo(
    () => topics.find((topic) => topic.id === selectedTopicId) || topics[0],
    [topics, selectedTopicId],
  );

  useEffect(() => {
    if (!selectedTopic) return;
    if (selectedTopicId !== selectedTopic.id) {
      setSelectedTopicId(selectedTopic.id);
    }
  }, [selectedTopic, selectedTopicId]);

  const topicProgress: TopicProgress = selectedTopic
    ? progress[selectedTopic.id] || { theoryOpened: false, completedPractices: [], quizCompleted: false }
    : { theoryOpened: false, completedPractices: [], quizCompleted: false };
  const allPracticesCompleted = Boolean(selectedTopic) && topicProgress.completedPractices.length >= (selectedTopic?.practices?.length || 0);

  const isTopicCompleted = (topicId: string) => {
    const topic = topics.find((item) => item.id === topicId);
    if (!topic) return false;
    const state = progress[topicId] || { theoryOpened: false, completedPractices: [], quizCompleted: false };
    const practicesDone = state.completedPractices.length >= topic.practices.length;
    const quizRequired = Boolean(topic.quizBank?.length);
    return state.theoryOpened && practicesDone && (!quizRequired || Boolean(state.quizCompleted));
  };

  const unlockedTopicIds = useMemo(() => {
    return topics
      .filter((topic, index) => index === 0 || isTopicCompleted(topics[index - 1].id))
      .map((topic) => topic.id);
  }, [topics, progress]);

  const selectedTopicIndex = selectedTopic ? topics.findIndex((topic) => topic.id === selectedTopic.id) : -1;
  const currentTopicCompleted = selectedTopic ? isTopicCompleted(selectedTopic.id) : false;
  const nextTopic = selectedTopicIndex >= 0 && selectedTopicIndex < topics.length - 1 ? topics[selectedTopicIndex + 1] : null;
  const nextTopicUnlocked = nextTopic ? unlockedTopicIds.includes(nextTopic.id) : false;
  const quizRequired = Boolean(selectedTopic?.quizBank?.length);
  const totalTopicSteps = selectedTopic ? 1 + selectedTopic.practices.length + (quizRequired ? 1 : 0) : 1;
  const completedTopicSteps = (topicProgress.theoryOpened ? 1 : 0)
    + topicProgress.completedPractices.length
    + (quizRequired && topicProgress.quizCompleted ? 1 : 0);
  const topicPercent = Math.max(0, Math.min(100, Math.round((completedTopicSteps / totalTopicSteps) * 100)));
  const currentStageText = !topicProgress.theoryOpened
    ? text.stageTheory
    : !allPracticesCompleted
      ? text.stagePractice
      : quizRequired && !topicProgress.quizCompleted
        ? text.stageQuiz
        : text.stageDone;

  useEffect(() => {
    if (!selectedTopic || topicProgress.theoryOpened) return;
    openTheory();
  }, [selectedTopic, topicProgress.theoryOpened]);

  useEffect(() => {
    if (!selectedTopic || !topicProgress.theoryOpened || !allPracticesCompleted || !selectedTopic.quizBank?.length) return;
    if (localStorage.getItem(AUTO_OPEN_QUIZ_KEY) !== 'true') return;
    localStorage.removeItem(AUTO_OPEN_QUIZ_KEY);
    setIsQuizOpen(true);
    setActivePage('theory');
  }, [allPracticesCompleted, selectedTopic, topicProgress.theoryOpened]);

  useEffect(() => {
    if (!selectedTopicId) return;
    localStorage.setItem(ACTIVE_TOPIC_KEY, selectedTopicId);
  }, [selectedTopicId]);

  useEffect(() => {
    if (!topics.length) return;
    if (selectedTopicId && unlockedTopicIds.includes(selectedTopicId)) return;

    const fallback = unlockedTopicIds[unlockedTopicIds.length - 1] || topics[0].id;
    if (fallback) {
      setSelectedTopicId(fallback);
    }
  }, [selectedTopicId, topics, unlockedTopicIds]);

  useEffect(() => {
    localStorage.setItem(ACTIVE_PAGE_KEY, activePage);
  }, [activePage]);

  const quizQuestions = useMemo(() => {
    if (!selectedTopic?.quizBank?.length) return undefined;
    return selectedTopic.quizBank.map((question) => ({
      ...question,
      explanation: question.explanation || '',
    }));
  }, [selectedTopic]);

  const openTheory = () => {
    if (!selectedTopic) return;
    upsertTopicProgress(selectedTopic.id, (current) => ({
      ...current,
      theoryOpened: true,
    }));
  };

  const openPracticeInEditor = (practiceIndex: number) => {
    if (!selectedTopic || !topicProgress.theoryOpened) return;

    const isUnlocked = practiceIndex === 0
      || topicProgress.completedPractices.includes(practiceIndex - 1)
      || topicProgress.completedPractices.includes(practiceIndex);

    if (!isUnlocked) return;

    localStorage.setItem(PRACTICE_TOPIC_KEY, selectedTopic.id);
    localStorage.setItem(PRACTICE_INDEX_KEY, String(practiceIndex));
    setView(View.SIMPLE_LEARNING);
  };

  const openQuiz = () => {
    if (!selectedTopic || !topicProgress.theoryOpened || !allPracticesCompleted) return;
    setIsQuizOpen(true);
  };

  const finishQuiz = (summary: { correct: number; total: number; questions: Array<{ question: string }>; }) => {
    if (!selectedTopic) return;
    upsertTopicProgress(selectedTopic.id, (current) => ({
      ...current,
      quizCompleted: true,
      quizScore: summary.correct,
      quizTotal: summary.total,
    }));
    setIsQuizOpen(false);
  };

  const oracleContext = useMemo(() => {
    if (!selectedTopic) return undefined;

    const completedPractices = topicProgress.completedPractices.length;
    const totalPractices = selectedTopic.practices.length;
    const stage = activePage === 'practice'
      ? 'Практика'
      : 'Теория';

    return {
      screen: 'course-journey',
      page: stage,
      courseId: Number(selectedTopic.id.replace(/[^0-9]/g, '')) || undefined,
      courseTitle: selectedTopic.title,
      courseSection: selectedTopic.section,
      gradeBand: selectedTopic.grade,
      courseStatus: !topicProgress.theoryOpened
        ? (isKz ? 'Теория ашылмаған' : 'Теория не открыта')
        : completedPractices >= totalPractices
          ? (selectedTopic.quizBank?.length ? (isKz ? 'Тестке дайын' : 'Готов к тесту') : (isKz ? 'Курс аяқталды' : 'Курс завершён'))
          : (isKz ? 'Практика жалғасып жатыр' : 'Практика продолжается'),
      theoryOpened: topicProgress.theoryOpened,
      completedPractices,
      totalPractices,
      quizCompleted: Boolean(topicProgress.quizCompleted),
      practiceIndex: activePage === 'practice' ? topicProgress.completedPractices.length : undefined,
      practiceName: activePage === 'practice' && selectedTopic.practices[topicProgress.completedPractices.length]
        ? selectedTopic.practices[topicProgress.completedPractices.length]
        : undefined,
    };
  }, [activePage, isKz, selectedTopic, topicProgress.completedPractices.length, topicProgress.theoryOpened, topicProgress.quizCompleted]);

  if (!selectedTopic) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0c120e] text-slate-900 dark:text-slate-100 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6">
            <h1 className="text-2xl font-black mb-2">{text.fullCourse}</h1>
            <p className="text-slate-600 dark:text-slate-300">{isKz ? 'Серверден курс тақырыптары жүктелмеді.' : 'Темы курса не загрузились с сервера.'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0c120e] text-slate-900 dark:text-slate-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <button
            onClick={() => setView(View.COURSES)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronLeft size={18} />
            {text.backToCourses}
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center p-1 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900">
              <button
                onClick={() => setActivePage('theory')}
                className={`px-3 py-1.5 rounded-md text-sm font-semibold ${activePage === 'theory' ? 'bg-indigo-600 text-white' : 'text-slate-700 dark:text-slate-300'}`}
              >
                {text.theory}
              </button>
              <button
                onClick={() => setActivePage('practice')}
                className={`px-3 py-1.5 rounded-md text-sm font-semibold ${activePage === 'practice' ? 'bg-emerald-600 text-white' : 'text-slate-700 dark:text-slate-300'}`}
              >
                {text.practicePage}
              </button>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <GraduationCap size={16} className="text-indigo-600" />
              {grade === 'pre' ? text.preTab : `${grade} ${text.classLabel}`}
            </div>
          </div>
        </div>

        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5 md:p-6 space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/40 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">{text.chooseTopic}</h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">{selectedTopicIndex + 1}/{topics.length}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {topics.map((topic, index) => {
                const unlocked = index === 0 || isTopicCompleted(topics[index - 1].id);
                const completed = isTopicCompleted(topic.id);
                const active = selectedTopic?.id === topic.id;

                return (
                  <button
                    key={topic.id}
                    onClick={() => unlocked && setSelectedTopicId(topic.id)}
                    disabled={!unlocked}
                    className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${active
                      ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                      : completed
                        ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/70 dark:bg-emerald-900/10'
                        : unlocked
                          ? 'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'
                          : 'border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-900/40 opacity-70 cursor-not-allowed'}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{topic.title}</span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 inline-flex items-center gap-1">
                        {!unlocked ? <Lock size={11} /> : completed ? <Trophy size={11} className="text-emerald-600" /> : null}
                        {!unlocked ? text.locked : completed ? text.completed : text.unlocked}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{topic.section}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{selectedTopic.section}</p>
            <h1 className="text-2xl md:text-3xl font-black mb-2">{selectedTopic.title}</h1>
            {(isSaving || saveNote) && <p className="text-xs text-slate-500 dark:text-slate-400">{saveNote || text.saving}</p>}
            <div className="mt-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/40 p-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{text.stage}</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{currentStageText}</p>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500" style={{ width: `${topicPercent}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{text.progressInTopic}: {topicPercent}%</p>
            </div>
            {currentTopicCompleted && (
              <div className="mt-4 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 p-4">
                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">{text.rewardEarned}</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                  {nextTopic
                    ? (nextTopicUnlocked ? `${text.nextTopicUnlocked} ${nextTopic.title}` : text.finishQuizHint)
                    : text.noNextTopic}
                </p>
              </div>
            )}
          </div>

          {activePage === 'theory' && (
            <div className="rounded-xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50 dark:bg-indigo-950/30 p-4 md:p-5 space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h3 className="font-semibold inline-flex items-center gap-2">
                  <BookOpen size={18} className="text-indigo-600" />
                  {text.theory}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1.5 rounded-lg bg-indigo-600/10 text-indigo-700 dark:text-indigo-200 text-sm font-semibold border border-indigo-200 dark:border-indigo-800/60">
                    {topicProgress.theoryOpened ? text.theoryOpened : (isKz ? 'Теория ашылуда...' : 'Теория открывается...')}
                  </span>
                  <button
                    onClick={() => {
                      const nextIndex = topicProgress.completedPractices.length;
                      openPracticeInEditor(Math.min(nextIndex, Math.max(0, selectedTopic.practices.length - 1)));
                    }}
                    disabled={!topicProgress.theoryOpened}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <span className="inline-flex items-center gap-1">
                      <PlayCircle size={16} />
                      {text.openPractice}
                    </span>
                  </button>
                </div>
              </div>

              {topicProgress.theoryOpened && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{selectedTopic.theory}</p>
                  <div className="space-y-3">
                    {(selectedTopic.theoryDetails && selectedTopic.theoryDetails.length > 0 ? selectedTopic.theoryDetails : [selectedTopic.theory]).map((paragraph, index) => (
                      <p key={`${selectedTopic.id}-detail-${index}`} className="text-sm text-slate-700 dark:text-slate-200 bg-white/70 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-3 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  {selectedTopic.theoryExample ? (
                    <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-900 text-slate-100 p-4 overflow-x-auto">
                      <pre className="text-sm whitespace-pre-wrap font-mono">{selectedTopic.theoryExample}</pre>
                    </div>
                  ) : null}
                  {selectedTopic.theoryHint ? (
                    <p className="text-sm text-indigo-800 dark:text-indigo-200 bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800/50 rounded-lg p-3">
                      {selectedTopic.theoryHint}
                    </p>
                  ) : null}
                  <div className="flex items-center justify-between gap-3 flex-wrap pt-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {allPracticesCompleted
                        ? (isKz ? 'Практика аяқталды. Енді финалдық тест ашылады.' : 'Практика завершена. Финальный тест готов к открытию.')
                        : (isKz ? 'Тест барлық практикалық қадамдардан кейін ашылады.' : 'Тест откроется после завершения всех практических шагов.')}
                    </p>
                    <button
                      onClick={openQuiz}
                      disabled={!topicProgress.theoryOpened || !allPracticesCompleted}
                      className="px-4 py-2 rounded-xl bg-arcade-primary text-white text-sm font-bold hover:bg-arcade-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isKz ? 'Финалдық тест' : 'Финальный тест'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activePage === 'practice' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h3 className="font-semibold">{text.practicePage} ({selectedTopic.practices.length})</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isKz ? 'Әр тапсырма бөлек ашылады, ал теория бөлек бетте қалады.' : 'Каждое задание открывается отдельно, а теория остается на отдельной странице.'}
                </p>
              </div>
              {!topicProgress.theoryOpened && (
                <p className="text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  {text.unlockPracticeHint}
                </p>
              )}
              {topicProgress.theoryOpened && (
                <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#0c120e] border border-slate-200 dark:border-white/10 rounded-lg p-3">
                  {text.practiceOrderHint}
                </p>
              )}
              <div className="space-y-2">
                {selectedTopic.practices.map((task, index) => {
                  const done = topicProgress.completedPractices.includes(index);
                  const unlocked = topicProgress.theoryOpened && (index === 0 || topicProgress.completedPractices.includes(index - 1) || done);
                  return (
                    <button
                      key={`${selectedTopic.id}-${index}`}
                      disabled={!unlocked}
                      onClick={() => openPracticeInEditor(index)}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between ${!unlocked ? 'border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' : done ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                      <span className="text-sm">{task}</span>
                      {done && <CheckCircle2 size={18} className="text-emerald-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 flex-wrap pt-2 border-t border-slate-200 dark:border-white/10">
            <div>
              <h3 className="font-semibold mb-1">{text.oracleChat}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isKz ? 'Сұрақ қойсаңыз, Оракул бөлек терезеде ашылады.' : 'Если нужен совет, Оракул откроется в отдельном окне.'}
              </p>
            </div>
            <button
              onClick={() => setIsOracleOpen(true)}
              className="px-4 py-2 rounded-lg bg-cyan-600 text-white text-sm font-semibold hover:bg-cyan-700"
            >
              {isKz ? 'Оракулды ашу' : 'Открыть Оракул'}
            </button>
          </div>
        </section>
      </div>

      {isOracleOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl h-[82vh] rounded-3xl overflow-hidden border border-slate-200 dark:border-cyan-500/30 bg-white dark:bg-slate-900 shadow-2xl">
            <button
              onClick={() => setIsOracleOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              aria-label={isKz ? 'Оракулды жабу' : 'Закрыть Оракул'}
            >
              <X size={18} />
            </button>
            <AIChat embedded context={oracleContext} />
          </div>
        </div>
      )}

      {isQuizOpen && selectedTopic && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl max-h-[88vh] overflow-y-auto rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl p-5 md:p-6">
            <button
              onClick={() => setIsQuizOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/20"
              aria-label={isKz ? 'Тестті жабу' : 'Закрыть тест'}
            >
              <X size={18} />
            </button>
            <QuizBlock
              topic={selectedTopic.title}
              theoryContent={[
                selectedTopic.theory || '',
                ...(Array.isArray(selectedTopic.theoryDetails) ? selectedTopic.theoryDetails : []),
                selectedTopic.theoryExample || '',
              ].filter(Boolean).join('\n')}
              numQuestions={selectedTopic.quizBank?.length || 5}
              language={isKz ? 'kz' : 'ru'}
              presetQuestions={quizQuestions}
              onFinished={finishQuiz}
              className="mt-8"
            />
          </div>
        </div>
      )}
    </div>
  );
};
