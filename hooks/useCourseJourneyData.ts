import { useEffect, useMemo, useState } from 'react';
import { apiGet, apiPut } from '../api';

export type GradeTab = 'pre' | '8' | '9';

export type JourneyTopic = {
  id: string;
  section: string;
  title: string;
  grade: GradeTab;
  theory: string;
  practices: string[];
};

export type TopicProgress = {
  theoryOpened: boolean;
  completedPractices: number[];
};

export type ProgressMap = Record<string, TopicProgress>;

const STORAGE_KEY_V2 = 'courseJourneyProgressV2';
const STORAGE_KEY_V1 = 'courseJourneyProgressV1';

const sanitizeProgress = (raw: unknown): ProgressMap => {
  if (!raw || typeof raw !== 'object') return {};
  const parsed = raw as Record<string, any>;
  const sanitized: ProgressMap = {};

  for (const [topicId, value] of Object.entries(parsed)) {
    if (!value || typeof value !== 'object') continue;
    const completedRaw = Array.isArray(value.completedPractices) ? value.completedPractices : [];
    const completed: number[] = Array.from(
      new Set<number>(
        completedRaw
          .map((item: unknown) => Number(item))
          .filter((item: number) => Number.isInteger(item) && item >= 0),
      ),
    ).sort((a: number, b: number) => a - b);

    sanitized[String(topicId)] = {
      theoryOpened: Boolean(value.theoryOpened),
      completedPractices: completed,
    };
  }

  return sanitized;
};

const loadLocalProgress = (): ProgressMap => {
  try {
    const v2 = localStorage.getItem(STORAGE_KEY_V2);
    if (v2) return sanitizeProgress(JSON.parse(v2));

    const v1 = localStorage.getItem(STORAGE_KEY_V1);
    if (v1) {
      const migrated = sanitizeProgress(JSON.parse(v1));
      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(migrated));
      return migrated;
    }
  } catch {
  }

  return {};
};

const saveLocalProgress = (progress: ProgressMap) => {
  localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(progress));
};

export const useCourseJourneyData = (fallbackTopics: JourneyTopic[], texts: {
  saving: string;
  saved: string;
  syncLater: string;
  syncFail: string;
}, isKz: boolean) => {
  const translateRuToKz = (input: string): string => {
    const exact: Record<string, string> = {
      'Первые шаги': 'Алғашқы қадамдар',
      'Переменные и числа': 'Айнымалылар және сандар',
      'Условия if': 'if шарттары',
      'Циклы for': 'for циклдері',
      'Функции': 'Функциялар',
      'Мини-игра': 'Мини-жоба',
      'Тестовый курс': 'Тест курсы',
      'Пробуждение ИИ': 'ИИ оянуы',
      'Подготовка к 8/9': '8/9 сыныпқа дайындық',
      'Общий модуль': 'Жалпы модуль',
      '8 класс': '8 сынып',
      '9 класс': '9 сынып',
      'основы': 'негіздер',
      'циклы': 'циклдер',
      'функции': 'функциялар',
      'коллекции': 'коллекциялар',
      'Практика': 'Практика',
      'Теория': 'Теория',
      'Глава': 'Тарау',
    };
    if (exact[input]) return exact[input];
    let value = input;
    for (const [ru, kz] of Object.entries(exact)) {
      value = value.replaceAll(ru, kz);
    }

    const chapter = value.match(/^Глава\s*(\d+)\s*:\s*(.+)$/i);
    if (chapter) {
      value = `Тарау ${chapter[1]}: ${chapter[2]}`;
    }
    return value;
  };

  const localizeTopic = (topic: JourneyTopic): JourneyTopic => {
    if (!isKz) return topic;
    return {
      ...topic,
      section: translateRuToKz(String(topic.section || '')),
      title: translateRuToKz(String(topic.title || '')),
      theory: translateRuToKz(String(topic.theory || '')),
      practices: Array.isArray(topic.practices) ? topic.practices.map((item) => translateRuToKz(String(item))) : [],
    };
  };

  const [topicsData, setTopicsData] = useState<JourneyTopic[]>(() => fallbackTopics);
  const [progress, setProgress] = useState<ProgressMap>(loadLocalProgress);
  const [isSaving, setIsSaving] = useState(false);
  const [saveNote, setSaveNote] = useState('');

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const [topicsResult, progressResult] = await Promise.allSettled([
        apiGet<JourneyTopic[]>('/courses/journey'),
        apiGet<ProgressMap>('/courses/journey/progress'),
      ]);

      if (!mounted) return;

      if (topicsResult.status === 'fulfilled' && Array.isArray(topicsResult.value) && topicsResult.value.length > 0) {
        const fallbackById = new Map(fallbackTopics.map((topic) => [topic.id, topic]));
        const localizedTopics = topicsResult.value.map((topic) => {
          const localized = fallbackById.get(topic.id);
          if (!localized) return localizeTopic(topic);
          return {
            ...localizeTopic(topic),
            section: isKz ? localized.section : topic.section,
            title: isKz ? localized.title : topic.title,
            theory: isKz ? localized.theory : topic.theory,
            practices: isKz ? localized.practices : topic.practices,
          };
        });
        setTopicsData(localizedTopics);
      } else {
        setTopicsData((prev) => (prev.length > 0 ? prev : fallbackTopics));
      }

      if (progressResult.status === 'fulfilled' && progressResult.value && typeof progressResult.value === 'object') {
        const sanitized = sanitizeProgress(progressResult.value);
        setProgress(sanitized);
        saveLocalProgress(sanitized);
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [fallbackTopics, isKz]);

  useEffect(() => {
    if (!saveNote) return;
    const timer = window.setTimeout(() => setSaveNote(''), 2800);
    return () => window.clearTimeout(timer);
  }, [saveNote]);

  const persistTopicProgress = async (topicId: string, topicState: TopicProgress) => {
    try {
      setIsSaving(true);
      setSaveNote(texts.saving);
      const synced = await Promise.race<ProgressMap | null>([
        apiPut<ProgressMap>('/courses/journey/progress', {
          topicId,
          progress: topicState,
        }),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 3500)),
      ]);

      if (synced && typeof synced === 'object') {
        const sanitized = sanitizeProgress(synced);
        setProgress(sanitized);
        saveLocalProgress(sanitized);
        setSaveNote(texts.saved);
      } else {
        setSaveNote(texts.syncLater);
      }
    } catch {
      setSaveNote(texts.syncFail);
    } finally {
      setIsSaving(false);
    }
  };

  const upsertTopicProgress = (topicId: string, producer: (current: TopicProgress) => TopicProgress) => {
    const current = progress[topicId] || { theoryOpened: false, completedPractices: [] };
    const nextTopicState = producer(current);
    const nextProgress = {
      ...progress,
      [topicId]: nextTopicState,
    };

    setProgress(nextProgress);
    saveLocalProgress(nextProgress);
    void persistTopicProgress(topicId, nextTopicState);
  };

  const topicsByGrade = useMemo(() => {
    return {
      pre: topicsData.filter((item) => item.grade === 'pre'),
      '8': topicsData.filter((item) => item.grade === '8'),
      '9': topicsData.filter((item) => item.grade === '9'),
    } as Record<GradeTab, JourneyTopic[]>;
  }, [topicsData]);

  return {
    topicsData,
    topicsByGrade,
    progress,
    isSaving,
    saveNote,
    upsertTopicProgress,
  };
};
