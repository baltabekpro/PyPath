/**
 * QuizBlock – displays AI-generated multiple-choice questions after a theory
 * section so students can test their understanding.
 *
 * Usage:
 *   <QuizBlock topic="Переменные" theoryContent={theoryText} language="ru" />
 */
import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, RefreshCw, BookOpen, Loader } from 'lucide-react';
import { aiChat, QuizQuestion } from '../api';
import { APP_LANGUAGE } from '../constants';

interface QuizBlockProps {
  topic: string;
  theoryContent?: string;
  numQuestions?: number;
  language?: string;
  presetQuestions?: QuizQuestion[];
  onFinished?: (summary: { correct: number; total: number; questions: QuizQuestion[] }) => void;
  /** Optional CSS class for the wrapper element */
  className?: string;
}

type AnswerState = 'unanswered' | 'correct' | 'wrong';

interface QuestionState {
  selected: number | null;
  state: AnswerState;
}

const t = (isKz: boolean) => ({
  title: isKz ? 'Білімді тексеру' : 'Проверь знания',
  subtitle: isKz ? 'Теорияны бекіту үшін тест сұрақтары' : 'Тестовые вопросы для закрепления теории',
  generate: isKz ? 'Тест жасау' : 'Сгенерировать тест',
  loading: isKz ? 'Сұрақтар жасалуда...' : 'Генерируем вопросы...',
  retry: isKz ? 'Қайталау' : 'Повторить',
  correct: isKz ? 'Дұрыс!' : 'Правильно!',
  wrong: isKz ? 'Қате.' : 'Неверно.',
  explanation: isKz ? 'Түсіндірме:' : 'Пояснение:',
  score: (c: number, t: number) => isKz ? `Нәтиже: ${c} / ${t}` : `Результат: ${c} / ${t}`,
  allCorrect: isKz ? 'Керемет! Барлық жауап дұрыс!' : 'Отлично! Все ответы верны!',
  someWrong: isKz ? 'Жақсы әрекет! Материалды қайта қарауды ұсынамыз.' : 'Хорошая попытка! Рекомендуем повторить материал.',
  errorMsg: isKz ? 'Сұрақтар жасау кезінде қате орын алды. Қайталаңыз.' : 'Не удалось сгенерировать вопросы. Попробуйте ещё раз.',
});

