import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, ChevronLeft, GraduationCap, PlayCircle, X } from 'lucide-react';
import { View } from '../types';
import { APP_LANGUAGE } from '../constants';
import { apiGet } from '../api';
import { AIChat } from './AIChat';
import { QuizBlock } from './QuizBlock';
import {
  GradeTab,
  JourneyTopic,
  TopicProgress,
  useCourseJourneyData,
} from '../hooks/useCourseJourneyData';

interface CourseJourneyProps {
  setView: (view: View) => void;
}

type TheoryContent = {
  intro: string;
  bullets: string[];
  example: string;
  hint: string;
};

type LearningPage = 'theory' | 'practice';

const ACTIVE_TOPIC_KEY = 'courseJourneyActiveTopicV1';
const ACTIVE_PAGE_KEY = 'courseJourneyActivePageV1';
const AUTO_OPEN_THEORY_KEY = 'courseJourneyAutoOpenTheoryV1';
const PRACTICE_TOPIC_KEY = 'practicePrefillTopicIdV1';
const PRACTICE_INDEX_KEY = 'practicePrefillIndexV1';

const getDefaultTopics = (isKz: boolean): JourneyTopic[] => [
  {
    id: 'pre-variables',
    section: isKz ? '8/9 сыныпқа дайындық' : 'Подготовка к 8/9',
    title: isKz ? 'Айнымалылар және дерек түрлері' : 'Переменные и типы данных',
    grade: 'pre',
    theory: isKz ? 'Айнымалы мәнді сақтайды. Python тілінде int, str, float және bool жиі қолданылады.' : 'Переменная хранит значение. В Python часто используются int, str, float и bool.',
    practices: isKz ? ['2 айнымалы жаса', 'Сандарды қос', 'Жолдарды біріктір', 'int -> str түрлендір', 'type() арқылы түрін тексер', 'Шағын калькулятор жаса'] : ['Создай 2 переменные', 'Сложи числа', 'Склей строки', 'Преобразуй int -> str', 'Проверь тип через type()', 'Сделай мини-калькулятор'],
  },
  {
    id: 'g8-if',
    section: isKz ? '8 сынып: негіздер' : '8 класс: основы',
    title: isKz ? 'if / else шарттары' : 'Условия if / else',
    grade: '8',
    theory: isKz ? 'Шарт логикалық өрнекке байланысты әрекетті таңдауға мүмкіндік береді.' : 'Условие позволяет выбрать действие в зависимости от логического выражения.',
    practices: isKz ? ['Жасты тексеру', 'Жұп/тақ тексеру', 'Екі санды салыстыру', 'Ұпай бойынша баға', 'Кірістірілген if', 'Шағын жоба: рұқсат'] : ['Проверка возраста', 'Проверка четности', 'Сравнение двух чисел', 'Оценка по баллам', 'Вложенный if', 'Мини-проект: доступ'],
  },
  {
    id: 'g8-loops',
    section: isKz ? '8 сынып: циклдер' : '8 класс: циклы',
    title: isKz ? 'for және while циклдері' : 'Циклы for и while',
    grade: '8',
    theory: isKz ? 'Циклдер әрекеттерді қайталайды: for коллекция бойынша, while шарт ақиқат болғанша.' : 'Циклы повторяют действия: for по коллекции, while пока условие истинно.',
    practices: isKz ? ['range(1,10)', 'Сандар қосындысы', 'Көбейту кестесі', 'Максимумды табу', 'Санағышы бар while', 'Шығатын мәзір'] : ['range(1,10)', 'Сумма чисел', 'Таблица умножения', 'Поиск максимума', 'while со счетчиком', 'Меню с выходом'],
  },
  {
    id: 'g9-func',
    section: isKz ? '9 сынып: функциялар' : '9 класс: функции',
    title: isKz ? 'Функциялар және параметрлер' : 'Функции и параметры',
    grade: '9',
    theory: isKz ? 'Функция кодты қайта пайдалануға көмектеседі. def қолданып, нәтижені return арқылы қайтарыңыз.' : 'Функция помогает переиспользовать код. Используй def и возвращай результат через return.',
    practices: isKz ? ['Сәлемдесу функциясы', 'Екі санның қосындысы', 'Аудан функциясы', 'Жай санды тексеру', 'Әдепкі параметрлер', 'Шағын калькулятор'] : ['Функция приветствия', 'Сумма двух чисел', 'Функция площади', 'Проверка простого числа', 'Параметры по умолчанию', 'Мини-калькулятор'],
  },
  {
    id: 'g9-lists',
    section: isKz ? '9 сынып: коллекциялар' : '9 класс: коллекции',
    title: isKz ? 'Тізімдер мен сөздіктер' : 'Списки и словари',
    grade: '9',
    theory: isKz ? 'Тізім реттілікті сақтайды, ал сөздік кілт-мән жұптарын сақтайды.' : 'Список хранит последовательность, словарь хранит пары ключ-значение.',
    practices: isKz ? ['Элемент қосу', 'Элемент жою', 'Тізім тілімдері', 'Жиілікті санау', 'Профиль сөздігі', 'Бағалар журналы', 'Сөздік бойынша іздеу'] : ['Добавить элемент', 'Удалить элемент', 'Срезы списка', 'Подсчет частоты', 'Словарь профиля', 'Мини-журнал оценок', 'Поиск по словарю'],
  },
];

