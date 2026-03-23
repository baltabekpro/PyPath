import React, { useEffect, useState } from 'react';
import { BookOpen, CheckCircle2, Code, ChevronRight, Trophy, Lock } from 'lucide-react';
import { View } from '../types';
import { APP_LANGUAGE } from '../constants';

interface SimpleLearningProps {
  setView: (view: View) => void;
}

type Topic = {
  id: string;
  title: string;
  description: string;
  theoryCompleted: boolean;
  practiceTotal: number;
  practiceCompleted: number;
  locked: boolean;
};

export const SimpleLearning: React.FC<SimpleLearningProps> = ({ setView }) => {
  const isKz = APP_LANGUAGE === 'kz';

  const text = {
    title: isKz ? 'Менің оқу жолым' : 'Моё обучение',
    subtitle: isKz ? 'Python негіздерін қадамдап үйрен' : 'Изучай основы Python шаг за шагом',
    theory: isKz ? 'Теория' : 'Теория',
    practice: isKz ? 'Практика' : 'Практика',
    completed: isKz ? 'Аяқталды' : 'Завершено',
    inProgress: isKz ? 'Орындалуда' : 'В процессе',
    locked: isKz ? 'Жабық' : 'Заблокировано',
    start: isKz ? 'Бастау' : 'Начать',
    continue: isKz ? 'Жалғастыру' : 'Продолжить',
    openTheory: isKz ? 'Теорияны оқу' : 'Читать теорию',
    doPractice: isKz ? 'Практика жасау' : 'Делать практику',
    overall: isKz ? 'Жалпы прогресс' : 'Общий прогресс',
    step: isKz ? 'Қадам' : 'Шаг',
  };

  const [topics, setTopics] = useState<Topic[]>([
    {
      id: '1',
      title: isKz ? 'Айнымалылар және дерек түрлері' : 'Переменные и типы данных',
      description: isKz ? 'Python-да айнымалыларды қалай жасау және қолдану керектігін үйрен' : 'Научись создавать и использовать переменные в Python',
      theoryCompleted: false,
      practiceTotal: 6,
      practiceCompleted: 0,
      locked: false,
    },
    {
      id: '2',
      title: isKz ? 'Шарттар: if / else' : 'Условия: if / else',
      description: isKz ? 'Бағдарлама шешім қабылдауға үйрет' : 'Научи программу принимать решения',
      theoryCompleted: false,
      practiceTotal: 6,
      practiceCompleted: 0,
      locked: true,
    },
    {
      id: '3',
      title: isKz ? 'Циклдер: for және while' : 'Циклы: for и while',
      description: isKz ? 'Әрекеттерді қайталау үшін циклдерді пайдалан' : 'Используй циклы для повторения действий',
      theoryCompleted: false,
      practiceTotal: 6,
      practiceCompleted: 0,
      locked: true,
    },
    {
      id: '4',
      title: isKz ? 'Функциялар' : 'Функции',
      description: isKz ? 'Кодты қайта пайдалану үшін функциялар жаса' : 'Создавай функции для повторного использования кода',
      theoryCompleted: false,
      practiceTotal: 6,
      practiceCompleted: 0,
      locked: true,
    },
    {
      id: '5',
      title: isKz ? 'Тізімдер және сөздіктер' : 'Списки и словари',
      description: isKz ? 'Деректер жинағын сақта және өңде' : 'Храни и обрабатывай наборы данных',
      theoryCompleted: false,
      practiceTotal: 7,
      practiceCompleted: 0,
      locked: true,
    },
  ]);

  const totalProgress = topics.reduce((sum, topic) => {
    const theoryWeight = 1;
    const practiceWeight = topic.practiceTotal;
    const totalWeight = theoryWeight + practiceWeight;
    const completedWeight = (topic.theoryCompleted ? theoryWeight : 0) + topic.practiceCompleted;
    return sum + (completedWeight / totalWeight) * 100;
  }, 0) / topics.length;

  const handleTopicClick = (topic: Topic) => {
    if (topic.locked) return;

    if (!topic.theoryCompleted) {
      // Переход к теории
      setView(View.COURSE_JOURNEY);
    } else {
      // Переход к практике
      setView(View.PRACTICE);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-[#0c120e] dark:to-[#0a0f0b] text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/10 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-black mb-1">{text.title}</h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm">{text.subtitle}</p>
            </div>
            <Trophy className="text-yellow-500" size={40} />
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-semibold">{text.overall}</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{Math.round(totalProgress)}%</span>
            </div>
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500 ease-out"
                style={{ width: `${totalProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Topics List */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {topics.map((topic, index) => {
            const isCompleted = topic.theoryCompleted && topic.practiceCompleted === topic.practiceTotal;
            const isInProgress = !topic.locked && !isCompleted;
            const topicProgress = topic.theoryCompleted
              ? ((1 + topic.practiceCompleted) / (1 + topic.practiceTotal)) * 100
              : 0;

            return (
              <div
                key={topic.id}
                className={`
                  relative bg-white dark:bg-slate-900 border-2 rounded-2xl p-6 transition-all
                  ${topic.locked
                    ? 'border-slate-200 dark:border-white/10 opacity-60'
                    : isCompleted
                      ? 'border-emerald-400 dark:border-emerald-600'
                      : 'border-slate-300 dark:border-white/20 hover:border-indigo-400 dark:hover:border-indigo-600 cursor-pointer hover:shadow-lg'
                  }
                `}
                onClick={() => handleTopicClick(topic)}
              >
                {/* Step Number */}
                <div className="absolute -top-3 -left-3 size-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black flex items-center justify-center text-lg shadow-lg">
                  {index + 1}
                </div>

                {/* Lock Icon */}
                {topic.locked && (
                  <div className="absolute top-4 right-4">
                    <Lock className="text-slate-400" size={24} />
                  </div>
                )}

                {/* Completed Badge */}
                {isCompleted && (
                  <div className="absolute -top-3 -right-3 size-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg">
                    <CheckCircle2 size={24} />
                  </div>
                )}

                <div className="ml-4">
                  <h3 className="text-xl font-bold mb-2">{topic.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">{topic.description}</p>

                  {/* Progress */}
                  {!topic.locked && (
                    <div className="space-y-3 mb-4">
                      {/* Theory */}
                      <div className="flex items-center gap-3">
                        <div className={`size-6 rounded-full flex items-center justify-center ${topic.theoryCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800'}`}>
                          {topic.theoryCompleted ? <CheckCircle2 size={16} /> : <BookOpen size={14} />}
                        </div>
                        <span className={`text-sm font-semibold ${topic.theoryCompleted ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
                          {text.theory}
                        </span>
                        {topic.theoryCompleted && (
                          <span className="ml-auto text-xs font-bold text-emerald-600 dark:text-emerald-400">{text.completed}</span>
                        )}
                      </div>

                      {/* Practice */}
                      <div className="flex items-center gap-3">
                        <div className={`size-6 rounded-full flex items-center justify-center ${topic.practiceCompleted > 0 ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800'}`}>
                          <Code size={14} />
                        </div>
                        <span className={`text-sm font-semibold ${topic.practiceCompleted > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
                          {text.practice}
                        </span>
                        <span className="ml-auto text-xs font-bold text-slate-600 dark:text-slate-400">
                          {topic.practiceCompleted}/{topic.practiceTotal}
                        </span>
                      </div>

                      {/* Topic Progress Bar */}
                      {topicProgress > 0 && (
                        <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                            style={{ width: `${topicProgress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Button */}
                  {!topic.locked && !isCompleted && (
                    <button
                      onClick={() => handleTopicClick(topic)}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold flex items-center justify-center gap-2 transition-all"
                    >
                      {!topic.theoryCompleted ? text.openTheory : text.doPractice}
                      <ChevronRight size={18} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Tips */}
        <div className="mt-8 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-6">
          <h3 className="font-bold text-indigo-900 dark:text-indigo-200 mb-3">💡 {isKz ? 'Қалай оқу керек?' : 'Как учиться?'}</h3>
          <ol className="space-y-2 text-sm text-indigo-800 dark:text-indigo-300">
            <li>1️⃣ {isKz ? 'Теорияны оқып, мысалдарды түсін' : 'Прочитай теорию и разберись в примерах'}</li>
            <li>2️⃣ {isKz ? 'Практикалық тапсырмаларды ретімен орында' : 'Выполни практические задания по порядку'}</li>
            <li>3️⃣ {isKz ? 'Келесі тақырыпқа өт' : 'Переходи к следующей теме'}</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
