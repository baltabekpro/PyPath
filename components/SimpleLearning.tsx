import React, { useEffect, useState } from 'react';
import { BookOpen, CheckCircle2, Code, ChevronRight, Trophy, Lock, Play, X, AlertCircle, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { View } from '../types';
import { APP_LANGUAGE } from '../constants';
import { apiGet, apiPut } from '../api';
import { AIChat } from './AIChat';

interface SimpleLearningProps {
  setView: (view: View) => void;
}

// API Types (from CourseJourney)
type Topic = {
  id: string;
  section: string;
  title: string;
  grade: 'pre' | '8' | '9';
  theory: string;
  practices: string[];
};

type TopicProgress = {
  theoryOpened: boolean;
  completedPractices: number[];
};

type ProgressMap = Record<string, TopicProgress>;

// Extended types for practice details
type PracticeDetails = {
  description: string;
  starterCode: string;
  hints: string[];
  tests: {
    description: string;
    checkFunction: (code: string) => boolean;
  }[];
};

// Practice details mapping (topicId -> practiceIndex -> details)
const getPracticeDetails = (topicId: string, practiceIndex: number, practiceName: string): PracticeDetails => {
  const isKz = APP_LANGUAGE === 'kz';

  // Variables topic
  if (topicId.includes('variable') || topicId === 'pre-variables') {
    const practices: PracticeDetails[] = [
      {
        description: isKz ? 'name және age айнымалыларын жаса. name - жолдық түр, age - сан түрі.' : 'Создай переменные name и age. name должна быть строкой, age - числом.',
        starterCode: '# Кодты мұнда жаз\n',
        hints: [
          isKz ? 'Жолдар қос немесе жалғыз тырнақшада: "жол"' : 'Строки в кавычках: "строка"',
          isKz ? 'Сандарға тырнақша керек емес: age = 14' : 'Числа без кавычек: age = 14',
        ],
        tests: [
          {
            description: isKz ? 'name айнымалысы бар' : 'Переменная name существует',
            checkFunction: (code) => /name\s*=\s*["'][^"']+["']/.test(code),
          },
          {
            description: isKz ? 'age айнымалысы бар' : 'Переменная age существует',
            checkFunction: (code) => /age\s*=\s*\d+/.test(code),
          },
        ],
      },
      {
        description: isKz ? 'a=5, b=3 жасап, олардың қосындысын result-қа сақта' : 'Создай a=5, b=3 и сохрани их сумму в result',
        starterCode: 'a = 5\nb = 3\n# result = ...\n',
        hints: [
          isKz ? 'Қосу үшін + операторын қолдан' : 'Для сложения используй +',
          isKz ? 'result = a + b' : 'result = a + b',
        ],
        tests: [
          {
            description: isKz ? 'result айнымалысы анықталған' : 'Переменная result определена',
            checkFunction: (code) => /result\s*=/.test(code),
          },
          {
            description: isKz ? 'a + b қосындысын қолданады' : 'Использует сложение a + b',
            checkFunction: (code) => /result\s*=\s*a\s*\+\s*b/.test(code) || /result\s*=\s*8/.test(code),
          },
        ],
      },
      {
        description: isKz ? 'first="Hello" және second="World" біріктіріп result-қа сақта' : 'Объедини first="Hello" и second="World" в result',
        starterCode: 'first = "Hello"\nsecond = "World"\n# result = ...\n',
        hints: [
          isKz ? 'Жолдарды + арқылы біріктіруге болады' : 'Строки объединяются через +',
          isKz ? 'Аралық: first + " " + second' : 'С пробелом: first + " " + second',
        ],
        tests: [
          {
            description: isKz ? 'result айнымалысы бар' : 'Переменная result определена',
            checkFunction: (code) => /result\s*=/.test(code),
          },
          {
            description: isKz ? 'first және second біріктірілген' : 'Объединены first и second',
            checkFunction: (code) => /result\s*=\s*first.*second/.test(code) || /Hello.*World/.test(code),
          },
        ],
      },
      {
        description: isKz ? 'x = 42 жаса, оның түрін int-тен str-ге түрлендір' : 'Создай x = 42, преобразуй его из int в str',
        starterCode: 'x = 42\n# x_str = ...\n',
        hints: [
          isKz ? 'str() функциясын қолдан' : 'Используй функцию str()',
          isKz ? 'x_str = str(x)' : 'x_str = str(x)',
        ],
        tests: [
          {
            description: isKz ? 'x_str айнымалысы бар' : 'Переменная x_str существует',
            checkFunction: (code) => /x_str\s*=/.test(code),
          },
          {
            description: isKz ? 'str() функциясын қолданады' : 'Использует функцию str()',
            checkFunction: (code) => /x_str\s*=\s*str\(x\)/.test(code) || /str\(42\)/.test(code),
          },
        ],
      },
      {
        description: isKz ? 'x = 42 жаса және оның түрін my_type-қа сақта' : 'Создай x = 42 и сохрани его тип в my_type',
        starterCode: 'x = 42\n# my_type = type(...)\n',
        hints: [
          isKz ? 'type() функциясы айнымалының түрін қайтарады' : 'Функция type() возвращает тип',
          isKz ? 'my_type = type(x)' : 'my_type = type(x)',
        ],
        tests: [
          {
            description: isKz ? 'x = 42 анықталған' : 'x = 42 определена',
            checkFunction: (code) => /x\s*=\s*42/.test(code),
          },
          {
            description: isKz ? 'type() қолданады' : 'Использует type()',
            checkFunction: (code) => /my_type\s*=\s*type\(x\)/.test(code),
          },
        ],
      },
      {
        description: isKz ? 'a және b сұрап, олардың қосындысын шығар' : 'Спроси a и b, выведи их сумму',
        starterCode: '# Мини-калькулятор\n',
        hints: [
          isKz ? 'input() арқылы енгізу' : 'Ввод через input()',
          isKz ? 'int() арқылы санға түрлендір' : 'Преобразуй в число через int()',
        ],
        tests: [
          {
            description: isKz ? 'input() қолданады' : 'Использует input()',
            checkFunction: (code) => /input\(/.test(code),
          },
          {
            description: isKz ? 'Қосындыны шығарады' : 'Выводит сумму',
            checkFunction: (code) => /print\(/.test(code) && /\+/.test(code),
          },
        ],
      },
    ];
    return practices[practiceIndex] || practices[0];
  }

  // Conditions topic
  if (topicId.includes('if') || topicId === 'g8-if') {
    const practices: PracticeDetails[] = [
      {
        description: isKz ? 'age = 20 жаса. age >= 18 болса "Adult", әйтпесе "Child"' : 'Создай age = 20. Если age >= 18 выведи "Adult", иначе "Child"',
        starterCode: 'age = 20\n# if ...\n',
        hints: [
          isKz ? 'if шартынан кейін : қой' : 'После if поставь :',
          isKz ? 'print() 4 бос орынмен шегіндіру керек' : 'print() с отступом 4 пробела',
        ],
        tests: [
          {
            description: isKz ? 'if шарты бар' : 'Есть условие if',
            checkFunction: (code) => /if\s+age\s*>=\s*18/.test(code),
          },
          {
            description: isKz ? 'else блогы бар' : 'Есть блок else',
            checkFunction: (code) => /else\s*:/.test(code),
          },
        ],
      },
      {
        description: isKz ? 'num = 7 жаса. num % 2 == 0 болса "Even", әйтпесе "Odd"' : 'Создай num = 7. Если num % 2 == 0 выведи "Even", иначе "Odd"',
        starterCode: 'num = 7\n# if ...\n',
        hints: [
          isKz ? '% - бөлгеннен қалдық' : '% - остаток от деления',
          isKz ? 'Жұп: num % 2 == 0' : 'Четное: num % 2 == 0',
        ],
        tests: [
          {
            description: isKz ? '% 2 == 0 тексеруі бар' : 'Есть проверка % 2 == 0',
            checkFunction: (code) => /num\s*%\s*2\s*==\s*0/.test(code),
          },
        ],
      },
      {
        description: isKz ? 'a және b сұрап, қайсысы үлкен екенін шығар' : 'Спроси a и b, выведи какое больше',
        starterCode: '# Қайсысы үлкен?\n',
        hints: [
          isKz ? 'a > b, a < b, a == b' : 'a > b, a < b, a == b',
        ],
        tests: [
          {
            description: isKz ? 'input() қолданады' : 'Использует input()',
            checkFunction: (code) => /input\(/.test(code),
          },
          {
            description: isKz ? 'if салыстыруы бар' : 'Есть сравнение if',
            checkFunction: (code) => /if.*[><]=?/.test(code),
          },
        ],
      },
      {
        description: isKz ? 'score (0-100) сұрап, бағаны шығар: 90+ A, 80+ B, 70+ C, 60+ D, <60 F' : 'Спроси score (0-100), выведи оценку: 90+ A, 80+ B, 70+ C, 60+ D, <60 F',
        starterCode: '# Баллдар бойынша баға\n',
        hints: [
          isKz ? 'Бірнеше if-elif қолдан' : 'Используй несколько if-elif',
        ],
        tests: [
          {
            description: isKz ? 'if/elif қолданады' : 'Использует if/elif',
            checkFunction: (code) => /if.*elif/.test(code),
          },
        ],
      },
      {
        description: isKz ? 'age және height сұрап, екеуі де жеткілікті болса "OK"' : 'Спроси age и height, если оба достаточны выведи "OK"',
        starterCode: '# Біліктілік тексеру\n',
        hints: [
          isKz ? 'and операторын қолдан' : 'Используй оператор and',
          isKz ? 'if age >= 14 and height >= 140:' : 'if age >= 14 and height >= 140:',
        ],
        tests: [
          {
            description: isKz ? 'and қолданады' : 'Использует and',
            checkFunction: (code) => /and/.test(code),
          },
        ],
      },
      {
        description: isKz ? 'Кіру құпия сөзін тексер (password == "secret")' : 'Проверь пароль для входа (password == "secret")',
        starterCode: '# Құпия сөзді тексеру\n',
        hints: [
          isKz ? '== арқылы салыстыр' : 'Сравни через ==',
        ],
        tests: [
          {
            description: isKz ? '== салыстыруы бар' : 'Есть сравнение ==',
            checkFunction: (code) => /==/.test(code),
          },
        ],
      },
    ];
    return practices[practiceIndex] || practices[0];
  }

  // Loops topic
  if (topicId.includes('loop') || topicId === 'g8-loops') {
    const practices: PracticeDetails[] = [
      {
        description: isKz ? 'range(1,10) қолданып, 1-ден 9-ға дейін шығар' : 'Используй range(1,10), выведи числа от 1 до 9',
        starterCode: '# for циклі\n',
        hints: [
          isKz ? 'for i in range(1, 10):' : 'for i in range(1, 10):',
        ],
        tests: [
          {
            description: isKz ? 'for range қолданады' : 'Использует for range',
            checkFunction: (code) => /for.*in\s+range/.test(code),
          },
        ],
      },
      {
        description: isKz ? '1-ден 10-ға дейін сандардың қосындысын шығар' : 'Выведи сумму чисел от 1 до 10',
        starterCode: 'total = 0\n# for циклін қосыңыз\n',
        hints: [
          isKz ? 'total += i' : 'total += i',
        ],
        tests: [
          {
            description: isKz ? 'for циклі бар' : 'Есть цикл for',
            checkFunction: (code) => /for/.test(code),
          },
          {
            description: isKz ? 'total қолданады' : 'Использует total',
            checkFunction: (code) => /total\s*\+?=/.test(code),
          },
        ],
      },
    ];
    return practices[practiceIndex] || practices[0];
  }

  // Default generic practice
  return {
    description: isKz
      ? `${practiceName}: ${topicId}-тақырыбы бойынша практика`
      : `${practiceName}: практика по теме ${topicId}`,
    starterCode: '# Кодты мұнда жаз\n',
    hints: [isKz ? 'Теорияны оқы және мысалдарды қарастыр' : 'Прочитай теорию и изучи примеры'],
    tests: [
      {
        description: isKz ? 'Код жазылған' : 'Код написан',
        checkFunction: (code) => code.trim().length > 10,
      },
    ],
  };
};

const storageKey = 'courseJourneyProgressV2';
const storageKeyLegacy = 'courseJourneyProgressV1';
const PRACTICE_TOPIC_KEY = 'practicePrefillTopicIdV1';
const PRACTICE_INDEX_KEY = 'practicePrefillIndexV1';

const getInitialProgress = (): ProgressMap => {
  try {
    const rawCurrent = localStorage.getItem(storageKey);
    if (rawCurrent) {
      return JSON.parse(rawCurrent) as ProgressMap;
    }

    const rawLegacy = localStorage.getItem(storageKeyLegacy);
    if (!rawLegacy) return {};
    const migrated = JSON.parse(rawLegacy) as ProgressMap;
    localStorage.setItem(storageKey, JSON.stringify(migrated));
    return migrated;
  } catch {
    return {};
  }
};

const saveProgressLocal = (progress: ProgressMap) => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress locally:', e);
  }
};

const getTheoryContent = (topic: Topic) => {
  const isKz = APP_LANGUAGE === 'kz';

  if (topic.id.includes('variable') || topic.id === 'pre-variables') {
    return {
      intro: isKz
        ? 'Айнымалы - бұл деректерді сақтайтын қорап. Python тілінде төрт негізгі түр бар.'
        : 'Переменная - это коробка для хранения данных. В Python есть 4 основных типа.',
      points: [
        isKz ? 'int - бүтін сандар: 42, -5, 0' : 'int - целые числа: 42, -5, 0',
        isKz ? 'str - жолдар: "Сәлем", \'Python\'' : 'str - строки: "Привет", \'Python\'',
        isKz ? 'float - ондық: 3.14, -0.5' : 'float - дробные: 3.14, -0.5',
        isKz ? 'bool - логикалық: True, False' : 'bool - логические: True, False',
      ],
      example: isKz
        ? 'name = "Алия"\nage = 14\nprint(name, age)\n\na = 5\nb = 3\nresult = a + b\nprint(result)'
        : 'name = "Аня"\nage = 14\nprint(name, age)\n\na = 5\nb = 3\nresult = a + b\nprint(result)',
    };
  }

  if (topic.id.includes('if') || topic.id === 'g8-if') {
    return {
      intro: isKz
        ? 'if шарты бағдарламаға әртүрлі жағдайларда әртүрлі әрекеттер жасауға мүмкіндік береді.'
        : 'Условие if позволяет программе делать разные действия в разных ситуациях.',
      points: [
        isKz ? 'if age >= 14: - шарт тексеру' : 'if age >= 14: - проверка условия',
        isKz ? 'else: - шарт жалған болса' : 'else: - если условие ложно',
        isKz ? 'elif: - қосымша шарт' : 'elif: - дополнительное условие',
        isKz ? 'Салыстыру: ==, !=, >, <, >=, <=' : 'Сравнения: ==, !=, >, <, >=, <=',
      ],
      example: 'age = 15\nif age >= 18:\n    print("Adult")\nelif age >= 14:\n    print("Teen")\nelse:\n    print("Child")',
    };
  }

  if (topic.id.includes('loop') || topic.id === 'g8-loops') {
    return {
      intro: isKz
        ? 'Циклдер әрекеттерді қайталайды: for коллекция бойынша, while шарт ақиқат болғанша.'
        : 'Циклы повторяют действия: for по коллекции, while пока условие истинно.',
      points: [
        isKz ? 'for i in range(10): - 0-ден 9-ға циклi' : 'for i in range(10): - цикл от 0 до 9',
        isKz ? 'for item in list: - тізім бойынша' : 'for item in list: - по списку',
        isKz ? 'while условие: - шарт ақиқат болғанша' : 'while условие: - пока условие истинно',
      ],
      example: 'for i in range(1, 6):\n    print(i)\n\ncount = 5\nwhile count > 0:\n    print(count)\n    count -= 1',
    };
  }

  return {
    intro: topic.theory || '',
    points: [
      isKz ? 'Мысалдарды қарастыр' : 'Разбери примеры',
      isKz ? 'Практикаға өт' : 'Переходи к практике',
    ],
    example: isKz ? 'print("Жаттығу")' : 'print("Практика")',
  };
};

export const SimpleLearning: React.FC<SimpleLearningProps> = ({ setView }) => {
  const isKz = APP_LANGUAGE === 'kz';

  const text = {
    title: isKz ? 'Менің оқу жолым' : 'Моё обучение',
    subtitle: isKz ? 'Python негіздерін қадамдап үйрен' : 'Изучай основы Python шаг за шагом',
    theory: isKz ? 'Теория' : 'Теория',
    practice: isKz ? 'Практика' : 'Практика',
    completed: isKz ? 'Аяқталды' : 'Завершено',
    locked: isKz ? 'Жабық' : 'Заблокировано',
    overall: isKz ? 'Жалпы прогресс' : 'Общий прогресс',
    runCode: isKz ? 'Кодты тексеру' : 'Проверить код',
    yourCode: isKz ? 'Сенің кодың' : 'Твой код',
    result: isKz ? 'Нәтиже' : 'Результат',
    success: isKz ? 'Дұрыс! Келесі тапсырмаға өт' : 'Правильно! Переходи к следующему',
    nextTask: isKz ? 'Келесі' : 'Далее',
    backToTopics: isKz ? 'Тақырыптарға оралу' : 'К темам',
    selectTask: isKz ? 'Тапсырманы таңда' : 'Выбери задание',
    hints: isKz ? 'Кеңестер' : 'Подсказки',
    loading: isKz ? 'Жүктелуде...' : 'Загрузка...',
    preTab: isKz ? '8/9 дейін' : 'До 8/9',
    class8: isKz ? '8 сынып' : '8 класс',
    class9: isKz ? '9 сынып' : '9 класс',
    oracleChat: isKz ? 'Оракул чаты' : 'Чат с Оракулом',
  };

  const [topics, setTopics] = useState<Topic[]>([]);
  const [progress, setProgress] = useState<ProgressMap>(getInitialProgress);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [showTheoryPanel, setShowTheoryPanel] = useState(true);
  const [selectedPracticeIndex, setSelectedPracticeIndex] = useState<number | null>(null);
  const [userCode, setUserCode] = useState('');
  const [testResults, setTestResults] = useState<{ passed: boolean; message: string }[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const applyPracticePrefill = (allTopics: Topic[], sourceProgress: ProgressMap) => {
    const topicId = localStorage.getItem(PRACTICE_TOPIC_KEY);
    const indexRaw = localStorage.getItem(PRACTICE_INDEX_KEY);
    if (!topicId || indexRaw === null) return;

    const topic = allTopics.find((item) => item.id === topicId);
    const parsedIndex = Number(indexRaw);
    if (!topic || !Number.isInteger(parsedIndex) || parsedIndex < 0 || parsedIndex >= topic.practices.length) {
      localStorage.removeItem(PRACTICE_TOPIC_KEY);
      localStorage.removeItem(PRACTICE_INDEX_KEY);
      return;
    }

    const topicState = sourceProgress[topic.id] || { theoryOpened: false, completedPractices: [] };
    const unlocked = topicState.theoryOpened && (
      parsedIndex === 0
      || topicState.completedPractices.includes(parsedIndex - 1)
      || topicState.completedPractices.includes(parsedIndex)
    );
    if (!unlocked) {
      localStorage.removeItem(PRACTICE_TOPIC_KEY);
      localStorage.removeItem(PRACTICE_INDEX_KEY);
      return;
    }

    const details = getPracticeDetails(topic.id, parsedIndex, topic.practices[parsedIndex]);
    setSelectedTopic(topic);
    setSelectedPracticeIndex(parsedIndex);
    setShowTheoryPanel(false);
    setUserCode(details.starterCode);
    setTestResults([]);
    setIsSuccess(false);

    localStorage.removeItem(PRACTICE_TOPIC_KEY);
    localStorage.removeItem(PRACTICE_INDEX_KEY);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load topics
        const topicsData = await apiGet<Topic[]>('/courses/journey');
        const resolvedTopics = Array.isArray(topicsData) && topicsData.length > 0 ? topicsData : [];
        if (resolvedTopics.length > 0) {
          setTopics(resolvedTopics);
        }

        // Load progress
        const progressData = await apiGet<ProgressMap>('/courses/journey/progress');
        const resolvedProgress = progressData && typeof progressData === 'object' ? progressData : {};
        if (progressData && typeof progressData === 'object') {
          setProgress(resolvedProgress);
          saveProgressLocal(resolvedProgress);
        }

        if (resolvedTopics.length > 0) {
          applyPracticePrefill(resolvedTopics, resolvedProgress);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const saveTopicProgress = async (topicId: string, topicState: TopicProgress) => {
    const newProgress = {
      ...progress,
      [topicId]: topicState,
    };

    setProgress(newProgress);
    saveProgressLocal(newProgress);

    try {
      const serverProgress = await apiPut<ProgressMap>('/courses/journey/progress', {
        topicId,
        progress: topicState,
      });
      if (serverProgress && typeof serverProgress === 'object') {
        setProgress(serverProgress);
        saveProgressLocal(serverProgress);
      }
    } catch (error) {
      console.error('Failed to save progress to server:', error);
    }
  };

  const totalProgress = topics.reduce((sum, topic) => {
    const theoryWeight = 1;
    const practiceWeight = topic.practices.length;
    const totalWeight = theoryWeight + practiceWeight;
    const topicProgress = progress[topic.id] || { theoryOpened: false, completedPractices: [] };
    const completedWeight = (topicProgress.theoryOpened ? theoryWeight : 0) + topicProgress.completedPractices.length;
    return sum + (completedWeight / totalWeight) * 100;
  }, 0) / (topics.length || 1);

  const handleSelectTopic = (topic: Topic) => {
    const topicProgress = progress[topic.id] || { theoryOpened: false, completedPractices: [] };

    // Mark theory as opened
    if (!topicProgress.theoryOpened) {
      void saveTopicProgress(topic.id, { ...topicProgress, theoryOpened: true });
    }

    setSelectedTopic(topic);
    setSelectedPracticeIndex(null);
    setShowTheoryPanel(true);
  };

  const handleSelectPractice = (practiceIndex: number) => {
    if (!selectedTopic) return;

    const practiceName = selectedTopic.practices[practiceIndex];
    const details = getPracticeDetails(selectedTopic.id, practiceIndex, practiceName);

    setSelectedPracticeIndex(practiceIndex);
    setUserCode(details.starterCode);
    setTestResults([]);
    setIsSuccess(false);
  };

  const handleBackToTopics = () => {
    setSelectedTopic(null);
    setSelectedPracticeIndex(null);
    setUserCode('');
    setTestResults([]);
    setIsSuccess(false);
  };

  const runTests = () => {
    if (!selectedTopic || selectedPracticeIndex === null) return;

    const practiceName = selectedTopic.practices[selectedPracticeIndex];
    const details = getPracticeDetails(selectedTopic.id, selectedPracticeIndex, practiceName);

    const results = details.tests.map((test) => {
      const passed = test.checkFunction(userCode);
      return { passed, message: test.description };
    });

    setTestResults(results);

    const allPassed = results.every((r) => r.passed);
    setIsSuccess(allPassed);

    if (allPassed) {
      const topicProgress = progress[selectedTopic.id] || { theoryOpened: true, completedPractices: [] };
      const newCompletedPractices = [...new Set([...topicProgress.completedPractices, selectedPracticeIndex])];

      void saveTopicProgress(selectedTopic.id, {
        ...topicProgress,
        completedPractices: newCompletedPractices,
      });
    }
  };

  const handleNextPractice = () => {
    if (!selectedTopic || selectedPracticeIndex === null) return;
    if (selectedPracticeIndex < selectedTopic.practices.length - 1) {
      handleSelectPractice(selectedPracticeIndex + 1);
    } else {
      setSelectedPracticeIndex(null);
      setUserCode('');
      setTestResults([]);
      setIsSuccess(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-[#0c120e] dark:to-[#0a0f0b] flex items-center justify-center">
        <div className="text-center">
          <div className="size-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">{text.loading}</p>
        </div>
      </div>
    );
  }

  // Render topics list
  if (!selectedTopic) {
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
              const topicProgress = progress[topic.id] || { theoryOpened: false, completedPractices: [] };
              const isCompleted = topicProgress.theoryOpened && topicProgress.completedPractices.length === topic.practices.length;
              const progressPercent = topicProgress.theoryOpened
                ? ((1 + topicProgress.completedPractices.length) / (1 + topic.practices.length)) * 100
                : 0;

              return (
                <button
                  key={topic.id}
                  onClick={() => handleSelectTopic(topic)}
                  className={`
                    w-full relative bg-white dark:bg-slate-900 border-2 rounded-2xl p-6 transition-all text-left
                    ${isCompleted
                      ? 'border-emerald-400 dark:border-emerald-600 hover:shadow-lg'
                      : 'border-slate-300 dark:border-white/20 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-lg'
                    }
                  `}
                >
                  {/* Step Number */}
                  <div className="absolute -top-3 -left-3 size-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black flex items-center justify-center text-lg shadow-lg">
                    {index + 1}
                  </div>

                  {/* Completed Badge */}
                  {isCompleted && (
                    <div className="absolute -top-3 -right-3 size-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg">
                      <CheckCircle2 size={24} />
                    </div>
                  )}

                  <div className="ml-4">
                    <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">{topic.section}</div>
                    <h3 className="text-xl font-bold mb-2">{topic.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">{topic.theory}</p>

                    {/* Progress */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className={`size-5 rounded-full flex items-center justify-center ${topicProgress.theoryOpened ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800'}`}>
                            {topicProgress.theoryOpened ? <Check size={12} /> : <BookOpen size={12} />}
                          </div>
                          <span className={`text-xs font-semibold ${topicProgress.theoryOpened ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
                            {text.theory}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Code size={14} className={topicProgress.completedPractices.length > 0 ? 'text-emerald-600' : 'text-slate-400'} />
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                            {text.practice}: {topicProgress.completedPractices.length}/{topic.practices.length}
                          </span>
                        </div>
                      </div>

                      {progressPercent > 0 && (
                        <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Render topic detail view
  const topicProgress = progress[selectedTopic.id] || { theoryOpened: true, completedPractices: [] };
  const theoryContent = getTheoryContent(selectedTopic);
  const selectedPracticeDetails =
    selectedPracticeIndex !== null
      ? getPracticeDetails(selectedTopic.id, selectedPracticeIndex, selectedTopic.practices[selectedPracticeIndex])
      : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0c120e] text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={handleBackToTopics}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <ChevronRight size={20} className="rotate-180" />
            <span className="font-semibold">{text.backToTopics}</span>
          </button>
          <div className="text-center">
            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{selectedTopic.section}</div>
            <h2 className="text-xl font-bold">{selectedTopic.title}</h2>
          </div>
          <div className="w-32"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-120px)]">
          {/* Left sidebar */}
          <div className="lg:col-span-4 space-y-4 overflow-y-auto">
            {/* Theory */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowTheoryPanel(!showTheoryPanel)}
                className="w-full flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-950/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <BookOpen size={20} className="text-indigo-600" />
                  <span className="font-bold">{text.theory}</span>
                </div>
                {showTheoryPanel ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>

              {showTheoryPanel && (
                <div className="p-4 space-y-3">
                  <p className="text-sm text-slate-700 dark:text-slate-300">{theoryContent.intro}</p>

                  <ul className="space-y-2">
                    {theoryContent.points.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-indigo-600 font-bold mt-0.5">•</span>
                        <span className="text-slate-700 dark:text-slate-300">{point}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="bg-slate-900 text-slate-100 p-3 rounded-lg">
                    <pre className="text-xs whitespace-pre-wrap font-mono">{theoryContent.example}</pre>
                  </div>
                </div>
              )}
            </div>

            {/* Practice List */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Code size={20} className="text-emerald-600" />
                <span className="font-bold">{text.practice}</span>
                <span className="ml-auto text-xs font-bold text-slate-600 dark:text-slate-400">
                  {topicProgress.completedPractices.length}/{selectedTopic.practices.length}
                </span>
              </div>

              <div className="space-y-2">
                {selectedTopic.practices.map((practiceName, index) => {
                  const isDone = topicProgress.completedPractices.includes(index);
                  const isActive = selectedPracticeIndex === index;
                  return (
                    <button
                      key={index}
                      onClick={() => handleSelectPractice(index)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all ${
                        isActive
                          ? 'bg-indigo-100 dark:bg-indigo-900/30 border-2 border-indigo-500'
                          : isDone
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                            : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {isDone && <Check size={14} className="text-emerald-600" />}
                      <span>{practiceName}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right panel - Code editor */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden flex flex-col">
            {selectedPracticeDetails ? (
              <>
                <div className="p-4 border-b border-slate-200 dark:border-white/10">
                  <h3 className="font-bold text-lg mb-1">{selectedTopic.practices[selectedPracticeIndex!]}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{selectedPracticeDetails.description}</p>
                </div>

                <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
                  {/* Code Editor */}
                  <div className="flex-1 min-h-[300px]">
                    <label className="block text-sm font-semibold mb-2">{text.yourCode}</label>
                    <textarea
                      value={userCode}
                      onChange={(e) => setUserCode(e.target.value)}
                      className="w-full h-full min-h-[250px] p-4 bg-slate-900 text-slate-100 font-mono text-sm rounded-xl border border-slate-700 focus:border-indigo-500 focus:outline-none resize-none"
                      spellCheck={false}
                      placeholder="# Кодты мұнда жаз..."
                    />
                  </div>

                  {/* Hints */}
                  {selectedPracticeDetails.hints.length > 0 && (
                    <details className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                      <summary className="cursor-pointer font-semibold text-sm text-amber-800 dark:text-amber-300">
                        💡 {text.hints}
                      </summary>
                      <ul className="mt-2 space-y-1">
                        {selectedPracticeDetails.hints.map((hint, i) => (
                          <li key={i} className="text-xs text-amber-700 dark:text-amber-400">
                            {i + 1}. {hint}
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}

                  {/* Run Button */}
                  <button
                    onClick={runTests}
                    className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 flex items-center justify-center gap-2"
                  >
                    <Play size={18} />
                    {text.runCode}
                  </button>

                  {/* Test Results */}
                  {testResults.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">{text.result}:</h4>
                      {testResults.map((result, i) => (
                        <div
                          key={i}
                          className={`p-3 rounded-lg flex items-center gap-2 ${
                            result.passed
                              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                          }`}
                        >
                          {result.passed ? <Check size={18} /> : <AlertCircle size={18} />}
                          <span className="text-sm">{result.message}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Success Message */}
                  {isSuccess && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-500 rounded-xl p-4 text-center">
                      <CheckCircle2 size={48} className="text-emerald-600 mx-auto mb-2" />
                      <p className="text-emerald-700 dark:text-emerald-400 font-bold mb-3">{text.success}</p>
                      <button
                        onClick={handleNextPractice}
                        className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700"
                      >
                        {text.nextTask}
                      </button>
                    </div>
                  )}

                  {/* Oracle Chat */}
                  <div className="border-t border-slate-200 dark:border-white/10 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{text.oracleChat}</span>
                    </div>
                    <div className="h-[360px] rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
                      <AIChat embedded />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center">
                <div className="w-full max-w-xl">
                  <div className="mb-8">
                  <Code size={64} className="text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400 text-lg font-semibold mb-2">
                    {text.selectTask}
                  </p>
                  <p className="text-slate-400 dark:text-slate-500 text-sm">
                    {isKz ? '← Солдағы тізімнен тапсырма таңда' : '← Выбери задание из списка слева'}
                  </p>
                  </div>

                  <div className="text-left">
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3">{text.oracleChat}</div>
                    <div className="h-[360px] rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
                      <AIChat embedded />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
