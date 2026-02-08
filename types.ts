export enum View {
  DASHBOARD = 'DASHBOARD',
  COURSES = 'COURSES',
  PRACTICE = 'PRACTICE', // Editor
  AI_CHAT = 'AI_CHAT', // Full screen chat
  PROFILE = 'PROFILE',
  LEADERBOARD = 'LEADERBOARD',
  ACHIEVEMENTS = 'ACHIEVEMENTS',
  SETTINGS = 'SETTINGS'
}

export interface User {
  name: string;
  level: string;
  levelNum: number;
  xp: number;
  streak: number;
  rank: number;
  avatar: string;
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
  stars?: number;     // 0-3 stars for completed levels
  isBoss?: boolean;   // Marks a boss level
  locked?: boolean;   // Explicit lock status
}