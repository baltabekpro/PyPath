import { Course, User } from './types';
import { Terminal, Database, Cpu, Code2, Gamepad2, Rocket, Ghost, Zap, Skull, Box, Layers, ShieldAlert, Key, Flame, Bug, Gift, LockKeyhole, Target, Sword, Crown, AlertCircle, Search, Sparkles, LayoutGrid, Map, Code, Bot, User as UserIcon, Trophy, Bell, CreditCard, Shield } from 'lucide-react';
import { apiGet } from './api';

let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

const DEFAULT_UI_DATA = {
    sidebarNavItems: [],
    texts: {},
    editor: {},
};

export type AppLanguage = 'ru' | 'kz';
const LANGUAGE_STORAGE_KEY = 'app-language';

const isLanguage = (value: string | null): value is AppLanguage => value === 'ru' || value === 'kz';

const getInitialLanguage = (): AppLanguage => {
    if (typeof window === 'undefined') return 'ru';
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return isLanguage(stored) ? stored : 'ru';
};

export let APP_LANGUAGE: AppLanguage = getInitialLanguage();

const VIEW_LABELS_KZ: Record<string, string> = {
    DASHBOARD: 'Басты бет',
    COURSES: 'Курстар',
    COURSE_JOURNEY: 'Оқу',
    SIMPLE_LEARNING: 'Практика',
    AI_CHAT: 'Оракул',
    PROFILE: 'Профиль',
    LEADERBOARD: 'Рейтинг',
    ACHIEVEMENTS: 'Жетістіктер',
    SETTINGS: 'Баптаулар',
    ADMIN: 'Әкімдік',
};

