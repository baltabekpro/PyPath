import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, ChevronLeft, GraduationCap, PlayCircle } from 'lucide-react';
import { View } from '../types';
import { apiGet, apiPut } from '../api';

interface CourseJourneyProps {
  setView: (view: View) => void;
}

type GradeTab = 'pre' | '8' | '9';

type Topic = {
  id: string;
  section: string;
  title: string;
  grade: GradeTab;
  theory: string;
  practices: string[];
};

const TOPICS: Topic[] = [
  {
    id: 'pre-variables',
    section: 'Подготовка к 8/9',
    title: 'Переменные и типы данных',
    grade: 'pre',
    theory: 'Переменная хранит значение. В Python часто используются int, str, float и bool.',
    practices: ['Создай 2 переменные', 'Сложи числа', 'Склей строки', 'Преобразуй int -> str', 'Проверь тип через type()', 'Сделай мини-калькулятор'],
  },
  {
    id: 'g8-if',
    section: '8 класс: основы',
    title: 'Условия if / else',
    grade: '8',
    theory: 'Условие позволяет выбрать действие в зависимости от логического выражения.',
    practices: ['Проверка возраста', 'Проверка четности', 'Сравнение двух чисел', 'Оценка по баллам', 'Вложенный if', 'Мини-проект: доступ'],
  },
  {
    id: 'g8-loops',
    section: '8 класс: циклы',
    title: 'Циклы for и while',
    grade: '8',
    theory: 'Циклы повторяют действия: for по коллекции, while пока условие истинно.',
    practices: ['range(1,10)', 'Сумма чисел', 'Таблица умножения', 'Поиск максимума', 'while со счетчиком', 'Меню с выходом'],
  },
  {
    id: 'g9-func',
    section: '9 класс: функции',
    title: 'Функции и параметры',
    grade: '9',
    theory: 'Функция помогает переиспользовать код. Используй def и возвращай результат через return.',
    practices: ['Функция приветствия', 'Сумма двух чисел', 'Функция площади', 'Проверка простого числа', 'Параметры по умолчанию', 'Мини-калькулятор'],
  },
  {
    id: 'g9-lists',
    section: '9 класс: коллекции',
    title: 'Списки и словари',
    grade: '9',
    theory: 'Список хранит последовательность, словарь хранит пары ключ-значение.',
    practices: ['Добавить элемент', 'Удалить элемент', 'Срезы списка', 'Подсчет частоты', 'Словарь профиля', 'Мини-журнал оценок', 'Поиск по словарю'],
  },
];

const storageKey = 'courseJourneyProgressV1';

type TopicProgress = {
  theoryOpened: boolean;
  completedPractices: number[];
};

type ProgressMap = Record<string, TopicProgress>;

const getInitialProgress = (): ProgressMap => {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return {};
    return JSON.parse(raw) as ProgressMap;
  } catch {
    return {};
  }
};

