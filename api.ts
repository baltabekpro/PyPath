const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000';

const buildUrl = (path: string) => `${API_BASE_URL}${path}`;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers || {}),
  };

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path), {
    ...init,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
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
}

export interface ChatResponse {
  response: string;
  timestamp: string;
}

export interface QuickActionRequest {
  action_type: 'hint' | 'error' | 'theory' | 'motivation';
  user_id?: string;
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

export const aiChat = {
  sendMessage: (message: string, userId?: string) =>
    apiPost<ChatResponse>('/ai/chat', { message, user_id: userId }),
  
  quickAction: (actionType: string, userId?: string) =>
    apiPost<ChatResponse>('/ai/quick-action', { action_type: actionType, user_id: userId }),
  
  resetSession: (userId: string) =>
    apiPost<{ message: string; user_id: string }>('/ai/reset-session', { user_id: userId }),

  getHistory: (userId?: string) =>
    apiGet<{ items: AIHistoryItem[] }>(`/ai/history${userId ? `?user_id=${encodeURIComponent(userId)}` : ''}`),
  
  getStatus: () =>
    apiGet<AIStatusResponse>('/ai/status'),
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

