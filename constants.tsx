import { Course, User } from './types';
import { Terminal, Database, Cpu, Globe, Code2, LineChart } from 'lucide-react';
import React from 'react';

export const CURRENT_USER: User = {
  name: "Алексей П.",
  level: "Младший Профи",
  levelNum: 14,
  xp: 12450,
  streak: 12,
  rank: 42,
  avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d"
};

export const COURSES: Course[] = [
  {
    id: 1,
    title: "Асинхронность в Python",
    description: "Освойте asyncio, await и конкурентное программирование.",
    progress: 45,
    totalLessons: 20,
    icon: "Cpu",
    color: "text-blue-400",
    difficulty: "Средний"
  },
  {
    id: 2,
    title: "PostgreSQL и SQLAlchemy",
    description: "Проектирование баз данных и мастерство ORM.",
    progress: 82,
    totalLessons: 32,
    icon: "Database",
    color: "text-orange-400",
    difficulty: "Сложный"
  },
  {
    id: 3,
    title: "Веб-скрапинг 101",
    description: "Извлечение данных из веба с помощью BeautifulSoup.",
    progress: 10,
    totalLessons: 15,
    icon: "Globe",
    color: "text-purple-400",
    difficulty: "Новичок"
  },
  {
    id: 4,
    title: "Введение в Data Science",
    description: "Pandas, NumPy и визуализация данных.",
    progress: 0,
    totalLessons: 40,
    icon: "LineChart",
    color: "text-red-400",
    difficulty: "Средний"
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
        case 'Cpu': return <Cpu />;
        case 'Database': return <Database />;
        case 'Globe': return <Globe />;
        case 'LineChart': return <LineChart />;
        default: return <Code2 />;
    }
}