const getStoredPage = (): LearningPage => {
  const raw = localStorage.getItem(ACTIVE_PAGE_KEY);
  return raw === 'practice' ? 'practice' : 'theory';
};

const getTheoryContent = (topic: JourneyTopic, isKz: boolean): TheoryContent => {
  if (topic.id === 'course-1' || topic.id.includes('pre-variables')) {
    return {
      intro: isKz ? 'Python тілінде ең алдымен экранға мәтін шығару мен алғашқы командаларды түсіну керек.' : 'В Python сначала важно понять вывод текста на экран и первые команды.',
      bullets: [
        isKz ? 'print мәтін мен мәндерді экранға шығарады.' : 'print выводит текст и значения на экран.',
        isKz ? 'Жолдарды тырнақшамен жазыңыз.' : 'Строки пишутся в кавычках.',
        isKz ? 'Алғашқы қадамда қарапайым мысалдармен жұмыс істеген дұрыс.' : 'На старте лучше работать с простыми примерами.',
      ],
      example: isKz ? 'print("Сәлем, әлем!")' : 'print("Привет, мир!")',
      hint: isKz ? 'Алдымен экранға мәтін шығаруды меңгеріп алыңыз, содан кейін айнымалыларға өтіңіз.' : 'Сначала разберитесь с выводом на экран, потом переходите к переменным.',
    };
  }

  if (topic.id === 'course-2' || topic.id.includes('variables')) {
    return {
      intro: isKz ? 'Айнымалылар деректерді сақтайды, ал түрлер олардың қалай өңделетінін анықтайды.' : 'Переменные хранят данные, а типы определяют, как их обрабатывать.',
      bullets: [
        isKz ? 'Айнымалы кейін қолданылатын мәнді сақтайды.' : 'Переменная сохраняет значение для последующего использования.',
        isKz ? 'Сандар мен жолдар бірдей емес өңделеді.' : 'Числа и строки обрабатываются по-разному.',
        isKz ? 'type() мәннің түрін тексеруге көмектеседі.' : 'type() помогает проверить тип значения.',
      ],
      example: isKz ? ['name = "Алия"', 'age = 14', 'print(name, age)'].join('\n') : ['name = "Аня"', 'age = 14', 'print(name, age)'].join('\n'),
      hint: isKz ? 'Егер дерек керек болса, оны бірден айнымалыға сақтаңыз.' : 'Если данные нужны дальше, сразу сохраняйте их в переменную.',
    };
  }

  if (topic.id === 'course-3' || topic.id.includes('if')) {
    return {
      intro: isKz ? 'Шарт тексеру нәтижесіне байланысты бағдарламаға әрекеттердің бірін таңдауға мүмкіндік береді.' : 'Условие позволяет программе выбирать одно из действий в зависимости от результата проверки.',
      bullets: [
        isKz ? 'if-тен кейін True немесе False беретін шарт жазылады.' : 'После if пишется условие, которое даёт True или False.',
        isKz ? 'if-тен кейінгі блок шарт ақиқат болса ғана орындалады.' : 'Блок после if выполняется только если условие истинно.',
        isKz ? 'else шарт жалған болса балама әрекет үшін керек.' : 'else нужен для альтернативного действия, когда условие ложно.',
      ],
      example: isKz ? ['age = 14', 'if age >= 14:', '    print("Қатысуға болады")', 'else:', '    print("Әзірге ерте")'].join('\n') : ['age = 14', 'if age >= 14:', '    print("Можно участвовать")', 'else:', '    print("Пока рано")'].join('\n'),
      hint: isKz ? 'Алдымен шартты сөзбен құрастырып, содан кейін оны кодқа аударыңыз.' : 'Сначала сформулируйте условие словами, а потом переведите его в код.',
    };
  }

  if (topic.id === 'course-4' || topic.id.includes('loop')) {
    return {
      intro: isKz ? 'Циклдер бір әрекет бірнеше рет қайталанғанда қажет.' : 'Циклы нужны, когда одно и то же действие повторяется несколько раз.',
      bullets: [
        isKz ? 'for элементтер немесе диапазон алдын ала белгілі болса ыңғайлы.' : 'for удобно использовать, когда заранее известны элементы или диапазон.',
        isKz ? 'while шарт ақиқат болып тұрғанша қайталау үшін қолайлы.' : 'while подходит для повторения до тех пор, пока условие истинно.',
        isKz ? 'while бір кезде аяқталатынын бақылау маңызды.' : 'Важно следить, чтобы while когда-нибудь завершался.',
      ],
      example: ['for number in range(1, 4):', '    print(number)', '', 'count = 3', 'while count > 0:', '    print(count)', '    count -= 1'].join('\n'),
      hint: isKz ? 'Қайталану саны белгілі болса, көбіне for-дан бастау оңай.' : 'Если повторений известно количество, почти всегда проще начать с for.',
    };
  }

  if (topic.id === 'course-5' || topic.id.includes('func')) {
    return {
      intro: isKz ? 'Функция қайталанатын кодты бірнеше рет шақыруға болатын бір атаулы блокқа жинайды.' : 'Функция собирает повторяющийся код в один именованный блок, который можно вызывать много раз.',
      bullets: [
        isKz ? 'Функциялар def арқылы жасалады.' : 'Функции создаются через def.',
        isKz ? 'Параметрлер кіріс деректерін қабылдайды.' : 'Параметры принимают входные данные.',
        isKz ? 'return нәтижені сыртқа қайтарады.' : 'return возвращает результат наружу.',
      ],
      example: ['def add(a, b):', '    return a + b', '', 'result = add(2, 3)', 'print(result)'].join('\n'),
      hint: isKz ? 'Бір код екі рет қайталанса, функция туралы ойлану керек.' : 'Если один и тот же код повторяется два раза, уже стоит подумать о функции.',
    };
  }

  if (topic.id === 'course-6' || topic.id.includes('list')) {
    return {
      intro: isKz ? 'Тізімдер элементтердің реттілігін сақтайды, ал сөздіктер кілт арқылы мәнді тез табуға көмектеседі.' : 'Списки хранят последовательность элементов, а словари помогают быстро находить значение по ключу.',
      bullets: [
        isKz ? 'Тізім элементтері индекс арқылы қолжетімді.' : 'Элементы списка доступны по индексу.',
        isKz ? 'Сөздікте әр мәннің өз кілті бар.' : 'В словаре у каждого значения есть свой ключ.',
        isKz ? 'Екі құрылым да оқу деректері мен нәтижелерін сақтауда жиі қолданылады.' : 'Обе структуры часто используются для хранения учебных данных и результатов.',
      ],
      example: isKz ? ['students = ["Алия", "Бекзат"]', 'profile = {"name": "Алия", "score": 95}', 'print(students[0])', 'print(profile["score"])'].join('\n') : ['students = ["Аня", "Борис"]', 'profile = {"name": "Аня", "score": 95}', 'print(students[0])', 'print(profile["score"])'].join('\n'),
      hint: isKz ? 'Рет керек болса тізім алыңыз. Өріс атауы бойынша қолжетімділік керек болса сөздік алыңыз.' : 'Если нужен порядок, берите список. Если нужен доступ по имени поля, берите словарь.',
    };
  }

  return {
    intro: topic.theory,
    bullets: [
      isKz ? 'Алдымен негізгі ұғымды өз сөзіңізбен түсіндіріңіз.' : 'Сначала разберите основное понятие своими словами.',
      isKz ? 'Содан кейін өзіңізді қысқа мысалмен тексеріңіз.' : 'Потом проверьте себя на коротком примере.',
      isKz ? 'Осыдан кейін практикаға қадаммен өтіңіз.' : 'После этого переходите к практике по шагам.',
    ],
    example: isKz ? 'print("Тақырыпты талдау")' : 'print("Разбор темы")',
    hint: isKz ? 'Теория есептерді шешпей тұрып идеяны түсінуге көмектесуі керек.' : 'Теория должна помочь вам понять идею до решения задач.',
  };
};