export const QuizBlock: React.FC<QuizBlockProps> = ({
  topic,
  theoryContent = '',
  numQuestions = 3,
  language,
  presetQuestions,
  onFinished,
  className = '',
}) => {
  const isKz = (language ?? APP_LANGUAGE) === 'kz';
  const txt = t(isKz);
  const effectiveLang = isKz ? 'kz' : 'ru';

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<QuestionState[]>([]);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState('');
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!Array.isArray(presetQuestions) || presetQuestions.length === 0) return;
    setQuestions(presetQuestions);
    setAnswers(presetQuestions.map(() => ({ selected: null, state: 'unanswered' as AnswerState })));
    setStarted(true);
    setLoading(false);
    setError('');
    setFinished(false);
  }, [presetQuestions]);

  const fetchQuestions = async () => {
    if (Array.isArray(presetQuestions) && presetQuestions.length > 0) {
      console.log('[QuizBlock] Using preset questions:', presetQuestions.length);
      setQuestions(presetQuestions);
      setAnswers(presetQuestions.map(() => ({ selected: null, state: 'unanswered' as AnswerState })));
      setStarted(true);
      setLoading(false);
      setError('');
      setFinished(false);
      return;
    }
    setLoading(true);
    setError('');
    setStarted(true);
    setFinished(false);
    try {
      const res = await aiChat.generateQuiz(topic, theoryContent, numQuestions, effectiveLang);
      setQuestions(res.questions);
      setAnswers(res.questions.map(() => ({ selected: null, state: 'unanswered' as AnswerState })));
    } catch {
      setError(txt.errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionIdx: number, optionIdx: number) => {
    if (answers[questionIdx]?.state !== 'unanswered') return;
    const isCorrect = optionIdx === questions[questionIdx].correct_index;
    setAnswers((prev) => {
      const updated = prev.map((a, i) =>
        i === questionIdx
          ? { selected: optionIdx, state: isCorrect ? ('correct' as AnswerState) : ('wrong' as AnswerState) }
          : a,
      );
      if (updated.every((a) => a.state !== 'unanswered')) {
        console.log('[QuizBlock] All questions answered, setting finished=true');
        setFinished(true);
      }
      return updated;
    });
  };

  const correctCount = answers.filter((a) => a.state === 'correct').length;

  useEffect(() => {
    if (!finished || questions.length === 0) return;
    if (answers.some((answer) => answer.state === 'unanswered')) return;
    console.log('[QuizBlock] Calling onFinished with', { correct: correctCount, total: questions.length });
    onFinished?.({ correct: correctCount, total: questions.length, questions });
  }, [answers, correctCount, finished, onFinished, questions]);

  if (!started) {
    return (
      <div className={`mt-6 rounded-2xl border border-arcade-primary/30 bg-arcade-primary/5 p-5 ${className}`}>
        <div className="flex items-center gap-3 mb-3">
          <BookOpen size={20} className="text-arcade-primary flex-shrink-0" />
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">{txt.title}</h3>
            <p className="text-xs text-slate-500 dark:text-gray-400">{txt.subtitle}</p>
          </div>
        </div>
        <button
          onClick={fetchQuestions}
          className="mt-1 px-4 py-2 rounded-xl bg-arcade-primary text-white text-sm font-bold hover:bg-arcade-primary/90 transition-colors"
        >
          {txt.generate}
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`mt-6 rounded-2xl border border-arcade-primary/30 bg-arcade-primary/5 p-5 flex items-center gap-3 ${className}`}>
        <Loader size={18} className="text-arcade-primary animate-spin" />
        <span className="text-sm text-slate-600 dark:text-gray-300">{txt.loading}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`mt-6 rounded-2xl border border-red-300/30 bg-red-50/10 p-5 ${className}`}>
        <p className="text-sm text-red-400 mb-3">{error}</p>
        <button
          onClick={fetchQuestions}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-white/20 transition-colors"
        >
          <RefreshCw size={14} /> {txt.retry}
        </button>
      </div>
    );
  }

  return (
    <div className={`mt-6 space-y-5 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
          <BookOpen size={16} className="text-arcade-primary" />
          {txt.title}
        </h3>
        <button
          onClick={fetchQuestions}
          className="text-xs text-slate-500 dark:text-gray-400 hover:text-arcade-primary flex items-center gap-1 transition-colors"
        >
          <RefreshCw size={12} /> {txt.retry}
        </button>
      </div>

      {questions.map((q, qi) => {
        const ans = answers[qi];
        return (
          <div
            key={qi}
            className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E293B] p-4 space-y-3"
          >
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {qi + 1}. {q.question}
            </p>
            <div className="grid grid-cols-1 gap-2">
              {q.options.map((opt, oi) => {
                const isSelected = ans?.selected === oi;
                const isCorrectOption = oi === q.correct_index;
                const answered = ans?.state !== 'unanswered';
                let optClass =
                  'w-full text-left px-3 py-2 rounded-xl text-sm border transition-colors ';
                if (!answered) {
                  optClass += 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-arcade-primary hover:bg-arcade-primary/10 text-slate-800 dark:text-slate-200 cursor-pointer';
                } else if (isCorrectOption) {
                  optClass += 'border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-semibold';
                } else if (isSelected && !isCorrectOption) {
                  optClass += 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300';
                } else {
                  optClass += 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-500 dark:text-gray-400 cursor-default opacity-60';
                }
                return (
                  <button
                    key={oi}
                    className={optClass}
                    onClick={() => handleAnswer(qi, oi)}
                    disabled={answered}
                  >
                    <span className="flex items-center gap-2">
                      {answered && isCorrectOption && <CheckCircle size={14} className="text-green-500 flex-shrink-0" />}
                      {answered && isSelected && !isCorrectOption && <XCircle size={14} className="text-red-500 flex-shrink-0" />}
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>
            {ans?.state !== 'unanswered' && q.explanation && (
              <p className="text-xs text-slate-500 dark:text-gray-400 border-t border-slate-100 dark:border-white/5 pt-2">
                <span className="font-semibold">{txt.explanation}</span> {q.explanation}
              </p>
            )}
          </div>
        );
      })}

      {finished && (
        <div
          className={`rounded-2xl p-4 text-sm font-semibold text-center ${
            correctCount === questions.length
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-300/40'
              : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-300/40'
          }`}
        >
          {txt.score(correctCount, questions.length)} —{' '}
          {correctCount === questions.length ? txt.allCorrect : txt.someWrong}
        </div>
      )}
    </div>
  );
};

export default QuizBlock;