const KZ_TEXT_OVERRIDES = {
    sidebar: {
        logoLine1: 'Py',
        logoLine2: 'Path',
    },
    header: {
        xpLabel: 'XP',
        logout: 'Шығу',
        langRu: 'RU',
        langKz: 'KZ',
    },
    app: {
        notificationsTitle: 'Хабарламалар',
        markAllRead: 'Барлығын оқылған деп белгілеу',
        notificationsNew: 'Жаңа',
        notificationsHistory: 'Тарих',
        notificationsEmpty: 'Жаңа хабарлама жоқ',
        loggedOut: 'Аккаунттан шықтыңыз',
        noAdminAccess: 'Әкім панеліне кіруге құқық жеткіліксіз',
        loadingData: 'Деректер жүктелуде...',
        loadingAdmin: 'Әкім панелі жүктелуде...',
        welcomePrefix: 'Қош келдіңіз',
        langChangedRu: 'Орыс тілі қосылды',
        langChangedKz: 'Қазақ тілі қосылды',
    },
    courses: {
        backToLobby: 'Артқа',
        mapTitle: 'Курстар картасы',
        season: 'Оқу маусымы',
        currentLevel: 'Ағымдағы деңгей',
        bossLabel: 'БОСС',
        chapterPrefix: 'Тарау',
        briefing: 'Брифинг',
        difficulty: 'Қиындық',
        acceptMission: 'Миссияны бастау',
    },
    dashboard: {
        baseTitle: 'Сіздің оқу аймағыңыз',
        streakLabel: 'Серия',
        currentMission: 'Ағымдағы миссия',
        progress: 'Прогресс',
        start: 'Бастау',
        dailyQuests: 'Күнделікті тапсырмалар',
        details: 'Толығырақ',
        statsTotalXp: 'Жалпы XP',
        statsSolved: 'Шешілген есептер',
        statsTime: 'Код уақыты',
        hoursSuffix: 'с',
        blitzTitle: 'Жылдам бастау',
        blitzStart: 'Оқуды ашу',
    },
    settings: {
        title: 'Баптаулар',
        save: 'Сақтау',
        saving: 'Сақталуда...',
        saved: 'Сақталды',
        chooseAvatar: 'Аватарды таңдаңыз',
        nickname: 'Никнейм',
        about: 'Өзіңіз туралы',
        charsLeft: 'Қалған таңба',
        notificationsTitle: 'Хабарлама баптаулары',
    },
    profile: {
        edit: 'Өңдеу',
        defaultBio: 'Python әлеміндегі жаңа саяхатшы',
        toastShared: 'Профиль сілтемесі бөлісілді',
    },
    editor: {
        missionTab: 'Тапсырма',
        filesTab: 'Файлдар',
        goalsTitle: 'Мақсаттар',
        knowledgeBaseTitle: 'Теория',
        expectedOutputLabel: 'Күтілетін нәтиже',
        commonErrorsTitle: 'Жиі қателер',
        miniCheckTitle: 'Мини-тексеру',
        askMentor: 'Тәлімгерден сұрау',
        run: 'Іске қосу',
        terminalTitle: 'Терминал',
        successTitle: 'Тапсырма орындалды!',
        successXp: '+XP қосылды',
        botMessages: {
            initial: 'Мен қасыңдамын. Келесі қадамды айта аламын 👋',
            running: 'Код пен орындау нәтижесін тексеріп жатырмын…',
            success: 'Керемет! Барлығы дұрыс ✅',
            error: 'Аздаған қате бар. Бірге түзетейік.',
        },
    },
    achievements: {
        collectorRank: 'Жинаушы дәрежесі',
        collectedPrefix: 'Жиналды',
        collectedMiddle: '/',
        collectedSuffix: 'жетістік',
        pointsLabel: 'ҰПАЙ',
        rareLabel: 'СИРЕК',
        legendaryLabel: 'АҢЫЗ',
        share: 'Бөлісу',
        locked: 'Жабық',
        secretMask: 'Құпия жетістік',
        secretTitle: 'Құпия жетістік',
        secretDescription: 'Бұл жетістік шарт орындалғанда ашылады.',
        owners: 'ИЕЛЕРІ',
        reward: 'СЫЙАҚЫ',
        rarity: {
            common: 'Кәдімгі',
            rare: 'Сирек',
            epic: 'Эпик',
            legendary: 'Аңыз',
        },
        filters: [
            { id: 'all', label: 'Барлығы' },
            { id: 'coding', label: 'Код' },
            { id: 'community', label: 'Қауымдастық' },
            { id: 'streak', label: 'Серия' },
            { id: 'secret', label: 'Құпия' },
        ],
        ranks: [
            { min: 0, label: 'Бастаушы' },
            { min: 25, label: 'Іздеуші' },
            { min: 50, label: 'Шебер' },
            { min: 75, label: 'Аңыз' },
        ],
        stats: {
            points: 0,
            rare: 0,
            legendary: 0,
        },
    },
    leaderboard: {
        titlePrefix: 'Ең үздік',
        titleHighlight: 'ойыншылар',
        season: 'Маусымдық рейтинг',
        youBadge: 'Сіз',
        currentUserSubtitle: 'Сіздің ағымдағы нәтижеңіз',
        nextRank: 'Келесі дәреже',
        scopes: {
            global: 'Әлем',
        },
        periods: {
            all: 'Барлығы',
        },
    },
    community: {
        title: 'Қауымдастық',
        subtitle: 'Оқушылармен сөйлесіп, кодпен бөлісіңіз',
        newPost: 'Жаңа жазба',
        createPostPlaceholder: 'Не үйреніп жатырсыз?',
        preview: 'Алдын ала қарау',
        popular: 'Танымал',
        fresh: 'Жаңа',
        filters: 'Сүзгілер',
        levelPrefix: 'Деңгей',
        share: 'Бөлісу',
        searchPlaceholder: 'Жазбаларды іздеу...',
        tagsTitle: 'Тренд тегтер',
        topContributorsTitle: 'Үздік қатысушылар',
        reputationSuffix: 'бедел',
    },
    aiChat: {
        oracleBadge: 'AI Көмекші',
        title: 'Оракул',
        statusLabel: 'Желіде',
        inputPlaceholder: 'Сұрағыңызды жазыңыз...',
    },
    aiChatPage: {
        neuralHistory: 'ЧАТ ТАРИХЫ',
        systemUptimeLabel: 'ЖҮЙЕ УАҚЫТЫ',
        systemUptime: 'Тұрақты',
        syncCenter: 'СИНХРОНДАУ ОРТАЛЫҒЫ',
        processing: 'Өңделуде',
        ready: 'Дайын',
        version: 'v1.0',
        mentorActivated: 'Тәлімгер іске қосылды',
        responseOutput: 'Жауап',
        inputPlaceholder: 'Оракулға сұрақ қойыңыз...',
        safeNotice: 'Қауіпсіз режим қосулы',
    },
};

