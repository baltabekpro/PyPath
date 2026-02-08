import { Course, User } from './types';
import { Terminal, Database, Cpu, Globe, Code2, LineChart, Gamepad2, Rocket, Ghost, Zap, Skull, Lock, Box, Layers } from 'lucide-react';
import React from 'react';

export const CURRENT_USER: User = {
  name: "Neo_Coder",
  level: "Кибер-ниндзя",
  levelNum: 5,
  xp: 450,
  streak: 12,
  rank: 42,
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
};

export const COURSES: Course[] = [
  {
    id: 1,
    title: "Инициализация",
    description: "Первые шаги: переменные и типы данных.",
    progress: 100,
    totalLessons: 5,
    icon: "Rocket",
    color: "text-arcade-success",
    difficulty: "Легко",
    stars: 3,
    locked: false
  },
  {
    id: 2,
    title: "Условные Ветви",
    description: "If, else и принятие решений.",
    progress: 100,
    totalLessons: 8,
    icon: "Zap",
    color: "text-arcade-action",
    difficulty: "Легко",
    stars: 2,
    locked: false
  },
  {
    id: 3,
    title: "Циклы Хаоса",
    description: "For и While: укроти повторения.",
    progress: 100,
    totalLessons: 10,
    icon: "Ghost",
    color: "text-purple-400",
    difficulty: "Средне",
    stars: 3,
    locked: false
  },
  {
    id: 4,
    title: "Массив Данных",
    description: "Списки и кортежи. Храни всё!",
    progress: 45,
    totalLessons: 12,
    icon: "Layers",
    color: "text-blue-400",
    difficulty: "Средне",
    stars: 0,
    locked: false
  },
  {
    id: 5,
    title: "БОСС: Спагетти-Код",
    description: "Рефакторинг и функции. Победи хаос!",
    progress: 0,
    totalLessons: 1,
    icon: "Skull",
    color: "text-red-500",
    difficulty: "Сложно",
    isBoss: true,
    locked: true
  },
  {
    id: 6,
    title: "Словари Мудрости",
    description: "Ключи, значения и хэш-таблицы.",
    progress: 0,
    totalLessons: 15,
    icon: "Database",
    color: "text-yellow-400",
    difficulty: "Средне",
    locked: true
  },
  {
    id: 7,
    title: "ООП Цитадель",
    description: "Классы и объекты. Построй свой мир.",
    progress: 0,
    totalLessons: 20,
    icon: "Box",
    color: "text-indigo-400",
    difficulty: "Сложно",
    locked: true
  },
  {
    id: 8,
    title: "Финал: ИИ Ядро",
    description: "Создание простой нейросети.",
    progress: 0,
    totalLessons: 25,
    icon: "Cpu",
    color: "text-arcade-mentor",
    difficulty: "Легенда",
    isBoss: true,
    locked: true
  }
];

export const ACTIVITY_DATA = [
  { name: 'Пн', xp: 400 },
  { name: 'Вт', xp: 300 },
  { name: 'Ср', xp: 200 },
  { name: 'Чт', xp: 780 },
  { name: 'Пт', xp: 450 },
  { name: 'Сб', xp: 900 },
  { name: 'Вс', xp: 120 },
];

export const getIcon = (name: string) => {
    switch(name) {
        case 'Rocket': return <Rocket strokeWidth={2.5} />;
        case 'Zap': return <Zap strokeWidth={2.5} />;
        case 'Ghost': return <Ghost strokeWidth={2.5} />;
        case 'Database': return <Database strokeWidth={2.5} />;
        case 'Skull': return <Skull strokeWidth={2.5} />;
        case 'Box': return <Box strokeWidth={2.5} />;
        case 'Layers': return <Layers strokeWidth={2.5} />;
        case 'Cpu': return <Cpu strokeWidth={2.5} />;
        default: return <Gamepad2 strokeWidth={2.5} />;
    }
}