import { Course, User } from './types';
import { Terminal, Database, Cpu, Globe, Code2, LineChart, Gamepad2, Rocket, Ghost, Zap, Skull, Lock, Box, Layers, ShieldAlert, Key, Flame, Bug, Gift, LockKeyhole, Target, Sword, Crown, AlertCircle, Search, Sparkles, LayoutGrid, Map, Code, Bot, User as UserIcon, Trophy, Bell, CreditCard, Shield } from 'lucide-react';
import React from 'react';
import DB from './backend/data/db.json';
import { apiGet } from './api';

let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

// Export Data from JSON
export let CURRENT_USER: User = DB.currentUser as unknown as User;
export let STATS = DB.stats;
export let ACTIVITY_DATA = DB.activity;
export let SKILLS = DB.skills;
export let COURSES: Course[] = DB.courses as unknown as Course[];
export let LEADERBOARD = DB.leaderboard;
export let FRIENDS = DB.friends;
export let POSTS = DB.posts;
export let ACHIEVEMENTS = DB.achievements;
export let MISSIONS = DB.missions;
export let LOGS = DB.logs;
export let UI_DATA = DB.uiData as any;
export let SIDEBAR_NAV_ITEMS = UI_DATA?.sidebarNavItems ?? [];
export let SETTINGS_UI = UI_DATA?.settings ?? {};
export let PROFILE_UI = UI_DATA?.profile ?? {};
export let COMMUNITY_UI = UI_DATA?.community ?? {};
export let DASHBOARD_UI = UI_DATA?.dashboard ?? {};
export let APP_UI = UI_DATA?.app ?? {};
export let AI_CHAT_DATA = UI_DATA?.aiChat ?? {};
export let AI_CHAT_PAGE_DATA = UI_DATA?.aiChatPage ?? {};
export let EDITOR_UI = UI_DATA?.editor ?? {};
export let UI_TEXTS = UI_DATA?.texts ?? {};

const safeFetchJson = async <T,>(path: string): Promise<T | null> => {
    try {
        return await apiGet<T>(path);
    } catch {
        return null;
    }
};

const applyUiData = (uiData: any) => {
    UI_DATA = uiData;
    SIDEBAR_NAV_ITEMS = UI_DATA?.sidebarNavItems ?? [];
    SETTINGS_UI = UI_DATA?.settings ?? {};
    PROFILE_UI = UI_DATA?.profile ?? {};
    COMMUNITY_UI = UI_DATA?.community ?? {};
    DASHBOARD_UI = UI_DATA?.dashboard ?? {};
    APP_UI = UI_DATA?.app ?? {};
    AI_CHAT_DATA = UI_DATA?.aiChat ?? {};
    AI_CHAT_PAGE_DATA = UI_DATA?.aiChatPage ?? {};
    EDITOR_UI = UI_DATA?.editor ?? {};
    UI_TEXTS = UI_DATA?.texts ?? {};
};

export const initializeAppData = async (): Promise<void> => {
    if (isInitialized) {
        return;
    }
    if (initializationPromise) {
        return initializationPromise;
    }

    initializationPromise = (async () => {
        const [
            currentUser,
            stats,
            activity,
            skills,
            courses,
            leaderboard,
            friends,
            posts,
            achievements,
            missions,
            logs,
            uiData,
        ] = await Promise.all([
            safeFetchJson<User>('/currentUser'),
            safeFetchJson<any>('/stats'),
            safeFetchJson<any[]>('/activity'),
            safeFetchJson<any[]>('/skills'),
            safeFetchJson<Course[]>('/courses'),
            safeFetchJson<any[]>('/leaderboard'),
            safeFetchJson<any[]>('/friends'),
            safeFetchJson<any[]>('/posts'),
            safeFetchJson<any[]>('/achievements'),
            safeFetchJson<any[]>('/missions'),
            safeFetchJson<any[]>('/logs'),
            safeFetchJson<any>('/uiData'),
        ]);

        if (currentUser) CURRENT_USER = currentUser;
        if (stats) STATS = stats;
        if (activity) ACTIVITY_DATA = activity;
        if (skills) SKILLS = skills;
        if (courses) COURSES = courses;
        if (leaderboard) LEADERBOARD = leaderboard;
        if (friends) FRIENDS = friends;
        if (posts) POSTS = posts;
        if (achievements) ACHIEVEMENTS = achievements;
        if (missions) MISSIONS = missions;
        if (logs) LOGS = logs;
        if (uiData) applyUiData(uiData);

        isInitialized = true;
    })().finally(() => {
        initializationPromise = null;
    });

    return initializationPromise;
};