export const CourseJourney: React.FC<CourseJourneyProps> = ({ setView }) => {
  const [topicsData, setTopicsData] = useState<Topic[]>(TOPICS);
  const [grade, setGrade] = useState<GradeTab>('8');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('g8-if');
  const [progress, setProgress] = useState<ProgressMap>(getInitialProgress);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadJourney = async () => {
      try {
        const data = await apiGet<Topic[]>('/courses/journey');
        if (Array.isArray(data) && data.length > 0) {
          setTopicsData(data);
          const firstEight = data.find((item) => item.grade === '8') || data[0];
          setGrade(firstEight.grade);
          setSelectedTopicId(firstEight.id);
        }
        const progressData = await apiGet<ProgressMap>('/courses/journey/progress');
        if (progressData && typeof progressData === 'object') {
          setProgress(progressData);
        }
      } catch {
      }
    };
    loadJourney();
  }, []);

  const topics = useMemo(() => topicsData.filter((topic) => topic.grade === grade), [topicsData, grade]);
  const selectedTopic = useMemo(
    () => topics.find((topic) => topic.id === selectedTopicId) || topics[0],
    [topics, selectedTopicId],
  );

  const topicProgress = selectedTopic ? progress[selectedTopic.id] || { theoryOpened: false, completedPractices: [] } : { theoryOpened: false, completedPractices: [] };

  const saveProgress = (next: ProgressMap) => {
    setProgress(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const persistTopicProgress = async (topicId: string, topicState: TopicProgress) => {
    try {
      setIsSaving(true);
      const synced = await apiPut<ProgressMap>('/courses/journey/progress', {
        topicId,
        progress: topicState,
      });
      if (synced && typeof synced === 'object') {
        setProgress(synced);
        localStorage.setItem(storageKey, JSON.stringify(synced));
      }
    } catch {
    } finally {
      setIsSaving(false);
    }
  };

  const openTheory = () => {
    if (!selectedTopic) return;
    const next = {
      ...progress,
      [selectedTopic.id]: {
        ...topicProgress,
        theoryOpened: true,
      },
    };
    saveProgress(next);
    void persistTopicProgress(selectedTopic.id, next[selectedTopic.id]);
  };

  const togglePractice = (index: number) => {
    if (!selectedTopic || !topicProgress.theoryOpened) return;
    const has = topicProgress.completedPractices.includes(index);
    const previousDone = index === 0 || topicProgress.completedPractices.includes(index - 1);
    if (!has && !previousDone) return;

    const nextCompleted = has
      ? topicProgress.completedPractices.filter((item) => item < index)
      : [...topicProgress.completedPractices, index].sort((a, b) => a - b);

    const next = {
      ...progress,
      [selectedTopic.id]: {
        ...topicProgress,
        completedPractices: nextCompleted,
      },
    };
    saveProgress(next);
    void persistTopicProgress(selectedTopic.id, next[selectedTopic.id]);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0c120e] text-slate-900 dark:text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setView(View.COURSES)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronLeft size={18} />
            Назад к курсам
          </button>
          <button
            onClick={() => setView(View.PRACTICE)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <PlayCircle size={18} />
            Открыть редактор
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap size={18} className="text-indigo-600" />
              <h2 className="font-bold">Полный курс</h2>
            </div>

            <div className="flex gap-2 mb-4">
              {(['pre', '8', '9'] as GradeTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setGrade(tab);
                    setSelectedTopicId(topicsData.find((t) => t.grade === tab)?.id || '');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${grade === tab ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                >
                  {tab === 'pre' ? 'До 8/9' : `${tab} класс`}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {topics.map((topic) => {
                const p = progress[topic.id] || { theoryOpened: false, completedPractices: [] };
                const done = p.completedPractices.length;
                return (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopicId(topic.id)}
                    className={`w-full text-left p-3 rounded-xl border ${selectedTopic?.id === topic.id ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30' : 'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900'}`}
                  >
                    <p className="text-xs text-slate-500 dark:text-slate-400">{topic.section}</p>
                    <p className="font-semibold text-sm">{topic.title}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">Теория + {topic.practices.length} практик</p>
                    <p className="text-xs mt-1 text-emerald-700 dark:text-emerald-400">Выполнено: {done}/{topic.practices.length}</p>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6">
            {selectedTopic && (
              <>
                <p className="text-sm text-slate-500 dark:text-slate-400">{selectedTopic.section}</p>
                <h1 className="text-2xl font-bold mb-4">{selectedTopic.title}</h1>
                {isSaving && <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Сохраняем прогресс...</p>}

                <div className="mb-6 p-4 rounded-xl border border-indigo-200 bg-indigo-50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold inline-flex items-center gap-2">
                      <BookOpen size={18} className="text-indigo-600" />
                      1. Теория
                    </h3>
                    <button
                      onClick={openTheory}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700"
                    >
                      Открыть теорию
                    </button>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-200">{selectedTopic.theory}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">2. Практика ({selectedTopic.practices.length} заданий)</h3>
                  {!topicProgress.theoryOpened && (
                    <p className="text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-3">
                      Сначала откройте теорию, после этого практические задания станут активными.
                    </p>
                  )}
                  {topicProgress.theoryOpened && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#0c120e] border border-slate-200 dark:border-white/10 rounded-lg p-3 mb-3">
                      Практика открывается по порядку: сначала 1 задание, затем 2 и далее.
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
                          onClick={() => togglePractice(index)}
                          className={`w-full p-3 rounded-xl border text-left flex items-center justify-between ${!unlocked ? 'border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' : done ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                          <span className="text-sm">{index + 1}. {task}</span>
                          {done && <CheckCircle2 size={18} className="text-emerald-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
