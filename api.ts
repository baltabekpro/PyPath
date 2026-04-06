const envApiBaseUrl = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
const isVercelHost = typeof window !== 'undefined' && window.location.hostname.endsWith('vercel.app');
const API_BASE_URL = isVercelHost ? '/api' : (envApiBaseUrl || 'http://localhost:8000');

const buildUrl = (path: string) => `${API_BASE_URL}${path}`;
const getAppLanguage = () => {
  if (typeof window === 'undefined') return 'ru';
  return localStorage.getItem('app-language') || 'ru';
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const initHeaders = init?.headers;
  if (initHeaders instanceof Headers) {
    initHeaders.forEach((value, key) => {
      headers[key] = value;
    });
  } else if (Array.isArray(initHeaders)) {
    for (const [key, value] of initHeaders) {
      headers[key] = value;
    }
  } else if (initHeaders) {
    Object.assign(headers, initHeaders as Record<string, string>);
  }

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  headers['X-App-Language'] = getAppLanguage();

  const response = await fetch(buildUrl(path), {
    ...init,
    headers,
  });

  if (!response.ok) {
    let message = `API request failed: ${response.status}`;
    try {
      const raw = await response.text();
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          const detail = parsed?.detail || parsed?.message;
          if (typeof detail === 'string' && detail.trim()) {
            message = detail;
          } else {
            message = raw;
          }
        } catch {
          message = raw;
        }
      }
    } catch {
    }

    const error = new Error(message) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  return response.json() as Promise<T>;
}

async function requestStream(path: string, init?: RequestInit, onChunk?: (chunk: string) => void): Promise<string> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const initHeaders = init?.headers;
  if (initHeaders instanceof Headers) {
    initHeaders.forEach((value, key) => {
      headers[key] = value;
    });
  } else if (Array.isArray(initHeaders)) {
    for (const [key, value] of initHeaders) {
      headers[key] = value;
    }
  } else if (initHeaders) {
    Object.assign(headers, initHeaders as Record<string, string>);
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  headers['X-App-Language'] = getAppLanguage();

  const response = await fetch(buildUrl(path), {
    ...init,
    headers,
  });

  if (!response.ok) {
    let message = `API request failed: ${response.status}`;
    try {
      const raw = await response.text();
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          const detail = parsed?.detail || parsed?.message;
          if (typeof detail === 'string' && detail.trim()) {
            message = detail;
          } else {
            message = raw;
          }
        } catch {
          message = raw;
        }
      }
    } catch {
    }

    const error = new Error(message) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  if (!response.body) {
    return '';
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    if (chunk) {
      fullText += chunk;
      onChunk?.(chunk);
    }
  }

  const tail = decoder.decode();
  if (tail) {
    fullText += tail;
    onChunk?.(tail);
  }

  return fullText;
}

export const apiGet = <T,>(path: string) => request<T>(path, { method: 'GET' });

export const apiPost = <T,>(path: string, body?: unknown) =>
  request<T>(path, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });

export const apiPut = <T,>(path: string, body?: unknown) =>
  request<T>(path, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });

export const apiDelete = <T,>(path: string) =>
  request<T>(path, {
    method: 'DELETE',
  });

export interface NotificationItem {
  id: string;
  time: string;
  text: string;
  read: boolean;
}

export interface NotificationPreference {
  label: string;
  enabled: boolean;
}

export interface NotificationResponse {
  items: NotificationItem[];
  unread: NotificationItem[];
  history: NotificationItem[];
  preferences: NotificationPreference[];
}

// AI Chat API
export interface ChatMessageRequest {
  message: string;
  user_id?: string;
  chat_id?: string;
  language?: string;
}

export interface ChatResponse {
  response: string;
  timestamp: string;
}

export interface ScaffoldedChatResponse {
  response: string;
  timestamp: string;
  scaffolding_applied: boolean;
  request_type: string;
  rules_applied: string[];
  validation_passed: boolean;
}

export interface AIChatContext {
  screen?: string;
  page?: string;
  courseId?: number;
  courseTitle?: string;
  courseSection?: string;
  gradeBand?: string;
  courseStatus?: string;
  theoryOpened?: boolean;
  practiceIndex?: number;
  practiceName?: string;
  completedPractices?: number;
  totalPractices?: number;
  quizCompleted?: boolean;
  lastValidation?: {
    success?: boolean;
    message?: string;
    failedChecks?: string[];
  };
  lastError?: string;
  codeSnippet?: string;
}

export interface QuickActionRequest {
  action_type: 'hint' | 'error' | 'theory' | 'motivation';
  user_id?: string;
  chat_id?: string;
  language?: string;
}

export interface AIStatusResponse {
  status: string;
  model: string;
  active_sessions: number;
}

