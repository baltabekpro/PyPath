import { Course, User } from './types';
import { Terminal, Database, Cpu, Globe, Code2, LineChart, Gamepad2, Rocket, Ghost, Zap, Skull, Lock, Box, Layers, ShieldAlert, Key } from 'lucide-react';
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
    title: "Глава 1: Взлом Терминала",
    description: "Система защиты ослабла. Инициализируй переменные, чтобы получить доступ к ядру.",
    progress: 100,
    totalLessons: 5,
    icon: "Terminal",
    color: "text-arcade-success",
    difficulty: "Вводная",
    stars: 3,
    locked: false
  },
  {
    id: 2,
    title: "Глава 2: Развилка Судьбы",
    description: "Шлюз требует пароль. Используй условные операторы (if/else), чтобы обойти брандмауэр.",
    progress: 100,
    totalLessons: 8,
    icon: "Key",
    color: "text-arcade-action",
    difficulty: "Легко",
    stars: 2,
    locked: false
  },
  {
    id: 3,
    title: "Глава 3: Петля Времени",
    description: "Ты попал в ловушку. Используй циклы (Loops), чтобы автоматизировать выход.",
    progress: 45,
    totalLessons: 10,
    icon: "Ghost",
    color: "text-purple-400",
    difficulty: "Средне",
    stars: 1,
    locked: false
  },
  {
    id: 4,
    title: "Глава 4: Хранилище Данных",
    description: "Массивы данных повреждены. Структурируй списки, чтобы восстановить память.",
    progress: 0,
    totalLessons: 12,
    icon: "Database",
    color: "text-blue-400",
    difficulty: "Средне",
    stars: 0,
    locked: true
  },
  {
    id: 5,
    title: "БОСС: Спагетти-Монстр",
    description: "Код запутан! Проведи рефакторинг с помощью Функций, чтобы победить хаос.",
    progress: 0,
    totalLessons: 1,
    icon: "Skull",
    color: "text-red-500",
    difficulty: "Босс",
    isBoss: true,
    locked: true
  },
  {
    id: 6,
    title: "Глава 6: Секретные Ключи",
    description: "Словари и Хэш-таблицы. Найди значение по ключу.",
    progress: 0,
    totalLessons: 15,
    icon: "ShieldAlert",
    color: "text-yellow-400",
    difficulty: "Сложно",
    locked: true
  },
  {
    id: 7,
    title: "Глава 7: Цитадель ООП",
    description: "Создай свою армию объектов. Классы и наследование.",
    progress: 0,
    totalLessons: 20,
    icon: "Box",
    color: "text-indigo-400",
    difficulty: "Сложно",
    locked: true
  },
  {
    id: 8,
    title: "ФИНАЛ: Пробуждение ИИ",
    description: "Напиши нейросеть для финальной битвы.",
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
        case 'Terminal': return <Terminal strokeWidth={2.5} />;
        case 'Key': return <Key strokeWidth={2.5} />;
        case 'ShieldAlert': return <ShieldAlert strokeWidth={2.5} />;
        default: return <Gamepad2 strokeWidth={2.5} />;
    }
}