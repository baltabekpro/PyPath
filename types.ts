export enum View {
  DASHBOARD = 'DASHBOARD',
  COURSES = 'COURSES',
  COURSE_JOURNEY = 'COURSE_JOURNEY',
  SIMPLE_LEARNING = 'SIMPLE_LEARNING', // Simplified learning interface
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
  username?: string;
  role?: string;
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
    role?: string;
    is_admin?: boolean;
  };
}

export interface Course {
  id: number;
  title: string;
  description: string;
  gradeBand?: 'pre' | '8' | '9' | 'common';
  section?: string;
  progress: number;
  totalLessons: number;
  icon: string;
  color: string;
  difficulty: string;
  stars: number;
  isBoss: boolean;
  locked: boolean;
  season?: number;
  status?: 'locked' | 'in_progress' | 'completed';
  completedLessons?: number;
  nextCourseId?: number | null;
  unlockRequirement?: string;
  seasonUnlocked?: boolean;
  seasonCompleted?: boolean;
  currentSeason?: number;
}