export const CourseJourney: React.FC<CourseJourneyProps> = ({ setView }) => {
  const isKz = APP_LANGUAGE === 'kz';
  const text = {
    backToCourses: isKz ? 'Бастыға оралу' : 'Вернуться на главную',
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
    openTheory: isKz ? 'Теорияны ашу' : 'Открыть теорию',
    theoryOpened: isKz ? 'Теория ашық' : 'Теория открыта',
    openTheoryHint: isKz ? 'Тақырыптың толық талдауын ашып, практиканы бұғаттан шығару үшін батырманы басыңыз.' : 'Нажмите кнопку, чтобы открыть полный разбор темы и разблокировать практику.',
    unlockPracticeHint: isKz ? 'Алдымен теорияны ашыңыз, содан кейін практикалық тапсырмалар белсенді болады.' : 'Сначала откройте теорию, после этого практические задания станут активными.',
    practiceOrderHint: isKz ? 'Практика ретімен ашылады: алдымен 1-тапсырма, кейін 2 және ары қарай.' : 'Практика открывается по порядку: сначала 1 задание, затем 2 и далее.',
    oracleChat: isKz ? 'Оракул чаты' : 'Чат с Оракулом',
  };

  const fallbackTopics = useMemo(() => getDefaultTopics(isKz), [isKz]);
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
  } = useCourseJourneyData(fallbackTopics, {
    saving: text.saving,
    saved: text.saved,
    syncLater: text.syncLater,
    syncFail: text.syncFail,
  }, isKz);

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

  useEffect(() => {
    if (!selectedTopic || topicProgress.theoryOpened) return;
    if (localStorage.getItem(AUTO_OPEN_THEORY_KEY) !== 'true') return;
    localStorage.removeItem(AUTO_OPEN_THEORY_KEY);
    openTheory();
  }, [selectedTopic, topicProgress.theoryOpened]);

  useEffect(() => {
    if (!selectedTopicId) return;
    localStorage.setItem(ACTIVE_TOPIC_KEY, selectedTopicId);
  }, [selectedTopicId]);

  useEffect(() => {
    localStorage.setItem(ACTIVE_PAGE_KEY, activePage);
  }, [activePage]);

  const theoryContent = useMemo(() => {
    if (!selectedTopic) return null;
    return getTheoryContent(selectedTopic, isKz);
  }, [selectedTopic, isKz]);

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0c120e] text-slate-900 dark:text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <button
            onClick={() => setView(View.DASHBOARD)}
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap size={18} className="text-indigo-600" />
              <h2 className="font-bold">{text.fullCourse}</h2>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              {isKz ? 'Курс сыныбы профильде сақталады.' : 'Класс курса сохраняется в профиле.'}
            </p>

            <div className="space-y-2 max-h-[65vh] overflow-y-auto custom-scrollbar pr-1">
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
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{text.theoryAndPractices.replace('{count}', String(topic.practices.length))}</p>
                    <p className="text-xs mt-1 text-emerald-700 dark:text-emerald-400">{text.completed.replace('{done}', String(done)).replace('{total}', String(topic.practices.length))}</p>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6">
            {selectedTopic && (
              <>
                <p className="text-sm text-slate-500 dark:text-slate-400">{selectedTopic.section}</p>
                <h1 className="text-2xl font-bold mb-2">{selectedTopic.title}</h1>
                {(isSaving || saveNote) && <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{saveNote || text.saving}</p>}

                {activePage === 'theory' && (
                  <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50 dark:bg-indigo-950/30">
                    <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
                      <h3 className="font-semibold inline-flex items-center gap-2">
                        <BookOpen size={18} className="text-indigo-600" />
                        {text.theory}
                      </h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={openTheory}
                          disabled={topicProgress.theoryOpened}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-default"
                        >
                          {topicProgress.theoryOpened ? text.theoryOpened : text.openTheory}
                        </button>
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

                    {!topicProgress.theoryOpened && (
                      <div className="space-y-3">
                        <p className="text-sm text-slate-700 dark:text-slate-200">{selectedTopic.theory}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg p-3">
                          {text.openTheoryHint}
                        </p>
                      </div>
                    )}

                    {topicProgress.theoryOpened && theoryContent && (
                      <div className="space-y-4">
                        <p className="text-sm text-slate-700 dark:text-slate-200">{theoryContent.intro}</p>
                        <ul className="space-y-2">
                          {theoryContent.bullets.map((item) => (
                            <li key={item} className="text-sm text-slate-700 dark:text-slate-200 bg-white/70 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2">
                              {item}
                            </li>
                          ))}
                        </ul>
                        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-900 text-slate-100 p-4 overflow-x-auto">
                          <pre className="text-sm whitespace-pre-wrap font-mono">{theoryContent.example}</pre>
                        </div>
                        <p className="text-sm text-indigo-800 dark:text-indigo-200 bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800/50 rounded-lg p-3">
                          {theoryContent.hint}
                        </p>
                        {selectedTopic.theoryDetails && Array.isArray(selectedTopic.theoryDetails) && selectedTopic.theoryDetails.length > 0 && (
                          <div className="space-y-2">
                            {selectedTopic.theoryDetails.map((detail) => (
                              <div key={detail} className="text-sm text-slate-700 dark:text-slate-200 bg-white/70 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2">
                                {detail}
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between gap-3 flex-wrap pt-2">
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {allPracticesCompleted
                              ? (isKz ? 'Практика аяқталды. Енді финалдық тестке өтіңіз.' : 'Практика завершена. Можно перейти к финальному тесту.')
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
                  <div>
                    <h3 className="font-semibold mb-3">{text.practicePage} ({selectedTopic.practices.length})</h3>
                    {!topicProgress.theoryOpened && (
                      <p className="text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-3">
                        {text.unlockPracticeHint}
                      </p>
                    )}
                    {topicProgress.theoryOpened && (
                      <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#0c120e] border border-slate-200 dark:border-white/10 rounded-lg p-3 mb-3">
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

                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-3 flex-wrap">
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
              </>
            )}
          </section>
        </div>
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
            <AIChat embedded />
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
              theoryContent={[theoryContent?.intro || '', ...(theoryContent?.bullets || []), theoryContent?.example || ''].filter(Boolean).join('\n')}
              numQuestions={selectedTopic.quizBank?.length || 5}
              language={isKz ? 'kz' : 'ru'}
              presetQuestions={selectedTopic.quizBank}
              onFinished={finishQuiz}
              className="mt-8"
            />
          </div>
        </div>
      )}
    </div>
  );
};
