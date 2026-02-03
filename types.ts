export enum View {
  DASHBOARD = 'DASHBOARD',
  COURSES = 'COURSES',
  PRACTICE = 'PRACTICE', // Editor
  COMMUNITY = 'COMMUNITY',
  PROFILE = 'PROFILE',
  LEADERBOARD = 'LEADERBOARD',
  ACHIEVEMENTS = 'ACHIEVEMENTS'
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
  icon: string;
  color: string;
  difficulty: string;
}