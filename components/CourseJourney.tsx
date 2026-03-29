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
  paragraphs: string[];
  example: string;
  hint: string;
};

type LearningPage = 'theory' | 'practice';

const ACTIVE_TOPIC_KEY = 'courseJourneyActiveTopicV1';
const ACTIVE_PAGE_KEY = 'courseJourneyActivePageV1';
const AUTO_OPEN_THEORY_KEY = 'courseJourneyAutoOpenTheoryV1';
const AUTO_OPEN_QUIZ_KEY = 'courseJourneyAutoOpenQuizV1';
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
      paragraphs: [
        isKz ? 'Бастапқыда print() функциясы арқылы не шығатынын түсіну маңызды. Бұл Python-дағы ең алғашқы кері байланыс береді.' : 'На старте важно понять, как работает print(). Именно он дает первый видимый результат в Python.',
        isKz ? 'Жолдар тырнақшаға алынады, ал сандар мен мәтін әртүрлі ережемен өңделеді. Сондықтан алғашқы мысалдар өте қарапайым болуы керек.' : 'Строки берутся в кавычки, а числа и текст обрабатываются по разным правилам. Поэтому первые примеры должны быть максимально простыми.',
        isKz ? 'Ең дұрысы, алдымен бір-екі жолдық шағын мысалмен қолды үйретіп, содан кейін ғана айнымалыларға көшу.' : 'Лучше сначала закрепить навык на коротком примере из одной-двух строк, а уже потом переходить к переменным.',
      ],
      example: isKz ? 'print("Сәлем, әлем!")' : 'print("Привет, мир!")',
      hint: isKz ? 'Алдымен экранға мәтін шығаруды меңгеріп алыңыз, содан кейін айнымалыларға өтіңіз.' : 'Сначала разберитесь с выводом на экран, потом переходите к переменным.',
    };
  }

  if (topic.id === 'course-2' || topic.id.includes('variables')) {
    return {
      intro: isKz ? 'Айнымалылар деректерді сақтайды, ал түрлер олардың қалай өңделетінін анықтайды.' : 'Переменные хранят данные, а типы определяют, как их обрабатывать.',
      paragraphs: [
        isKz ? 'Айнымалыға сақталған мәнді кейін қайта қолдануға болады. Бұл кодты қысқартып, оқуға жеңіл етеді.' : 'Переменная позволяет сохранить значение и использовать его позже. Это делает код короче и понятнее.',
        isKz ? 'Сандар, мәтін және логикалық мәндер әртүрлі өңделеді. Сондықтан дерек түрін түсіну кейінгі есептердің бәріне әсер етеді.' : 'Числа, текст и логические значения обрабатываются по-разному, поэтому понимание типа данных влияет на все дальнейшие задачи.',
        isKz ? 'type() арқылы мәннің қандай тип екенін тексеру арқылы қателерді ертерек байқауға болады.' : 'Проверка type() помогает быстрее заметить ошибки и понять, что именно хранится в переменной.',
      ],
      example: isKz ? ['name = "Алия"', 'age = 14', 'print(name, age)'].join('\n') : ['name = "Аня"', 'age = 14', 'print(name, age)'].join('\n'),
      hint: isKz ? 'Егер дерек керек болса, оны бірден айнымалыға сақтаңыз.' : 'Если данные нужны дальше, сразу сохраняйте их в переменную.',
    };
  }

  if (topic.id === 'course-3' || topic.id.includes('if')) {
    return {
      intro: isKz ? 'Шарт тексеру нәтижесіне байланысты бағдарламаға әрекеттердің бірін таңдауға мүмкіндік береді.' : 'Условие позволяет программе выбирать одно из действий в зависимости от результата проверки.',
      paragraphs: [
        isKz ? 'if арқылы бағдарламаға бір ғана жағдайға емес, екі түрлі сценарийге де дайын болуды үйретеміз. Шарт ақиқат болса бір тармақ, жалған болса басқа тармақ іске қосылады.' : 'С помощью if программа учится выбирать между двумя сценариями: если условие истинно, выполняется один путь, если ложно — другой.',
        isKz ? 'Осы тақырыпта басты ой — шарт тексеру бағдарламаның шешім қабылдауына әсер етеді. Сондықтан салыстыру операторларын сенімді қолдану маңызды.' : 'Главная идея здесь в том, что проверка условия влияет на решение программы. Поэтому важно уверенно использовать операторы сравнения.',
        isKz ? 'else бөлігі кодты толықтырады: егер алғашқы шарт орындалмаса, бағдарлама не істеу керегін анықтап береді.' : 'Блок else завершает логику: он говорит программе, что делать, когда первое условие не выполнено.',
      ],
      example: isKz ? ['age = 14', 'if age >= 14:', '    print("Қатысуға болады")', 'else:', '    print("Әзірге ерте")'].join('\n') : ['age = 14', 'if age >= 14:', '    print("Можно участвовать")', 'else:', '    print("Пока рано")'].join('\n'),
      hint: isKz ? 'Алдымен шартты сөзбен құрастырып, содан кейін оны кодқа аударыңыз.' : 'Сначала сформулируйте условие словами, а потом переведите его в код.',
    };
  }

  if (topic.id === 'course-4' || topic.id.includes('loop')) {
    return {
      intro: isKz ? 'Циклдер бір әрекет бірнеше рет қайталанғанда қажет.' : 'Циклы нужны, когда одно и то же действие повторяется несколько раз.',
      paragraphs: [
        isKz ? 'for көбіне қайталану саны немесе элементтер тізімі белгілі болғанда қолданылады. Бұл цикл оқу үшін де, код жазу үшін де ыңғайлы.' : 'for удобно использовать, когда заранее известен диапазон или список элементов. Такой цикл хорошо читается и легко записывается.',
        isKz ? 'while шарт орындалып тұрғанша жұмыс істейді. Сондықтан оның қашан тоқтайтынын алдын ала ойлау керек.' : 'while работает, пока условие остается истинным. Поэтому заранее важно понимать, когда цикл должен остановиться.',
        isKz ? 'Циклдер қайталанатын логиканы қысқартады, бірақ оларды дұрыс тоқтату өте маңызды. Әйтпесе бағдарлама шексіз айналып кетуі мүмкін.' : 'Циклы уменьшают повторяющийся код, но их важно правильно завершать. Иначе программа может уйти в бесконечный цикл.',
      ],
      example: ['for number in range(1, 4):', '    print(number)', '', 'count = 3', 'while count > 0:', '    print(count)', '    count -= 1'].join('\n'),
      hint: isKz ? 'Қайталану саны белгілі болса, көбіне for-дан бастау оңай.' : 'Если повторений известно количество, почти всегда проще начать с for.',
    };
  }

  if (topic.id === 'course-5' || topic.id.includes('func')) {
    return {
      intro: isKz ? 'Функция қайталанатын кодты бірнеше рет шақыруға болатын бір атаулы блокқа жинайды.' : 'Функция собирает повторяющийся код в один именованный блок, который можно вызывать много раз.',
      paragraphs: [
        isKz ? 'Функция кодтың бір бөлігін атауы бар жеке блокқа бөледі. Бұл бір әрекетті бірнеше жерде қайта қолдануға мүмкіндік береді.' : 'Функция выделяет кусок кода в отдельный именованный блок. Это позволяет переиспользовать одно и то же действие в нескольких местах.',
        isKz ? 'Параметрлер функцияға сырттан дерек береді, ал return нәтижені қайтарады. Осы екі нәрсе функцияны пайдалы етеді.' : 'Параметры передают данные внутрь функции, а return возвращает результат наружу. Именно эти две вещи делают функцию полезной.',
        isKz ? 'Егер бір логика бірнеше рет қайталанса, оны функцияға айналдыру кодты таза әрі сенімді етеді.' : 'Если одна и та же логика повторяется несколько раз, её стоит вынести в функцию, чтобы код стал чище и надежнее.',
      ],
      example: ['def add(a, b):', '    return a + b', '', 'result = add(2, 3)', 'print(result)'].join('\n'),
      hint: isKz ? 'Бір код екі рет қайталанса, функция туралы ойлану керек.' : 'Если один и тот же код повторяется два раза, уже стоит подумать о функции.',
    };
  }

  if (topic.id === 'course-6' || topic.id.includes('list')) {
    return {
      intro: isKz ? 'Тізімдер элементтердің реттілігін сақтайды, ал сөздіктер кілт арқылы мәнді тез табуға көмектеседі.' : 'Списки хранят последовательность элементов, а словари помогают быстро находить значение по ключу.',
      paragraphs: [
        isKz ? 'Тізім реті маңызды болғанда қолданылады: элементтер индекс арқылы алынады, өзгертіледі немесе жойылады.' : 'Список используют, когда важен порядок: элементы можно брать по индексу, менять и удалять.',
        isKz ? 'Сөздікке келгенде негізгі ой — кілт пен мән. Кілт арқылы керек ақпаратты тез табуға болады.' : 'В словаре главный принцип — пара ключ-значение. По ключу можно быстро получить нужную информацию.',
        isKz ? 'Бұл екі құрылым деректерді жинақтап сақтауға көмектеседі, сондықтан оларды бір-бірінен ажырата білу өте маңызды.' : 'Обе структуры помогают хранить данные, поэтому важно понимать, чем они отличаются и где каждая полезна.',
      ],
      example: isKz ? ['students = ["Алия", "Бекзат"]', 'profile = {"name": "Алия", "score": 95}', 'print(students[0])', 'print(profile["score"])'].join('\n') : ['students = ["Аня", "Борис"]', 'profile = {"name": "Аня", "score": 95}', 'print(students[0])', 'print(profile["score"])'].join('\n'),
      hint: isKz ? 'Рет керек болса тізім алыңыз. Өріс атауы бойынша қолжетімділік керек болса сөздік алыңыз.' : 'Если нужен порядок, берите список. Если нужен доступ по имени поля, берите словарь.',
    };
  }

  return {
    intro: topic.theory,
    paragraphs: [
      isKz ? 'Алдымен тақырыптың негізгі идеясын өз сөзіңізбен түсіндіріп көріңіз. Содан кейін сол ойды кодпен қалай көрсетуге болатынын ойлаңыз.' : 'Сначала попробуйте объяснить основную идею своими словами. Потом подумайте, как показать её кодом.',
      isKz ? 'Қысқа мысал арқылы түсінуді тексеру жақсы жұмыс істейді: мысалды оқып қана қоймай, неге дәл солай жазылғанын түсініңіз.' : 'Короткий пример помогает проверить понимание: не просто прочитайте его, а разберите, почему он написан именно так.',
      isKz ? 'Осыдан кейін практикаға өтіңіз: теориядағы ойды шағын тапсырмада қолданып көру білімді бекітеді.' : 'После этого переходите к практике: применение идеи в небольшой задаче закрепляет материал.',
    ],
    example: isKz ? 'print("Тақырыпты талдау")' : 'print("Разбор темы")',
    hint: isKz ? 'Теория есептерді шешпей тұрып идеяны түсінуге көмектесуі керек.' : 'Теория должна помочь вам понять идею до решения задач.',
  };
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
    localStorage.setItem(ACTIVE_PAGE_KEY, activePage);
  }, [activePage]);

  const theoryContent = useMemo(() => {
    if (!selectedTopic) return null;
    return getTheoryContent(selectedTopic, isKz);
  }, [selectedTopic, isKz]);

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
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{selectedTopic.section}</p>
            <h1 className="text-2xl md:text-3xl font-black mb-2">{selectedTopic.title}</h1>
            {(isSaving || saveNote) && <p className="text-xs text-slate-500 dark:text-slate-400">{saveNote || text.saving}</p>}
          </div>

          {activePage === 'theory' && theoryContent && (
            <div className="rounded-xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50 dark:bg-indigo-950/30 p-4 md:p-5 space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h3 className="font-semibold inline-flex items-center gap-2">
                  <BookOpen size={18} className="text-indigo-600" />
                  {text.theory}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
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

              {topicProgress.theoryOpened && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{theoryContent.intro}</p>
                  <div className="space-y-3">
                    {theoryContent.paragraphs.map((paragraph) => (
                      <p key={paragraph} className="text-sm text-slate-700 dark:text-slate-200 bg-white/70 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-3 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-900 text-slate-100 p-4 overflow-x-auto">
                    <pre className="text-sm whitespace-pre-wrap font-mono">{theoryContent.example}</pre>
                  </div>
                  <p className="text-sm text-indigo-800 dark:text-indigo-200 bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800/50 rounded-lg p-3">
                    {theoryContent.hint}
                  </p>
                  {selectedTopic.theoryDetails && Array.isArray(selectedTopic.theoryDetails) && selectedTopic.theoryDetails.length > 0 && (
                    <div className="space-y-2">
                      {selectedTopic.theoryDetails.map((detail) => (
                        <div key={detail} className="text-sm text-slate-700 dark:text-slate-200 bg-white/70 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-3 leading-relaxed">
                          {detail}
                        </div>
                      ))}
                    </div>
                  )}
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
              theoryContent={[theoryContent?.intro || '', ...(theoryContent?.paragraphs || []), theoryContent?.example || ''].filter(Boolean).join('\n')}
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
