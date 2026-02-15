export enum View {
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  DASHBOARD = 'DASHBOARD',
  COURSES = 'COURSES',
  PRACTICE = 'PRACTICE', // Editor
  AI_CHAT = 'AI_CHAT', // Full screen chat
  PROFILE = 'PROFILE',
  LEADERBOARD = 'LEADERBOARD',
  ACHIEVEMENTS = 'ACHIEVEMENTS',
  SETTINGS = 'SETTINGS',
  ADMIN = 'ADMIN'
}

export interface User {
  id?: string;
  name: string;
  email?: string;
  fullName?: string;
  level: string;
  levelNum: number;
  xp: number;
  maxXp?: number;
  streak: number;
  rank: number;
  avatar: string;
  bio?: string;
  league?: string;
  settings?: {
    theme: string;
    notifications: boolean;
    sound: boolean;
  };
}

export interface Course {
  id: number;
  title: string;
  description: string;
  progress: number;
  totalLessons: number;
  icon: string;
  color: string;
  difficulty: string;
  stars: number;
  isBoss: boolean;
  locked: boolean;
}