// API-first app state (no frontend mock dataset)
export let CURRENT_USER: User = {
    name: 'Пользователь',
    email: '',
    fullName: '',
    level: 'Новичок',
    levelNum: 1,
    xp: 0,
    maxXp: 100,
    streak: 0,
    rank: 0,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PyPath',
    bio: '',
    league: 'Bronze',
    settings: {
        theme: 'dark',
        notifications: true,
        sound: true,
    },
};
export let STATS = { totalXp: 0, problemsSolved: 0, codingHours: 0, accuracy: 0 };
export let ACTIVITY_DATA: any[] = [];
export let SKILLS: any[] = [];
export let COURSES: Course[] = [];
export let LEADERBOARD: any[] = [];
export let FRIENDS: any[] = [];
export let POSTS: any[] = [];
export let ACHIEVEMENTS: any[] = [];
export let MISSIONS: any[] = [];
export let LOGS: any[] = [];
export let UI_DATA: any = DEFAULT_UI_DATA;
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
let RAW_UI_DATA: any = DEFAULT_UI_DATA;

const isObject = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const deepMerge = <T extends Record<string, any>>(base: T, override: Record<string, any>): T => {
    const output: Record<string, any> = { ...base };
    for (const [key, value] of Object.entries(override)) {
        const current = output[key];
        if (isObject(current) && isObject(value)) {
            output[key] = deepMerge(current, value);
        } else {
            output[key] = value;
        }
    }
    return output as T;
};

const localizeTexts = (texts: any) => {
    const base = isObject(texts) ? texts : {};
    return APP_LANGUAGE === 'kz' ? deepMerge(base, KZ_TEXT_OVERRIDES) : base;
};

const localizeSidebarNavItems = (items: any[]) => {
    if (!Array.isArray(items)) return [];
    if (APP_LANGUAGE !== 'kz') return items;
    return items.map((item: any) => {
        const translatedLabel = VIEW_LABELS_KZ[String(item?.view || '')];
        if (!translatedLabel) return item;
        return { ...item, label: translatedLabel };
    });
};

const refreshLocalizedUi = () => {
    const source = { ...DEFAULT_UI_DATA, ...(RAW_UI_DATA || {}) };
    UI_DATA = {
        ...source,
        sidebarNavItems: localizeSidebarNavItems(source?.sidebarNavItems ?? []),
        texts: localizeTexts(source?.texts),
    };
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

export const setAppLanguage = (language: AppLanguage) => {
    APP_LANGUAGE = language;
    if (typeof window !== 'undefined') {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    }
    refreshLocalizedUi();
};

const safeFetchJson = async <T,>(path: string): Promise<T | null> => {
    try {
        return await apiGet<T>(path);
    } catch {
        return null;
    }
};

const normalizeLegacyUiData = (uiData: any) => {
    if (!isObject(uiData)) return uiData;
    const normalized = { ...uiData };

    if (Array.isArray(normalized.sidebarNavItems)) {
        normalized.sidebarNavItems = normalized.sidebarNavItems
            .map((item: any) => {
                if (!isObject(item)) return item;
                const currentView = String(item.view);
                if (currentView !== 'PRACTICE' && currentView !== 'SIMPLE_LEARNING') return item;
                return {
                    ...item,
                    view: 'COURSE_JOURNEY',
                    label: APP_LANGUAGE === 'kz' ? 'Оқу' : 'Обучение',
                };
            })
            .filter((item: any, index: number, list: any[]) => {
                const view = String(item?.view || '');
                return list.findIndex((candidate: any) => String(candidate?.view || '') === view) === index;
            });
    }

    const dashboardText = normalized?.texts?.dashboard;
    if (isObject(dashboardText)) {
        const blitzStart = String(dashboardText.blitzStart || '');
        if (/арена/i.test(blitzStart)) {
            dashboardText.blitzStart = APP_LANGUAGE === 'kz' ? 'Оқуды ашу' : 'Открыть обучение';
        }
    }

    return normalized;
};

const applyUiData = (uiData: any) => {
    RAW_UI_DATA = { ...DEFAULT_UI_DATA, ...(normalizeLegacyUiData(uiData) || {}) };
    refreshLocalizedUi();
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
        if (uiData && typeof uiData === 'object' && Object.keys(uiData).length > 0) {
            applyUiData(uiData);
        }

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