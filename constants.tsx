import { Course, User } from './types';
import { Terminal, Database, Cpu, Globe, Code2, LineChart, Gamepad2, Rocket, Ghost, Zap, Skull, Lock, Box, Layers, ShieldAlert, Key, Flame, Bug, Gift, LockKeyhole, Target, Sword, Crown } from 'lucide-react';
import React from 'react';
import DB from './db.json';

// Export Data from JSON
export const CURRENT_USER: User = DB.currentUser as unknown as User;
export const STATS = DB.stats;
export const ACTIVITY_DATA = DB.activity;
export const SKILLS = DB.skills;
export const COURSES: Course[] = DB.courses;
export const LEADERBOARD = DB.leaderboard;
export const FRIENDS = DB.friends;
export const POSTS = DB.posts;
export const ACHIEVEMENTS = DB.achievements;
export const MISSIONS = DB.missions;
export const LOGS = DB.logs;

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
        default: return Gamepad2;
    }
}