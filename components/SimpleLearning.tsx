import React, { useEffect, useState } from 'react';
import { BookOpen, CheckCircle2, Code, ChevronRight, Trophy, Lock, Play, X, AlertCircle, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { View } from '../types';
import { APP_LANGUAGE } from '../constants';

interface SimpleLearningProps {
  setView: (view: View) => void;
}

type PracticeTask = {
  id: string;
  title: string;
  description: string;
  starterCode: string;
  solution: string;
  hints: string[];
  tests: {
    input?: string;
    expectedOutput: string;
    description: string;
    checkFunction: (code: string) => boolean;
  }[];
};

type Topic = {
  id: string;
  title: string;
  description: string;
  theory: {
    intro: string;
    points: string[];
    example: string;
  };
  practices: PracticeTask[];
  theoryViewed: boolean;
  completedPractices: string[];
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
    locked: isKz ? 'Жабық' : 'Заблокировано',
    showTheory: isKz ? 'Теорияны көрсету' : 'Показать теорию',
    hideTheory: isKz ? 'Теорияны жасыру' : 'Скрыть теорию',
    doPractice: isKz ? 'Практика жасау' : 'Делать практику',
    overall: isKz ? 'Жалпы прогресс' : 'Общий прогресс',
    runCode: isKz ? 'Кодты тексеру' : 'Проверить код',
    taskTitle: isKz ? 'Тапсырма' : 'Задание',
    yourCode: isKz ? 'Сенің кодың' : 'Твой код',
    result: isKz ? 'Нәтиже' : 'Результат',
    success: isKz ? 'Дұрыс! Келесі тапсырмаға өт' : 'Правильно! Переходи к следующему',
    error: isKz ? 'Дұрыс емес. Қайталап көр' : 'Неправильно. Попробуй ещё',
    nextTask: isKz ? 'Келесі' : 'Далее',
    backToTopics: isKz ? 'Тақырыптарға оралу' : 'К темам',
    testPassed: isKz ? 'Тест өтті' : 'Тест пройден',
    testFailed: isKz ? 'Тест өтпеді' : 'Тест не прошёл',
    selectTask: isKz ? 'Тапсырманы таңда' : 'Выбери задание',
    hints: isKz ? 'Кеңестер' : 'Подсказки',
  };

  const [topics, setTopics] = useState<Topic[]>([
    {
      id: '1',
      title: isKz ? 'Айнымалылар және дерек түрлері' : 'Переменные и типы данных',
      description: isKz ? 'Python-да айнымалыларды қалай жасау және қолдану керектігін үйрен' : 'Научись создавать и использовать переменные в Python',
      theory: {
        intro: isKz ? 'Айнымалы - бұ деректерді сақтайтын қорап. Python тілінде төрт негізгі түр бар: int (сандар), str (жолдар), float (ондық сандар), bool (ақиқат/жалған).' : 'Переменная - это коробка для хранения данных. В Python есть 4 основных типа: int (числа), str (строки), float (дробные числа), bool (истина/ложь).',
        points: [
          isKz ? 'Айнымалы жасау үшін: name = "Алия"' : 'Чтобы создать переменную: name = "Аня"',
          isKz ? 'Түрін тексеру үшін: type(name)' : 'Чтобы проверить тип: type(name)',
          isKz ? 'Сандарды қосу: a + b' : 'Сложить числа: a + b',
          isKz ? 'Жолдарды біріктіру: first + second' : 'Объединить строки: first + second',
        ],
        example: isKz ? 'name = "Алия"\nage = 14\nprint(name, age)\n\n# Сандарды қосу\na = 5\nb = 3\nresult = a + b\nprint(result)  # 8' : 'name = "Аня"\nage = 14\nprint(name, age)\n\n# Сложение чисел\na = 5\nb = 3\nresult = a + b\nprint(result)  # 8',
      },
      practices: [
        {
          id: '1-1',
          title: isKz ? '1. Екі айнымалы жаса' : '1. Создай две переменные',
          description: isKz ? 'name және age айнымалыларын жаса. name - жолдық түр, age - сан түрі.' : 'Создай переменные name и age. name должна быть строкой, age - числом.',
          starterCode: '# Кодты мұнда жаз\n',
          solution: 'name = "Аня"\nage = 14',
          hints: [
            isKz ? 'Жолдар қос немесе жалғыз тырнақшада жазылады: "жол" немесе \'жол\'' : 'Строки пишутся в двойных или одинарных кавычках: "строка" или \'строка\'',
            isKz ? 'Сандарға тырнақша керек емес: age = 14' : 'Числа пишутся без кавычек: age = 14',
          ],
          tests: [
            {
              expectedOutput: 'name exists',
              description: isKz ? 'name айнымалысы бар' : 'Переменная name существует',
              checkFunction: (code) => /name\s*=\s*["'][^"']+["']/.test(code),
            },
            {
              expectedOutput: 'age exists',
              description: isKz ? 'age айнымалысы бар' : 'Переменная age существует',
              checkFunction: (code) => /age\s*=\s*\d+/.test(code),
            },
          ],
        },
        {
          id: '1-2',
          title: isKz ? '2. Сандарды қос' : '2. Сложи числа',
          description: isKz ? 'a=5, b=3 жасап, олардың қосындысын result-қа сақта' : 'Создай a=5, b=3 и сохрани их сумму в result',
          starterCode: 'a = 5\nb = 3\n# result = ...\n',
          solution: 'a = 5\nb = 3\nresult = a + b',
          hints: [
            isKz ? 'Сандарды қосу үшін + операторын қолдан: result = a + b' : 'Для сложения используй оператор +: result = a + b',
            isKz ? 'result айнымалысына a + b мәнін меншікте' : 'Присвой переменной result значение a + b',
          ],
          tests: [
            {
              expectedOutput: 'result defined',
              description: isKz ? 'result айнымалысы анықталған' : 'Переменная result определена',
              checkFunction: (code) => /result\s*=/.test(code),
            },
            {
              expectedOutput: 'uses addition',
              description: isKz ? 'a + b қосындысын қолданады' : 'Использует сложение a + b',
              checkFunction: (code) => /result\s*=\s*a\s*\+\s*b/.test(code) || /result\s*=\s*5\s*\+\s*3/.test(code) || /result\s*=\s*8/.test(code),
            },
          ],
        },
        {
          id: '1-3',
          title: isKz ? '3. Жолдарды біріктір' : '3. Склей строки',
          description: isKz ? 'first="Hello" және second="World" біріктіріп, result-қа сақта (аралықпен)' : 'Объедини first="Hello" и second="World", сохрани в result (с пробелом)',
          starterCode: 'first = "Hello"\nsecond = "World"\n# result = ...\n',
          solution: 'first = "Hello"\nsecond = "World"\nresult = first + " " + second',
          hints: [
            isKz ? 'Жолдарды + арқылы біріктіруге болады' : 'Строки можно объединять через +',
            isKz ? 'Аралық қосу үшін: first + " " + second' : 'Чтобы добавить пробел: first + " " + second',
          ],
          tests: [
            {
              expectedOutput: 'result defined',
              description: isKz ? 'result айнымалысы анықталған' : 'Переменная result определена',
              checkFunction: (code) => /result\s*=/.test(code),
            },
            {
              expectedOutput: 'concatenates strings',
              description: isKz ? 'first және second-ты біріктіреді' : 'Объединяет first и second',
              checkFunction: (code) => /result\s*=\s*first\s*\+\s*["']\s["']\s*\+\s*second/.test(code) || /result\s*=\s*first\s*\+\s*second/.test(code),
            },
          ],
        },
        {
          id: '1-4',
          title: isKz ? '4. type() функциясын қолдан' : '4. Используй функцию type()',
          description: isKz ? 'x = 42 жаса және оның түрін my_type-қа сақта' : 'Создай x = 42 и сохрани его тип в my_type',
          starterCode: 'x = 42\n# my_type = type(...)\n',
          solution: 'x = 42\nmy_type = type(x)',
          hints: [
            isKz ? 'type() функциясы айнымалының түрін қайтарады' : 'Функция type() возвращает тип переменной',
            isKz ? 'Қолданыңыз: my_type = type(x)' : 'Используй: my_type = type(x)',
          ],
          tests: [
            {
              expectedOutput: 'x defined',
              description: isKz ? 'x = 42 анықталған' : 'x = 42 определена',
              checkFunction: (code) => /x\s*=\s*42/.test(code),
            },
            {
              expectedOutput: 'my_type uses type()',
              description: isKz ? 'my_type type() қолданады' : 'my_type использует type()',
              checkFunction: (code) => /my_type\s*=\s*type\(x\)/.test(code),
            },
          ],
        },
      ],
      theoryViewed: false,
      completedPractices: [],
      locked: false,
    },
    {
      id: '2',
      title: isKz ? 'Шарттар: if / else' : 'Условия: if / else',
      description: isKz ? 'Бағдарлама шешім қабылдауға үйрет' : 'Научи программу принимать решения',
      theory: {
        intro: isKz ? 'if шарты бағдарламаға әртүрлі жағдайларда әртүрлі әрекеттер жасауға мүмкіндік береді.' : 'Условие if позволяет программе делать разные действия в разных ситуациях.',
        points: [
          isKz ? 'if age >= 14: - шарт тексеру' : 'if age >= 14: - проверка условия',
          isKz ? 'else: - шарт жалған болса' : 'else: - если условие ложно',
          isKz ? 'Салыстыру: ==, !=, >, <, >=, <=' : 'Сравнения: ==, !=, >, <, >=, <=',
          isKz ? 'Шарттан кейін : қойып, келесі жолды шегіндіру керек' : 'После условия ставь : и делай отступ в следующей строке',
        ],
        example: 'age = 15\nif age >= 14:\n    print("OK")\nelse:\n    print("NO")\n\n# Әртүрлі салыстырулар\nif age == 15:\n    print("15 жас")\nelif age > 15:\n    print("15-тен көп")\nelse:\n    print("15-тен аз")',
      },
      practices: [
        {
          id: '2-1',
          title: isKz ? '1. Жасты тексер' : '1. Проверь возраст',
          description: isKz ? 'age = 20 жаса. Егер age >= 18 болса "Adult", әйтпесе "Child" шығар' : 'Создай age = 20. Если age >= 18 выведи "Adult", иначе "Child"',
          starterCode: 'age = 20\n# if ...\n',
          solution: 'age = 20\nif age >= 18:\n    print("Adult")\nelse:\n    print("Child")',
          hints: [
            isKz ? 'if шартынан кейін : қой' : 'После if поставь :',
            isKz ? 'print() 4 бос орынмен шегіндіру керек' : 'print() должен быть с отступом 4 пробела',
          ],
          tests: [
            {
              expectedOutput: 'has if',
              description: isKz ? 'if шарты бар' : 'Есть условие if',
              checkFunction: (code) => /if\s+age\s*>=\s*18/.test(code),
            },
            {
              expectedOutput: 'has else',
              description: isKz ? 'else блогы бар' : 'Есть блок else',
              checkFunction: (code) => /else\s*:/.test(code),
            },
            {
              expectedOutput: 'prints Adult',
              description: isKz ? 'Adult шығарады' : 'Выводит Adult',
              checkFunction: (code) => /print\s*\(\s*["']Adult["']\s*\)/.test(code),
            },
          ],
        },
        {
          id: '2-2',
          title: isKz ? '2. Жұп/тақ тексер' : '2. Проверь четность',
          description: isKz ? 'num = 7 жаса. Егер num % 2 == 0 болса "Even", әйтпесе "Odd"' : 'Создай num = 7. Если num % 2 == 0 выведи "Even", иначе "Odd"',
          starterCode: 'num = 7\n# if ...\n',
          solution: 'num = 7\nif num % 2 == 0:\n    print("Even")\nelse:\n    print("Odd")',
          hints: [
            isKz ? '% оператор - бөліндіні қалдығы (мысалы, 7 % 2 = 1)' : 'Оператор % - остаток от деления (например, 7 % 2 = 1)',
            isKz ? 'Жұп сан: num % 2 == 0' : 'Четное число: num % 2 == 0',
          ],
          tests: [
            {
              expectedOutput: 'has modulo check',
              description: isKz ? '% 2 == 0 тексеруі бар' : 'Есть проверка % 2 == 0',
              checkFunction: (code) => /num\s*%\s*2\s*==\s*0/.test(code),
            },
            {
              expectedOutput: 'prints Even/Odd',
              description: isKz ? 'Even және Odd шығарады' : 'Выводит Even и Odd',
              checkFunction: (code) => /print\s*\(\s*["']Even["']\s*\)/.test(code) && /print\s*\(\s*["']Odd["']\s*\)/.test(code),
            },
          ],
        },
      ],
      theoryViewed: false,
      completedPractices: [],
      locked: true,
    },
  ]);

  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [showTheoryPanel, setShowTheoryPanel] = useState(true);
  const [selectedPractice, setSelectedPractice] = useState<PracticeTask | null>(null);
  const [userCode, setUserCode] = useState('');
  const [testResults, setTestResults] = useState<{ passed: boolean; message: string }[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);

  const totalProgress = topics.reduce((sum, topic) => {
    const theoryWeight = 1;
    const practiceWeight = topic.practices.length;
    const totalWeight = theoryWeight + practiceWeight;
    const completedWeight = (topic.theoryViewed ? theoryWeight : 0) + topic.completedPractices.length;
    return sum + (completedWeight / totalWeight) * 100;
  }, 0) / topics.length;

  const handleSelectTopic = (topic: Topic) => {
    if (topic.locked) return;

    // Mark theory as viewed immediately
    const updatedTopics = topics.map((t) => {
      if (t.id === topic.id) {
        return { ...t, theoryViewed: true };
      }
      return t;
    });
    setTopics(updatedTopics);

    // Find updated topic
    const updatedTopic = updatedTopics.find((t) => t.id === topic.id);
    setSelectedTopic(updatedTopic || topic);
    setSelectedPractice(null);
    setShowTheoryPanel(true);

    // Unlock next topic
    const currentIndex = topics.findIndex((t) => t.id === topic.id);
    if (currentIndex >= 0 && currentIndex < topics.length - 1) {
      setTopics((prev) =>
        prev.map((t, i) => (i === currentIndex + 1 ? { ...t, locked: false } : t))
      );
    }
  };

  const handleSelectPractice = (practice: PracticeTask) => {
    setSelectedPractice(practice);
    setUserCode(practice.starterCode);
    setTestResults([]);
    setIsSuccess(false);
  };

  const handleBackToTopics = () => {
    setSelectedTopic(null);
    setSelectedPractice(null);
    setUserCode('');
    setTestResults([]);
    setIsSuccess(false);
  };

  const runTests = () => {
    if (!selectedPractice) return;

    const results = selectedPractice.tests.map((test) => {
      const passed = test.checkFunction(userCode);
      return { passed, message: test.description };
    });

    setTestResults(results);

    const allPassed = results.every((r) => r.passed);
    setIsSuccess(allPassed);

    if (allPassed && selectedTopic && selectedPractice) {
      setTopics((prev) =>
        prev.map((t) =>
          t.id === selectedTopic.id
            ? {
                ...t,
                completedPractices: [...new Set([...t.completedPractices, selectedPractice.id])],
              }
            : t
        )
      );
    }
  };

  const handleNextPractice = () => {
    if (!selectedTopic || !selectedPractice) return;
    const currentIndex = selectedTopic.practices.findIndex((p) => p.id === selectedPractice.id);
    if (currentIndex < selectedTopic.practices.length - 1) {
      const nextPractice = selectedTopic.practices[currentIndex + 1];
      handleSelectPractice(nextPractice);
    } else {
      setSelectedPractice(null);
      setUserCode('');
      setTestResults([]);
      setIsSuccess(false);
    }
  };

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
              const isCompleted = topic.theoryViewed && topic.completedPractices.length === topic.practices.length;
              const topicProgress = topic.theoryViewed
                ? ((1 + topic.completedPractices.length) / (1 + topic.practices.length)) * 100
                : 0;

              return (
                <button
                  key={topic.id}
                  onClick={() => handleSelectTopic(topic)}
                  disabled={topic.locked}
                  className={`
                    w-full relative bg-white dark:bg-slate-900 border-2 rounded-2xl p-6 transition-all text-left
                    ${topic.locked
                      ? 'border-slate-200 dark:border-white/10 opacity-60 cursor-not-allowed'
                      : isCompleted
                        ? 'border-emerald-400 dark:border-emerald-600 hover:shadow-lg'
                        : 'border-slate-300 dark:border-white/20 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-lg'
                    }
                  `}
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
                      <div className="space-y-3">
                        {/* Theory & Practice indicators */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className={`size-5 rounded-full flex items-center justify-center ${topic.theoryViewed ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800'}`}>
                              {topic.theoryViewed ? <Check size={12} /> : <BookOpen size={12} />}
                            </div>
                            <span className={`text-xs font-semibold ${topic.theoryViewed ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
                              {text.theory}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Code size={14} className={topic.completedPractices.length > 0 ? 'text-emerald-600' : 'text-slate-400'} />
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                              {text.practice}: {topic.completedPractices.length}/{topic.practices.length}
                            </span>
                          </div>
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
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Render topic detail view (theory + practice)
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
          <h2 className="text-xl font-bold">{selectedTopic.title}</h2>
          <div className="w-32"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-120px)]">
          {/* Left sidebar - Theory & Practice list */}
          <div className="lg:col-span-4 space-y-4 overflow-y-auto">
            {/* Theory Section - Always visible */}
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
                  <p className="text-sm text-slate-700 dark:text-slate-300">{selectedTopic.theory.intro}</p>

                  <ul className="space-y-2">
                    {selectedTopic.theory.points.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-indigo-600 font-bold mt-0.5">•</span>
                        <span className="text-slate-700 dark:text-slate-300">{point}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="bg-slate-900 text-slate-100 p-3 rounded-lg">
                    <pre className="text-xs whitespace-pre-wrap font-mono">{selectedTopic.theory.example}</pre>
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
                  {selectedTopic.completedPractices.length}/{selectedTopic.practices.length}
                </span>
              </div>

              <div className="space-y-2">
                {selectedTopic.practices.map((practice) => {
                  const isDone = selectedTopic.completedPractices.includes(practice.id);
                  const isActive = selectedPractice?.id === practice.id;
                  return (
                    <button
                      key={practice.id}
                      onClick={() => handleSelectPractice(practice)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all ${
                        isActive
                          ? 'bg-indigo-100 dark:bg-indigo-900/30 border-2 border-indigo-500'
                          : isDone
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                            : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {isDone && <Check size={14} className="text-emerald-600" />}
                      <span>{practice.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right panel - Code editor */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden flex flex-col">
            {selectedPractice ? (
              <>
                <div className="p-4 border-b border-slate-200 dark:border-white/10">
                  <h3 className="font-bold text-lg mb-1">{selectedPractice.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{selectedPractice.description}</p>
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
                      placeholder="# Кодыңды мұнда жаз..."
                    />
                  </div>

                  {/* Hints */}
                  {selectedPractice.hints.length > 0 && (
                    <details className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                      <summary className="cursor-pointer font-semibold text-sm text-amber-800 dark:text-amber-300">
                        💡 {text.hints}
                      </summary>
                      <ul className="mt-2 space-y-1">
                        {selectedPractice.hints.map((hint, i) => (
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
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center">
                <div>
                  <Code size={64} className="text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400 text-lg font-semibold mb-2">
                    {text.selectTask}
                  </p>
                  <p className="text-slate-400 dark:text-slate-500 text-sm">
                    {isKz ? '← Солдағы тізімнен тапсырма таңда' : '← Выбери задание из списка слева'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