export interface AIHistoryItem {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface AIHistoryChatSummary {
  id: string;
  title: string;
  updatedAt: string;
  lastMessage: string;
}

export interface AIHistoryResponse {
  items: AIHistoryItem[];
  active_chat_id?: string | null;
  chats?: AIHistoryChatSummary[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface QuizGenerateResponse {
  questions: QuizQuestion[];
  topic: string;
  language: string;
  translations?: Record<'ru' | 'kz', QuizQuestion[]>;
}

export const aiChat = {
  sendMessage: (message: string, userId?: string, chatId?: string, language?: string, context?: AIChatContext) =>
    apiPost<ChatResponse>('/ai/chat', { message, user_id: userId, chat_id: chatId, language, context }),

  sendMessageStream: (message: string, userId?: string, chatId?: string, language?: string, context?: AIChatContext, onChunk?: (chunk: string) => void) =>
    requestStream('/ai/chat/stream', {
      method: 'POST',
      body: JSON.stringify({ message, user_id: userId, chat_id: chatId, language, context }),
    }, onChunk).then((response) => ({ response, timestamp: new Date().toISOString() })),

  sendMessageWithScaffolding: (message: string, userId?: string, chatId?: string, language?: string, context?: AIChatContext) =>
    apiPost<ScaffoldedChatResponse>('/ai/chat/scaffolding', { message, user_id: userId, chat_id: chatId, language, context, enable_scaffolding: true }),

  quickAction: (actionType: string, userId?: string, chatId?: string, language?: string) =>
    apiPost<ChatResponse>('/ai/quick-action', { action_type: actionType, user_id: userId, chat_id: chatId, language }),

  resetSession: (userId: string, chatId?: string) =>
    apiPost<{ message: string; user_id: string }>('/ai/reset-session', { user_id: userId, chat_id: chatId }),

  getHistory: (userId?: string, chatId?: string) => {
    const params = new URLSearchParams();
    if (userId) params.set('user_id', userId);
    if (chatId) params.set('chat_id', chatId);
    const query = params.toString();
    return apiGet<AIHistoryResponse>(`/ai/history${query ? `?${query}` : ''}`);
  },

  getStatus: () =>
    apiGet<AIStatusResponse>('/ai/status'),

  generateQuiz: (topic: string, theoryContent: string, numQuestions = 3, language = 'ru') =>
    apiPost<QuizGenerateResponse>('/ai/generate-quiz', {
      topic,
      theory_content: theoryContent,
      num_questions: numQuestions,
      language,
    }),
};

export const notificationsApi = {
  getAll: () => apiGet<NotificationResponse>('/notifications'),
  getHistory: () => apiGet<{ history: NotificationItem[] }>('/notifications/history'),
  getPreferences: () => apiGet<{ preferences: NotificationPreference[] }>('/notifications/preferences'),
  updatePreferences: (preferences: NotificationPreference[]) =>
    apiPut<{ preferences: NotificationPreference[] }>('/notifications/preferences', { preferences }),
  markAllRead: () => apiPost<{ message: string; items: NotificationItem[] }>('/notifications/mark-all-read'),
};

export const authApi = {
  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) =>
    apiPost<{ message: string }>('/auth/change-password', { currentPassword, newPassword, confirmPassword }),
};

export interface MissionFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  language?: string;
  parentId?: string | null;
}

export interface MissionData {
  id: string;
  title: string;
  chapter: string;
  description: string;
  difficulty?: string;
  xpReward: number;
  objectives: Array<{ id?: string | number; text: string; completed: boolean }>;
  starterCode?: string;
  testCases?: any[];
  hints?: string[];
  previousMissionId?: string | null;
  nextMissionId?: string | null;
}

export interface MissionWorkspace {
  files: MissionFile[];
  activeFileId?: string | null;
  updatedAt?: string | null;
}

export interface MissionSubmitResponse {
  success: boolean;
  message: string;
  xpEarned: number;
  objectives: Array<{ id?: string | number; text: string; completed: boolean }>;
  testResults: Array<{ passed: boolean; message: string }>;
  terminalOutput?: string;
  terminalError?: string;
  courseProgress?: {
    lessonAdvanced: boolean;
    courseCompleted: boolean;
    nextCourseUnlocked: boolean;
    activeCourseId: number | null;
    activeSeason: number | null;
    nextSeasonUnlocked: boolean;
    activeCourseProgress?: number;
    completedLessons?: number;
    totalLessons?: number;
  };
  attemptMeta?: {
    totalAttempts?: number;
    consecutiveFailures?: number;
    cooldownUntil?: string | null;
    cooldownActive?: boolean;
    retryAfterSeconds?: number;
  };
  runtime?: { returncode: number; timedOut: boolean };
  analysis?: string;
}

export const missionApi = {
  getAll: () => apiGet<MissionData[]>('/missions'),
  getById: (missionId: string) => apiGet<MissionData>(`/missions/${missionId}`),
  getProgress: (missionId: string) => apiGet<{ missionId: string; objectives: MissionData['objectives']; testResults: any[] }>(`/missions/${missionId}/progress`),
  getWorkspace: (missionId: string) => apiGet<MissionWorkspace>(`/missions/${missionId}/code`),
  saveWorkspace: (missionId: string, payload: MissionWorkspace) => apiPut<MissionWorkspace>(`/missions/${missionId}/code`, payload),
  submit: (missionId: string, payload: { code: string; courseId?: number }) => apiPost<MissionSubmitResponse>(`/missions/${missionId}/submit`, payload),
};

