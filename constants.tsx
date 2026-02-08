import { Course, User } from './types';
import { Terminal, Database, Cpu, Globe, Code2, LineChart, Gamepad2, Rocket, Ghost, Zap } from 'lucide-react';
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
    title: "Основы Магии Python",
    description: "Научись управлять переменными и заклинаниями print().",
    progress: 100,
    totalLessons: 10,
    icon: "Rocket",
    color: "text-arcade-success",
    difficulty: "Изи"
  },
  {
    id: 2,
    title: "Петли Времени",
    description: "Освой циклы for и while, чтобы не повторяться.",
    progress: 45,
    totalLessons: 12,
    icon: "Zap",
    color: "text-arcade-action",
    difficulty: "Норм"
  },
  {
    id: 3,
    title: "Функции-Помощники",
    description: "Создавай своих мини-ботов для рутинных задач.",
    progress: 0,
    totalLessons: 15,
    icon: "Ghost",
    color: "text-arcade-primary",
    difficulty: "Сложно"
  },
  {
    id: 4,
    title: "Данные и Драконы",
    description: "Списки, словари и как в них не потеряться.",
    progress: 0,
    totalLessons: 20,
    icon: "Database",
    color: "text-arcade-danger",
    difficulty: "Босс"
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
        default: return <Gamepad2 strokeWidth={2.5} />;
    }
}