// Helper to get React Component for Icon name
export const getIcon = (name: string, props: any = {}) => {
    const iconProps = { strokeWidth: 2.5, ...props };
    
    switch(name) {
        // Course Icons
        case 'Rocket': return <Rocket {...iconProps} />;
        case 'Zap': return <Zap {...iconProps} />;
        case 'Ghost': return <Ghost {...iconProps} />;
        case 'Database': return <Database {...iconProps} />;
        case 'Skull': return <Skull {...iconProps} />;
        case 'Box': return <Box {...iconProps} />;
        case 'Layers': return <Layers {...iconProps} />;
        case 'Cpu': return <Cpu {...iconProps} />;
        case 'Terminal': return <Terminal {...iconProps} />;
        case 'Key': return <Key {...iconProps} />;
        case 'ShieldAlert': return <ShieldAlert {...iconProps} />;
        
        // Achievement Icons
        case 'Code2': return <Code2 {...iconProps} />;
        case 'Sword': return <Sword {...iconProps} />;
        case 'Flame': return <Flame {...iconProps} />;
        case 'Bug': return <Bug {...iconProps} />;
        case 'Crown': return <Crown {...iconProps} />;
        case 'Gift': return <Gift {...iconProps} />;
        case 'LockKeyhole': return <LockKeyhole {...iconProps} />;
        case 'Target': return <Target {...iconProps} />;
        case 'AlertCircle': return <AlertCircle {...iconProps} />;
        case 'Search': return <Search {...iconProps} />;
        case 'Sparkles': return <Sparkles {...iconProps} />;
        case 'LayoutGrid': return <LayoutGrid {...iconProps} />;
        case 'Map': return <Map {...iconProps} />;
        case 'Code': return <Code {...iconProps} />;
        case 'Bot': return <Bot {...iconProps} />;
        case 'User': return <UserIcon {...iconProps} />;
        case 'Trophy': return <Trophy {...iconProps} />;
        case 'Bell': return <Bell {...iconProps} />;
        case 'CreditCard': return <CreditCard {...iconProps} />;
        case 'Shield': return <Shield {...iconProps} />;
        
        default: return <Gamepad2 {...iconProps} />;
    }
}

// Helper to get the Component type itself (for when you need to pass it as a prop or style it heavily)
export const getIconComponent = (name: string) => {
    switch(name) {
        case 'Rocket': return Rocket;
        case 'Zap': return Zap;
        case 'Ghost': return Ghost;
        case 'Database': return Database;
        case 'Skull': return Skull;
        case 'Box': return Box;
        case 'Layers': return Layers;
        case 'Cpu': return Cpu;
        case 'Terminal': return Terminal;
        case 'Key': return Key;
        case 'ShieldAlert': return ShieldAlert;
        case 'Code2': return Code2;
        case 'Sword': return Sword;
        case 'Flame': return Flame;
        case 'Bug': return Bug;
        case 'Crown': return Crown;
        case 'Gift': return Gift;
        case 'LockKeyhole': return LockKeyhole;
        case 'Target': return Target;
        case 'AlertCircle': return AlertCircle;
        case 'Search': return Search;
        case 'Sparkles': return Sparkles;
        case 'LayoutGrid': return LayoutGrid;
        case 'Map': return Map;
        case 'Code': return Code;
        case 'Bot': return Bot;
        case 'User': return UserIcon;
        case 'Trophy': return Trophy;
        case 'Bell': return Bell;
        case 'CreditCard': return CreditCard;
        case 'Shield': return Shield;
        default: return Gamepad2;
    }
}